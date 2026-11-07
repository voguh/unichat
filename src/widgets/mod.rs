/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::RwLock;
use std::sync::RwLockReadGuard;

use anyhow::Error;
use serde::Serialize;
use serde_json::Map;

use crate::UNICHAT_VERSION;
use crate::addons::MANIFEST_FILE;
use crate::addons::UniChatAddonManifest;
use crate::addons::is_valid_addon_dir;
use crate::addons::load_manifest;
use crate::plugins::PluginMetadata;
use crate::utils::constants::BASE_URL;
use crate::utils::paths;
use crate::utils::paths::AppPaths;
use crate::utils::semver::Version;
use crate::utils::semver::VersionRange;

/* ========================================================================== */

const WIDGET_ASSETS_DIR: &str = "assets";
const WIDGET_FIELDS_FILE: &str = "fields.json";
pub const WIDGET_FIELDSTATE_FILE: &str = "fieldstate.json";
const WIDGET_CSS_FILE: &str = "widget.css";
const WIDGET_LEGACY_CSS_FILE: &str = "style.css";
const WIDGET_HTML_FILE: &str = "widget.html";
const WIDGET_LEGACY_HTML_FILE: &str = "main.html";
const WIDGET_JS_FILE: &str = "widget.js";
const WIDGET_LEGACY_JS_FILE: &str = "script.js";

/* ========================================================================== */

#[derive(Serialize, Clone, Debug, Eq, PartialEq)]
#[serde(tag = "type", content = "value", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum WidgetSource {
    System,
    UserPlugin(String),
    User
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WidgetMetadata {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub version: Version,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    pub dependencies: HashMap<String, VersionRange>,

    pub path: PathBuf,
    pub rest_path: String,
    pub widget_source: WidgetSource,
    pub warnings: Vec<String>
}

impl WidgetMetadata {
    pub fn assets_path(&self) -> PathBuf {
        return self.path.join(WIDGET_ASSETS_DIR);
    }

    /* ====================================================================== */

    fn fields_path(&self) -> PathBuf {
        return self.path.join(WIDGET_FIELDS_FILE);
    }

    pub fn fields(&self) -> Map<String, serde_json::Value> {
        let raw = fs::read_to_string(self.fields_path()).unwrap_or_else(|_| String::from("{}"));

        return match serde_json::from_str(&raw) {
            Ok(map) => map,
            Err(err) => {
                log::error!("Failed to parse {} for widget '{:?}': {:#?}", WIDGET_FIELDS_FILE, self.path, err);
                return Map::new();
            }
        };
    }

    /* ====================================================================== */

    pub fn fieldstate_path(&self) -> PathBuf {
        return self.path.join(WIDGET_FIELDSTATE_FILE);
    }

    pub fn fieldstate(&self) -> HashMap<String, serde_json::Value> {
        let raw = fs::read_to_string(self.fieldstate_path()).unwrap_or_else(|_| String::from("{}"));

        return match serde_json::from_str(&raw) {
            Ok(map) => map,
            Err(err) => {
                log::error!("Failed to parse {} for widget '{:?}': {:#?}", WIDGET_FIELDSTATE_FILE, self.path, err);
                return HashMap::new();
            }
        };
    }

    /* ====================================================================== */

    fn entrypoint_path(&self, current: &str, legacy: &str) -> PathBuf {
        let path = self.path.join(current);
        if path.exists() {
            return path;
        }

        log::warn!("Falling back to '{}' for widget '{:?}'", legacy, self.path);
        return self.path.join(legacy);
    }

    /* ====================================================================== */

    fn widget_css_path(&self) -> PathBuf {
        return self.entrypoint_path(WIDGET_CSS_FILE, WIDGET_LEGACY_CSS_FILE);
    }

    pub fn widget_css(&self) -> String {
        return fs::read_to_string(self.widget_css_path()).unwrap_or_default();
    }

    /* ====================================================================== */

    fn widget_html_path(&self) -> PathBuf {
        return self.entrypoint_path(WIDGET_HTML_FILE, WIDGET_LEGACY_HTML_FILE);
    }

    pub fn widget_html(&self) -> String {
        return fs::read_to_string(self.widget_html_path()).unwrap_or_default();
    }

    /* ====================================================================== */

    fn widget_js_path(&self) -> PathBuf {
        return self.entrypoint_path(WIDGET_JS_FILE, WIDGET_LEGACY_JS_FILE);
    }

    pub fn widget_js(&self) -> String {
        return fs::read_to_string(self.widget_js_path()).unwrap_or_default();
    }
}

static WIDGETS: LazyLock<RwLock<HashMap<String, WidgetMetadata>>> = LazyLock::new(|| RwLock::new(HashMap::new()));
fn read() -> RwLockReadGuard<'static, HashMap<String, WidgetMetadata>> {
    return WIDGETS.read().expect("Widgets::WIDGETS lock poisoned");
}

fn write(source_type: &WidgetSource, loaded: Vec<WidgetMetadata>) {
    let mut widgets = WIDGETS.write().expect("Widgets::WIDGETS lock poisoned");
    widgets.retain(|_, v| &v.widget_source != source_type);

    for metadata in loaded {
        widgets.insert(metadata.rest_path.clone(), metadata);
    }
}

/* ========================================================================== */

fn get_entrypoint_warning(widget_path: &Path, current: &str, legacy: &str, kind: &str) -> Option<String> {
    let has_current = widget_path.join(current).exists();
    let has_legacy = widget_path.join(legacy).exists();

    if has_legacy && has_current {
        return Some(format!("DUPLICATE_{}_ENTRYPOINT", kind));
    } else if has_legacy {
        return Some(format!("LEGACY_{}_ENTRYPOINT", kind));
    }

    return None;
}

fn get_warnings_for_widget(
    widget_path: &Path,
    source_type: &WidgetSource,
    manifest: &UniChatAddonManifest
) -> Vec<String> {
    let mut warnings = Vec::new();

    if source_type == &WidgetSource::User && !widget_path.join(MANIFEST_FILE).is_file() {
        warnings.push("MISSING_MANIFEST".to_string());
    }

    if let Some(version_req) = manifest.dependencies.get("unichat") {
        if !version_req.matches(&UNICHAT_VERSION) {
            warnings.push("INCOMPATIBLE_UNICHAT_VERSION".to_string());
        }
    }

    warnings.extend(get_entrypoint_warning(widget_path, WIDGET_HTML_FILE, WIDGET_LEGACY_HTML_FILE, "HTML"));
    warnings.extend(get_entrypoint_warning(widget_path, WIDGET_JS_FILE, WIDGET_LEGACY_JS_FILE, "JS"));
    warnings.extend(get_entrypoint_warning(widget_path, WIDGET_CSS_FILE, WIDGET_LEGACY_CSS_FILE, "CSS"));

    return warnings;
}

fn load_widgets_from_disk(
    widgets_path: &Path,
    source_type: WidgetSource,
    cb: impl Fn(&WidgetMetadata)
) -> Result<(), Error> {
    if !widgets_path.is_dir() {
        return Ok(());
    }

    let mut loaded = Vec::new();
    let entries = fs::read_dir(widgets_path)?;
    for entry in entries.flatten() {
        let widget_id = entry.file_name().to_string_lossy().to_string();
        let widget_path = entry.path();
        if !is_valid_addon_dir(&widget_id, &widget_path) {
            continue;
        }

        let mut manifest = None;
        if widget_path.join(MANIFEST_FILE).is_file() {
            match load_manifest(&widget_path) {
                Ok(loaded_manifest) => {
                    manifest = Some(loaded_manifest);
                }
                Err(e) => {
                    log::warn!("Failed to load widget manifest from {:?}: {:#?}", widget_path, e);
                }
            }
        }

        let manifest = manifest.unwrap_or_else(|| UniChatAddonManifest {
            name: widget_id.clone(),
            description: None,
            version: Version::default(),
            author: None,
            license: None,
            homepage: None,
            dependencies: HashMap::new()
        });
        let warnings = get_warnings_for_widget(&widget_path, &source_type, &manifest);

        let rest_path;
        if let WidgetSource::UserPlugin(plugin_id) = &source_type {
            rest_path = format!("{}::{}", plugin_id, widget_id);
        } else {
            rest_path = widget_id.clone();
        }

        let metadata = WidgetMetadata {
            id: widget_id,
            name: manifest.name,
            description: manifest.description,
            version: manifest.version,
            author: manifest.author,
            license: manifest.license,
            homepage: manifest.homepage,
            dependencies: manifest.dependencies,

            path: widget_path,
            rest_path: rest_path,
            widget_source: source_type.clone(),
            warnings: warnings
        };
        cb(&metadata);
        loaded.push(metadata);
    }

    write(&source_type, loaded);

    return Ok(());
}

/* ========================================================================== */

pub fn get_widgets() -> Vec<WidgetMetadata> {
    let widgets = read();
    return widgets.values().cloned().collect();
}

pub fn get_widget_from_rest_path(rest_path: &str) -> Option<WidgetMetadata> {
    let widgets = read();
    return widgets.get(rest_path).cloned();
}

pub fn reload_user_widgets() -> Result<(), Error> {
    let user_widgets_path = paths::get(AppPaths::UniChatUserWidgets);
    load_widgets_from_disk(&user_widgets_path, WidgetSource::User, |_| {})?;

    return Ok(());
}

/* ========================================================================== */

pub fn add_plugin_widgets(plugin: &Arc<PluginMetadata>) -> Result<(), Error> {
    let widgets_path = plugin.get_widgets_path();

    load_widgets_from_disk(&widgets_path, WidgetSource::UserPlugin(plugin.id.clone()), move |metadata| {
        let id = &metadata.id;
        let rest_path = &metadata.rest_path;
        plugin.add_message(format!("Registered widget '{}' provided as '{}/widget/{}'", id, BASE_URL, rest_path));
    })?;

    return Ok(());
}

/* ========================================================================== */

pub fn init() -> Result<(), Error> {
    let system_widgets_path = paths::get(AppPaths::UniChatSystemWidgets);
    load_widgets_from_disk(&system_widgets_path, WidgetSource::System, |_| {})?;

    let user_widgets_path = paths::get(AppPaths::UniChatUserWidgets);
    load_widgets_from_disk(&user_widgets_path, WidgetSource::User, |_| {})?;

    return Ok(());
}

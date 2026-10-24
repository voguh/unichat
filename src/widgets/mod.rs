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
use std::sync::RwLockWriteGuard;

use anyhow::Error;
use anyhow::anyhow;
use serde::Serialize;
use serde_json::Map;

use crate::addons::manifest::UniChatAddonManifest;
use crate::addons::manifest::load_manifest;
use crate::plugins::UniChatPlugin;
use crate::utils::constants::BASE_WIDGET_URL;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

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
    pub name: String,
    pub description: Option<String>,
    pub version: String,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    pub dependencies: Vec<String>,

    pub path: PathBuf,
    pub rest_path: String,
    pub widget_source: WidgetSource,
    pub warnings: Vec<String>
}

impl WidgetMetadata {
    pub fn assets_path(&self) -> PathBuf {
        return self.path.join("assets");
    }

    /* ====================================================================== */

    pub fn fields_path(&self) -> PathBuf {
        return self.path.join("fields.json");
    }

    pub fn fields(&self) -> Map<String, serde_json::Value> {
        let raw = fs::read_to_string(self.fields_path()).unwrap_or(String::from("{}"));

        return match serde_json::from_str(&raw) {
            Ok(map) => map,
            Err(err) => {
                log::error!("Failed to parse fields.json for widget '{:?}': {:#?}", self.path, err);
                return Map::new();
            }
        };
    }

    /* ====================================================================== */

    pub fn fieldstate_path(&self) -> PathBuf {
        return self.path.join("fieldstate.json");
    }

    pub fn fieldstate(&self) -> HashMap<String, serde_json::Value> {
        let raw = fs::read_to_string(self.fieldstate_path()).unwrap_or(String::from("{}"));

        return match serde_json::from_str(&raw) {
            Ok(map) => map,
            Err(err) => {
                log::error!("Failed to parse fieldstate.json for widget '{:?}': {:#?}", self.path, err);
                return HashMap::new();
            }
        };
    }

    /* ====================================================================== */

    pub fn widget_css_path(&self) -> PathBuf {
        let path = self.path.join("widget.css");
        if path.exists() {
            return path;
        }

        log::warn!("Falling back to 'style.css' for widget '{:?}'", self.path);
        return self.path.join("style.css");
    }

    pub fn widget_css(&self) -> String {
        return fs::read_to_string(self.widget_css_path()).unwrap_or_default();
    }

    /* ====================================================================== */

    pub fn widget_html_path(&self) -> PathBuf {
        let path = self.path.join("widget.html");
        if path.exists() {
            return path;
        }

        log::warn!("Falling back to 'main.html' for widget '{:?}'", self.path);
        return self.path.join("main.html");
    }

    pub fn widget_html(&self) -> String {
        return fs::read_to_string(self.widget_html_path()).unwrap_or_default();
    }

    /* ====================================================================== */

    pub fn widget_js_path(&self) -> PathBuf {
        let path = self.path.join("widget.js");
        if path.exists() {
            return path;
        }

        log::warn!("Falling back to 'script.js' for widget '{:?}'", self.path);
        return self.path.join("script.js");
    }

    pub fn widget_js(&self) -> String {
        return fs::read_to_string(self.widget_js_path()).unwrap_or_default();
    }
}

static WIDGETS: LazyLock<RwLock<HashMap<String, WidgetMetadata>>> = LazyLock::new(|| RwLock::new(HashMap::new()));
fn read() -> RwLockReadGuard<'static, HashMap<String, WidgetMetadata>> {
    return WIDGETS.read().expect("Widgets::WIDGETS lock poisoned");
}

fn write() -> RwLockWriteGuard<'static, HashMap<String, WidgetMetadata>> {
    return WIDGETS.write().expect("Widgets::WIDGETS lock poisoned");
}

/* ========================================================================== */

fn get_warnings_for_widget(
    widget_path: &Path,
    widget_name: &str,
    source_type: &WidgetSource,
    manifest: &Option<UniChatAddonManifest>
) -> Vec<String> {
    let mut warnings = Vec::new();

    if let Some(manifest) = manifest {
        if manifest.name != widget_name {
            warnings.push("MANIFEST_NAME_MISMATCH".to_string());
        }
    } else if source_type == &WidgetSource::User && !widget_path.join("manifest.yaml").is_file() {
        warnings.push("MISSING_MANIFEST".to_string());
    }

    if widget_path.join("main.html").exists() && widget_path.join("widget.html").exists() {
        warnings.push("DUPLICATE_HTML_ENTRYPOINT".to_string());
    } else if widget_path.join("main.html").exists() && !widget_path.join("widget.html").exists() {
        warnings.push("LEGACY_HTML_ENTRYPOINT".to_string());
    }

    if widget_path.join("script.js").exists() && widget_path.join("widget.js").exists() {
        warnings.push("DUPLICATE_JS_ENTRYPOINT".to_string());
    } else if widget_path.join("script.js").exists() && !widget_path.join("widget.js").exists() {
        warnings.push("LEGACY_JS_ENTRYPOINT".to_string());
    }

    if widget_path.join("style.css").exists() && widget_path.join("widget.css").exists() {
        warnings.push("DUPLICATE_CSS_ENTRYPOINT".to_string());
    } else if widget_path.join("style.css").exists() && !widget_path.join("widget.css").exists() {
        warnings.push("LEGACY_CSS_ENTRYPOINT".to_string());
    }

    return warnings;
}

fn load_widgets_from_disk(
    widgets_path: &Path,
    source_type: WidgetSource,
    cb: impl Fn(&WidgetMetadata)
) -> Result<(), Error> {
    if !widgets_path.exists() || !widgets_path.is_dir() {
        return Ok(());
    }

    let mut widgets = write();
    widgets.retain(|_, v| v.widget_source != source_type);

    for entry in fs::read_dir(widgets_path)? {
        if let Ok(entry) = entry {
            let widget_path = entry.path();
            if !widget_path.is_dir() {
                continue;
            }

            let folder_name = widget_path.file_name().ok_or(anyhow!("Invalid widget folder name"))?;
            let widget_name = folder_name.to_string_lossy().to_string();
            if widget_name.starts_with(".") {
                continue;
            } else if widget_name.chars().any(|c| !c.is_ascii_alphanumeric() && c != '_' && c != '-') {
                log::warn!("Skipping widget with invalid name '{}' from {:?}", widget_name, widgets_path);
                continue;
            }

            let mut manifest = None;
            if widget_path.join("manifest.yaml").is_file() {
                match load_manifest(&widget_path) {
                    Ok(loaded_manifest) => {
                        manifest = Some(loaded_manifest);
                    }
                    Err(e) => {
                        log::warn!("Failed to load widget manifest from {:?}: {:#?}", widget_path, e);
                    }
                }
            }

            let warnings = get_warnings_for_widget(&widget_path, &widget_name, &source_type, &manifest);
            let manifest = manifest.unwrap_or(UniChatAddonManifest {
                name: widget_name.clone(),
                description: None,
                version: String::from("0.0.0"),
                author: None,
                license: None,
                homepage: None,
                dependencies: Vec::new()
            });

            let rest_path;
            if let WidgetSource::UserPlugin(plugin_name) = &source_type {
                rest_path = format!("{}::{}", plugin_name, widget_name);
            } else {
                rest_path = widget_name.clone()
            }

            let metadata = WidgetMetadata {
                name: widget_name,
                description: manifest.description,
                version: manifest.version,
                author: manifest.author,
                license: manifest.license,
                homepage: manifest.homepage,
                dependencies: manifest.dependencies,

                path: widget_path,
                rest_path: rest_path.clone(),
                widget_source: source_type.clone(),
                warnings: warnings
            };
            cb(&metadata);
            widgets.insert(rest_path.clone(), metadata);
        }
    }

    return Ok(());
}

/* ========================================================================== */

pub fn get_widgets() -> Vec<WidgetMetadata> {
    let widgets = read();
    return widgets.values().cloned().collect();
}

pub fn get_widget_from_name(name: &str) -> Result<WidgetMetadata, Error> {
    let widgets = read();
    for metadata in widgets.values() {
        if metadata.name == name {
            return Ok(metadata.clone());
        }
    }

    return Err(anyhow!("Widget not found"));
}

pub fn get_widget_from_rest_path(rest_path: &str) -> Result<WidgetMetadata, Error> {
    let widgets = read();
    if let Some(metadata) = widgets.get(rest_path) {
        return Ok(metadata.clone());
    }

    return Err(anyhow!("Widget not found"));
}

pub fn reload_user_widgets() -> Result<(), Error> {
    let user_widgets_path = properties::get_app_path(AppPaths::UniChatUserWidgets);
    load_widgets_from_disk(&user_widgets_path, WidgetSource::User, |_| {})?;

    return Ok(());
}

/* ========================================================================== */

pub fn add_plugin_widgets(plugin: &Arc<UniChatPlugin>) -> Result<(), Error> {
    let widgets_path = plugin.get_widgets_path();

    load_widgets_from_disk(&widgets_path, WidgetSource::UserPlugin(plugin.name.clone()), move |metadata| {
        let name = &metadata.name;
        let rest_path = &metadata.rest_path;
        plugin.add_message(format!("Registered widget '{}' provided as '{}/{}'", name, BASE_WIDGET_URL, rest_path));
    })?;

    return Ok(());
}

/* ========================================================================== */

pub fn init() -> Result<(), Error> {
    let system_widgets_path = properties::get_app_path(AppPaths::UniChatSystemWidgets);
    load_widgets_from_disk(&system_widgets_path, WidgetSource::System, |_| {})?;

    let user_widgets_path = properties::get_app_path(AppPaths::UniChatUserWidgets);
    load_widgets_from_disk(&user_widgets_path, WidgetSource::User, |_| {})?;

    return Ok(());
}

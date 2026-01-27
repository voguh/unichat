/*!******************************************************************************
 * UniChat
 * Copyright (C) 2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::RwLock;

use anyhow::anyhow;
use anyhow::Error;
use indexmap::IndexMap;
use serde::Serialize;

use crate::plugins::UniChatPlugin;
use crate::utils::constants::BASE_REST_PORT;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

#[derive(Serialize, Clone, Debug, Eq, PartialEq)]
#[serde(tag = "type", content = "value", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum WidgetSource {
    System,
    SystemPlugin(String),
    UserPlugin(String),
    User
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WidgetMetadata {
    #[serde(skip_serializing)]
    path: PathBuf,
    pub rest_path: String,
    pub widget_source: WidgetSource
}

impl WidgetMetadata {
    pub fn path(&self) -> &Path {
        return &self.path;
    }

    pub fn assets_path(&self) -> PathBuf {
        return self.path.join("assets");
    }

    /* ====================================================================== */

    pub fn name(&self) -> String {
        return self.path.file_name().unwrap().to_string_lossy().to_string();
    }

    /* ====================================================================== */

    pub fn fields_path(&self) -> PathBuf {
        return self.path.join("fields.json");
    }

    pub fn fields(&self) -> IndexMap<String, serde_json::Value> {
        let raw = fs::read_to_string(self.fields_path()).unwrap_or(String::from("{}"));

        return match serde_json::from_str(&raw) {
            Ok(map) => map,
            Err(err) => {
                log::error!("Failed to parse fields.json for widget '{:?}': {:#?}", self.path, err);
                return IndexMap::new();
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
                log::error!("Failed to parse fields.json for widget '{:?}': {:#?}", self.path, err);
                return HashMap::new();
            }
        };
    }

    /* ====================================================================== */

    pub fn widget_html_path(&self) -> PathBuf {
        return self.path.join("main.html");
    }

    pub fn widget_html(&self) -> String {
        return fs::read_to_string(self.widget_html_path()).unwrap_or_default();
    }

    /* ====================================================================== */

    pub fn widget_js_path(&self) -> PathBuf {
        return self.path.join("script.js");
    }

    pub fn widget_js(&self) -> String {
        return fs::read_to_string(self.widget_js_path()).unwrap_or_default();
    }

    /* ====================================================================== */

    pub fn widget_css_path(&self) -> PathBuf {
        return self.path.join("style.css");
    }

    pub fn widget_css(&self) -> String {
        return fs::read_to_string(self.widget_css_path()).unwrap_or_default();
    }
}

const WIDGETS_LAZY_LOCK_KEY: &str = "Widgets::WIDGETS";
static WIDGETS: LazyLock<RwLock<HashMap<String, WidgetMetadata>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

/* ============================================================================================== */

fn load_widgets_from_disk(widgets_path: &Path, source_type: WidgetSource, cb: impl Fn(&WidgetMetadata)) -> Result<(), Error> {
    if !widgets_path.exists() || !widgets_path.is_dir() {
        return Ok(());
    }

    let mut widgets = WIDGETS.write().map_err(|_| anyhow!("{} lock poisoned", WIDGETS_LAZY_LOCK_KEY))?;
    widgets.retain(|_, v| v.widget_source != source_type);

    for entry in fs::read_dir(widgets_path)? {
        if let Ok(entry) = entry {
            let widget_path = entry.path();
            if !widget_path.is_dir() {
                continue;
            }

            let widget_name = widget_path.file_name().ok_or(anyhow!("Invalid widget folder name"))?.to_string_lossy().to_string();
            if widget_name.starts_with(".") {
                continue;
            } else if widget_name.chars().any(|c| !c.is_ascii_alphanumeric() && c != '_' && c != '-') {
                log::warn!("Skipping widget with invalid name '{}' from {:?}", widget_name, widgets_path);
                continue;
            }

            let rest_path;
            if let WidgetSource::SystemPlugin(plugin_name) = &source_type {
                rest_path = format!("{}::{}", plugin_name, widget_name);
            } else if let WidgetSource::UserPlugin(plugin_name) = &source_type {
                rest_path = format!("{}::{}", plugin_name, widget_name);
            } else {
                rest_path = widget_name
            }

            let metadata = WidgetMetadata {
                path: widget_path,
                rest_path: rest_path.clone(),
                widget_source: source_type.clone()
            };
            cb(&metadata);
            widgets.insert(rest_path.clone(), metadata);
        }
    }

    return Ok(());
}

/* ============================================================================================== */

pub fn get_widgets() -> Result<Vec<WidgetMetadata>, Error> {
    let widgets = WIDGETS.read().map_err(|_| anyhow!("{} lock poisoned", WIDGETS_LAZY_LOCK_KEY))?;
    return Ok(widgets.values().cloned().collect());
}

pub fn get_widget_from_rest_path(rest_path: &str) -> Result<WidgetMetadata, Error> {
    let widgets = WIDGETS.read().map_err(|_| anyhow!("{} lock poisoned", WIDGETS_LAZY_LOCK_KEY))?;
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

/* ============================================================================================== */

pub fn add_plugin_widgets(plugin: &Arc<UniChatPlugin>) -> Result<(), Error> {
    let widgets_path = plugin.get_widgets_path();

    let callback = move |metadata: &WidgetMetadata| {
        plugin.add_message(format!("Registered widget '{}' provided as 'http://localhost:{}/widget/{}'", metadata.name(), BASE_REST_PORT, metadata.rest_path));
    };

    let system_plugins_path = properties::get_app_path(AppPaths::UniChatSystemPlugins);
    if plugin.get_plugin_path().starts_with(&system_plugins_path) {
        load_widgets_from_disk(&widgets_path, WidgetSource::SystemPlugin(plugin.name.clone()), callback)?;
    } else {
        load_widgets_from_disk(&widgets_path, WidgetSource::UserPlugin(plugin.name.clone()), callback)?;
    }

    return Ok(());
}

/* ============================================================================================== */

pub fn init() -> Result<(), Error> {
    let system_widgets_path = properties::get_app_path(AppPaths::UniChatSystemWidgets);
    load_widgets_from_disk(&system_widgets_path, WidgetSource::System, |_| {})?;

    let user_widgets_path = properties::get_app_path(AppPaths::UniChatUserWidgets);
    load_widgets_from_disk(&user_widgets_path, WidgetSource::User, |_| {})?;

    return Ok(());
}

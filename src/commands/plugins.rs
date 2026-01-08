/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::path::PathBuf;

use tauri::AppHandle;
use tauri::Runtime;

use crate::plugins;
use crate::plugins::PluginStatus;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SerializedPluginMetadata {
    pub name: String,
    pub description: Option<String>,
    pub version: String,
    pub author: Option<String>,
    pub license: Option<String>,
    pub homepage: Option<String>,
    pub dependencies: Vec<String>,

    pub icon: Option<Vec<u8>>,
    pub status: PluginStatus,
    pub messages: Vec<String>,
    pub plugin_path: Option<PathBuf>
}

#[tauri::command]
pub async fn get_plugins<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<SerializedPluginMetadata>, String> {
    let mut serialized_plugins: Vec<SerializedPluginMetadata> = Vec::new();
    let plugins = plugins::get_plugins().map_err(|e| format!("An error occurred on get plugins: {:#?}", e))?;

    for plugin in plugins {
        let manifest = plugin.manifest.clone();
        let mut plugin_path = Some(plugin.get_plugin_path());
        if plugin.get_plugin_path().starts_with(properties::get_app_path(AppPaths::UniChatSystemPlugins)) {
            plugin_path = None;
        }

        let metadata = SerializedPluginMetadata {
            name: manifest.name,
            description: manifest.description,
            version: manifest.version,
            author: manifest.author,
            license: manifest.license,
            homepage: manifest.homepage,
            dependencies: manifest.dependencies,

            icon: plugin.get_icon(),
            status: plugin.get_status(),
            messages: plugin.get_messages(),
            plugin_path: plugin_path,
        };

        serialized_plugins.push(metadata);
    }

    return Ok(serialized_plugins);
}

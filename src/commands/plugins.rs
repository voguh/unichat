/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::path::PathBuf;

use tauri::AppHandle;
use tauri::Runtime;

use crate::plugins;
use crate::plugins::PluginStatus;
use crate::utils::base64;
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

    pub icon: Option<String>,
    pub status: PluginStatus,
    pub messages: Vec<String>,
    pub plugin_path: Option<PathBuf>
}

#[tauri::command]
pub async fn get_plugins<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<SerializedPluginMetadata>, String> {
    let mut serialized_plugins: Vec<SerializedPluginMetadata> = Vec::new();

    for plugin in plugins::get_plugins() {
        let mut plugin_path = Some(plugin.get_plugin_path());
        if plugin.get_plugin_path().starts_with(properties::get_app_path(AppPaths::UniChatSystemPlugins)) {
            plugin_path = None;
        }

        let metadata = SerializedPluginMetadata {
            name: String::from(plugin.name()),
            description: plugin.description().map(String::from),
            version: plugin.version().to_string(),
            author: plugin.author().map(String::from),
            license: plugin.license().map(String::from),
            homepage: plugin.homepage().map(String::from),
            dependencies: plugin.dependencies().iter().map(|(name, range)| format!("{}@{}", name, range)).collect(),

            icon: plugin.get_icon().map(|bytes| format!("data:image/png;base64,{}", base64::encode(bytes))),
            status: plugin.get_status(),
            messages: plugin.get_messages(),
            plugin_path: plugin_path,
        };

        serialized_plugins.push(metadata);
    }

    return Ok(serialized_plugins);
}

#[tauri::command]
pub async fn get_plugin_settings_content<R: Runtime>(_app: AppHandle<R>, plugin_name: String) -> Result<Option<String>, String> {
    let plugin = plugins::get_plugin(&plugin_name).map_err(|e| format!("An error occurred on retrieve plugin: {:#?}", e))?;
    let settings_path = plugin.get_settings_path();
    if !settings_path.exists() {
        return Ok(None);
    }

    let settings_content = std::fs::read_to_string(settings_path).map_err(|e| format!("Failed to read settings file for plugin '{}': {:#?}", plugin_name, e))?;
    return Ok(Some(settings_content));
}

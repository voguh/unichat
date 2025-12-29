/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use tauri::AppHandle;
use tauri::Runtime;

use crate::error::Error;
use crate::plugins;
use crate::plugins::PluginStatus;

#[derive(serde::Serialize)]
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
}

#[tauri::command]
pub async fn get_plugins<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<SerializedPluginMetadata>, Error> {
    let mut serialized_plugins: Vec<SerializedPluginMetadata> = Vec::new();
    let plugins = plugins::get_plugins()?;

    for plugin in plugins {
        let manifest = plugin.manifest.clone();

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
        };

        serialized_plugins.push(metadata);
    }

    return Ok(serialized_plugins);
}

#[tauri::command]
pub async fn toggle_plugin_state<R: Runtime>(app: AppHandle<R>, plugin_name: String, new_state: bool) -> Result<(), Error> {
    let plugin = plugins::get_plugin(&plugin_name)?;
    plugin.toggle_plugin_state(new_state)?;
    app.restart();
}

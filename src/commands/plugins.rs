/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;
use std::path::PathBuf;

use tauri::AppHandle;
use tauri::Runtime;

use crate::plugins;
use crate::plugins::PluginStatus;
use crate::utils::base64;
use crate::utils::semver::Version;
use crate::utils::semver::VersionRange;

/* ========================================================================== */

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SerializedPluginMetadata {
    id: String,
    name: String,
    description: Option<String>,
    version: Version,
    author: Option<String>,
    license: Option<String>,
    homepage: Option<String>,
    dependencies: HashMap<String, VersionRange>,

    path: PathBuf,
    icon: Option<String>,
    status: PluginStatus,
    messages: Vec<String>
}

#[tauri::command]
pub async fn get_plugins<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<SerializedPluginMetadata>, String> {
    let mut serialized_plugins: Vec<SerializedPluginMetadata> = Vec::new();
    let plugins = plugins::get_plugins();

    for plugin in plugins {
        let metadata = SerializedPluginMetadata {
            id: plugin.id.clone(),
            name: plugin.name.clone(),
            description: plugin.description.clone(),
            version: plugin.version.clone(),
            author: plugin.author.clone(),
            license: plugin.license.clone(),
            homepage: plugin.homepage.clone(),
            dependencies: plugin.dependencies.clone(),

            path: plugin.get_plugin_path(),
            icon: plugin.get_icon().map(|bytes| format!("data:image/png;base64,{}", base64::encode(bytes))),
            status: plugin.get_status(),
            messages: plugin.get_messages()
        };

        serialized_plugins.push(metadata);
    }

    return Ok(serialized_plugins);
}

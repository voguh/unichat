/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use tauri::AppHandle;
use tauri::Runtime;

use crate::addons::plugin;
use crate::addons::plugin::CommunityPlugin;
use crate::addons::widget;
use crate::addons::widget::CommunityWidget;
use crate::utils::semver::Version;

/* ========================================================================== */

#[tauri::command]
pub async fn get_community_plugin<R: Runtime>(
    _app: AppHandle<R>,
    internal_id: String
) -> Result<CommunityPlugin, String> {
    return match plugin::get(&internal_id) {
        Ok(community_plugin) => Ok(community_plugin),
        Err(e) => {
            let message = format!("Failed to get community plugin '{}': {:#?}", internal_id, e);
            return Err(message);
        }
    };
}

/* ========================================================================== */

#[tauri::command]
pub async fn get_community_plugins<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<CommunityPlugin>, String> {
    return plugin::list().map_err(|e| format!("Failed to get community plugins: {:#?}", e));
}

/* ========================================================================== */

#[tauri::command]
pub async fn get_community_widget<R: Runtime>(
    _app: AppHandle<R>,
    internal_id: String
) -> Result<CommunityWidget, String> {
    return match widget::get(&internal_id) {
        Ok(community_widget) => Ok(community_widget),
        Err(e) => {
            let message = format!("Failed to get community widget '{}': {:#?}", internal_id, e);
            return Err(message);
        }
    };
}

/* ========================================================================== */

#[tauri::command]
pub async fn get_community_widgets<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<CommunityWidget>, String> {
    return widget::list().map_err(|e| format!("Failed to get community widgets: {:#?}", e));
}

/* ========================================================================== */

#[tauri::command]
pub async fn install_community_plugin<R: Runtime>(
    _app: AppHandle<R>,
    internal_id: String,
    release: Version
) -> Result<(), String> {
    if let Err(e) = plugin::install(&internal_id, &release) {
        let message = format!("Failed to install community plugin '{}' version '{}': {:#?}", internal_id, release, e);
        return Err(message);
    }

    return Ok(());
}

/* ========================================================================== */

#[tauri::command]
pub async fn install_community_widget<R: Runtime>(
    _app: AppHandle<R>,
    internal_id: String,
    release: Version
) -> Result<(), String> {
    if let Err(e) = widget::install(&internal_id, &release) {
        let message = format!("Failed to install community widget '{}' version '{}': {:#?}", internal_id, release, e);
        return Err(message);
    }

    return Ok(());
}

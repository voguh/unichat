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

use crate::addons::community_widget;
use crate::addons::community_widget::CommunityWidget;

#[tauri::command]
pub async fn get_community_widgets<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<CommunityWidget>, String> {
    return community_widget::list().map_err(|e| format!("Failed to get community widgets: {:#?}", e));
}

#[tauri::command]
pub async fn get_community_widget<R: Runtime>(_app: AppHandle<R>, id: String) -> Result<CommunityWidget, String> {
    return community_widget::get(&id).map_err(|e| format!("Failed to get community widget '{}': {:#?}", id, e));
}

#[tauri::command]
pub async fn install_community_widget<R: Runtime>(_app: AppHandle<R>, id: String, release: String) -> Result<(), String> {
    return community_widget::install(&id, &release).map_err(|e| format!("Failed to install community widget '{}' version '{}': {:#?}", id, release, e));
}

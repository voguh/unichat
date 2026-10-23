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

use crate::events;
use crate::events::unichat::UniChatEvent;
use crate::wm::custom_event_window;

/* ========================================================================== */

#[tauri::command]
pub async fn dispatch_emulated_event<R: Runtime>(_app: AppHandle<R>, event: UniChatEvent) -> Result<(), String> {
    events::emit(event).map_err(|e| format!("Failed to emit event: {:#?}", e))?;
    return Ok(());
}

#[tauri::command]
pub async fn open_custom_event_window<R: Runtime>(_app: AppHandle<R>) -> Result<(), String> {
    custom_event_window::open().map_err(|e| format!("Failed to open custom event window: {:#?}", e))?;
    return Ok(());
}

#[tauri::command]
pub async fn close_custom_event_window<R: Runtime>(_app: AppHandle<R>) -> Result<(), String> {
    custom_event_window::close().map_err(|e| format!("Failed to close custom event window: {:#?}", e))?;
    return Ok(());
}

/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
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

#[tauri::command]
pub async fn dispatch_emulated_event<R: Runtime>(_app: AppHandle<R>, event: UniChatEvent) -> Result<(), String> {
    events::emit(event).map_err(|e| format!("Failed to emit event: {:#?}", e))?;
    return Ok(());
}

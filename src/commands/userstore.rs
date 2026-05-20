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

use crate::utils::userstore;

#[tauri::command]
pub async fn get_userstore<R: Runtime>(_app: AppHandle<R>, key: String) -> Result<serde_json::Value, String> {
    let value: Option<serde_json::Value> = userstore::get_item(&key).map_err(|e| format!("Failed to emit event: {:#?}", e))?;

    if let Some(v) = value {
        return Ok(v);
    } else {
        return Ok(serde_json::Value::Null);
    }
}

#[tauri::command]
pub async fn set_userstore<R: Runtime>(_app: AppHandle<R>, key: String, value: Option<serde_json::Value>) -> Result<(), String> {
    userstore::set_item(&key, &value).map_err(|e| format!("Failed to set userstore item: {:#?}", e))
}

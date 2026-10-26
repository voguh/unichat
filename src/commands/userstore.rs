/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::utils::userstore;

/* ========================================================================== */

#[tauri::command]
pub async fn get_userstore<R: Runtime>(_app: AppHandle<R>, key: String) -> Result<Value, String> {
    let value: Option<Value> = userstore::get_item(&key).map_err(|e| format!("Failed to emit event: {:#?}", e))?;

    if let Some(v) = value {
        return Ok(v);
    } else {
        return Ok(Value::Null);
    }
}

/* ========================================================================== */

#[tauri::command]
pub async fn set_userstore<R: Runtime>(_app: AppHandle<R>, key: String, value: Option<Value>) -> Result<(), String> {
    return userstore::set_item(&key, &value).map_err(|e| format!("Failed to set userstore item: {:#?}", e));
}

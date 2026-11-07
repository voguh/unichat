/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use serde_json::Map;
use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::settings;

/* ========================================================================== */

fn settings_key(key: &str) -> Result<String, String> {
    if key.contains(':') {
        return Err(format!("Invalid settings key '{}'", key));
    }

    return Ok(format!("settings:{}", key));
}

/* ========================================================================== */

#[tauri::command]
pub async fn settings_get_item(key: &str) -> Result<Value, String> {
    let full_key = settings_key(key)?;
    return settings::get_by_key(&full_key).map_err(|e| format!("Failed to get item '{}': {:#?}", key, e));
}

/* ========================================================================== */

#[tauri::command]
pub async fn settings_get_items(keys: Vec<String>) -> Result<Map<String, Value>, String> {
    let mut result = Map::new();

    for key in keys {
        let full_key = settings_key(&key)?;
        let value = settings::get_by_key(&full_key).map_err(|e| format!("Failed to get item '{}': {:#?}", key, e))?;
        result.insert(key, value);
    }

    return Ok(result);
}

/* ========================================================================== */

#[tauri::command]
pub async fn settings_set_item<R: Runtime>(_app: AppHandle<R>, key: &str, value: Value) -> Result<(), String> {
    let full_key = settings_key(key)?;
    return settings::set_by_key(&full_key, &value).map_err(|e| format!("Failed to set item '{}': {:#?}", key, e));
}

/* ========================================================================== */

#[tauri::command]
pub async fn settings_set_items<R: Runtime>(_app: AppHandle<R>, items: Map<String, Value>) -> Result<(), String> {
    for (key, value) in items {
        let full_key = settings_key(&key)?;
        settings::set_by_key(&full_key, &value).map_err(|e| format!("Failed to set item '{}': {:#?}", key, e))?;
    }

    return Ok(());
}

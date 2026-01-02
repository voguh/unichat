/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::utils::settings;

#[tauri::command]
pub async fn settings_get_item(key: &str) -> Result<Value, String> {
    let key = format!("settings:{}", key);
    if key.split(':').count() != 2 {
        return Err("Invalid settings key format".to_string());
    }

    let raw_value = settings::get_item(&key).map_err(|e| format!("Failed to get item: {:#?}", e))?;
    return Ok(raw_value);
}

#[tauri::command]
pub async fn settings_set_item<R: Runtime>(_app: AppHandle<R>, key: &str, value: Value) -> Result<(), String> {
    let key = format!("settings:{}", key);
    if key.split(':').count() != 2 {
        return Err("Invalid settings key format".to_string());
    }

    settings::set_item(&key, &value).map_err(|e| format!("Failed to set item: {:#?}", e))?;
    return Ok(());
}

#[tauri::command]
pub async fn store_get_item<R: Runtime>(_app: AppHandle<R>, key: &str) -> Result<Value, String> {
    let raw_value = settings::get_item(key).map_err(|e| format!("Failed to get item: {:#?}", e))?;
    return Ok(raw_value);
}

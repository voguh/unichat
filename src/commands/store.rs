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
use crate::utils::settings::SettingsKeys;

#[tauri::command]
pub async fn store_get_item<R: Runtime>(_app: AppHandle<R>, key: &str) -> Result<Value, String> {
    if key.starts_with("settings") {
        return Err(String::from("Settings keys could not be retrieved with `store_get_item`"));
    }

    let p_key = SettingsKeys::from_str(key)?;
    return settings::get_item(p_key);
}

#[tauri::command]
pub async fn store_set_item<R: Runtime>(_app: AppHandle<R>, key: &str, value: Value) -> Result<(), String> {
    if key.starts_with("settings") {
        return Err(String::from("Settings keys could not be set with `store_set_item`"));
    }

    let p_key = SettingsKeys::from_str(key)?;
    return settings::set_item(p_key, value);
}

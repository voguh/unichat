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

use crate::error::Error;
use crate::utils::settings;

#[tauri::command]
pub async fn store_get_item<R: Runtime>(_app: AppHandle<R>, key: &str) -> Result<Value, Error> {
    if key.starts_with("settings") {
        return Err(Error::from("Use specific settings commands to get settings values"));
    }

    let raw_value = settings::get_store_item_raw(key)?;
    return Ok(raw_value);
}

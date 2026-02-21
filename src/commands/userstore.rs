/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;

use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::utils::userstore;

#[tauri::command]
pub async fn userstore_get_items<R: Runtime>(_app: AppHandle<R>, prefix: String) -> Result<HashMap<String, String>, String> {
    let items = userstore::get_all_items().map_err(|e| format!("Failed to get userstore items: {:#?}", e))?;
    let filtered_items: HashMap<String, String> = items.into_iter().filter(|(key, _)| key.starts_with(&prefix)).collect();

    return Ok(filtered_items);
}

#[tauri::command]
pub async fn userstore_get_item<R: Runtime>(_app: AppHandle<R>, key: String) -> Result<Option<String>, String> {
    let item = userstore::get_item(&key).map_err(|e| format!("Failed to get userstore item: {:#?}", e))?;

    return Ok(item);
}

#[tauri::command]
pub async fn userstore_set_items<R: Runtime>(_app: AppHandle<R>, items: HashMap<String, Option<Value>>) -> Result<(), String> {
    for (key, value) in items.into_iter() {
        userstore::set_item(&key, &value).map_err(|e| format!("Failed to set userstore item: {:#?}", e))?;
    }

    return Ok(());
}

#[tauri::command]
pub async fn userstore_set_item<R: Runtime>(_app: AppHandle<R>, key: String, value: Option<Value>) -> Result<(), String> {
    userstore::set_item(&key, &value).map_err(|e| format!("Failed to set userstore item: {:#?}", e))?;

    return Ok(());
}

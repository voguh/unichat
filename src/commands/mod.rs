/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use serde_json::json;
use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::events;
use crate::events::unichat::UniChatClearEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::STATIC_APP_ICON;
use crate::THIRD_PARTY_LICENSES;
use crate::UNICHAT_AUTHORS;
use crate::UNICHAT_DESCRIPTION;
use crate::UNICHAT_DISPLAY_NAME;
use crate::UNICHAT_HOMEPAGE;
use crate::UNICHAT_LICENSE_CODE;
use crate::UNICHAT_LICENSE_NAME;
use crate::UNICHAT_LICENSE_URL;
use crate::UNICHAT_NAME;
use crate::UNICHAT_VERSION;
use crate::utils;
use crate::utils::get_current_timestamp;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

pub mod gallery;
pub mod plugins;
pub mod store;
pub mod tour;
pub mod scrappers;
pub mod widgets;

#[tauri::command]
pub async fn get_app_info<R: Runtime>(_app: AppHandle<R>) -> Result<Value, String> {
    let metadata = json!({
        "displayName": UNICHAT_DISPLAY_NAME,
        "identifier": UNICHAT_NAME,
        "version": UNICHAT_VERSION,
        "description": UNICHAT_DESCRIPTION,
        "authors": UNICHAT_AUTHORS,
        "homepage": UNICHAT_HOMEPAGE,
        "icon": STATIC_APP_ICON,
        "licenseCode": UNICHAT_LICENSE_CODE,
        "licenseName": UNICHAT_LICENSE_NAME,
        "licenseUrl": UNICHAT_LICENSE_URL,

        "licenseFile": properties::get_app_path(AppPaths::UniChatLicense).to_string_lossy().to_string(),
        "widgetsDir": properties::get_app_path(AppPaths::UniChatUserWidgets).to_string_lossy().to_string(),
        "pluginsDir": properties::get_app_path(AppPaths::UniChatUserPlugins).to_string_lossy().to_string(),

        "thirdPartyLicenses": serde_json::from_str::<Value>(THIRD_PARTY_LICENSES).unwrap_or(Value::Array(vec![]))
    });

    return Ok(metadata);
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn is_dev<R: Runtime>(_app: AppHandle<R>) -> Result<bool, String> {
    return Ok(utils::is_dev())
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn dispatch_clear_chat<R: Runtime>(_app: AppHandle<R>) -> Result<(), String> {
    let timestamp_usec = get_current_timestamp().map_err(|e| format!("An error occurred on get current timestamp: {:#?}", e))?;

    let event = UniChatEvent::Clear(UniChatClearEventPayload {
        platform: None,

        timestamp: timestamp_usec
    });

    events::emit(event).map_err(|e| format!("An error occurred on emit ClearChat event: {:#?}", e))?;

    return Ok(());
}

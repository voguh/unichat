/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use serde_json::json;
use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::error::Error;
use crate::events;
use crate::events::unichat::UniChatClearEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::utils;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::CARGO_PKG_AUTHORS;
use crate::CARGO_PKG_DESCRIPTION;
use crate::CARGO_PKG_DISPLAY_NAME;
use crate::CARGO_PKG_HOMEPAGE;
use crate::CARGO_PKG_LICENSE_CODE;
use crate::CARGO_PKG_LICENSE_NAME;
use crate::CARGO_PKG_LICENSE_URL;
use crate::CARGO_PKG_NAME;
use crate::CARGO_PKG_VERSION;
use crate::STATIC_APP_ICON;
use crate::THIRD_PARTY_LICENSES;

pub mod gallery;
pub mod plugins;
pub mod store;
pub mod tour;
pub mod scrappers;
pub mod widgets;

#[tauri::command]
pub async fn get_app_info<R: Runtime>(_app: AppHandle<R>) -> Result<Value, Error> {
    let metadata = json!({
        "displayName": CARGO_PKG_DISPLAY_NAME,
        "identifier": CARGO_PKG_NAME,
        "version": CARGO_PKG_VERSION,
        "description": CARGO_PKG_DESCRIPTION,
        "authors": CARGO_PKG_AUTHORS,
        "homepage": CARGO_PKG_HOMEPAGE,
        "icon": STATIC_APP_ICON,
        "licenseCode": CARGO_PKG_LICENSE_CODE,
        "licenseName": CARGO_PKG_LICENSE_NAME,
        "licenseUrl": CARGO_PKG_LICENSE_URL,

        "licenseFile": properties::get_app_path(AppPaths::UniChatLicense).to_string_lossy().to_string(),
        "widgetsDir": properties::get_app_path(AppPaths::UniChatUserWidgets).to_string_lossy().to_string(),

        "thirdPartyLicenses": serde_json::from_str::<Value>(THIRD_PARTY_LICENSES).unwrap_or(Value::Array(vec![]))
    });

    return Ok(metadata);
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn is_dev<R: Runtime>(_app: AppHandle<R>) -> Result<bool, Error> {
    return Ok(utils::is_dev())
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn dispatch_clear_chat<R: Runtime>(_app: AppHandle<R>) -> Result<(), Error> {
    let timestamp_usec = SystemTime::now().duration_since(UNIX_EPOCH)?;

    let event = UniChatEvent::Clear(UniChatClearEventPayload {
        platform: None,

        timestamp: timestamp_usec.as_secs() as i64
    });

    events::emit(event)?;

    return Ok(());
}

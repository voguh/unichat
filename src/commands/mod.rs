/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::path::PathBuf;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use serde_json::json;
use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::events;
use crate::events::unichat::UniChatClearEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UNICHAT_EVENT_CLEAR_TYPE;
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
pub mod store;
pub mod tour;
pub mod webview;
pub mod widgets;

/* ================================================================================================================== */

pub fn serialize_error<E: std::fmt::Debug + 'static>(e: E) -> String {
    log::error!("{:?}", e);
    return format!("{:?}", e);
}

pub fn parse_fs_error(e: std::io::Error, path: &PathBuf) -> String {
    return match e.kind() {
        std::io::ErrorKind::NotFound => format!("File or directory '{:?}' not found", path),
        std::io::ErrorKind::PermissionDenied => format!("Permission denied for file or directory '{:?}'", path),
        std::io::ErrorKind::AlreadyExists => format!("File or directory '{:?}' already exists", path),
        _ => format!("An error occurred with file or directory '{:?}': {:?}", path, e),
    };
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn get_app_info<R: Runtime>(_app: AppHandle<R>) -> Result<Value, String> {
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
pub async fn is_dev<R: Runtime>(_app: AppHandle<R>) -> Result<bool, String> {
    return Ok(utils::is_dev())
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn dispatch_clear_chat<R: Runtime>(_app: AppHandle<R>) -> Result<(), String> {
    let timestamp_usec = SystemTime::now().duration_since(UNIX_EPOCH).map_err(serialize_error)?;

    let event = UniChatEvent::Clear {
        event_type: String::from(UNICHAT_EVENT_CLEAR_TYPE),
        data: UniChatClearEventPayload {
            platform: None,

            timestamp: timestamp_usec.as_secs() as i64
        }
    };

    events::event_emitter().emit(event).map_err(serialize_error)?;

    return Ok(());
}

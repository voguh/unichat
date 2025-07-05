/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

use std::str::FromStr;

use serde_json::json;
use serde_json::Value;
use tauri::Manager;
use tauri::Runtime;

use crate::events;
use crate::events::unichat::UniChatClearEventPayload;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UNICHAT_EVENT_CLEAR_TYPE;
use crate::utils;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::settings;
use crate::utils::settings::SettingsKeys;
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

#[tauri::command]
pub async fn get_app_info<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<Value, String> {
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
        "widgetsDir": properties::get_app_path(AppPaths::UniChatWidgets).to_string_lossy().to_string(),

        "thirdPartyLicenses": serde_json::from_str::<Value>(THIRD_PARTY_LICENSES).unwrap_or(Value::Array(vec![]))
    });

    return Ok(metadata);
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn is_dev<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<bool, String> {
    return Ok(utils::is_dev())
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn store_get_item<R: tauri::Runtime>(_app: tauri::AppHandle<R>, key: &str) -> Result<Value, String> {
    if key.starts_with("settings") {
        return Err(String::from("Settings keys could not be retrieved with `store_get_item`"));
    }

    let p_key = SettingsKeys::from_str(key)?;
    return settings::get_item(p_key);
}

#[tauri::command]
pub async fn store_set_item<R: tauri::Runtime>(_app: tauri::AppHandle<R>, key: &str, value: Value) -> Result<(), String> {
    if key.starts_with("settings") {
        return Err(String::from("Settings keys could not be set with `store_set_item`"));
    }

    let p_key = SettingsKeys::from_str(key)?;
    return settings::set_item(p_key, value);
}

/* ================================================================================================================== */

#[tauri::command]
pub fn toggle_webview<R: Runtime>(app: tauri::AppHandle<R>, label: &str) -> Result<(), String> {
    let webview_window = app.get_webview_window(label).unwrap();
    if webview_window.is_visible().map_err(|e| format!("{:?}", e))? {
        webview_window.hide().map_err(|e| format!("{:?}", e))?;
    } else {
        webview_window.show().map_err(|e| format!("{:?}", e))?;
    }

    return Ok(());
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn dispatch_clear_chat<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<bool, String> {
    let event = UniChatEvent::Clear {
        event_type: String::from(UNICHAT_EVENT_CLEAR_TYPE),
        data: UniChatClearEventPayload {
            platform: None
        }
    };

    if let Err(err) = events::event_emitter().emit(event) {
        log::error!("An error occurred on send 'unichat:clear' unichat event: {}", err);
    }

    return Ok(utils::is_dev())
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn list_widgets<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<Vec<String>, String> {
    let widgets_dir = properties::get_app_path(AppPaths::UniChatWidgets);
    if widgets_dir.is_dir() {
        let mut folders: Vec<String> = Vec::new();

        let entries = std::fs::read_dir(&widgets_dir).unwrap();
        for entry in entries {
            let path = entry.unwrap().path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    folders.push(name.to_string());
                }
            }
        }

        return Ok(folders);
    } else {
        Err(String::from_str("An error occurred on iterate over widgets dir").unwrap())
    }
}

/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashSet;
use std::fs;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

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
        "widgetsDir": properties::get_app_path(AppPaths::UniChatUserWidgets).to_string_lossy().to_string(),

        "thirdPartyLicenses": serde_json::from_str::<Value>(THIRD_PARTY_LICENSES).unwrap_or(Value::Array(vec![]))
    });

    return Ok(metadata);
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn tour_steps_has_new<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<bool, String> {
    let prev_tour_steps: Vec<String> = settings::get_item(SettingsKeys::PrevTourSteps)?;
    let current_tour_steps: Vec<String> = settings::get_item(SettingsKeys::CurrentTourSteps)?;

    let prev_hash_set: HashSet<_> = prev_tour_steps.iter().cloned().collect();
    let mut new_hash_set: HashSet<_> = current_tour_steps.iter().cloned().collect();

    if prev_hash_set != new_hash_set {
        for step in &prev_hash_set {
            new_hash_set.remove(step);
        }

        return Ok(!new_hash_set.is_empty());
    }

    return Ok(false);
}

#[tauri::command]
pub async fn get_prev_tour_steps<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<Vec<String>, String> {
    let prev_tour_steps: Vec<String> = settings::get_item(SettingsKeys::PrevTourSteps)?;

    return Ok(prev_tour_steps);
}

#[tauri::command]
pub async fn get_tour_steps<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<Vec<String>, String> {
    let tour_steps: Vec<String> = settings::get_item(SettingsKeys::CurrentTourSteps)?;

    return Ok(tour_steps)
}

#[tauri::command]
pub async fn set_tour_steps<R: Runtime>(_app: tauri::AppHandle<R>, new_steps: Vec<String>) -> Result<(), String> {
    let current_tour_steps: Vec<String> = settings::get_item(SettingsKeys::CurrentTourSteps)?;

    let current_hash_set: HashSet<_> = current_tour_steps.iter().cloned().collect();
    let new_hash_set: HashSet<_> = new_steps.iter().cloned().collect();

    if current_hash_set != new_hash_set {
        if current_tour_steps.is_empty() {
            settings::set_item(SettingsKeys::PrevTourSteps, new_steps.clone())?;
        } else {
            settings::set_item(SettingsKeys::PrevTourSteps, current_tour_steps)?;
        }

        settings::set_item(SettingsKeys::CurrentTourSteps, new_steps)?;
    }

    return Ok(())
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
    let timestamp_usec = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| format!("{:?}", e))?;

    let event = UniChatEvent::Clear {
        event_type: String::from(UNICHAT_EVENT_CLEAR_TYPE),
        data: UniChatClearEventPayload {
            platform: None,

            timestamp: timestamp_usec.as_secs() as i64
        }
    };

    if let Err(err) = events::event_emitter().emit(event) {
        log::error!("An error occurred on send 'unichat:clear' unichat event: {}", err);
    }

    return Ok(utils::is_dev())
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn list_widgets<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<Value, String> {
    let user_widgets_dir = properties::get_app_path(AppPaths::UniChatUserWidgets);
    if !user_widgets_dir.is_dir() {
        return Err("An error occurred on iterate over user widgets dir".into());
    }

    let system_widgets_dir = properties::get_app_path(AppPaths::UniChatSystemWidget);
    if !system_widgets_dir.is_dir() {
        return Err("An error occurred on iterate over system widgets dir".into());
    }

    let mut user_widgets: Vec<String> = Vec::new();
    let user_widgets_read = fs::read_dir(&user_widgets_dir).map_err(|e| format!("{:?}", e))?;
    for entry in user_widgets_read {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    if name.starts_with(".") {
                        continue; // Skip hidden folders
                    }

                    user_widgets.push(name.to_string());
                }
            }
        } else {
            log::error!("An error occurred on read user widgets dir: {:?}", entry);
        }
    }

    let mut system_widgets: Vec<String> = Vec::new();
    let system_widgets_read = fs::read_dir(&system_widgets_dir).map_err(|e| format!("{:?}", e))?;
    for entry in system_widgets_read {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    if name.starts_with(".") {
                        continue; // Skip hidden folders
                    }

                    system_widgets.push(name.to_string());
                }
            }
        } else {
            log::error!("An error occurred on read user widgets dir: {:?}", entry);
        }
    }

    return Ok(json!([
        { "group": "System Widgets", "items": system_widgets },
        { "group": "User Widgets", "items": user_widgets }
    ]));
}

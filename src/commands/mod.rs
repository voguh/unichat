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
use std::path::PathBuf;
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
use crate::utils::constants::BASE_REST_PORT;
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

/* ================================================================================================================== */

fn parse_fs_error(e: std::io::Error, path: &PathBuf) -> String {
    return match e.kind() {
        std::io::ErrorKind::NotFound => format!("File or directory '{:?}' not found", path),
        std::io::ErrorKind::PermissionDenied => format!("Permission denied for file or directory '{:?}'", path),
        std::io::ErrorKind::AlreadyExists => format!("File or directory '{:?}' already exists", path),
        _ => format!("{:?}", e)
    };
}

/* ================================================================================================================== */

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

    let system_widgets_dir = properties::get_app_path(AppPaths::UniChatSystemWidgets);
    if !system_widgets_dir.is_dir() {
        return Err("An error occurred on iterate over system widgets dir".into());
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

                    if !system_widgets.iter().any(|w| w == name) {
                        user_widgets.push(name.to_string());
                    }
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

/* ================================================================================================================== */

#[tauri::command]
pub async fn get_widget_fields<R: Runtime>(_app: tauri::AppHandle<R>, widget: String) -> Result<String, String> {
    let user_widgets_dir = properties::get_app_path(AppPaths::UniChatUserWidgets);
    if !user_widgets_dir.is_dir() {
        return Err("User widgets directory does not exist".into());
    }

    let fields_path = user_widgets_dir.join(&widget).join("fields.json");
    if !fields_path.is_file() {
        return Err("Widget fields file does not exist".into());
    }

    return fs::read_to_string(&fields_path).map_err(|e| parse_fs_error(e, &fields_path));
}

#[tauri::command]
pub async fn get_widget_fieldstate<R: Runtime>(_app: tauri::AppHandle<R>, widget: String) -> Result<String, String> {
    let user_widgets_dir = properties::get_app_path(AppPaths::UniChatUserWidgets);
    if !user_widgets_dir.is_dir() {
        return Err("User widgets directory does not exist".into());
    }

    let fieldstate_path = user_widgets_dir.join(&widget).join("fieldstate.json");
    if !fieldstate_path.is_file() {
        return Err("Widget fieldstate file does not exist".into());
    }

    return fs::read_to_string(&fieldstate_path).map_err(|e| parse_fs_error(e, &fieldstate_path));
}

#[tauri::command]
pub async fn set_widget_fieldstate<R: Runtime>(_app: tauri::AppHandle<R>, widget: String, data: String) -> Result<(), String> {
    let user_widgets_dir = properties::get_app_path(AppPaths::UniChatUserWidgets);
    if !user_widgets_dir.is_dir() {
        return Err("User widgets directory does not exist".into());
    }

    let fieldstate_path = user_widgets_dir.join(&widget).join("fieldstate.json");
    if fieldstate_path.exists() && !fieldstate_path.is_file() {
        return Err("Widget fieldstate path is not a file".into());
    }

    return fs::write(&fieldstate_path, data).map_err(|e| parse_fs_error(e, &fieldstate_path));
}

/* ================================================================================================================== */

#[derive(serde::Serialize, serde::Deserialize)]
pub struct GalleryItem {
    title: String,
    #[serde(rename = "type")]
    item_type: String,
    url: String
}

#[tauri::command]
pub async fn get_gallery_items<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<Vec<GalleryItem>, String> {
    let gallery_path = properties::get_app_path(AppPaths::UniChatGallery);

    let mut gallery_items: Vec<GalleryItem> = Vec::new();

    let gallery_read = fs::read_dir(&gallery_path).map_err(|e| format!("{:?}", e))?;
    for entry in gallery_read {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_file() {
                if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                    let title = path.file_stem().and_then(|n| n.to_str()).unwrap_or("Untitled").to_string();
                    let url = format!("http://localhost:{}/gallery/{}", BASE_REST_PORT, path.file_name().and_then(|n| n.to_str()).unwrap_or(""));

                    let item_type = match ext.to_lowercase().as_str() {
                        "png" | "jpg" | "jpeg" | "gif" | "bmp" | "webp" => "image",
                        "mp4" | "webm" | "ogg" | "mov" => "video",
                        "mp3" | "wav" | "flac" | "aac" => "audio",
                        _ => "file"
                    }.to_string();

                    gallery_items.push(GalleryItem { title, item_type, url });
                }
            }
        }
    }

    return Ok(gallery_items);
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct GalleryFile {
    name: String,
    data: Vec<u8>
}

#[tauri::command]
pub async fn upload_gallery_items<R: Runtime>(_app: tauri::AppHandle<R>, files: Vec<GalleryFile>) -> Result<(), String> {
    let gallery_path = properties::get_app_path(AppPaths::UniChatGallery);
    if !gallery_path.exists() {
        fs::create_dir_all(&gallery_path).map_err(|e| parse_fs_error(e, &gallery_path))?;
    }

    for file in files {
        let file_path = gallery_path.join(&file.name);
        fs::write(&file_path, &file.data).map_err(|e| parse_fs_error(e, &file_path))?;
    }

    return Ok(());
}

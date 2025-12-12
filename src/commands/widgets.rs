/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::fs;

use serde_json::Value;
use serde_json::json;
use tauri::AppHandle;
use tauri::Runtime;

use crate::commands::parse_fs_error;
use crate::commands::serialize_error;
use crate::utils::properties;
use crate::utils::properties::AppPaths;

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

#[tauri::command]
pub async fn list_widgets<R: Runtime>(_app: AppHandle<R>) -> Result<Value, String> {
    let user_widgets_dir = properties::get_app_path(AppPaths::UniChatUserWidgets);
    if !user_widgets_dir.is_dir() {
        return Err("An error occurred on iterate over user widgets dir".into());
    }

    let system_widgets_dir = properties::get_app_path(AppPaths::UniChatSystemWidgets);
    if !system_widgets_dir.is_dir() {
        return Err("An error occurred on iterate over system widgets dir".into());
    }

    let mut system_widgets: Vec<String> = Vec::new();
    let system_widgets_read = fs::read_dir(&system_widgets_dir).map_err(serialize_error)?;
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
    let user_widgets_read = fs::read_dir(&user_widgets_dir).map_err(serialize_error)?;
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

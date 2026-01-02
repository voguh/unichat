/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::fs;

use serde_json::json;
use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::settings;
use crate::utils::settings::SETTINGS_DEFAULT_PREVIEW_WIDGET_KEY;

#[tauri::command]
pub async fn get_default_preview_widget<R: Runtime>(_app: AppHandle<R>) -> Result<String, String> {
    let default_preview_widget = settings::get_item(SETTINGS_DEFAULT_PREVIEW_WIDGET_KEY)
        .map_err(|e| format!("An error occurred on get default preview widget setting: {:#?}", e))?;

    return Ok(default_preview_widget);
}

#[tauri::command]
pub async fn set_default_preview_widget<R: Runtime>(_app: AppHandle<R>, widget: String) -> Result<(), String> {
    settings::set_item(SETTINGS_DEFAULT_PREVIEW_WIDGET_KEY, &widget)
        .map_err(|e| format!("An error occurred on set default preview widget setting: {:#?}", e))?;
    return Ok(());
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

    let result = fs::read_to_string(&fields_path).map_err(|e| format!("Failed to read widget fields file: {:#?}", e))?;
    return Ok(result);
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

    let result = fs::read_to_string(&fieldstate_path).map_err(|e| format!("Failed to read widget fieldstate file: {:#?}", e))?;
    return Ok(result);
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

    fs::write(&fieldstate_path, data).map_err(|e| format!("Failed to write widget fieldstate file: {:#?}", e))?;
    return Ok(());
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
    let system_widgets_read = fs::read_dir(&system_widgets_dir).map_err(|e| format!("An error occurred on read system widgets dir: {:#?}", e))?;
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
    let user_widgets_read = fs::read_dir(&user_widgets_dir).map_err(|e| format!("An error occurred on read user widgets dir: {:#?}", e))?;
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

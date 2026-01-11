/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::fs;

use serde_json::json;
use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::widgets::WidgetSource;
use crate::widgets::get_widget_from_rest_path;
use crate::widgets::get_widgets;
use crate::widgets::reload_user_widgets;

#[tauri::command]
pub async fn get_widget_fields<R: Runtime>(_app: tauri::AppHandle<R>, widget: String) -> Result<HashMap<String, Value>, String> {
    let widget = get_widget_from_rest_path(&widget).map_err(|e| format!("Failed to locate widget '{}': {:#?}", widget, e))?;
    if let WidgetSource::User = widget.widget_source {
        let fields = widget.fields();

        return Ok(fields);
    }

    return Err("Cannot get fields of system or plugin widgets".into());
}

#[tauri::command]
pub async fn get_widget_fieldstate<R: Runtime>(_app: tauri::AppHandle<R>, widget: String) -> Result<HashMap<String, Value>, String> {
    let widget = get_widget_from_rest_path(&widget).map_err(|e| format!("Failed to locate widget '{}': {:#?}", widget, e))?;
    if let WidgetSource::User = widget.widget_source {
        let fieldstate = widget.fieldstate();

        return Ok(fieldstate);
    }

    return Err("Cannot get fieldstate of system or plugin widgets".into());
}

#[tauri::command]
pub async fn set_widget_fieldstate<R: Runtime>(_app: tauri::AppHandle<R>, widget: String, data: String) -> Result<(), String> {
    let widget = get_widget_from_rest_path(&widget).map_err(|e| format!("Failed to locate widget '{}': {:#?}", widget, e))?;
    if let WidgetSource::User = widget.widget_source {
        let fieldstate_path = widget.fieldstate_path();
        if fieldstate_path.exists() && !fieldstate_path.is_file() {
            return Err("Widget 'fieldstate.json' file does not exist".into());
        }

        fs::write(&fieldstate_path, data).map_err(|e| format!("Failed to write widget '{}' fieldstate file: {:#?}", widget.name, e))?;
        return Ok(());
    }

    return Err("Cannot set fieldstate of system or plugin widgets".into());
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn list_widgets<R: Runtime>(_app: AppHandle<R>) -> Result<Value, String> {
    let widgets = get_widgets().map_err(|e| format!("Failed to get widgets list: {:#?}", e))?;

    let mut system_widgets: Vec<String> = Vec::new();
    let mut user_widgets: Vec<String> = Vec::new();
    let mut plugins_widgets: Vec<String> = Vec::new();

    for widget in widgets.iter() {
        match widget.widget_source {
            WidgetSource::System => {
                system_widgets.push(widget.rest_path.clone());
            }
            WidgetSource::User => {
                user_widgets.push(widget.rest_path.clone());
            }
            WidgetSource::Plugin(_) => {
                plugins_widgets.push(widget.rest_path.clone());
            }
        }
    }

    return Ok(json!([
        { "group": "System Widgets", "items": system_widgets },
        { "group": "User Widgets", "items": user_widgets },
        { "group": "Plugin Widgets", "items": plugins_widgets }
    ]));
}

#[tauri::command]
pub async fn reload_widgets<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<(), String> {
    reload_user_widgets().map_err(|e| format!("Failed to reload user widgets: {:#?}", e))?;
    return Ok(());
}

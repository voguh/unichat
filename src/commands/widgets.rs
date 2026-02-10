/*!******************************************************************************

 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;
use std::fs;

use indexmap::IndexMap;
use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::widgets;
use crate::widgets::WidgetMetadata;
use crate::widgets::WidgetSource;
use crate::widgets::get_widget_from_rest_path;
use crate::widgets::reload_user_widgets;

#[tauri::command]
pub async fn get_widget_fields<R: Runtime>(_app: tauri::AppHandle<R>, widget: String) -> Result<IndexMap<String, Value>, String> {
    let widget = get_widget_from_rest_path(&widget).map_err(|e| format!("Failed to locate widget '{}': {:#?}", widget, e))?;
    if matches!(widget.widget_source, WidgetSource::User | WidgetSource::UserPlugin(_)) {
        let fields = widget.fields();

        return Ok(fields);
    }

    return Err("Cannot get fields of system or plugin widgets".into());
}

#[tauri::command]
pub async fn get_widget_fieldstate<R: Runtime>(_app: tauri::AppHandle<R>, widget: String) -> Result<HashMap<String, Value>, String> {
    let widget = get_widget_from_rest_path(&widget).map_err(|e| format!("Failed to locate widget '{}': {:#?}", widget, e))?;
    if matches!(widget.widget_source, WidgetSource::User | WidgetSource::UserPlugin(_)) {
        let fieldstate = widget.fieldstate();
        return Ok(fieldstate);
    }

    return Err("Cannot get fieldstate of system or plugin widgets".into());
}

#[tauri::command]
pub async fn set_widget_fieldstate<R: Runtime>(_app: tauri::AppHandle<R>, widget: String, data: String) -> Result<(), String> {
    let widget = get_widget_from_rest_path(&widget).map_err(|e| format!("Failed to locate widget '{}': {:#?}", widget, e))?;
    if matches!(widget.widget_source, WidgetSource::User | WidgetSource::UserPlugin(_)) {
        let fieldstate_path = widget.fieldstate_path();
        if fieldstate_path.exists() && !fieldstate_path.is_file() {
            return Err(format!("Widget '{:?}' exists but is not a file", fieldstate_path));
        }

        fs::write(&fieldstate_path, data).map_err(|e| format!("Failed to write widget '{:?}' fieldstate file: {:#?}", fieldstate_path, e))?;
        return Ok(());
    }

    return Err("Cannot set fieldstate of system or plugin widgets".into());
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn get_widgets<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<WidgetMetadata>, String> {
    reload_user_widgets().map_err(|e| format!("Failed to reload user widgets: {:#?}", e))?;
    let widgets = widgets::get_widgets().map_err(|e| format!("Failed to get widgets list: {:#?}", e))?;
    return Ok(widgets);
}

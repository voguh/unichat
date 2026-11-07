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

use serde_json::Map;
use serde_json::Value;
use tauri::AppHandle;
use tauri::Runtime;

use crate::widgets;
use crate::widgets::WidgetMetadata;
use crate::widgets::WidgetSource;
use crate::widgets::get_widget_from_rest_path;
use crate::widgets::reload_user_widgets;

/* ========================================================================== */

fn find_user_widget(widget: &str) -> Result<WidgetMetadata, String> {
    let found = get_widget_from_rest_path(widget);
    let metadata = found.ok_or_else(|| format!("Widget '{}' not found", widget))?;
    if metadata.widget_source == WidgetSource::System {
        return Err(format!("Widget '{}' is a system widget", widget));
    }

    return Ok(metadata);
}

/* ========================================================================== */

#[tauri::command]
pub async fn get_widget_fields<R: Runtime>(_app: AppHandle<R>, widget: String) -> Result<Map<String, Value>, String> {
    let metadata = find_user_widget(&widget)?;
    return Ok(metadata.fields());
}

/* ========================================================================== */

#[tauri::command]
pub async fn get_widget_fieldstate<R: Runtime>(
    _app: AppHandle<R>,
    widget: String
) -> Result<HashMap<String, Value>, String> {
    let metadata = find_user_widget(&widget)?;
    return Ok(metadata.fieldstate());
}

/* ========================================================================== */

#[tauri::command]
pub async fn get_widgets<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<WidgetMetadata>, String> {
    reload_user_widgets().map_err(|e| format!("Failed to reload user widgets: {:#?}", e))?;
    let widgets = widgets::get_widgets();
    return Ok(widgets);
}

/* ========================================================================== */

#[tauri::command]
pub async fn set_widget_fieldstate<R: Runtime>(
    _app: AppHandle<R>,
    widget: String,
    fieldstate: HashMap<String, Value>
) -> Result<(), String> {
    let metadata = find_user_widget(&widget)?;

    let path = metadata.fieldstate_path();
    let serialized = serde_json::to_string(&fieldstate).expect("Fieldstate serializes to JSON");
    fs::write(&path, serialized).map_err(|e| format!("Failed to write fieldstate '{:?}': {:#?}", path, e))?;

    return Ok(());
}

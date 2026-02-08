/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use anyhow::anyhow;
use anyhow::Error;
use serde_json::json;
use serde_json::Value;
use tauri::Emitter as _;
use tauri::Manager as _;

use crate::get_app_handle;

pub fn emit_notification(title:&str, message: &str) -> Result<(), Error> {
    let app_handle = get_app_handle();

    let window = app_handle.get_webview_window("main").ok_or(anyhow!("Main window not found"))?;
    window.emit("unichat://notification", json!({ "title": title, "message": message }))?;
    return Ok(());
}

pub fn emit(mut payload: Value) -> Result<(), Error> {
    let app_handle = get_app_handle();

    if payload.get("type").is_none() {
        return Err(anyhow!("Missing 'type' field in YouTube raw event payload"));
    }

    if payload.get("scraperId").is_none() {
        return Err(anyhow!("Missing 'scraperId' field in YouTube raw event payload"));
    }

    if payload.get("timestamp").is_none() {
        let now = SystemTime::now().duration_since(UNIX_EPOCH)?;
        payload["timestamp"] = json!(now.as_millis());
    }

    if let Some(window) = app_handle.get_webview_window("main") {
        let _ = window.emit("unichat://status:event", payload);
    }

    return Ok(());
}

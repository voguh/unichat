/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use serde_json::json;
use tauri::Emitter as _;
use tauri::Manager as _;

use crate::get_app_handle;
use crate::scraper::status::ScraperStatusEvent;

pub fn emit_notification(title:&str, message: &str) {
    let app_handle = get_app_handle();

    if let Some(window) = app_handle.get_webview_window("main") {
        if let Err(err) = window.emit("unichat://notification", json!({ "title": title, "message": message })) {
            log::error!("An error occurred on emit notification: {:#?}", err);
        }
    }
}

pub fn emit_status(event: &ScraperStatusEvent) {
    let app_handle = get_app_handle();

    if let Some(window) = app_handle.get_webview_window("main") {
        if let Err(err) = window.emit("unichat://status:event", event) {
            log::error!("An error occurred on emit scraper status: {:#?}", err);
        }
    }
}

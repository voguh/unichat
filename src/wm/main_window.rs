/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::Error;
use serde::Serialize;
use serde_json::json;
use tauri::Emitter as _;
use tauri::Manager as _;
use tauri::WebviewUrl;

use crate::UNICHAT_DISPLAY_NAME;
use crate::UNICHAT_VERSION;
use crate::get_app_handle;
use crate::scraper::ScraperStatusEvent;
use crate::wm::splash_window;
use crate::wm::window;

/* ========================================================================== */

pub const MAIN_WINDOW_LABEL: &str = "main";

pub fn create() -> Result<(), Error> {
    window::new(MAIN_WINDOW_LABEL, WebviewUrl::App("index.html".into()))
        .title(format!("{} v{}", UNICHAT_DISPLAY_NAME, UNICHAT_VERSION))
        .inner_size(1180.0, 640.0)
        .maximizable(false)
        .resizable(false)
        .center()
        .visible(false)
        .initialization_script(window::webapp_globals_script())
        .on_page_load(splash_window::on_page_load_close_splash)
        .build()?;

    log::info!("Main window created successfully.");

    return Ok(());
}

/* ========================================================================== */

fn emit<S: Serialize + Clone>(event: &str, payload: S) {
    let app_handle = get_app_handle();

    if let Some(window) = app_handle.get_webview_window(MAIN_WINDOW_LABEL) {
        if let Err(err) = window.emit(event, payload) {
            log::error!("An error occurred on emit '{}': {:#?}", event, err);
        }
    }
}

pub fn emit_notification(title: &str, message: &str) {
    emit("unichat://notification", json!({ "title": title, "message": message }));
}

pub fn emit_status(event: &ScraperStatusEvent) {
    emit("unichat://status:event", event);
}

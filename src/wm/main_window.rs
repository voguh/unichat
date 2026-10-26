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
use serde_json::json;
use tauri::Emitter as _;
use tauri::Manager as _;
use tauri::WebviewWindow;
use tauri::Wry;
use tauri::webview::PageLoadPayload;

use crate::UNICHAT_DISPLAY_NAME;
use crate::UNICHAT_VERSION;
use crate::get_app_handle;
use crate::scraper::ScraperStatusEvent;
use crate::wm::splash_window;
use crate::wm::window;

/* ========================================================================== */

pub const MAIN_WINDOW_LABEL: &str = "main";

fn on_page_load(window: WebviewWindow<Wry>, payload: PageLoadPayload<'_>) {
    if window::show_on_page_finished(&window, &payload) {
        splash_window::close();
    }
}

pub fn create() -> Result<(), Error> {
    window::new(MAIN_WINDOW_LABEL, "index.html")
        .title(format!("{} v{}", UNICHAT_DISPLAY_NAME, UNICHAT_VERSION))
        .inner_size(1180.0, 640.0)
        .maximizable(false)
        .resizable(false)
        .center()
        .visible(false)
        .initialization_script(window::webapp_globals_script())
        .on_page_load(on_page_load)
        .build()?;

    log::info!("Main window created successfully.");

    return Ok(());
}

/* ========================================================================== */

pub fn emit_notification(title: &str, message: &str) {
    let app_handle = get_app_handle();

    if let Some(window) = app_handle.get_webview_window(MAIN_WINDOW_LABEL) {
        if let Err(err) = window.emit("unichat://notification", json!({ "title": title, "message": message })) {
            log::error!("An error occurred on emit notification: {:#?}", err);
        }
    }
}

pub fn emit_status(event: &ScraperStatusEvent) {
    let app_handle = get_app_handle();

    if let Some(window) = app_handle.get_webview_window(MAIN_WINDOW_LABEL) {
        if let Err(err) = window.emit("unichat://status:event", event) {
            log::error!("An error occurred on emit scraper status: {:#?}", err);
        }
    }
}

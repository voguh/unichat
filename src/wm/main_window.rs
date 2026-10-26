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
use tauri::WebviewWindow;
use tauri::Wry;
use tauri::webview::PageLoadPayload;

use crate::UNICHAT_DISPLAY_NAME;
use crate::UNICHAT_VERSION;
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

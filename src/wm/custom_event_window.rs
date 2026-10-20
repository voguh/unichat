/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::anyhow;
use anyhow::Error;
use tauri::webview::PageLoadPayload;
use tauri::Manager as _;
use tauri::WebviewWindow;
use tauri::Wry;

use crate::get_app_handle;
use crate::utils::is_dev;
use crate::wm::main_window;
use crate::wm::window;
use crate::UNICHAT_DISPLAY_NAME;

pub const CUSTOM_EVENT_WINDOW_LABEL: &str = "custom-event";

fn on_page_load(window: WebviewWindow<Wry>, payload: PageLoadPayload<'_>) {
    if window::show_on_page_finished(&window, &payload) {
        if let Err(err) = window.set_focus() {
            log::error!("Failed to focus custom event window: {:#?}", err);
        }
    }
}

pub fn open() -> Result<(), Error> {
    let app = get_app_handle();

    if let Some(window) = app.get_webview_window(CUSTOM_EVENT_WINDOW_LABEL) {
        window.show()?;
        window.set_focus()?;

        return Ok(());
    }

    let main_window = app.get_webview_window(main_window::MAIN_WINDOW_LABEL)
        .ok_or(anyhow!("Main window not found"))?;

    window::new(CUSTOM_EVENT_WINDOW_LABEL, "custom-event.html")
        .title(format!("{} - Custom Event", UNICHAT_DISPLAY_NAME))
        .inner_size(960.0, 600.0)
        .resizable(false).maximizable(false).minimizable(false).center().visible(false)
        .parent(&main_window)?
        .initialization_script(format!("globalThis.__IS_DEV__ = {};", is_dev()))
        .on_page_load(on_page_load)
        .build()?;

    log::info!("Custom event window created successfully.");

    return Ok(());
}

pub fn close() -> Result<(), Error> {
    if let Some(window) = get_app_handle().get_webview_window(CUSTOM_EVENT_WINDOW_LABEL) {
        window.destroy()?;
    }

    return Ok(());
}

/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use tauri::Manager as _;

use crate::utils::userstore::flush_userstore;

pub mod custom_event_window;
pub mod error_window;
pub mod main_window;
pub mod splash_window;
pub mod window;

/* ========================================================================== */

fn shutdown(app: &tauri::AppHandle, exit_code: i32) {
    if let Err(err) = flush_userstore() {
        log::error!("Failed to flush userstore to disk: {:#?}", err);
    }

    for (key, window) in app.webview_windows() {
        if key != main_window::MAIN_WINDOW_LABEL {
            if let Err(err) = window.destroy() {
                log::error!("Failed to destroy window '{}': {:#?}", key, err);
            }
        }
    }

    app.exit(exit_code);
}

pub fn on_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    let app = window.app_handle();
    let label = window.label();

    if let tauri::WindowEvent::Destroyed = event {
        log::info!("Window '{}' destroyed.", label);

        if label == main_window::MAIN_WINDOW_LABEL {
            shutdown(app, 0);
        } else if label == error_window::ERROR_WINDOW_LABEL {
            shutdown(app, 1);
        } else if label == splash_window::SPLASH_WINDOW_LABEL {
            let has_main_window = app.get_webview_window(main_window::MAIN_WINDOW_LABEL).is_some();
            let has_error_window = app.get_webview_window(error_window::ERROR_WINDOW_LABEL).is_some();
            if !has_main_window && !has_error_window {
                shutdown(app, 0);
            }
        }
    } else if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        if label.ends_with("-chat") || label == custom_event_window::CUSTOM_EVENT_WINDOW_LABEL {
            api.prevent_close();

            if let Err(err) = window.hide() {
                log::error!("Failed to hide window '{}': {:#?}", label, err);
            }
        }
    }
}

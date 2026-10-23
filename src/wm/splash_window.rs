/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::sync::LazyLock;
use std::sync::RwLock;
use std::sync::RwLockReadGuard;

use anyhow::Error;
use tauri::Emitter as _;
use tauri::Manager as _;
use tauri::WebviewWindow;

use crate::UNICHAT_DISPLAY_NAME;
use crate::UNICHAT_VERSION;
use crate::get_app_handle;
use crate::wm::window;

/* ========================================================================== */

pub const SPLASH_WINDOW_LABEL: &str = "splash-screen";
pub const SPLASH_WINDOW_READY_EVENT: &str = "unichat://splashscreen:ready";
pub const TOTAL_STAGES: u8 = 15;

/* ========================================================================== */

static CURRENT_STAGE: LazyLock<RwLock<(u8, String)>> = LazyLock::new(|| RwLock::new((0, String::new())));
fn read() -> RwLockReadGuard<'static, (u8, String)> {
    return CURRENT_STAGE.read().expect("SplashWindow::CURRENT_STAGE lock poisoned");
}

fn write(step: u8, message: String) {
    let mut current_stage = CURRENT_STAGE.write().expect("SplashWindow::CURRENT_STAGE lock poisoned");
    *current_stage = (step, message);
}

/* ========================================================================== */

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct SplashProgressEvent {
    step: u8,
    total: u8,
    message: String
}

/* ========================================================================== */

pub fn create() -> Result<WebviewWindow, Error> {
    let window = window::new(SPLASH_WINDOW_LABEL, "splash-screen.html")
        .title(format!("{} v{}", UNICHAT_DISPLAY_NAME, UNICHAT_VERSION))
        .inner_size(500.0, 300.0)
        .center()
        .focused(true)
        .decorations(false)
        .resizable(false)
        .maximizable(false)
        .minimizable(false)
        .closable(false)
        .build()?;

    return Ok(window);
}

pub fn close() {
    if let Some(window) = get_app_handle().get_webview_window(SPLASH_WINDOW_LABEL) {
        if let Err(err) = window.close() {
            log::error!("Failed to close splash screen: {:#?}", err);
        }
    }
}

/* ========================================================================== */

fn report(step: u8, message: &str) {
    write(step, message.to_string());

    if let Some(window) = get_app_handle().get_webview_window(SPLASH_WINDOW_LABEL) {
        let event = SplashProgressEvent {
            step: step,
            total: TOTAL_STAGES,
            message: message.to_string()
        };

        if let Err(err) = window.emit("unichat://splashscreen:update", &event) {
            log::error!("Failed to emit splash screen progress: {:#?}", err);
        }
    }
}

pub fn begin(message: impl Into<String>) {
    let message = message.into();
    log::info!("{}", message);
    report(0, &message);
}

pub fn stage(step: u8, message: impl Into<String>) {
    let message = message.into();
    log::info!("[{:02}/{}] {}", step, TOTAL_STAGES, message);
    report(step, &message);
}

pub fn end(message: impl Into<String>) {
    let message = message.into();
    log::info!("{}", message);
    report(TOTAL_STAGES, &message);
}

pub fn current_stage() -> (u8, String) {
    return read().clone();
}

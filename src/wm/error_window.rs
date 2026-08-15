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
use tauri::Manager as _;

use crate::get_app_handle;
use crate::wm::splash_window;
use crate::wm::window;
use crate::UNICHAT_DISPLAY_NAME;
use crate::UNICHAT_NAME;
use crate::UNICHAT_VERSION;

pub const ERROR_WINDOW_LABEL: &str = "error";

fn resolve_log_file() -> Option<String> {
    let log_dir = get_app_handle().path().app_log_dir().ok()?;
    let log_file = log_dir.join(format!("{}.log", UNICHAT_NAME));

    return Some(log_file.to_string_lossy().to_string());
}

pub fn open(err: &Error) {
    let (step, stage_message) = splash_window::current_stage();

    let payload = json!({
        "displayName": UNICHAT_DISPLAY_NAME,
        "version": UNICHAT_VERSION,
        "step": step,
        "total": splash_window::TOTAL_STAGES,
        "stageMessage": stage_message,
        "message": err.to_string(),
        "detail": format!("{:#?}", err),
        "logFile": resolve_log_file()
    });

    let serialized_payload = serde_json::to_string(&payload).unwrap_or_else(|_| "null".to_string());

    let result = window::new(ERROR_WINDOW_LABEL, "error.html")
        .title(format!("{} v{}", UNICHAT_DISPLAY_NAME, UNICHAT_VERSION))
        .inner_size(640.0, 460.0)
        .center().focused(true).resizable(false).maximizable(false)
        .initialization_script(format!("globalThis.__UNICHAT_ERROR__ = {};", serialized_payload))
        .build();

    if let Err(err) = result {
        log::error!("Failed to open startup error window: {:#?}", err);
    }
}

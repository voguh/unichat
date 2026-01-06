/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::sync::OnceLock;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use anyhow::anyhow;
use anyhow::Error;
use serde_json::json;
use serde_json::Value;
use tauri::AppHandle;
use tauri::Emitter;
use tauri::Manager;

const ONCE_LOCK_NAME: &str = "RenderEmitter::APP_HANDLE";
static APP_HANDLE: OnceLock<AppHandle<tauri::Wry>> = OnceLock::new();

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Error> {
    APP_HANDLE.set(app.handle().to_owned()).map_err(|_| anyhow!("{} already initialized", ONCE_LOCK_NAME))?;

    return Ok(());
}

pub fn emit(mut payload: Value) -> Result<(), Error> {
    let app_handle = APP_HANDLE.get().ok_or(anyhow!("{} was not initialized", ONCE_LOCK_NAME))?;

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

    let window = app_handle.get_webview_window("main").ok_or(anyhow!("Main window not found"))?;
    window.emit("unichat://status:event", payload)?;
    return Ok(());
}

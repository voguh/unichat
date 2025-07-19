/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

use std::sync::OnceLock;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use serde_json::json;
use serde_json::Value;
use tauri::AppHandle;
use tauri::Emitter;
use tauri::Manager;

static APP_HANDLE: OnceLock<AppHandle<tauri::Wry>> = OnceLock::new();

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    APP_HANDLE.set(app.handle().to_owned()).map_err(|_| "RenderEmitter already initialized")?;

    return Ok(());
}

pub fn emit(mut payload: Value) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = APP_HANDLE.get().ok_or("App handle not initialized")?;

    if payload.get("type").is_none() {
        return Err("Missing 'type' field in YouTube raw event payload".into());
    }

    if payload.get("platform").is_none() {
        return Err("Missing 'platform' field in YouTube raw event payload".into());
    }

    if payload.get("timestamp").is_none() {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| format!("{:?}", e))?;
        payload["timestamp"] = json!(now.as_millis());
    }

    let window = app_handle.get_webview_window("main").ok_or("Main window not found")?;
    window.emit("unichat://status:event", payload).map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;
    return Ok(());
}

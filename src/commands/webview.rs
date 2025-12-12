/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use tauri::AppHandle;
use tauri::Manager as _;
use tauri::Runtime;
use tauri::Url;

use crate::commands::serialize_error;
use crate::utils::constants::CHAT_WINDOWS;

fn decode_url(scrapper: &str, url: &str) -> Result<Url, String> {
    let mut url = url.to_string();

    if url.is_empty() || url == "about:blank" || !url.starts_with("https://") {
        url = format!("tauri://localhost/{}-await.html", scrapper);
    }

    return Url::parse(&url).map_err(serialize_error);
}

/* ============================================================================================== */

#[tauri::command]
pub fn get_scrapper_webview_url<R: Runtime>(app: AppHandle<R>, label: &str) -> Result<String, String> {
    if !label.ends_with("-chat") || CHAT_WINDOWS.iter().all(|&w| w != label) {
        return Err(format!("Webview window '{}' not recognized", label));
    }

    let webview_window = app.get_webview_window(label).ok_or(format!("Scrapper window '{}' not found", label))?;
    let url = webview_window.url().map_err(serialize_error)?;

    return Ok(url.to_string());
}

#[tauri::command]
pub fn set_scrapper_webview_url<R: Runtime>(app: AppHandle<R>, label: &str, url: &str) -> Result<(), String> {
    if !label.ends_with("-chat") || CHAT_WINDOWS.iter().all(|&w| w != label) {
        return Err(format!("Webview window '{}' not recognized", label));
    }

    log::info!("Setting scrapper webview '{}' to URL '{}'", label, url);
    let webview_window = app.get_webview_window(label).ok_or(format!("Scrapper window '{}' not found", label))?;

    let parsed_url = decode_url(label.trim_end_matches("-chat"), url)?;
    webview_window.navigate(parsed_url).map_err(serialize_error)?;

    if url == "about:blank" {
        webview_window.hide().map_err(serialize_error)?;
    }

    return Ok(());
}

#[tauri::command]
pub fn toggle_scrapper_webview<R: Runtime>(app: AppHandle<R>, label: &str) -> Result<(), String> {
    if !label.ends_with("-chat") || CHAT_WINDOWS.iter().all(|&w| w != label) {
        return Err(format!("Webview window '{}' not recognized", label));
    }

    let webview_window = app.get_webview_window(label).ok_or(format!("Scrapper window '{}' not found", label))?;
    if webview_window.is_visible().map_err(serialize_error)? {
        webview_window.hide().map_err(serialize_error)?;
    } else {
        webview_window.show().map_err(serialize_error)?;
    }

    return Ok(());
}

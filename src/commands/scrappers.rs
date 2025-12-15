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
use url::Url;

use crate::error::Error;
use crate::scrapper;
use crate::scrapper::UniChatScrapper;
use crate::utils::constants::CHAT_WINDOWS;
use crate::utils::settings;

fn decode_url(url: &str) -> Result<Url, Error> {
    let mut url = url;
    if url.trim().is_empty() || url == "about:blank" || !url.starts_with("https://") {
        url = "tauri://localhost/scrapper_idle.html";
    }

    let url = Url::parse(url)?;
    return Ok(url);
}

/* ============================================================================================== */

#[tauri::command]
pub fn get_scrappers<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<UniChatScrapper>, Error> {
    return scrapper::get_scrappers();
}

#[tauri::command]
pub fn get_scrapper<R: Runtime>(_app: AppHandle<R>, id: &str) -> Result<Option<UniChatScrapper>, Error> {
    return scrapper::get_scrapper(id);
}

#[tauri::command]
pub fn validate_scrapper_url<R: Runtime>(_app: AppHandle<R>, id: &str, url: &str) -> Result<String, Error> {
    let scrapper = scrapper::get_scrapper(id)?;
    let scrapper = scrapper.ok_or(Error::Message(format!("Scrapper with ID '{}' not found", id)))?;

    return (scrapper.validate_url)(url.to_string());
}

/* ============================================================================================== */

#[tauri::command]
pub fn get_scrapper_webview_url<R: Runtime>(app: AppHandle<R>, label: &str) -> Result<String, Error> {
    if !label.ends_with("-chat") || CHAT_WINDOWS.iter().all(|&w| w != label) {
        return Err(Error::Message(format!("Webview window '{}' not recognized", label)));
    }

    let webview_window = app.get_webview_window(label).ok_or(format!("Scrapper window '{}' not found", label))?;
    let url = webview_window.url()?;

    return Ok(url.to_string());
}

#[tauri::command]
pub fn set_scrapper_webview_url<R: Runtime>(app: AppHandle<R>, label: &str, url: &str) -> Result<(), Error> {
    if !label.ends_with("-chat") || CHAT_WINDOWS.iter().all(|&w| w != label) {
        return Err(Error::Message(format!("Webview window '{}' not recognized", label)));
    }

    log::info!("Setting scrapper webview '{}' to URL '{}'", label, url);
    let webview_window = app.get_webview_window(label).ok_or(format!("Scrapper window '{}' not found", label))?;

    let parsed_url = decode_url(url)?;
    webview_window.navigate(parsed_url.clone())?;

    if parsed_url.as_str() == "tauri://localhost/scrapper_idle.html" {
        webview_window.hide()?;
    } else {
        settings::set_scrapper_url(label, url)?;
    }

    return Ok(());
}

#[tauri::command]
pub fn toggle_scrapper_webview<R: Runtime>(app: AppHandle<R>, label: &str) -> Result<(), Error> {
    if !label.ends_with("-chat") || CHAT_WINDOWS.iter().all(|&w| w != label) {
        return Err(Error::Message(format!("Webview window '{}' not recognized", label)));
    }

    let webview_window = app.get_webview_window(label).ok_or(format!("Scrapper window '{}' not found", label))?;
    if webview_window.is_visible()? {
        webview_window.hide()?;
    } else {
        webview_window.show()?;
    }

    return Ok(());
}

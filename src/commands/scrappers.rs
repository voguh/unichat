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

use crate::error::Error;
use crate::scrapper;
use crate::scrapper::serialize_scrapper;
use crate::utils::decode_scrapper_url;
use crate::utils::settings;

/* ============================================================================================== */

#[tauri::command]
pub fn get_scrappers<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<serde_json::Value>, Error> {
    let scrappers = scrapper::get_scrappers()?;
    let serialized_scrappers: Vec<serde_json::Value> = scrappers.iter().map(|s| serialize_scrapper(s)).collect();
    return Ok(serialized_scrappers);
}

#[tauri::command]
pub fn get_scrapper<R: Runtime>(_app: AppHandle<R>, scrapper_id: &str) -> Result<Option<serde_json::Value>, Error> {
    let scrapper = scrapper::get_scrapper(scrapper_id)?;
    if let Some(scrapper) = scrapper {
        let serialized_scrapper = serialize_scrapper(&scrapper);
        return Ok(Some(serialized_scrapper));
    }

    return Ok(None);
}

#[tauri::command]
pub fn validate_scrapper_url<R: Runtime>(_app: AppHandle<R>, scrapper_id: &str, url: String) -> Result<String, Error> {
    let scrapper = scrapper::get_scrapper(scrapper_id)?;
    if let Some(scrapper) = &scrapper {
        return scrapper.validate_url(url);
    }

    return Err(Error::Message(format!("Scrapper with ID '{}' not found", scrapper_id)));
}

/* ============================================================================================== */

#[tauri::command]
pub fn get_scrapper_stored_url<R: Runtime>(_app: AppHandle<R>, scrapper_id: &str) -> Result<Option<String>, Error> {
    if !scrapper_id.ends_with("-chat") {
        return Err(Error::Message(format!("Scrapper webview '{}' not recognized", scrapper_id)));
    }

    let url = settings::get_scrapper_property(scrapper_id, "url").ok();
    return Ok(url);
}

#[tauri::command]
pub fn get_scrapper_webview_url<R: Runtime>(app: AppHandle<R>, scrapper_id: &str) -> Result<String, Error> {
    if !scrapper_id.ends_with("-chat") {
        return Err(Error::Message(format!("Webview window '{}' not recognized", scrapper_id)));
    }

    let webview_window = app.get_webview_window(scrapper_id).ok_or(format!("Scrapper window '{}' not found", scrapper_id))?;
    let url = webview_window.url()?;

    return Ok(url.to_string());
}

#[tauri::command]
pub fn set_scrapper_webview_url<R: Runtime>(app: AppHandle<R>, scrapper_id: &str, url: &str) -> Result<(), Error> {
    if !scrapper_id.ends_with("-chat") {
        return Err(Error::Message(format!("Scrapper webview '{}' not recognized", scrapper_id)));
    }

    log::info!("Setting scrapper webview '{}' to URL '{}'", scrapper_id, url);
    let webview_window = app.get_webview_window(scrapper_id).ok_or(format!("Scrapper webview '{}' not found", scrapper_id))?;

    let parsed_url = decode_scrapper_url(url)?;
    webview_window.navigate(parsed_url.clone())?;

    if parsed_url.to_string() == "tauri://localhost/scrapper_idle.html" {
        webview_window.hide()?;
    } else {
        settings::set_scrapper_property(scrapper_id, "url", &parsed_url.to_string())?;
    }

    return Ok(());
}

#[tauri::command]
pub fn toggle_scrapper_webview<R: Runtime>(app: AppHandle<R>, scrapper_id: &str) -> Result<(), Error> {
    if !scrapper_id.ends_with("-chat") {
        return Err(Error::Message(format!("Scrapper webview '{}' not recognized", scrapper_id)));
    }

    let webview_window = app.get_webview_window(scrapper_id).ok_or(format!("Scrapper webview '{}' not found", scrapper_id))?;
    if webview_window.is_visible()? {
        webview_window.hide()?;
    } else {
        webview_window.show()?;
    }

    return Ok(());
}

/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use tauri::AppHandle;
use tauri::Manager as _;
use tauri::Runtime;

use crate::scraper;
use crate::scraper::serialize_scraper;
use crate::utils::decode_scraper_url;
use crate::utils::settings;

#[tauri::command]
pub fn get_scrapers<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<serde_json::Value>, String> {
    let scrapers = scraper::get_scrapers().map_err(|e| format!("An error occurred on get scrapers: {:#?}", e))?;
    let serialized_scrapers: Vec<serde_json::Value> = scrapers.iter().map(|s| serialize_scraper(s)).collect();
    return Ok(serialized_scrapers);
}

#[tauri::command]
pub fn get_scraper<R: Runtime>(_app: AppHandle<R>, scraper_id: &str) -> Result<Option<serde_json::Value>, String> {
    let scraper = scraper::get_scraper(scraper_id).map_err(|e| format!("An error occurred on get scraper: {:#?}", e))?;
    if let Some(scraper) = scraper {
        let serialized_scraper = serialize_scraper(&scraper);
        return Ok(Some(serialized_scraper));
    }

    return Ok(None);
}

#[tauri::command]
pub fn validate_scraper_url<R: Runtime>(_app: AppHandle<R>, scraper_id: &str, url: String) -> Result<String, String> {
    let scraper = scraper::get_scraper(scraper_id).map_err(|e| format!("An error occurred on get scraper: {:#?}", e))?;
    if let Some(scraper) = &scraper {
        return scraper.validate_url(url).map_err(|e| format!("An error occurred on validate scraper URL: {:#?}", e))
    }

    return Err(format!("Scraper with ID '{}' not found", scraper_id));
}

/* ============================================================================================== */

#[tauri::command]
pub fn get_scraper_stored_url<R: Runtime>(_app: AppHandle<R>, scraper_id: &str) -> Result<Option<String>, String> {
    if !scraper_id.ends_with("-chat") {
        return Err(format!("Scraper webview '{}' not recognized", scraper_id));
    }

    let url = settings::get_scraper_property(scraper_id, "url").ok();
    return Ok(url);
}

#[tauri::command]
pub fn get_scraper_webview_url<R: Runtime>(app: AppHandle<R>, scraper_id: &str) -> Result<String, String> {
    if !scraper_id.ends_with("-chat") {
        return Err(format!("Webview window '{}' not recognized", scraper_id));
    }

    let webview_window = app.get_webview_window(scraper_id).ok_or(format!("Scraper window '{}' not found", scraper_id))?;
    let url = webview_window.url().map_err(|e| format!("An error occurred on get scraper webview URL: {:#?}", e))?;

    return Ok(url.to_string());
}

#[tauri::command]
pub fn set_scraper_webview_url<R: Runtime>(app: AppHandle<R>, scraper_id: &str, url: &str) -> Result<(), String> {
    if !scraper_id.ends_with("-chat") {
        return Err(format!("Scraper webview '{}' not recognized", scraper_id));
    }

    log::info!("Setting scraper webview '{}' to URL '{}'", scraper_id, url);
    let webview_window = app.get_webview_window(scraper_id).ok_or(format!("Scraper webview '{}' not found", scraper_id))?;

    let parsed_url = decode_scraper_url(url).map_err(|e| format!("An error occurred on decode scraper URL: {:#?}", e))?;
    webview_window.navigate(parsed_url.clone()).map_err(|e| format!("An error occurred on navigate scraper webview to URL: {:#?}", e))?;

    if parsed_url.to_string() == "tauri://localhost/scraper_idle.html" {
        webview_window.hide().map_err(|e| format!("An error occurred on hide scraper webview: {:#?}", e))?;
    } else {
        settings::set_scraper_property(scraper_id, "url", &parsed_url.to_string()).map_err(|e| format!("An error occurred on store scraper URL: {:#?}", e))?;
    }

    return Ok(());
}

#[tauri::command]
pub fn toggle_scraper_webview<R: Runtime>(app: AppHandle<R>, scraper_id: &str) -> Result<(), String> {
    if !scraper_id.ends_with("-chat") {
        return Err(format!("Scraper webview '{}' not recognized", scraper_id));
    }

    let webview_window = app.get_webview_window(scraper_id).ok_or(format!("Scraper webview '{}' not found", scraper_id))?;
    if webview_window.is_visible().map_err(|e| format!("An error occurred on get scraper webview visibility: {:#?}", e))? {
        webview_window.hide().map_err(|e| format!("An error occurred on hide scraper webview: {:#?}", e))?;
    } else {
        webview_window.show().map_err(|e| format!("An error occurred on show scraper webview: {:#?}", e))?;
    }

    return Ok(());
}

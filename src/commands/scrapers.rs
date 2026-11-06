/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use serde_json::Value;
use tauri::AppHandle;
use tauri::Manager as _;
use tauri::Runtime;

use crate::scraper;
use crate::scraper::decode_url;
use crate::scraper::serialize_scraper;
use crate::settings;

/* ========================================================================== */

#[tauri::command]
pub async fn get_scraper_stored_url<R: Runtime>(
    _app: AppHandle<R>,
    scraper_id: &str
) -> Result<Option<String>, String> {
    if !scraper_id.ends_with("-chat") {
        return Err(format!("Scraper webview '{}' not recognized", scraper_id));
    }

    let url = settings::get_scraper_url(scraper_id);
    return Ok(url);
}

/* ========================================================================== */

#[tauri::command]
pub async fn get_scraper_webview_url<R: Runtime>(
    app: AppHandle<R>,
    scraper_id: &str
) -> Result<Option<String>, String> {
    if !scraper_id.ends_with("-chat") {
        return Err(format!("Webview window '{}' not recognized", scraper_id));
    }

    if let Some(webview) = app.get_webview_window(scraper_id) {
        let url = webview.url().map_err(|e| format!("An error occurred on get scraper webview URL: {:#?}", e))?;
        return Ok(Some(url.to_string()));
    }

    return Ok(None);
}

/* ========================================================================== */

#[tauri::command]
pub async fn get_scraper<R: Runtime>(_app: AppHandle<R>, scraper_id: &str) -> Result<Option<Value>, String> {
    let scraper = scraper::get_scraper(scraper_id);
    return Ok(scraper.map(|scraper| serialize_scraper(&scraper)));
}

/* ========================================================================== */

#[tauri::command]
pub async fn get_scrapers<R: Runtime>(_app: AppHandle<R>) -> Result<Vec<Value>, String> {
    let scrapers = scraper::get_scrapers();
    let serialized_scrapers: Vec<Value> = scrapers.iter().map(serialize_scraper).collect();
    return Ok(serialized_scrapers);
}

/* ========================================================================== */

#[tauri::command]
pub async fn start_scraper<R: Runtime>(_app: AppHandle<R>, scraper_id: &str, url: &str) -> Result<(), String> {
    if !scraper_id.ends_with("-chat") {
        return Err(format!("Scraper webview '{}' not recognized", scraper_id));
    }

    log::info!("Starting scraper '{}' with URL '{}'", scraper_id, url);
    let parsed_url = decode_url(url).map_err(|e| format!("An error occurred on decode scraper URL: {:#?}", e))?;

    return scraper::start_scraper(scraper_id, parsed_url).map_err(|e| format!("Failed to start scraper: {:#?}", e));
}

/* ========================================================================== */

#[tauri::command]
pub async fn stop_scraper<R: Runtime>(_app: AppHandle<R>, scraper_id: &str) -> Result<(), String> {
    if !scraper_id.ends_with("-chat") {
        return Err(format!("Scraper webview '{}' not recognized", scraper_id));
    }

    log::info!("Stopping scraper '{}'", scraper_id);

    return scraper::stop_scraper(scraper_id).map_err(|e| format!("Failed to stop scraper: {:#?}", e));
}

/* ========================================================================== */

#[tauri::command]
pub async fn toggle_scraper_webview<R: Runtime>(app: AppHandle<R>, scraper_id: &str) -> Result<(), String> {
    if !scraper_id.ends_with("-chat") {
        return Err(format!("Scraper webview '{}' not recognized", scraper_id));
    }

    let webview = app.get_webview_window(scraper_id).ok_or_else(|| format!("Scraper webview '{}' not found", scraper_id))?;
    let visible = webview.is_visible();
    let visible = visible.map_err(|e| format!("An error occurred on get scraper webview visibility: {:#?}", e))?;
    if visible {
        webview.hide().map_err(|e| format!("An error occurred on hide scraper webview: {:#?}", e))?;
    } else {
        webview.show().map_err(|e| format!("An error occurred on show scraper webview: {:#?}", e))?;
    }

    return Ok(());
}

/* ========================================================================== */

#[tauri::command]
pub async fn validate_scraper_url<R: Runtime>(
    _app: AppHandle<R>,
    scraper_id: &str,
    url: String
) -> Result<String, String> {
    let scraper = scraper::get_scraper(scraper_id);
    if let Some(scraper) = &scraper {
        return scraper.validate_url(url).map_err(|e| format!("An error occurred on validate scraper URL: {:#?}", e));
    }

    return Err(format!("Scraper with ID '{}' not found", scraper_id));
}

/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::RwLock;

use anyhow::anyhow;
use anyhow::Error;
use tauri::Listener as _;
use tauri::WebviewWindow;
use tauri::WebviewWindowBuilder;

use crate::get_app_handle;
use crate::utils::decode_scraper_url;
use crate::utils::is_dev;
use crate::utils::settings;

pub static COMMON_SCRAPER_JS: &str = include_str!("./static/common_scraper.js");
const LAZY_LOCK_NAME: &str = "Scraper::SCRAPERS";
static SCRAPERS: LazyLock<RwLock<HashMap<String, Arc<dyn UniChatScraper + Send + Sync>>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

/* ============================================================================================== */

pub trait UniChatScraper {
    fn id(&self) -> &str;
    fn name(&self) -> &str;
    fn editing_tooltip_message(&self) -> &str;
    fn editing_tooltip_urls(&self) -> &[String];
    fn placeholder_text(&self) -> &str;
    fn badges(&self) -> &[String];
    fn icon(&self) -> &str;
    fn validate_url(&self, url: String) -> Result<String, Error>;
    fn scraper_js(&self) -> &str;
    fn on_event(&self, event: serde_json::Value) -> Result<(), Error>;
}

/* ============================================================================================== */

pub fn serialize_scraper(scraper: &Arc<dyn UniChatScraper + Send + Sync>) -> serde_json::Value {
    let serialized = serde_json::json!({
        "id": scraper.id(),
        "name": scraper.name(),
        "editingTooltipMessage": scraper.editing_tooltip_message(),
        "editingTooltipUrls": scraper.editing_tooltip_urls(),
        "placeholderText": scraper.placeholder_text(),
        "badges": scraper.badges(),
        "icon": scraper.icon(),
    });

    return serialized;
}

pub fn get_scrapers() -> Result<Vec<Arc<dyn UniChatScraper + Send + Sync>>, Error> {
    let scrapers = SCRAPERS.read().map_err(|_| anyhow!("{} lock poisoned", LAZY_LOCK_NAME))?;
    return Ok(scrapers.values().cloned().collect());
}

pub fn get_scraper(id: &str) -> Result<Option<Arc<dyn UniChatScraper + Send + Sync>>, Error> {
    let scrapers = SCRAPERS.read().map_err(|_| anyhow!("{} lock poisoned", LAZY_LOCK_NAME))?;
    return Ok(scrapers.get(id).cloned());
}

fn handle_event(payload: &str) -> Result<(), Error> {
    let payload: serde_json::Value = serde_json::from_str(payload)?;
    let scraper_id = payload.get("scraperId").and_then(|v| v.as_str())
        .ok_or(anyhow!("Missing or invalid 'scraperId' field in Twitch raw event payload"))?;

    let scrapers = SCRAPERS.read().map_err(|_| anyhow!("{} lock poisoned", LAZY_LOCK_NAME))?;
    let scraper = scrapers.get(scraper_id).ok_or(anyhow!("Scraper with ID '{}' not found", scraper_id))?;
    scraper.on_event(payload)?;

    return Ok(());
}

/* ================================================================================================================== */

fn on_page_load(scraper_js: &str, window: &tauri::WebviewWindow, payload: tauri::webview::PageLoadPayload<'_>) -> Result<(), Error> {
    let scraper_id = window.label();
    let event = payload.event();

    match event {
        tauri::webview::PageLoadEvent::Started => {
            log::debug!("Scraper webview '{}' started loading: {:}", scraper_id, payload.url());
            let stored_url: String = settings::get_scraper_property(scraper_id, "url").unwrap_or_default();
            let stored_url = url::Url::parse(&stored_url).ok();
            let current_url = payload.url();

            let is_remote = stored_url.is_some_and(|stored_url| stored_url.scheme() == current_url.scheme() && stored_url.host() == current_url.host() && stored_url.path() == current_url.path());
            let is_local = matches!(current_url.scheme(), "http" | "tauri") && matches!(current_url.host_str(), Some("localhost") | Some("tauri.localhost")) && current_url.path() == "/scraper_idle.html";

            if is_local || is_remote {
                log::info!("Injecting scraper JS into scraper '{}'", scraper_id);
                let formatted_js = COMMON_SCRAPER_JS
                    .replace("{{SCRAPER_JS}}", &scraper_js)
                    .replace("{{IS_DEV}}", &is_dev().to_string())
                    .replace("{{SCRAPER_ID}}", scraper_id);
                window.eval(&formatted_js)?;
            } else {
                log::warn!("Blocked navigation attempt in scraper '{}': {}", scraper_id, current_url);
                window.eval("window.stop();")?;

                let idle_url = decode_scraper_url("about:blank")?;
                window.navigate(idle_url)?;
            }
        }
        tauri::webview::PageLoadEvent::Finished => {
            log::debug!("Scraper webview '{}' finished loading: {:}", window.label(), payload.url());
        }
    }

    return Ok(());
}

pub fn register_scraper(scraper: Arc<dyn UniChatScraper + Send + Sync>) -> Result<WebviewWindow, Error> {
    if scraper.id().chars().any(|c| !c.is_ascii_alphanumeric() && c != '_' && c != '-') {
        return Err(anyhow!("Scraper ID '{}' contains invalid characters. Only ASCII alphanumeric characters, underscores, and hyphens are allowed.", scraper.id()));
    }

    if !scraper.id().ends_with("-chat") {
        return Err(anyhow!("Scraper ID '{}' is invalid. Scraper IDs must end with the suffix '-chat'.", scraper.id()));
    }

    /* ========================================================================================== */

    let mut scrapers = SCRAPERS.write().map_err(|_| anyhow!("{} lock poisoned", LAZY_LOCK_NAME))?;
    if scrapers.contains_key(scraper.id()) {
        return Err(anyhow!("Scraper with ID '{}' is already registered", scraper.id()));
    }

    /* ========================================================================================== */

    let start_hidden: bool = settings::get_item(settings::SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY)?;
    let webview_url = tauri::WebviewUrl::App(PathBuf::from("scraper_idle.html"));
    let scraper_js = scraper.scraper_js().to_string();

    let app_handle = get_app_handle();
    let window = WebviewWindowBuilder::new(app_handle, scraper.id(), webview_url)
        .title(format!("UniChat - Scraper ({})", scraper.name()))
        .inner_size(400.0, 576.0)
        .visible(!start_hidden)
        .resizable(false)
        .maximizable(false)
        .on_page_load(move |window, payload| {
            if let Err(err) = on_page_load(&scraper_js, &window, payload) {
                log::error!("Failed to handle page load event for scraper '{}': {:?}", window.label(), err);
            }
        })
        .build()?;

    /* ========================================================================================== */

    scrapers.insert(scraper.id().to_string(), scraper);

    window.listen("unichat://scraper_event", |event| {
        let payload = event.payload();

        if let Err(err) = handle_event(payload) {
            log::error!("Failed to handle scraper event: {:?}", err);
            log::error!("Event payload: {}", payload);
        }
    });

    return Ok(window);
}

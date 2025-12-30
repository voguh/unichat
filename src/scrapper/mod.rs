/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
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

use anyhow::Error;
use tauri::Listener as _;
use tauri::WebviewWindow;
use tauri::WebviewWindowBuilder;

use crate::utils::decode_scrapper_url;
use crate::utils::settings;

pub static COMMON_SCRAPPER_JS: &str = include_str!("./static/common_scrapper.js");
const LAZY_LOCK_NAME: &str = "Scrapper::SCRAPPERS";
static SCRAPPERS: LazyLock<RwLock<HashMap<String, Arc<dyn UniChatScrapper + Send + Sync>>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

/* ============================================================================================== */

pub trait UniChatScrapper {
    fn id(&self) -> &str;
    fn name(&self) -> &str;
    fn editing_tooltip_message(&self) -> &str;
    fn editing_tooltip_urls(&self) -> &[String];
    fn placeholder_text(&self) -> &str;
    fn badges(&self) -> &[String];
    fn icon(&self) -> &str;
    fn validate_url(&self, url: String) -> Result<String, Error>;
    fn scrapper_js(&self) -> &str;
    fn on_event(&self, event: serde_json::Value) -> Result<(), Error>;
}

/* ============================================================================================== */

pub fn serialize_scrapper(scrapper: &Arc<dyn UniChatScrapper + Send + Sync>) -> serde_json::Value {
    let serialized = serde_json::json!({
        "id": scrapper.id(),
        "name": scrapper.name(),
        "editingTooltipMessage": scrapper.editing_tooltip_message(),
        "editingTooltipUrls": scrapper.editing_tooltip_urls(),
        "placeholderText": scrapper.placeholder_text(),
        "badges": scrapper.badges(),
        "icon": scrapper.icon(),
    });

    return serialized;
}

pub fn get_scrappers() -> Result<Vec<Arc<dyn UniChatScrapper + Send + Sync>>, Error> {
    let scrappers = SCRAPPERS.read().map_err(|_| anyhow::anyhow!("{} lock poisoned", LAZY_LOCK_NAME))?;
    return Ok(scrappers.values().cloned().collect());
}

pub fn get_scrapper(id: &str) -> Result<Option<Arc<dyn UniChatScrapper + Send + Sync>>, Error> {
    let scrappers = SCRAPPERS.read().map_err(|_| anyhow::anyhow!("{} lock poisoned", LAZY_LOCK_NAME))?;
    return Ok(scrappers.get(id).cloned());
}

fn handle_event(payload: &str) -> Result<(), Error> {
    let payload: serde_json::Value = serde_json::from_str(payload)?;
    let scrapper_id = payload.get("scrapperId").and_then(|v| v.as_str())
        .ok_or(anyhow::anyhow!("Missing or invalid 'scrapperId' field in Twitch raw event payload"))?;

    let scrappers = SCRAPPERS.read().map_err(|_| anyhow::anyhow!("{} lock poisoned", LAZY_LOCK_NAME))?;
    let scrapper = scrappers.get(scrapper_id).ok_or(anyhow::anyhow!("Scrapper with ID '{}' not found", scrapper_id))?;
    scrapper.on_event(payload)?;

    return Ok(());
}

/* ================================================================================================================== */

fn on_page_load(scrapper_js: &str, window: &tauri::WebviewWindow, payload: tauri::webview::PageLoadPayload<'_>) -> Result<(), Error> {
    let scrapper_id = window.label();
    let event = payload.event();

    match event {
        tauri::webview::PageLoadEvent::Started => {
            log::debug!("Scrapper webview '{}' started loading: {:}", scrapper_id, payload.url());
            let stored_url: String = settings::get_scrapper_property(scrapper_id, "url").unwrap_or_default();
            let stored_url = url::Url::parse(&stored_url).ok();
            let current_url = payload.url();

            let is_remote = stored_url.is_some_and(|stored_url| stored_url.scheme() == current_url.scheme() && stored_url.host() == current_url.host() && stored_url.path() == current_url.path());
            let is_local = matches!(current_url.scheme(), "http" | "tauri") && current_url.host_str() == Some("localhost") && current_url.path() == "/scrapper_idle.html";

            if is_local || is_remote {
                log::info!("Injecting scrapper JS into scrapper '{}'", scrapper_id);
                let formatted_js = COMMON_SCRAPPER_JS
                    .replace("{{SCRAPPER_JS}}", &scrapper_js)
                    .replace("{{SCRAPPER_ID}}", scrapper_id);
                window.eval(&formatted_js)?;
            } else {
                log::warn!("Blocked navigation attempt in scrapper '{}': {}", scrapper_id, current_url);
                window.eval("window.stop();")?;

                let idle_url = decode_scrapper_url("about:blank")?;
                window.navigate(idle_url)?;
            }
        }
        tauri::webview::PageLoadEvent::Finished => {
            log::debug!("Scrapper webview '{}' finished loading: {:}", window.label(), payload.url());
        }
    }

    return Ok(());
}

static SCRAPPER_ID_REGEX: LazyLock<regex::Regex> = LazyLock::new(|| regex::Regex::new(r"^[a-z]+-chat$").unwrap());
pub fn register_scrapper(app: &tauri::AppHandle<tauri::Wry>, scrapper: Arc<dyn UniChatScrapper + Send + Sync>) -> Result<WebviewWindow, Error> {
    if !SCRAPPER_ID_REGEX.is_match(scrapper.id()) {
        return Err(anyhow::anyhow!("Scrapper ID must be a non-empty lowercase string".to_string()));
    }

    /* ========================================================================================== */

    let mut scrappers = SCRAPPERS.write().map_err(|_| anyhow::anyhow!("{} lock poisoned", LAZY_LOCK_NAME))?;
    if scrappers.contains_key(scrapper.id()) {
        return Err(anyhow::anyhow!("Scrapper with ID '{}' is already registered", scrapper.id()));
    }

    /* ========================================================================================== */

    let start_hidden: bool = settings::get_item(settings::SETTINGS_CREATE_WEBVIEW_HIDDEN_KEY)?;
    let webview_url = tauri::WebviewUrl::App(PathBuf::from("scrapper_idle.html"));
    let scrapper_js = scrapper.scrapper_js().to_string();

    let window = WebviewWindowBuilder::new(app, scrapper.id(), webview_url)
        .title(format!("UniChat - Scrapper ({})", scrapper.name()))
        .inner_size(400.0, 576.0)
        .visible(!start_hidden)
        .resizable(false)
        .maximizable(false)
        .on_page_load(move |window, payload| {
            if let Err(err) = on_page_load(&scrapper_js, &window, payload) {
                log::error!("Failed to handle page load event for scrapper '{}': {:?}", window.label(), err);
            }
        })
        .build()?;

    /* ========================================================================================== */

    scrappers.insert(scrapper.id().to_string(), scrapper);

    window.listen("unichat://scrapper_event", |event| {
        let payload = event.payload();

        if let Err(err) = handle_event(payload) {
            log::error!("Failed to handle scrapper event: {:?}", err);
            log::error!("Event payload: {}", payload);
        }
    });

    return Ok(window);
}

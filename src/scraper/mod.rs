/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::RwLock;

use anyhow::anyhow;
use anyhow::Error;
use tauri::Listener as _;
use tauri::webview::PageLoadPayload;
use tauri::WebviewWindow;
use tauri::Wry;

use crate::scraper::status::ScraperStatusEvent;
use crate::scraper::utils::decode_url;
use crate::utils::get_current_timestamp;
use crate::utils::is_dev;
use crate::utils::render_emitter;
use crate::utils::settings;
use crate::wm::window;

pub mod status;
pub mod utils;

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
    fn on_status(&self, _event: &ScraperStatusEvent) -> Result<(), Error>;
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
    let mut payload: serde_json::Value = serde_json::from_str(payload)?;

    let scraper_id = payload.get("scraperId").and_then(|v| v.as_str())
        .ok_or(anyhow!("Missing or invalid 'scraperId' field in scraper event payload"))?.to_string();
    let event_type = payload.get("type").and_then(|v| v.as_str())
        .ok_or(anyhow!("Missing or invalid 'type' field in scraper event payload"))?.to_string();

    let scraper = get_scraper(&scraper_id)?.ok_or(anyhow!("Scraper with ID '{}' not found", scraper_id))?;

    if status::parse_status(&event_type).is_none() {
        return scraper.on_event(payload);
    }

    if payload.get("timestamp").is_none() {
        payload["timestamp"] = serde_json::json!(get_current_timestamp()?);
    }

    let event: ScraperStatusEvent = serde_json::from_value(payload)?;

    if let Err(err) = scraper.on_status(&event) {
        log::error!(target: &format!("scraper:{}", scraper_id), "An error occurred on '{}' scraper status hook: {:#?}", scraper_id, err);
    }

    render_emitter::emit_status(&event);

    return Ok(());
}

/* ================================================================================================================== */

fn build_scraper_initialization_script(scraper: Arc<dyn UniChatScraper + Send + Sync>) -> String {
    return COMMON_SCRAPER_JS
        .replace("{{SCRAPER_JS}}", &scraper.scraper_js())
        .replace("{{IS_DEV}}", &is_dev().to_string())
        .replace("{{SCRAPER_ID}}", scraper.id());
}

fn on_scraper_page_load(webview: WebviewWindow<Wry>, payload: PageLoadPayload<'_>) {
    let scraper_id = webview.label();

    if utils::is_navigation_allowed(scraper_id, payload.url()) {
        return;
    }

    log::warn!(target: &format!("scraper:{}", scraper_id), "Blocked navigation attempt in scraper '{}': {}", scraper_id, payload.url());

    if let Err(err) = webview.eval("window.stop();") {
        log::error!(target: &format!("scraper:{}", scraper_id), "Failed to stop blocked page in scraper '{}': {:#?}", scraper_id, err);
    }

    match decode_url("") {
        Ok(idle_url) => {
            if let Err(err) = webview.navigate(idle_url) {
                log::error!(target: &format!("scraper:{}", scraper_id), "Failed to send scraper '{}' back to the idle page: {:#?}", scraper_id, err);
            }
        }
        Err(err) => log::error!(target: &format!("scraper:{}", scraper_id), "Failed to resolve the idle page URL: {:#?}", err)
    }
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
    let window = window::new(scraper.id(), "scraper_idle.html")
        .title(format!("UniChat - Scraper ({})", scraper.name()))
        .inner_size(400.0, 576.0)
        .visible(!start_hidden)
        .initialization_script(build_scraper_initialization_script(scraper.clone()))
        .on_page_load(on_scraper_page_load)
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

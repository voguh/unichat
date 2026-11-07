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
use std::sync::RwLockReadGuard;

use anyhow::Error;
use anyhow::anyhow;
use tauri::Listener;
use tauri::Manager;
use tauri::WebviewUrl;
use tauri::WebviewWindow;
use tauri::Wry;
use tauri::webview::PageLoadPayload;
use url::Url;

use crate::get_app_handle;
use crate::settings;
use crate::utils::get_current_timestamp;
use crate::utils::is_dev;
use crate::wm::main_window;
use crate::wm::window;

mod status;
mod utils;

/* ========================================================================== */

pub use status::ScraperStatus;
pub use status::ScraperStatusEvent;
pub use utils::ScraperLogKind;
pub use utils::decode_url;
pub use utils::log_action;

/* ========================================================================== */

static COMMON_SCRAPER_JS: &str = include_str!("./static/common_scraper.js");

/* ========================================================================== */

type ArcScraper = Arc<dyn UniChatScraper + Send + Sync>;

static SCRAPERS: LazyLock<RwLock<HashMap<String, ArcScraper>>> = LazyLock::new(|| RwLock::new(HashMap::new()));
fn read() -> RwLockReadGuard<'static, HashMap<String, ArcScraper>> {
    return SCRAPERS.read().expect("Scraper::SCRAPERS lock poisoned");
}

fn write(scraper: ArcScraper) {
    let mut scrapers = SCRAPERS.write().expect("Scraper::SCRAPERS lock poisoned");
    scrapers.insert(scraper.id().to_string(), scraper);
}

/* ========================================================================== */

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
    fn on_status(&self, event: &ScraperStatusEvent) -> Result<(), Error>;
}

/* ========================================================================== */

pub fn serialize_scraper(scraper: &ArcScraper) -> serde_json::Value {
    return serde_json::json!({
        "id": scraper.id(),
        "name": scraper.name(),
        "editingTooltipMessage": scraper.editing_tooltip_message(),
        "editingTooltipUrls": scraper.editing_tooltip_urls(),
        "placeholderText": scraper.placeholder_text(),
        "badges": scraper.badges(),
        "icon": scraper.icon()
    });
}

pub fn get_scrapers() -> Vec<ArcScraper> {
    let scrapers = read();
    return scrapers.values().cloned().collect();
}

pub fn get_scraper(id: &str) -> Option<ArcScraper> {
    let scrapers = read();
    return scrapers.get(id).cloned();
}

/* ========================================================================== */

fn dispatch_status(scraper: &ArcScraper, event: &ScraperStatusEvent) {
    if let Err(err) = scraper.on_status(event) {
        log::error!(target: &format!("scraper:{}", event.scraper_id), "An error occurred on status hook: {:#?}", err);
    }

    main_window::emit_status(event);

    if event.status == ScraperStatus::Fatal {
        let scraper_id = event.scraper_id.clone();

        tauri::async_runtime::spawn(async move {
            if let Err(err) = stop_scraper(&scraper_id) {
                log::error!(target: &format!("scraper:{}", scraper_id), "Failed to destroy webview: {:#?}", err);
            }
        });
    }
}

fn handle_event(payload: &str) -> Result<(), Error> {
    let payload: serde_json::Value = serde_json::from_str(payload)?;

    let scraper_id = payload
        .get("scraperId")
        .and_then(|v| v.as_str())
        .ok_or_else(|| anyhow!("Missing or invalid 'scraperId' field in scraper event payload"))?;
    let scraper = get_scraper(scraper_id).ok_or_else(|| anyhow!("Scraper with ID '{}' not found", scraper_id))?;

    let event_type = payload
        .get("type")
        .and_then(|v| v.as_str())
        .ok_or_else(|| anyhow!("Missing or invalid 'type' field in scraper event payload"))?;
    if status::parse_status(event_type).is_none() {
        return scraper.on_event(payload);
    }

    let event: ScraperStatusEvent = serde_json::from_value(payload)?;
    dispatch_status(&scraper, &event);

    return Ok(());
}

pub fn init() {
    let app = get_app_handle();

    app.listen_any("unichat://scraper_event", |event| {
        let payload = event.payload();

        if let Err(err) = handle_event(payload) {
            log::error!("Failed to handle scraper event: {:#?}", err);
            log::error!("Event payload: {}", payload);
        }
    });
}

/* ========================================================================== */

fn build_initialization_script(scraper: &ArcScraper) -> String {
    return COMMON_SCRAPER_JS
        .replace("{{SCRAPER_JS}}", scraper.scraper_js())
        .replace("{{IS_DEV}}", &is_dev().to_string())
        .replace("{{SCRAPER_ID}}", scraper.id());
}

fn on_page_load(webview: WebviewWindow<Wry>, payload: PageLoadPayload<'_>) {
    let scraper_id = webview.label();

    if utils::is_navigation_allowed(scraper_id, payload.url()) {
        return;
    }

    log::warn!(target: &format!("scraper:{}", scraper_id), "Blocked navigation attempt: {}", payload.url());

    let scraper = get_scraper(scraper_id).expect("Scraper webview without a registered scraper");
    let event = ScraperStatusEvent {
        status: ScraperStatus::Fatal,
        scraper_id: scraper_id.to_string(),
        timestamp: get_current_timestamp(),
        message: Some(String::from("The page tried to leave the chat.")),
        stack: None,
        extra: serde_json::Map::new()
    };

    dispatch_status(&scraper, &event);
}

pub fn start_scraper(scraper_id: &str, url: Url) -> Result<(), Error> {
    let scraper = get_scraper(scraper_id).ok_or_else(|| anyhow!("Scraper with ID '{}' not found", scraper_id))?;

    settings::set_scraper_url(scraper_id, url.as_str());

    window::new(scraper.id(), WebviewUrl::External(url))
        .title(format!("UniChat - Scraper ({})", scraper.name()))
        .inner_size(400.0, 576.0)
        .visible(false)
        .initialization_script(build_initialization_script(&scraper))
        .on_page_load(on_page_load)
        .build()?;

    return Ok(());
}

pub fn stop_scraper(scraper_id: &str) -> Result<(), Error> {
    let app = get_app_handle();

    if let Some(window) = app.get_webview_window(scraper_id) {
        window.destroy()?;
    }

    return Ok(());
}

pub fn register_scraper(scraper: ArcScraper) -> Result<(), Error> {
    if scraper.id().chars().any(|c| !c.is_ascii_alphanumeric() && c != '_' && c != '-') {
        return Err(anyhow!("Invalid characters in scraper ID '{}'", scraper.id()));
    }

    if !scraper.id().ends_with("-chat") {
        return Err(anyhow!("Missing '-chat' suffix in scraper ID '{}'", scraper.id()));
    }

    /* ====================================================================== */

    if get_scraper(scraper.id()).is_some() {
        return Err(anyhow!("Scraper with ID '{}' is already registered", scraper.id()));
    }

    /* ====================================================================== */

    write(scraper);

    return Ok(());
}

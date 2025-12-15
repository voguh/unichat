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
use std::sync::LazyLock;
use std::sync::RwLock;

use tauri::WebviewWindow;
use tauri::WebviewWindowBuilder;

use crate::error::Error;
use crate::utils::settings;

pub static COMMON_SCRAPPER_JS: &str = include_str!("./static/common_scrapper.js");

#[derive(serde::Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UniChatScrapper {
    pub id: String,
    pub name: String,
    pub editing_tooltup_message: String,
    pub editing_tooltip_urls: Vec<String>,
    pub placeholder_text: String,
    pub icon: String,

    #[serde(skip_serializing)]
    pub validate_url: fn(String) -> Result<String, Error>,

    #[serde(skip_serializing)]
    pub scrapper_js: String
}

static SCRAPPERS: LazyLock<RwLock<HashMap<String, UniChatScrapper>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

pub fn get_scrappers() -> Result<Vec<UniChatScrapper>, Error> {
    let scrappers = SCRAPPERS.read().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;
    return Ok(scrappers.values().cloned().collect());
}

pub fn get_scrapper(id: &str) -> Result<Option<UniChatScrapper>, Error> {
    let scrappers = SCRAPPERS.read().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;
    return Ok(scrappers.get(id).cloned());
}

pub fn register_scrapper(app: &tauri::AppHandle<tauri::Wry>, scrapper: UniChatScrapper) -> Result<WebviewWindow, Error> {
    let mut scrappers = SCRAPPERS.write().map_err(|e| Error::LockPoisoned { source: Box::new(e) })?;
    if scrappers.contains_key(&scrapper.id) {
        return Err(Error::Message(format!("Scrapper with ID '{}' is already registered", scrapper.id)));
    }

    /* ========================================================================================== */

    let start_hidden = settings::get_settings_create_webview_hidden()?;
    let webview_url = tauri::WebviewUrl::App(PathBuf::from("scrapper_idle.html"));
    let scrapper_js = scrapper.scrapper_js.clone();

    let window = WebviewWindowBuilder::new(app, &scrapper.id, webview_url)
        .title(format!("UniChat - Scrapper ({})", scrapper.name))
        .inner_size(400.0, 576.0)
        .visible(!start_hidden)
        .resizable(false)
        .maximizable(false)
        .on_page_load(move |window, payload| {
            let event = payload.event();

            match event {
                tauri::webview::PageLoadEvent::Started => {
                    log::info!("Scrapper webview '{}' started loading: {:}", window.label(), payload.url());
                    let formatted_js = COMMON_SCRAPPER_JS
                        .replace("{{SCRAPPER_JS}}", &scrapper_js)
                        .replace("{{SCRAPPER_ID}}", window.label());
                    window.eval(&formatted_js).unwrap();
                }
                tauri::webview::PageLoadEvent::Finished => {
                    log::info!("Scrapper webview '{}' finished loading: {:}", window.label(), payload.url());
                }
            }
        })
        .build()?;

    /* ========================================================================================== */

    scrappers.insert(scrapper.id.clone(), scrapper.clone());

    return Ok(window);
}

/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use anyhow::Error;
use tauri::Manager as _;
use url::Url;

use crate::get_app_handle;
use crate::utils::is_dev;
use crate::utils::settings;

pub fn decode_url(url: &str) -> Result<Url, Error> {
    let mut url = url.trim();
    if url.is_empty() || !url.starts_with("https://") {
        if is_dev() {
            url = "http://localhost:1421/scraper_idle.html";
        } else {
            url = "tauri://localhost/scraper_idle.html";
        }
    }

    let url = Url::parse(url)?;
    return Ok(url);
}

/* ================================================================================================================== */

fn get_scraper_url(scraper_id: &str) -> Option<String> {
    let window = get_app_handle().get_webview_window(scraper_id)?;
    let url = window.url().ok()?;

    return Some(url.to_string());
}

pub fn is_local_url(scraper_id: &str, url: &Url) -> bool {
    if get_scraper_url(scraper_id).is_none() {
        return false;
    }

    return matches!(url.scheme(), "http" | "tauri")
        && matches!(url.host_str(), Some("localhost") | Some("tauri.localhost"))
        && url.path() == "/scraper_idle.html";
}

pub fn is_remote_url(scraper_id: &str, url: &Url) -> bool {
    if get_scraper_url(scraper_id).is_none() {
        return false;
    }

    let stored_url: String = match settings::get_scraper_property(scraper_id, "url") {
        Ok(stored_url) => stored_url,
        Err(_) => return false
    };

    let stored_url = match Url::parse(&stored_url) {
        Ok(stored_url) => stored_url,
        Err(_) => return false
    };

    return url == &stored_url;
}

pub fn is_navigation_allowed(scraper_id: &str, url: &Url) -> bool {
    return is_local_url(scraper_id, url) || is_remote_url(scraper_id, url);
}

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
use url::Url;

use crate::settings;
use crate::utils::is_dev;

/* ========================================================================== */

pub fn idle_url() -> Url {
    if is_dev() {
        return Url::parse("http://localhost:1421/scraper_idle.html").expect("Invalid scraper idle URL");
    }

    return Url::parse("tauri://localhost/scraper_idle.html").expect("Invalid scraper idle URL");
}

pub fn decode_url(url: &str) -> Result<Url, Error> {
    let url = url.trim();
    if !url.starts_with("https://") {
        return Ok(idle_url());
    }

    let url = Url::parse(url)?;
    return Ok(url);
}

/* ========================================================================== */

pub fn is_local_url(url: &Url) -> bool {
    return matches!(url.scheme(), "http" | "tauri")
        && matches!(url.host_str(), Some("localhost") | Some("tauri.localhost"))
        && url.path() == "/scraper_idle.html";
}

pub fn is_remote_url(scraper_id: &str, url: &Url) -> bool {
    let stored_url = settings::get_scraper_url(scraper_id);
    return stored_url.and_then(|value| Url::parse(&value).ok()).is_some_and(|stored| &stored == url);
}

pub fn is_navigation_allowed(scraper_id: &str, url: &Url) -> bool {
    return is_local_url(url) || is_remote_url(scraper_id, url);
}

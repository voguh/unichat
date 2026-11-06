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
use anyhow::anyhow;
use url::Url;

use crate::settings;

/* ========================================================================== */

pub fn decode_url(url: &str) -> Result<Url, Error> {
    let url = Url::parse(url.trim())?;
    if url.scheme() != "https" {
        return Err(anyhow!("Scraper URL '{}' is not https", url));
    }

    return Ok(url);
}

/* ========================================================================== */

pub fn is_navigation_allowed(scraper_id: &str, url: &Url) -> bool {
    let stored_url = settings::get_scraper_url(scraper_id);
    return stored_url.and_then(|value| Url::parse(&value).ok()).is_some_and(|stored| &stored == url);
}

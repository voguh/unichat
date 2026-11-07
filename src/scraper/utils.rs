/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fs;
use std::io::Write as _;

use anyhow::Error;
use anyhow::anyhow;
use url::Url;

use crate::settings;
use crate::settings::SettingLogEventLevel;
use crate::utils::paths;
use crate::utils::paths::AppPaths;

/* ========================================================================== */

pub enum ScraperLogKind {
    Raw,
    Parsed,
    Unknown,
    Error
}

impl ScraperLogKind {
    fn file_name(&self) -> &'static str {
        return match self {
            ScraperLogKind::Raw => "events-raw.log",
            ScraperLogKind::Parsed => "events-parsed.log",
            ScraperLogKind::Unknown => "events-unknown.log",
            ScraperLogKind::Error => "events-error.log"
        };
    }

    fn is_enabled(&self, level: &SettingLogEventLevel) -> bool {
        return match self {
            ScraperLogKind::Raw | ScraperLogKind::Parsed => *level == SettingLogEventLevel::AllEvents,
            ScraperLogKind::Unknown => *level != SettingLogEventLevel::OnlyErrors,
            ScraperLogKind::Error => true
        };
    }
}

pub fn log_action(scraper_id: &str, kind: ScraperLogKind, content: impl FnOnce() -> String) {
    let level = settings::get_scraper_events_log_level();
    if !kind.is_enabled(&level) {
        return;
    }

    let scraper_log_dir = paths::get(AppPaths::AppLog).join(scraper_id);
    fs::create_dir_all(&scraper_log_dir).expect("Failed to create scraper log directory");

    let mut options = fs::OpenOptions::new();
    options.create(true).append(true);
    let mut file = options.open(scraper_log_dir.join(kind.file_name())).expect("Failed to open scraper log file");
    writeln!(file, "{}", content()).expect("Failed to write scraper log file");
}

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

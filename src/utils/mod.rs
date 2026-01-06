/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::path;
use std::sync::LazyLock;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use anyhow::anyhow;
use anyhow::Error;
use url::Url;

pub mod constants;
pub mod properties;
pub mod render_emitter;
pub mod settings;
pub mod ureq;

pub fn is_dev() -> bool {
    return cfg!(debug_assertions) || tauri::is_dev();
}

/* ================================================================================================================== */

pub fn get_current_timestamp() -> Result<i64, Error> {
    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH)?;
    let timestamp_sec = timestamp.as_millis() as i64;
    return Ok(timestamp_sec);
}

/* ================================================================================================================== */

pub fn decode_scraper_url(url: &str) -> Result<Url, Error> {
    let mut url = url;
    if url.trim().is_empty() || url == "about:blank" || !url.starts_with("https://") {
        url = "tauri://localhost/scraper_idle.html";
    }

    let url = Url::parse(url)?;
    return Ok(url);
}

/* ================================================================================================================== */

pub fn normalize_value(value_raw: &str) -> Result<f32, Error> {
    let last_dot = value_raw.rfind('.');
    let last_comma = value_raw.rfind(',');
    let normalized = match(last_dot, last_comma) {
        (Some(dot_index), Some(comma_index)) => {
            if dot_index > comma_index {
                value_raw.replace(",", "")
            } else {
                value_raw.replace(".", "").replace(",", ".")
            }
        }
        (Some(dot_index), None) => {
            let digits_after_dot = value_raw.len() - dot_index - 1;
            if value_raw.matches(".").count() == 1 && digits_after_dot <= 2 {
                value_raw.to_string()
            } else {
                value_raw.replace(".", "")
            }
        }
        (None, Some(comma_index)) => {
            let digits_after_comma = value_raw.len() - comma_index -1;
            if value_raw.matches(",").count() == 1 && digits_after_comma <= 2 {
                value_raw.replace(",", ".")
            } else {
                value_raw.replace(",", "")
            }
        },
        (None, None) => value_raw.to_string()
    };

    let value: f32 = normalized.parse()?;

    return Ok(value);
}

/* ================================================================================================================== */

pub fn parse_u32_to_rgba(color: u32) -> (u8, u8, u8, f32) {
    let a = ((color >> 24) & 0xFF) as u8;
    let r = ((color >> 16) & 0xFF) as u8;
    let g = ((color >> 8) & 0xFF) as u8;
    let b = (color & 0xFF) as u8;

    return (r, g, b, a as f32 / 255.0);
}

pub fn random_color_by_seed(seed: &str) -> Result<String, Error> {
    let mut hash: u32 = 2166136261;
    for byte in seed.as_bytes() {
        hash ^= *byte as u32;
        hash = hash.wrapping_mul(16777619);
    }

    let r = ((hash >> 16) & 0xFF) as u8;
    let g = ((hash >> 8) & 0xFF) as u8;
    let b = (hash & 0xFF) as u8;

    return Ok(format!("#{:02X}{:02X}{:02X}", r, g, b));
}

/* ================================================================================================================== */

// Thanks to Glenn Slayden which explained the YouTube channel ID format
// on https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video/101153#101153
static YOUTUBE_CHANNEL_ID_REGEX: LazyLock<regex::Regex> = LazyLock::new(|| regex::Regex::new(r"^UC[0-9A-Za-z_-]{21}[AQgw]$").unwrap());
pub fn is_valid_youtube_channel_id(channel_id: &str) -> bool {
    if channel_id.is_empty() {
        return false;
    }

    return YOUTUBE_CHANNEL_ID_REGEX.is_match(channel_id);
}

// Thanks to Glenn Slayden which explained the YouTube video ID format
// on https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video/101153#101153
static YOUTUBE_VIDEO_ID_REGEX: LazyLock<regex::Regex> = LazyLock::new(|| regex::Regex::new(r"^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$").unwrap());
pub fn is_valid_youtube_video_id(video_id: &str) -> bool {
    if video_id.is_empty() || video_id.len() != 11 {
        return false;
    }

    return YOUTUBE_VIDEO_ID_REGEX.is_match(video_id);
}

static TWITCH_CHANNEL_NAME_REGEX: LazyLock<regex::Regex> = LazyLock::new(|| regex::Regex::new(r"^[0-9A-Za-z_]+$").unwrap());
pub fn is_valid_twitch_channel_name(channel_name: &str) -> bool {
    if channel_name.is_empty() || channel_name.len() < 4 || channel_name.len() > 25 {
        return false;
    }

    return TWITCH_CHANNEL_NAME_REGEX.is_match(channel_name);
}

/* ================================================================================================================== */

pub fn safe_guard_path(base_path: &path::PathBuf, concat_str: &str) -> Result<path::PathBuf, Error> {
    let concatenated_path = base_path.join(concat_str);
    let resolved_path = path::absolute(concatenated_path)?;
    if !resolved_path.starts_with(base_path) {
        return Err(anyhow!("Access to path '{:?}' is not allowed", resolved_path));
    }

    return Ok(resolved_path);
}

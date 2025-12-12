/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::sync::LazyLock;

pub mod constants;
pub mod properties;
pub mod render_emitter;
pub mod settings;
pub mod ureq;

pub static COMMON_SCRAPPER_JS: &str = include_str!("./static/common_scrapper.js");

pub fn parse_u32_to_rgba(color: u32) -> (u8, u8, u8, f32) {
    let a = ((color >> 24) & 0xFF) as u8;
    let r = ((color >> 16) & 0xFF) as u8;
    let g = ((color >> 8) & 0xFF) as u8;
    let b = (color & 0xFF) as u8;

    return (r, g, b, a as f32 / 255.0);
}

pub fn is_dev() -> bool {
    return cfg!(debug_assertions) || tauri::is_dev();
}

pub fn parse_serde_error(error: serde_json::Error) -> Box<dyn std::error::Error> {
    return Box::new(error);
}

pub fn normalize_value(value_raw: &str) -> Result<f32, Box<dyn std::error::Error>> {
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

    return normalized.parse().map_err(|e| Box::new(e) as Box<dyn std::error::Error>);
}

pub fn random_color_by_seed(seed: &str) -> Result<String, Box<dyn std::error::Error>> {
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

// Thanks to Glenn Slayden which explained the YouTube video ID format
// on https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video/101153#101153
static YOUTUBE_CHANNEL_ID_REGEX: LazyLock<regex::Regex> = LazyLock::new(|| regex::Regex::new(r"^UC[0-9A-Za-z_-]{21}[AQgw]$").unwrap());
pub fn is_valid_youtube_channel_id(channel_id: &str) -> bool {
    if channel_id.is_empty() {
        return false;
    }

    return YOUTUBE_CHANNEL_ID_REGEX.is_match(channel_id);
}

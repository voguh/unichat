/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::RwLock;

use anyhow::Error;
use anyhow::anyhow;
use regex::Regex;
use serde_json::Value;

use crate::events;
use crate::scraper;
use crate::scraper::ScraperLogKind;
use crate::scraper::ScraperStatus;
use crate::scraper::ScraperStatusEvent;
use crate::scraper::UniChatScraper;
use crate::shared_emotes;

mod mapper;

/* ========================================================================== */

const SCRAPER_ID: &str = "youtube-chat";
static SCRAPER_JS: &str = include_str!("./static/scraper.js");

/* ========================================================================== */

// Thanks to Glenn Slayden which explained the YouTube channel and video ID format
// on https://webapps.stackexchange.com/questions/54443/format-for-id-of-youtube-video/101153#101153
static CHANNEL_ID: LazyLock<Regex> = LazyLock::new(|| {
    return Regex::new(r"^UC[0-9A-Za-z_-]{21}[AQgw]$").expect("YouTube::CHANNEL_ID regex is invalid");
});
fn is_valid_channel_id(channel_id: &str) -> bool {
    return CHANNEL_ID.is_match(channel_id);
}

static VIDEO_ID: LazyLock<Regex> = LazyLock::new(|| {
    return Regex::new(r"^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$").expect("YouTube::VIDEO_ID regex is invalid");
});
fn is_valid_video_id(video_id: &str) -> bool {
    return VIDEO_ID.is_match(video_id);
}

/* ========================================================================== */

static YOUTUBE_CHANNEL_ID: LazyLock<RwLock<Option<String>>> = LazyLock::new(|| RwLock::new(None));
fn read_channel_id() -> Result<String, Error> {
    let channel_id = YOUTUBE_CHANNEL_ID.read().expect("YouTube::YOUTUBE_CHANNEL_ID lock poisoned");
    return channel_id.clone().ok_or_else(|| anyhow!("Missing YouTube channel id"));
}

fn write_channel_id(channel_id: String) {
    let mut current_channel_id = YOUTUBE_CHANNEL_ID.write().expect("YouTube::YOUTUBE_CHANNEL_ID lock poisoned");
    *current_channel_id = Some(channel_id);
}

/* ========================================================================== */

fn handle_ready_status(event: &ScraperStatusEvent) -> Result<(), Error> {
    let channel_id = event
        .extra_str("channelId")
        .ok_or_else(|| anyhow!("Missing or invalid 'channelId' field in YouTube 'ready' payload"))?;

    if !is_valid_channel_id(channel_id) {
        return Err(anyhow!("Invalid YouTube channel ID '{}' in 'ready' event payload", channel_id));
    }

    write_channel_id(String::from(channel_id));
    shared_emotes::fetch_shared_emotes("youtube", channel_id);

    return Ok(());
}

/* ========================================================================== */

fn handle_message_event(event_type: &str, payload: &Value) -> Result<(), Error> {
    let actions = payload
        .get("actions")
        .and_then(|v| v.as_array())
        .ok_or_else(|| anyhow!("Missing or invalid 'actions' field in '{event_type}' event payload"))?;

    for action in actions {
        scraper::log_action(SCRAPER_ID, ScraperLogKind::Raw, || action.to_string());

        match mapper::parse(action) {
            Ok(Some(parsed)) => {
                scraper::log_action(SCRAPER_ID, ScraperLogKind::Parsed, || {
                    return serde_json::to_string(&parsed).expect("Failed to serialize UniChatEvent");
                });

                events::emit(parsed);
            }

            Ok(None) => {
                scraper::log_action(SCRAPER_ID, ScraperLogKind::Unknown, || action.to_string());
            }

            Err(err) => {
                scraper::log_action(SCRAPER_ID, ScraperLogKind::Error, || format!("{:#?} -- {}", err, action));
            }
        }
    }

    return Ok(());
}

/* ========================================================================== */

static YOUTUBE_VALID_URLS: LazyLock<Vec<String>> = LazyLock::new(|| {
    vec![
        String::from("https://www.youtube.com/watch?v={VIDEO_ID}"),
        String::from("https://www.youtube.com/live_chat?v={VIDEO_ID}"),
        String::from("https://youtu.be/{VIDEO_ID}"),
        String::from("https://www.youtube.com/live/{VIDEO_ID}"),
        String::from("https://www.youtube.com/shorts/{VIDEO_ID}"),
    ]
});

struct YouTubeUniChatScraper;

impl UniChatScraper for YouTubeUniChatScraper {
    fn id(&self) -> &str {
        return SCRAPER_ID;
    }

    fn name(&self) -> &str {
        return "YouTube";
    }

    fn editing_tooltip_message(&self) -> &str {
        return "You can enter just the video ID or one of the following URLs to get the YouTube chat:";
    }

    fn editing_tooltip_urls(&self) -> &[String] {
        return &YOUTUBE_VALID_URLS;
    }

    fn placeholder_text(&self) -> &str {
        return "https://www.youtube.com/live_chat?v={VIDEO_ID}";
    }

    fn badges(&self) -> &[String] {
        return &[];
    }

    fn icon(&self) -> &str {
        return "fab fa-youtube";
    }

    fn validate_url(&self, url: String) -> Result<String, Error> {
        let mut url = url.trim();
        url = url.strip_prefix("http://").unwrap_or(url);
        url = url.strip_prefix("https://").unwrap_or(url);
        url = url.strip_prefix("www.").unwrap_or(url);

        let mut video_id: Option<&str> = None;
        if url.starts_with("youtu.be/") {
            let mut parts = url.splitn(2, '/');
            parts.next();
            video_id = parts.next();
        } else if url.starts_with("youtube.com/live/") || url.starts_with("youtube.com/shorts/") {
            let mut parts = url.splitn(3, '/');
            parts.next();
            parts.next();
            video_id = parts.next();
        } else if url.starts_with("youtube.com/watch") || url.starts_with("youtube.com/live_chat") {
            let query = url.split_once("?").map(|x| x.1).ok_or_else(|| anyhow!("Missing query"))?;
            for param in query.split('&') {
                let mut kv = param.splitn(2, '=');
                if kv.next() == Some("v") {
                    video_id = kv.next();
                    break;
                }
            }
        } else {
            video_id = Some(url);
        }

        if let Some(video_id) = video_id.filter(|video_id| is_valid_video_id(video_id)) {
            let formatted_url = format!("https://www.youtube.com/live_chat?v={}", video_id);
            return Ok(formatted_url);
        }

        return Err(anyhow!("Could not extract video ID from YouTube URL"));
    }

    fn scraper_js(&self) -> &str {
        return SCRAPER_JS;
    }

    fn on_event(&self, event: serde_json::Value) -> Result<(), Error> {
        let event_type = event
            .get("type")
            .and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing or invalid 'type' field in YouTube raw event payload"))?;

        return match event_type {
            "message" => handle_message_event(event_type, &event),
            _ => Ok(())
        };
    }

    fn on_status(&self, event: &ScraperStatusEvent) -> Result<(), Error> {
        return match event.status {
            ScraperStatus::Ready => handle_ready_status(event),
            _ => Ok(())
        };
    }
}

pub fn init() -> Result<(), Error> {
    scraper::register_scraper(Arc::new(YouTubeUniChatScraper))?;

    return Ok(());
}

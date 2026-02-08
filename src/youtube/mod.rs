/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::fs;
use std::io::Write;
use std::sync::Arc;
use std::sync::LazyLock;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use anyhow::anyhow;
use anyhow::Error;
use serde_json::Value;

use crate::events;
use crate::scraper;
use crate::scraper::UniChatScraper;
use crate::shared_emotes;
use crate::utils::is_valid_youtube_channel_id;
use crate::utils::is_valid_youtube_video_id;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::properties::PropertiesKey;
use crate::utils::render_emitter;
use crate::utils::settings;
use crate::utils::settings::SettingLogEventLevel;

mod mapper;

pub const SCRAPER_ID: &str = "youtube-chat";
static SCRAPER_JS: &str = include_str!("./static/scraper.js");

/* ================================================================================================================== */

fn dispatch_event(mut payload: Value) -> Result<(), Error> {
    if payload.get("type").is_none() {
        return Err(anyhow!("Missing 'type' field in YouTube raw event payload"));
    }

    if payload.get("scraperId").is_none() {
        payload["scraperId"] = serde_json::json!(SCRAPER_ID);
    }

    if payload.get("timestamp").is_none() {
        let now = SystemTime::now().duration_since(UNIX_EPOCH)?;
        payload["timestamp"] = serde_json::json!(now.as_millis());
    }

    return render_emitter::emit(payload);
}

/* ================================================================================================================== */

fn handle_ready_event(event_type: &str, payload: &Value) -> Result<(), Error> {
    let channel_id = payload.get("channelId").and_then(|v| v.as_str())
        .ok_or_else(|| anyhow!("Missing or invalid 'channelId' field in YouTube '{event_type}' payload"))?;

    if !is_valid_youtube_channel_id(channel_id) {
        return Err(anyhow!("Invalid YouTube channel ID '{}' in '{event_type}' event payload", channel_id));
    }

    properties::set_item(PropertiesKey::YouTubeChannelId, String::from(channel_id))?;
    shared_emotes::fetch_shared_emotes("youtube", channel_id)?;

    return dispatch_event(payload.clone());
}


fn handle_idle_event(_event_type: &str, payload: &Value) -> Result<(), Error> {
    return dispatch_event(payload.clone());
}

/* ================================================================================================================== */

fn log_action(file_name: &str, content: &impl std::fmt::Display) {
    let app_log_dir = properties::get_app_path(AppPaths::AppLog);
    let youtube_log_dir = app_log_dir.join(SCRAPER_ID);
    if !youtube_log_dir.exists() {
        fs::create_dir_all(&youtube_log_dir).unwrap();
    }

    let log_file = youtube_log_dir.join(file_name);
    let mut file = fs::OpenOptions::new().create(true).append(true).open(log_file).unwrap();
    writeln!(file, "{content}").unwrap();
}

fn handle_message_event(event_type: &str, payload: &Value) -> Result<(), Error> {
    let actions = payload.get("actions").and_then(|v| v.as_array())
        .ok_or_else(|| anyhow!("Missing or invalid 'actions' field in '{event_type}' event payload"))?;

    let log_events = settings::get_scraper_events_log_level();

    for action in actions {
        if log_events == SettingLogEventLevel::AllEvents {
            log_action("events-raw.log", &action);
        }

        match mapper::parse(action) {
            Ok(Some(parsed)) => {
                if log_events == SettingLogEventLevel::AllEvents {
                    log_action("events-parsed.log", &serde_json::to_string(&parsed).unwrap());
                }

                if let Err(err) = events::emit(parsed) {
                    log::error!("An error occurred on send unichat event: {}", err);
                }
            }

            Ok(None) => {
                if [SettingLogEventLevel::AllEvents, SettingLogEventLevel::UnknownEvents].contains(&log_events) {
                    log_action("events-unknown.log", &action);
                }
            }

            Err(err) => {
                log_action("events-error.log", &format!("{} -- {}", err, action));
            }
        }
    }

    return Ok(());
}

/* ================================================================================================================== */

static YOUTUBE_VALID_URLS: LazyLock<Vec<String>> = LazyLock::new(|| vec![
    String::from("https://www.youtube.com/watch?v={VIDEO_ID}"),
    String::from("https://www.youtube.com/live_chat?v={VIDEO_ID}"),
    String::from("https://youtu.be/{VIDEO_ID}"),
    String::from("https://www.youtube.com/live/{VIDEO_ID}"),
    String::from("https://www.youtube.com/shorts/{VIDEO_ID}"),
]);

#[derive(Default)]
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
            let query = url.splitn(2, "?").nth(1).ok_or_else(|| anyhow!("Missing query"))?;
            for param in query.split('&') {
                let mut kv = param.splitn(2, '=');
                if kv.next() == Some("v") {
                    video_id = kv.next();
                    break;
                }
            }
        }

        if let Some(video_id) = video_id.filter(|video_id| is_valid_youtube_video_id(video_id)) {
            let formatted_url = format!("https://www.youtube.com/live_chat?v={}", video_id);
            return Ok(formatted_url);
        }

        return Err(anyhow!("Could not extract video ID from YouTube URL"));
    }

    fn scraper_js(&self) -> &str {
        return SCRAPER_JS;
    }

    fn on_event(&self, event: serde_json::Value) -> Result<(), Error> {
        let scraper_id = event.get("scraperId").and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing or invalid 'scraperId' field in YouTube raw event payload"))?;
        let event_type = event.get("type").and_then(|v| v.as_str())
            .ok_or_else(|| anyhow!("Missing or invalid 'type' field in YouTube raw event payload"))?;

        if scraper_id != SCRAPER_ID {
            return Ok(());
        }

        return match event_type {
            "ready" => handle_ready_event(event_type, &event),
            "idle" => handle_idle_event(event_type, &event),
            "message" => handle_message_event(event_type, &event),
            _ => dispatch_event(event.clone())
        };
    }
}

pub fn init() -> Result<(), Error> {
    let scraper_data = YouTubeUniChatScraper::default();
    let scraper: Arc<dyn UniChatScraper + Send + Sync> = Arc::new(scraper_data);
    scraper::register_scraper(scraper)?;

    return Ok(());
}

/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::collections::HashSet;
use std::fs;
use std::io::Write;
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::RwLock;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use anyhow::anyhow;
use anyhow::Error;
use serde_json::Value;

use crate::events;
use crate::events::unichat::UniChatBadge;
use crate::irc::IRCMessage;
use crate::scraper;
use crate::scraper::UniChatScraper;
use crate::shared_emotes;
use crate::twitch::mapper::structs::author::TwitchRawBadge;
use crate::utils::is_valid_twitch_channel_name;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::properties::PropertiesKey;
use crate::utils::render_emitter;
use crate::utils::settings;
use crate::utils::settings::SettingLogEventLevel;

mod mapper;

pub const SCRAPER_ID: &str = "twitch-chat";
static SCRAPER_JS: &str = include_str!("./static/scraper.js");

pub static TWITCH_CHEERMOTES: LazyLock<RwLock<HashSet<String>>> = LazyLock::new(|| RwLock::new(HashSet::new()));
pub static TWITCH_BADGES: LazyLock<RwLock<HashMap<String, UniChatBadge>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

/* ================================================================================================================== */

fn dispatch_event(mut payload: Value) -> Result<(), Error> {
    if payload.get("type").is_none() {
        return Err(anyhow!("Missing 'type' field in Twitch raw event payload"));
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
        .ok_or(anyhow!("Missing or invalid 'channelId' field in Twitch '{}' payload", event_type))?;

    shared_emotes::fetch_shared_emotes("twitch", channel_id)?;
    properties::set_item(PropertiesKey::TwitchChannelId, String::from(channel_id))?;

    return dispatch_event(payload.clone());
}

fn handle_idle_event(_event_type: &str, payload: &Value) -> Result<(), Error> {
    return dispatch_event(payload.clone());
}

fn handle_badges_event(event_type: &str, payload: &Value) -> Result<(), Error> {
    let badges_type = payload.get("badgesType").and_then(|v| v.as_str())
        .ok_or(anyhow!("Missing or invalid 'badgesType' field in Twitch '{}' payload", event_type))?;
    let badges = payload.get("badges").and_then(|v| v.as_array()).cloned()
        .ok_or(anyhow!("Missing or invalid 'badges' field in Twitch '{}' payload", event_type))?;

    let twitch_badges: Vec<TwitchRawBadge> = serde_json::from_value(serde_json::Value::Array(badges))?;

    if let Ok(mut badges) = TWITCH_BADGES.write() {
        for twitch_badge in twitch_badges {
            let mut code = format!("{}/{}", twitch_badge.set_id, twitch_badge.version);
            if badges_type == "global" && ["bits", "subscriber"].contains(&twitch_badge.set_id.as_str()) {
                // For global badges, we need to prepend "global/" to the code as a fallback
                code = format!("global/{}", code);
            }

            let url = twitch_badge.image_4x;
            badges.insert(code.clone(), UniChatBadge { code: code.clone(), url: url.clone() });
        }
    }

    return Ok(());
}

fn handle_cheermotes_event(event_type: &str, payload: &Value) -> Result<(), Error> {
    let cheermotes = payload.get("cheermotes").and_then(|v| v.as_array()).cloned()
        .ok_or(anyhow!("Missing or invalid 'cheermotes' field in Twitch '{}' payload", event_type))?;

    if let Ok(mut cheermotes_set) = TWITCH_CHEERMOTES.write() {
        for cheer in cheermotes {
            if let Ok(cheer_str) = serde_json::from_value::<String>(cheer) {
                cheermotes_set.insert(cheer_str);
            }
        }
    }

    return Ok(());
}

/* ================================================================================================================== */

fn log_action(file_name: &str, content: &impl std::fmt::Display) {
    let app_log_dir = properties::get_app_path(AppPaths::AppLog);
    let twitch_log_dir = app_log_dir.join(SCRAPER_ID);
    if !twitch_log_dir.exists() {
        fs::create_dir_all(&twitch_log_dir).unwrap();
    }

    let log_file = twitch_log_dir.join(file_name);
    let mut file = fs::OpenOptions::new().create(true).append(true).open(log_file).unwrap();
    writeln!(file, "{content}").unwrap();
}

fn handle_ws_event(_event_type: &str, message: &Value) -> Result<(), Error> {
    let log_events = settings::get_scraper_events_log_level();

    if log_events == SettingLogEventLevel::AllEvents {
        log_action("events-raw.log", &format!("{:?}", message));
    }

    match mapper::parse_ws(message) {
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
                log_action("events-unknown.log", &format!("{:?}", message));
            }
        }

        Err(err) => {
            log_action("events-error.log", &format!("{} -- {:?}", err, message));
        }
    }

    return Ok(());
}

fn handle_message_event(_event_type: &str, payload: &Value) -> Result<(), Error> {
    let message = IRCMessage::parse(payload.get("message"))?;
    let log_events = settings::get_scraper_events_log_level();

    if log_events == SettingLogEventLevel::AllEvents {
        log_action("events-raw.log", &format!("{:?}", message));
    }

    match mapper::parse_irc(&message) {
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
                log_action("events-unknown.log", &format!("{:?}", message));
            }
        }

        Err(err) => {
            log_action("events-error.log", &format!("{} -- {:?}", err, message));
        }
    }

    return Ok(());
}

/* ================================================================================================================== */

static TWITCH_VALID_URLS: LazyLock<Vec<String>> = LazyLock::new(|| vec![
    String::from("https://www.twitch.tv/{CHANNEL_NAME}/chat"),
    String::from("https://www.twitch.tv/popout/{CHANNEL_NAME}/chat"),
]);

#[derive(Default)]
struct TwitchUniChatScraper;

impl UniChatScraper for TwitchUniChatScraper {
    fn id(&self) -> &str {
        return SCRAPER_ID;
    }

    fn name(&self) -> &str {
        return "Twitch";
    }

    fn editing_tooltip_message(&self) -> &str {
        return "You can enter just the channel name or one of the following URLs to get the Twitch chat:";
    }

    fn editing_tooltip_urls(&self) -> &[String] {
        return &TWITCH_VALID_URLS;
    }

    fn placeholder_text(&self) -> &str {
        return "https://www.twitch.tv/popout/{CHANNEL_NAME}/chat";
    }

    fn badges(&self) -> &[String] {
        return &[];
    }

    fn icon(&self) -> &str {
        return "fab fa-twitch";
    }

    fn validate_url(&self, url: String) -> Result<String, Error> {
        let mut url = url.trim();
        url = url.strip_prefix("http://").unwrap_or(url);
        url = url.strip_prefix("https://").unwrap_or(url);
        url = url.strip_prefix("www.").unwrap_or(url);

        let mut channel_name: Option<&str> = None;
        if url.starts_with("twitch.tv") {
            let mut parts = url.split('/');
            parts.next();

            let channel_name_or_popout = parts.next();
            if let Some(channel_name_or_popout) = channel_name_or_popout {
                if channel_name_or_popout == "popout" {
                    channel_name = parts.next();
                } else {
                    channel_name = Some(channel_name_or_popout);
                }
            } else {
                return Err(anyhow!("Could not extract channel name from Twitch URL"));
            }
        }

        if let Some(channel_name) = channel_name.filter(|channel_name| is_valid_twitch_channel_name(channel_name)) {
            let formatted_url = format!("https://www.twitch.tv/popout/{}/chat", channel_name);
            return Ok(formatted_url);
        }

        return Err(anyhow!("Could not extract channel name from Twitch URL"));
    }

    fn scraper_js(&self) -> &str {
        return SCRAPER_JS;
    }

    fn on_event(&self, event: serde_json::Value) -> Result<(), Error> {
        let scraper_id = event.get("scraperId").and_then(|v| v.as_str())
            .ok_or(anyhow!("Missing or invalid 'scraperId' field in Twitch raw event payload"))?;
        let event_type = event.get("type").and_then(|v| v.as_str())
            .ok_or(anyhow!("Missing or invalid 'type' field in Twitch raw event payload"))?;

        if scraper_id != SCRAPER_ID {
            return Ok(());
        }

        return match event_type {
            "ready" => handle_ready_event(event_type, &event),
            "idle" => handle_idle_event(event_type, &event),
            "badges" => handle_badges_event(event_type, &event),
            "cheermotes" => handle_cheermotes_event(event_type, &event),
            "redemption" => handle_ws_event(event_type, &event),
            "message" => handle_message_event(event_type, &event),
            _ => dispatch_event(event.clone())
        };
    }
}

/* ================================================================================================================== */

pub fn init() -> Result<(), Error> {
    let scraper_data = TwitchUniChatScraper::default();

    let scraper: Arc<dyn UniChatScraper + Send + Sync> = Arc::new(scraper_data);
    scraper::register_scraper(scraper)?;

    return Ok(());
}


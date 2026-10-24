/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

use std::collections::HashMap;
use std::collections::HashSet;
use std::fs;
use std::io::Write;
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::RwLock;
use std::sync::RwLockReadGuard;

use anyhow::Error;
use anyhow::anyhow;
use serde_json::Value;

use crate::events;
use crate::events::unichat::UniChatBadge;
use crate::scraper;
use crate::scraper::UniChatScraper;
use crate::scraper::status::ScraperStatus;
use crate::scraper::status::ScraperStatusEvent;
use crate::shared_emotes;
use crate::twitch::mapper::structs::author::TwitchRawBadge;
use crate::utils::irc::IRCMessage;
use crate::utils::is_valid_twitch_channel_name;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::properties::PropertiesKey;
use crate::utils::settings;
use crate::utils::settings::SettingLogEventLevel;

mod mapper;

/* ========================================================================== */

pub const SCRAPER_ID: &str = "twitch-chat";
static SCRAPER_JS: &str = include_str!("./static/scraper.js");

/* ========================================================================== */

static TWITCH_CHEERMOTES: LazyLock<RwLock<HashSet<String>>> = LazyLock::new(|| RwLock::new(HashSet::new()));
pub(in crate::twitch) fn read_cheermotes() -> RwLockReadGuard<'static, HashSet<String>> {
    return TWITCH_CHEERMOTES.read().expect("Twitch::TWITCH_CHEERMOTES lock poisoned");
}

fn write_cheermotes(cheermotes: HashSet<String>) {
    let mut cheermotes_set = TWITCH_CHEERMOTES.write().expect("Twitch::TWITCH_CHEERMOTES lock poisoned");
    cheermotes_set.extend(cheermotes);
}

/* ========================================================================== */

static TWITCH_BADGES: LazyLock<RwLock<HashMap<String, UniChatBadge>>> = LazyLock::new(|| RwLock::new(HashMap::new()));
pub(in crate::twitch) fn read_badges() -> RwLockReadGuard<'static, HashMap<String, UniChatBadge>> {
    return TWITCH_BADGES.read().expect("Twitch::TWITCH_BADGES lock poisoned");
}

fn write_badges(badges: HashMap<String, UniChatBadge>) {
    let mut badges_map = TWITCH_BADGES.write().expect("Twitch::TWITCH_BADGES lock poisoned");
    badges_map.extend(badges);
}

/* ========================================================================== */

fn handle_ready_status(event: &ScraperStatusEvent) -> Result<(), Error> {
    let channel_id = event
        .extra_str("channelId")
        .ok_or(anyhow!("Missing or invalid 'channelId' field in Twitch 'ready' payload"))?;

    shared_emotes::fetch_shared_emotes("twitch", channel_id);
    properties::set_item(PropertiesKey::TwitchChannelId, String::from(channel_id));

    return Ok(());
}

fn handle_badges_event(event_type: &str, payload: &Value) -> Result<(), Error> {
    let badges_type = payload
        .get("badgesType")
        .and_then(|v| v.as_str())
        .ok_or(anyhow!("Missing or invalid 'badgesType' field in Twitch '{}' payload", event_type))?;
    let badges = payload
        .get("badges")
        .and_then(|v| v.as_array())
        .cloned()
        .ok_or(anyhow!("Missing or invalid 'badges' field in Twitch '{}' payload", event_type))?;

    let twitch_badges: Vec<TwitchRawBadge> = serde_json::from_value(serde_json::Value::Array(badges))?;

    let mut badges = HashMap::new();
    for twitch_badge in twitch_badges {
        let mut code = format!("{}/{}", twitch_badge.set_id, twitch_badge.version);
        if badges_type == "global" && ["bits", "subscriber"].contains(&twitch_badge.set_id.as_str()) {
            code = format!("global/{}", code);
        }

        let url = twitch_badge.image_4x;
        badges.insert(code.clone(), UniChatBadge { code: code.clone(), url: url.clone() });
    }

    write_badges(badges);

    return Ok(());
}

fn handle_cheermotes_event(event_type: &str, payload: &Value) -> Result<(), Error> {
    let cheermotes = payload
        .get("cheermotes")
        .and_then(|v| v.as_array())
        .cloned()
        .ok_or(anyhow!("Missing or invalid 'cheermotes' field in Twitch '{}' payload", event_type))?;

    let mut cheermotes_set = HashSet::new();
    for cheer in cheermotes {
        if let Ok(cheer_str) = serde_json::from_value::<String>(cheer) {
            cheermotes_set.insert(cheer_str);
        }
    }

    write_cheermotes(cheermotes_set);

    return Ok(());
}

/* ========================================================================== */

fn log_action(file_name: &str, content: &impl std::fmt::Display) {
    let app_log_dir = properties::get_app_path(AppPaths::AppLog);
    let twitch_log_dir = app_log_dir.join(SCRAPER_ID);
    if !twitch_log_dir.exists() {
        fs::create_dir_all(&twitch_log_dir).expect("Failed to create Twitch log directory");
    }

    let log_file = twitch_log_dir.join(file_name);
    let mut options = fs::OpenOptions::new();
    options.create(true).append(true);
    let mut file = options.open(log_file).expect("Failed to open Twitch log file");
    writeln!(file, "{content}").expect("Failed to write Twitch log file");
}

fn handle_ws_event(_event_type: &str, message: &Value) -> Result<(), Error> {
    let log_events = settings::get_scraper_events_log_level();

    if log_events == SettingLogEventLevel::AllEvents {
        log_action("events-raw.log", &format!("{:?}", message));
    }

    match mapper::parse_ws(message) {
        Ok(Some(parsed)) => {
            if log_events == SettingLogEventLevel::AllEvents {
                let serialized = serde_json::to_string(&parsed).expect("Failed to serialize UniChatEvent");
                log_action("events-parsed.log", &serialized);
            }

            if let Err(err) = events::emit(parsed) {
                log::error!("An error occurred on send unichat event: {:#?}", err);
            }
        }

        Ok(None) => {
            if [SettingLogEventLevel::AllEvents, SettingLogEventLevel::UnknownEvents].contains(&log_events) {
                log_action("events-unknown.log", &format!("{:?}", message));
            }
        }

        Err(err) => {
            log_action("events-error.log", &format!("{:#?} -- {:?}", err, message));
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
                let serialized = serde_json::to_string(&parsed).expect("Failed to serialize UniChatEvent");
                log_action("events-parsed.log", &serialized);
            }

            if let Err(err) = events::emit(parsed) {
                log::error!("An error occurred on send unichat event: {:#?}", err);
            }
        }

        Ok(None) => {
            if [SettingLogEventLevel::AllEvents, SettingLogEventLevel::UnknownEvents].contains(&log_events) {
                log_action("events-unknown.log", &format!("{:?}", message));
            }
        }

        Err(err) => {
            log_action("events-error.log", &format!("{:#?} -- {:?}", err, message));
        }
    }

    return Ok(());
}

/* ========================================================================== */

static TWITCH_VALID_URLS: LazyLock<Vec<String>> = LazyLock::new(|| {
    vec![
        String::from("https://www.twitch.tv/{CHANNEL_NAME}/chat"),
        String::from("https://www.twitch.tv/popout/{CHANNEL_NAME}/chat"),
    ]
});

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
        let event_type = event
            .get("type")
            .and_then(|v| v.as_str())
            .ok_or(anyhow!("Missing or invalid 'type' field in Twitch raw event payload"))?;

        return match event_type {
            "badges" => handle_badges_event(event_type, &event),
            "cheermotes" => handle_cheermotes_event(event_type, &event),
            "redemption" => handle_ws_event(event_type, &event),
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

/* ========================================================================== */

pub fn init() -> Result<(), Error> {
    scraper::register_scraper(Arc::new(TwitchUniChatScraper::default()))?;

    return Ok(());
}

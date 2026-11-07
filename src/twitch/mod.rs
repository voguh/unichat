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
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::RwLock;
use std::sync::RwLockReadGuard;

use anyhow::Error;
use anyhow::anyhow;
use regex::Regex;
use serde::Deserialize;
use serde_json::Value;

use crate::events;
use crate::events::UniChatBadge;
use crate::scraper;
use crate::scraper::ScraperLogKind;
use crate::scraper::ScraperStatus;
use crate::scraper::ScraperStatusEvent;
use crate::scraper::UniChatScraper;
use crate::shared_emotes;
use crate::twitch::irc::IRCMessage;
use crate::twitch::mapper::structs::author::TwitchRawBadge;

mod irc;
mod mapper;

/* ========================================================================== */

const SCRAPER_ID: &str = "twitch-chat";
static SCRAPER_JS: &str = include_str!("./static/scraper.js");

/* ========================================================================== */

static TWITCH_CHEERMOTES: LazyLock<RwLock<HashSet<String>>> = LazyLock::new(|| RwLock::new(HashSet::new()));
fn read_cheermotes() -> RwLockReadGuard<'static, HashSet<String>> {
    return TWITCH_CHEERMOTES.read().expect("Twitch::TWITCH_CHEERMOTES lock poisoned");
}

fn write_cheermotes(cheermotes: HashSet<String>) {
    let mut cheermotes_set = TWITCH_CHEERMOTES.write().expect("Twitch::TWITCH_CHEERMOTES lock poisoned");
    cheermotes_set.extend(cheermotes);
}

/* ========================================================================== */

static TWITCH_BADGES: LazyLock<RwLock<HashMap<String, UniChatBadge>>> = LazyLock::new(|| RwLock::new(HashMap::new()));
fn read_badges() -> RwLockReadGuard<'static, HashMap<String, UniChatBadge>> {
    return TWITCH_BADGES.read().expect("Twitch::TWITCH_BADGES lock poisoned");
}

fn write_badges(badges: HashMap<String, UniChatBadge>) {
    let mut badges_map = TWITCH_BADGES.write().expect("Twitch::TWITCH_BADGES lock poisoned");
    badges_map.extend(badges);
}

/* ========================================================================== */

static CHANNEL_ID: LazyLock<RwLock<Option<String>>> = LazyLock::new(|| RwLock::new(None));
fn write_channel_id(channel_id: String) {
    let mut current_channel_id = CHANNEL_ID.write().expect("Twitch::CHANNEL_ID lock poisoned");
    *current_channel_id = Some(channel_id);
}

/* ========================================================================== */

fn handle_ready_status(event: &ScraperStatusEvent) -> Result<(), Error> {
    let channel_id = event
        .extra_str("channelId")
        .ok_or_else(|| anyhow!("Missing or invalid 'channelId' field in Twitch 'ready' payload"))?;

    shared_emotes::fetch_shared_emotes("twitch", channel_id);
    write_channel_id(String::from(channel_id));

    return Ok(());
}

/* ========================================================================== */

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct BadgesEvent {
    badges_type: String,
    badges: Vec<TwitchRawBadge>
}

fn handle_badges_event(payload: &Value) -> Result<(), Error> {
    let event = BadgesEvent::deserialize(payload)?;

    let mut badges = HashMap::new();
    for twitch_badge in event.badges {
        let mut code = format!("{}/{}", twitch_badge.set_id, twitch_badge.version);
        if event.badges_type == "global" && ["bits", "subscriber"].contains(&twitch_badge.set_id.as_str()) {
            code = format!("global/{}", code);
        }

        badges.insert(code.clone(), UniChatBadge { code: code, url: twitch_badge.image_4x });
    }

    write_badges(badges);

    return Ok(());
}

/* ========================================================================== */

#[derive(Deserialize)]
struct CheermotesEvent {
    cheermotes: HashSet<String>
}

fn handle_cheermotes_event(payload: &Value) -> Result<(), Error> {
    let event = CheermotesEvent::deserialize(payload)?;
    write_cheermotes(event.cheermotes);

    return Ok(());
}

/* ========================================================================== */

fn handle_ws_event(message: &Value) -> Result<(), Error> {
    scraper::log_action(SCRAPER_ID, ScraperLogKind::Raw, || format!("{:?}", message));

    match mapper::parse_ws(message) {
        Ok(Some(parsed)) => {
            scraper::log_action(SCRAPER_ID, ScraperLogKind::Parsed, || {
                return serde_json::to_string(&parsed).expect("Failed to serialize UniChatEvent");
            });

            events::emit(parsed);
        }

        Ok(None) => {
            scraper::log_action(SCRAPER_ID, ScraperLogKind::Unknown, || format!("{:?}", message));
        }

        Err(err) => {
            scraper::log_action(SCRAPER_ID, ScraperLogKind::Error, || format!("{:#?} -- {:?}", err, message));
        }
    }

    return Ok(());
}

/* ========================================================================== */

#[derive(Deserialize)]
struct MessageEvent {
    message: IRCMessage
}

fn handle_message_event(payload: &Value) -> Result<(), Error> {
    let event = MessageEvent::deserialize(payload)?;
    let message = event.message;

    scraper::log_action(SCRAPER_ID, ScraperLogKind::Raw, || message.raw.clone());

    match mapper::parse_irc(&message) {
        Ok(Some(parsed)) => {
            scraper::log_action(SCRAPER_ID, ScraperLogKind::Parsed, || {
                return serde_json::to_string(&parsed).expect("Failed to serialize UniChatEvent");
            });

            events::emit(parsed);
        }

        Ok(None) => {
            scraper::log_action(SCRAPER_ID, ScraperLogKind::Unknown, || format!("{:?}", message));
        }

        Err(err) => {
            scraper::log_action(SCRAPER_ID, ScraperLogKind::Error, || format!("{:#?} -- {:?}", err, message));
        }
    }

    return Ok(());
}

/* ========================================================================== */

static CHANNEL_NAME: LazyLock<Regex> = LazyLock::new(|| {
    return Regex::new(r"^[0-9A-Za-z_]{4,25}$").expect("Twitch::CHANNEL_NAME regex is invalid");
});
fn is_valid_channel_name(channel_name: &str) -> bool {
    return CHANNEL_NAME.is_match(channel_name);
}

/* ========================================================================== */

static TWITCH_VALID_URLS: LazyLock<Vec<String>> = LazyLock::new(|| {
    vec![
        String::from("https://www.twitch.tv/{CHANNEL_NAME}/chat"),
        String::from("https://www.twitch.tv/popout/{CHANNEL_NAME}/chat"),
    ]
});

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

        let channel_name: Option<&str>;
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
        } else {
            channel_name = Some(url);
        }

        if let Some(channel_name) = channel_name.filter(|channel_name| is_valid_channel_name(channel_name)) {
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
            .ok_or_else(|| anyhow!("Missing or invalid 'type' field in Twitch raw event payload"))?;

        return match event_type {
            "badges" => handle_badges_event(&event),
            "cheermotes" => handle_cheermotes_event(&event),
            "redemption" => handle_ws_event(&event),
            "message" => handle_message_event(&event),
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
    scraper::register_scraper(Arc::new(TwitchUniChatScraper))?;

    return Ok(());
}

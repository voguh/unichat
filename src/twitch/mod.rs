/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::collections::HashMap;
use std::collections::HashSet;
use std::fs;
use std::io::Write;
use std::sync::LazyLock;
use std::sync::RwLock;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use serde_json::Value;
use tauri::Manager as _;
use tauri::Listener;

use crate::error::Error;
use crate::events;
use crate::events::unichat::UniChatBadge;
use crate::irc::IRCCommand;
use crate::irc::IRCMessage;
use crate::shared_emotes;
use crate::twitch::mapper::structs::author::TwitchRawBadge;
use crate::utils::constants::TWITCH_CHAT_WINDOW;
use crate::utils::create_scrapper_webview_window;
use crate::utils::is_dev;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::properties::PropertiesKey;
use crate::utils::render_emitter;
use crate::utils::settings;
use crate::utils::settings::SettingLogEventLevel;

mod mapper;

static SCRAPPER_JS: &str = include_str!("./static/scrapper.js");

pub static TWITCH_CHEERMOTES: LazyLock<RwLock<HashSet<String>>> = LazyLock::new(|| RwLock::new(HashSet::new()));
pub static TWITCH_BADGES: LazyLock<RwLock<HashMap<String, UniChatBadge>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

/* ================================================================================================================== */

fn dispatch_event(mut payload: Value) -> Result<(), Error> {
    if payload.get("type").is_none() {
        return Err("Missing 'type' field in Twitch raw event payload".into());
    }

    if payload.get("scrapperId").is_none() {
        payload["scrapperId"] = serde_json::json!(TWITCH_CHAT_WINDOW);
    }

    if payload.get("timestamp").is_none() {
        let now = SystemTime::now().duration_since(UNIX_EPOCH)?;
        payload["timestamp"] = serde_json::json!(now.as_millis());
    }

    return render_emitter::emit(payload);
}

/* ================================================================================================================== */

fn handle_ready_event(_event_type: &str, payload: &Value) -> Result<(), Error> {
    return dispatch_event(payload.clone());
}

fn handle_idle_event(_event_type: &str, payload: &Value) -> Result<(), Error> {
    return dispatch_event(payload.clone());
}

fn handle_badges_event(event_type: &str, payload: &Value) -> Result<(), Error> {
    let badges_type = payload.get("badgesType").and_then(|v| v.as_str())
        .ok_or(format!("Missing or invalid 'badgesType' field in Twitch '{}' payload", event_type))?;
    let badges = payload.get("badges").and_then(|v| v.as_array()).cloned()
        .ok_or(format!("Missing or invalid 'badges' field in Twitch '{}' payload", event_type))?;

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
        .ok_or(format!("Missing or invalid 'cheermotes' field in Twitch '{}' payload", event_type))?;

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
    let twitch_log_dir = app_log_dir.join("twitch");
    if !twitch_log_dir.exists() {
        fs::create_dir_all(&twitch_log_dir).unwrap();
    }

    let log_file = twitch_log_dir.join(file_name);
    let mut file = fs::OpenOptions::new().create(true).append(true).open(log_file).unwrap();
    writeln!(file, "{content}").unwrap();
}

fn handle_ws_event(_event_type: &str, message: &Value) -> Result<(), Error> {
    let log_events = settings::get_settings_log_twitch_events()?;

    if is_dev() || log_events == SettingLogEventLevel::AllEvents {
        log_action("events-raw.log", &format!("{:?}", message));
    }

    match mapper::parse_ws(message) {
        Ok(Some(parsed)) => {
            if is_dev() || log_events == SettingLogEventLevel::AllEvents {
                log_action("events-parsed.log", &serde_json::to_string(&parsed).unwrap());
            }

            if let Err(err) = events::event_emitter().emit(parsed) {
                log::error!("An error occurred on send unichat event: {}", err);
            }
        }

        Ok(None) => {
            if is_dev() || [SettingLogEventLevel::AllEvents, SettingLogEventLevel::UnknownEvents].contains(&log_events) {
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
    let log_events = settings::get_settings_log_twitch_events()?;

    if is_dev() || log_events == SettingLogEventLevel::AllEvents {
        log_action("events-raw.log", &format!("{:?}", message));
    }

    if let IRCCommand::Raw(cmd, _args) = &message.command {
        if cmd == "ROOMSTATE" {
            let tags = &message.tags.clone();
            if let Some(channel_id) = tags.get("room-id").and_then(|v| v.as_ref()) {
                shared_emotes::fetch_shared_emotes(channel_id)?;
                properties::set_item(PropertiesKey::TwitchChannelId, channel_id.clone())?;
            }

            return Ok(());
        }
    }

    match mapper::parse_irc(&message) {
        Ok(Some(parsed)) => {
            if is_dev() || log_events == SettingLogEventLevel::AllEvents {
                log_action("events-parsed.log", &serde_json::to_string(&parsed).unwrap());
            }

            if let Err(err) = events::event_emitter().emit(parsed) {
                log::error!("An error occurred on send unichat event: {}", err);
            }
        }

        Ok(None) => {
            if is_dev() || [SettingLogEventLevel::AllEvents, SettingLogEventLevel::UnknownEvents].contains(&log_events) {
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

fn handle_event(event: &str) -> Result<(), Error> {
    let payload: Value = serde_json::from_str(event)?;
    let scrapper_id = payload.get("scrapperId").and_then(|v| v.as_str())
        .ok_or("Missing or invalid 'scrapperId' field in Twitch raw event payload")?;
    let event_type = payload.get("type").and_then(|v| v.as_str())
        .ok_or("Missing or invalid 'type' field in Twitch raw event payload")?;

    if scrapper_id != TWITCH_CHAT_WINDOW {
        return Ok(());
    }

    return match event_type {
        "ready" => handle_ready_event(event_type, &payload),
        "idle" => handle_idle_event(event_type, &payload),
        "badges" => handle_badges_event(event_type, &payload),
        "cheermotes" => handle_cheermotes_event(event_type, &payload),
        "redemption" => handle_ws_event(event_type, &payload),
        "message" => handle_message_event(event_type, &payload),
        _ => dispatch_event(payload.clone())
    };
}

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Error> {
    let window = create_scrapper_webview_window(app.app_handle(), TWITCH_CHAT_WINDOW, SCRAPPER_JS)?;

    window.listen("unichat://scrapper_event", move |event| {
        if let Err(err) = handle_event(event.payload()) {
            log::error!("Failed to handle Twitch raw event: {:?}", err);
            log::error!("Event payload: {}", event.payload());
        }
    });

    return Ok(());
}


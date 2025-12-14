/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

use std::fs;
use std::io::Write;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use serde_json::Value;
use tauri::Listener;
use tauri::Manager as _;

use crate::error::Error;
use crate::events;
use crate::shared_emotes;
use crate::utils::constants::YOUTUBE_CHAT_WINDOW;
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

/* ================================================================================================================== */

fn dispatch_event(mut payload: Value) -> Result<(), Error> {
    if payload.get("type").is_none() {
        return Err(Error::from("Missing 'type' field in YouTube raw event payload"));
    }

    if payload.get("scrapperId").is_none() {
        payload["scrapperId"] = serde_json::json!(YOUTUBE_CHAT_WINDOW);
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
        .ok_or(format!("Missing or invalid 'channelId' field in YouTube '{event_type}' payload"))?;

    properties::set_item(PropertiesKey::YouTubeChannelId, String::from(channel_id))?;
    shared_emotes::fetch_shared_emotes(channel_id)?;

    return dispatch_event(payload.clone());
}


fn handle_idle_event(_event_type: &str, payload: &Value) -> Result<(), Error> {
    return dispatch_event(payload.clone());
}

/* ================================================================================================================== */

fn log_action(file_name: &str, content: &impl std::fmt::Display) {
    let app_log_dir = properties::get_app_path(AppPaths::AppLog);
    let youtube_log_dir = app_log_dir.join("youtube");
    if !youtube_log_dir.exists() {
        fs::create_dir_all(&youtube_log_dir).unwrap();
    }

    let log_file = youtube_log_dir.join(file_name);
    let mut file = fs::OpenOptions::new().create(true).append(true).open(log_file).unwrap();
    writeln!(file, "{content}").unwrap();
}

fn handle_message_event(event_type: &str, payload: &Value) -> Result<(), Error> {
    let actions = payload.get("actions").and_then(|v| v.as_array())
        .ok_or(Error::Message(format!("Missing or invalid 'actions' field in '{event_type}' event payload")))?;

    let log_events = settings::get_settings_log_youtube_events()?;

    for action in actions {
        if is_dev() || log_events == SettingLogEventLevel::AllEvents {
            log_action("events-raw.log", &action);
        }

        match mapper::parse(action) {
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

fn handle_event(event: &str) -> Result<(), Error> {
    let payload: Value = serde_json::from_str(event)?;
    let scrapper_id = payload.get("scrapperId").and_then(|v| v.as_str())
        .ok_or("Missing or invalid 'scrapperId' field in YouTube raw event payload")?;
    let event_type = payload.get("type").and_then(|v| v.as_str())
        .ok_or("Missing or invalid 'type' field in YouTube raw event payload")?;

    if scrapper_id != YOUTUBE_CHAT_WINDOW {
        return Ok(());
    }

    return match event_type {
        "ready" => handle_ready_event(event_type, &payload),
        "idle" => handle_idle_event(event_type, &payload),
        "message" => handle_message_event(event_type, &payload),
        _ => dispatch_event(payload.clone())
    };
}

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Error> {
    let window = create_scrapper_webview_window(app.app_handle(), YOUTUBE_CHAT_WINDOW, SCRAPPER_JS)?;

    window.listen("unichat://scrapper_event", move |event| {
        if let Err(err) = handle_event(event.payload()) {
            log::error!("Failed to handle YouTube raw event: {:?}", err);
            log::error!("Event payload: {}", event.payload());
        }
    });

    return Ok(());
}

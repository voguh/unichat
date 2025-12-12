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
use tauri::Manager;

use crate::events;
use crate::events::unichat::UniChatPlatform;
use crate::shared_emotes;
use crate::utils::constants::YOUTUBE_CHAT_WINDOW;
use crate::utils::is_dev;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::properties::PropertiesKey;
use crate::utils::render_emitter;
use crate::utils::settings;
use crate::utils::settings::SettingsKeys;
use crate::utils::settings::SettingLogEventLevel;

mod mapper;

pub static SCRAPPER_JS: &str = include_str!("./static/scrapper.js");
static YOUTUBE_RAW_EVENT: &str = "youtube_raw::event";

/* ================================================================================================================== */

fn dispatch_event(mut payload: Value) -> Result<(), String> {
    if payload.get("type").is_none() {
        return Err("Missing 'type' field in YouTube raw event payload".to_string());
    }

    if payload.get("platform").is_none() {
        payload["platform"] = serde_json::json!(UniChatPlatform::YouTube);
    }

    if payload.get("timestamp").is_none() {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| format!("{:?}", e))?;
        payload["timestamp"] = serde_json::json!(now.as_millis());
    }

    return render_emitter::emit(payload).map_err(|e| format!("{:?}", e));
}

/* ================================================================================================================== */

fn handle_ready_event(_app: tauri::AppHandle<tauri::Wry>, event_type: &str, payload: &Value) -> Result<(), String> {
    let channel_id = payload.get("channelId").and_then(|v| v.as_str())
        .ok_or(format!("Missing or invalid 'channelId' field in YouTube '{event_type}' payload"))?;

    properties::set_item(PropertiesKey::YouTubeChannelId, String::from(channel_id))
        .map_err(|e| format!("{:?}", e))?;

    shared_emotes::fetch_shared_emotes(channel_id).map_err(|e| format!("{:?}", e))?;

    return dispatch_event(payload.clone());
}


fn handle_idle_event(_app: tauri::AppHandle<tauri::Wry>, _event_type: &str, payload: &Value) -> Result<(), String> {
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

fn handle_message_event(_app: tauri::AppHandle<tauri::Wry>, event_type: &str, payload: &Value) -> Result<(), String> {
    let actions = payload.get("actions").and_then(|v| v.as_array())
        .ok_or(format!("Missing or invalid 'actions' field in '{event_type}' event payload"))?;

    let log_events: SettingLogEventLevel = settings::get_item(SettingsKeys::LogYouTubeEvents)?;

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

fn handle_event(app: tauri::AppHandle<tauri::Wry>, event: &str) -> Result<(), String> {
    let payload: Value = serde_json::from_str(event).map_err(|e| format!("{:?}", e))?;
    let event_type = payload.get("type").and_then(|v| v.as_str())
        .ok_or("Missing or invalid 'type' field in YouTube raw event payload")?;

    return match event_type {
        "ready" => handle_ready_event(app, event_type, &payload),
        "idle" => handle_idle_event(app, event_type, &payload),
        "message" => handle_message_event(app, event_type, &payload),
        _ => dispatch_event(payload.clone())
    };
}

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle().clone();

    let window = app.get_webview_window(YOUTUBE_CHAT_WINDOW)
        .ok_or("YouTube chat window not found")?;

    window.listen(YOUTUBE_RAW_EVENT, move |event| {
        if let Err(err) = handle_event(app_handle.clone(), event.payload()) {
            log::error!("Failed to handle YouTube raw event: {:?}", err);
            log::error!("Event payload: {}", event.payload());
        }
    });

    return Ok(());
}

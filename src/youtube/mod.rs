/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ******************************************************************************/

use std::collections::HashMap;
use std::fs;
use std::io::Write;
use std::sync::RwLock;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use serde_json::Value;
use tauri::Emitter;
use tauri::Listener;
use tauri::Manager;

use crate::custom_emotes;
use crate::custom_emotes::betterttv;
use crate::custom_emotes::seventv;
use crate::events;
use crate::events::unichat::UniChatClearEventPayload;
use crate::events::unichat::UniChatEmote;
use crate::events::unichat::UniChatEvent;
use crate::events::unichat::UniChatLoadEventPayload;
use crate::events::unichat::UniChatPlatform;
use crate::events::unichat::UNICHAT_EVENT_CLEAR_TYPE;
use crate::events::unichat::UNICHAT_EVENT_LOAD_TYPE;
use crate::utils::constants::YOUTUBE_CHAT_WINDOW;
use crate::utils::is_dev;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::properties::PropertiesKey;
use crate::utils::settings;
use crate::utils::settings::SettingsKeys;
use crate::utils::settings::YouTubeSettingLogLevel;

mod mapper;

pub static SCRAPPER_JS: &str = include_str!("./static/scrapper.js");
pub static YOUTUBE_RAW_EVENT: &str = "youtube_raw::event";

/* ================================================================================================================== */

fn dispatch_event(app: tauri::AppHandle<tauri::Wry>, mut payload: Value) -> Result<(), String> {
    if payload.get("type").is_none() {
        return Err("Missing 'type' field in YouTube raw event payload".to_string());
    }

    if payload.get("timestamp").is_none() {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| format!("{:?}", e))?;
        payload["timestamp"] = serde_json::json!(now.as_millis());
    }

    let window = app.get_webview_window("main").ok_or("Main window not found")?;
    return window.emit("unichat://youtube:event", payload).map_err(|e| format!("{:?}", e));
}

/* ================================================================================================================== */

fn set_emotes_hashmap(emotes: HashMap<String, UniChatEmote>) -> Result<(), Box<dyn std::error::Error>> {
    let custom_emotes = custom_emotes::EMOTES_HASHSET.get();

    if let Some(custom_emotes) = custom_emotes {
        let mut guard = custom_emotes.write().map_err(|e| format!("{:?}", e))?;

        for (key, value) in emotes {
            guard.insert(key, value);
        }
    } else {
        custom_emotes::EMOTES_HASHSET.set(RwLock::new(emotes)).map_err(|_| "Failed to set custom emotes hashmap")?;
    }

    return Ok(());
}

fn handle_ready_event(app: tauri::AppHandle<tauri::Wry>, event_type: &str, payload: &Value) -> Result<(), String> {
    let channel_id = payload.get("channelId").and_then(|v| v.as_str())
        .ok_or(format!("Missing or invalid 'channelId' field in YouTube {event_type} payload"))?;

    properties::set_item(PropertiesKey::YouTubeChannelId, String::from(channel_id))
        .map_err(|e| format!("{:?}", e))?;

    let mut custom_emotes = betterttv::fetch_emotes(channel_id);
    custom_emotes.extend(seventv::fetch_emotes(channel_id));
    set_emotes_hashmap(custom_emotes).map_err(|err| format!("Failed to set custom emotes: {}", err))?;

    let init_event = UniChatEvent::Load {
        event_type: String::from(UNICHAT_EVENT_LOAD_TYPE),
        data: UniChatLoadEventPayload {
            channel_id: String::from(channel_id),
            channel_name: None,
            platform: UniChatPlatform::YouTube
        }
    };
    if let Err(err) = events::event_emitter().emit(init_event) {
        log::error!("An error occurred on send 'unichat:load' unichat event: {}", err);
    }

    return dispatch_event(app, payload.clone());
}


fn handle_idle_event(app: tauri::AppHandle<tauri::Wry>, _event_type: &str, payload: &Value) -> Result<(), String> {
    let channel_id = properties::get_item(PropertiesKey::YouTubeChannelId)
        .map_err(|e| format!("{:?}", e))?;

    let parsed = UniChatEvent::Clear {
        event_type: String::from(UNICHAT_EVENT_CLEAR_TYPE),
        data: UniChatClearEventPayload {
            channel_id: channel_id.clone(),
            channel_name: None,
            platform: UniChatPlatform::YouTube
        }
    };

    if let Err(err) = events::event_emitter().emit(parsed) {
        log::error!("An error occurred on send 'unichat:clear' unichat event: {}", err);
    }

    return dispatch_event(app, payload.clone());
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

    let log_events: YouTubeSettingLogLevel = settings::get_item(SettingsKeys::LogYouTubeEvents)?;

    for action in actions {
        if is_dev() || log_events == YouTubeSettingLogLevel::AllEvents {
            log_action("events-raw.log", &action);
        }

        match mapper::parse(action) {
            Ok(Some(parsed)) => {
                if is_dev() || log_events == YouTubeSettingLogLevel::AllEvents {
                    log_action("events-parsed.log", &serde_json::to_string(&parsed).unwrap());
                }

                if let Err(err) = events::event_emitter().emit(parsed) {
                    log::error!("An error occurred on send unichat event: {}", err);
                }
            }

            Ok(None) => {
                if is_dev() || [YouTubeSettingLogLevel::AllEvents, YouTubeSettingLogLevel::UnknownEvents].contains(&log_events) {
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

fn handle_event(app: tauri::AppHandle<tauri::Wry>, event: tauri::Event) -> Result<(), String> {
    let payload: Value = serde_json::from_str(event.payload()).map_err(|e| format!("{}", e))?;
    let event_type = payload.get("type").and_then(|v| v.as_str())
        .ok_or("Missing or invalid 'type' field in YouTube raw event payload")?;

    return match event_type {
        "ready" => handle_ready_event(app, event_type, &payload),
        "idle" => handle_idle_event(app, event_type, &payload),
        "message" => handle_message_event(app, event_type, &payload),
        _ => dispatch_event(app, payload.clone())
    };
}

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle().clone();

    let window = app.get_webview_window(YOUTUBE_CHAT_WINDOW)
        .ok_or("YouTube chat window not found")?;

    window.listen(YOUTUBE_RAW_EVENT, move |event| {
        if let Err(err) = handle_event(app_handle.clone(), event) {
            log::error!("Failed to handle YouTube raw event: {}", err);
        }
    });

    return Ok(());
}

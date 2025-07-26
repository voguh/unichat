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
use std::thread::sleep;
use std::time::Duration;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use futures::prelude::*;
use irc::client::prelude::*;
use rand::Rng;
use serde_json::json;
use serde_json::Value;
use tauri::async_runtime::JoinHandle;
use tauri::Listener;
use tauri::Manager;
use tauri::Url;

use crate::events;
use crate::events::unichat::UniChatBadge;
use crate::events::unichat::UniChatPlatform;
use crate::shared_emotes;
use crate::twitch::mapper::structs::author::TwitchRawBadge;
use crate::twitch::mapper::structs::parse_tags;
use crate::utils;
use crate::utils::constants::TWITCH_CHAT_WINDOW;
use crate::utils::is_dev;
use crate::utils::properties;
use crate::utils::properties::AppPaths;
use crate::utils::properties::PropertiesKey;
use crate::utils::render_emitter;
use crate::utils::settings;
use crate::utils::settings::SettingLogEventLevel;
use crate::utils::settings::SettingsKeys;

mod mapper;

static SCRAPPER_JS: &str = include_str!("./static/scrapper.js");
static RAW_EVENT: &str = "twitch_raw::event";
static ASYNC_HANDLE: LazyLock<RwLock<Option<JoinHandle<()>>>> = LazyLock::new(|| RwLock::new(None));

pub static TWITCH_CHEERMOTES: LazyLock<RwLock<HashSet<String>>> = LazyLock::new(|| RwLock::new(HashSet::new()));
pub static TWITCH_BADGES: LazyLock<RwLock<HashMap<String, UniChatBadge>>> = LazyLock::new(|| RwLock::new(HashMap::new()));

/* ================================================================================================================== */

fn dispatch_event(mut payload: Value) -> Result<(), String> {
    if payload.get("type").is_none() {
        return Err("Missing 'type' field in YouTube raw event payload".to_string());
    }

    if payload.get("platform").is_none() {
        payload["platform"] = serde_json::json!(UniChatPlatform::Twitch);
    }

    if payload.get("timestamp").is_none() {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| format!("{:?}", e))?;
        payload["timestamp"] = serde_json::json!(now.as_millis());
    }

    return render_emitter::emit(payload).map_err(|e| format!("{:?}", e));
}

/* ================================================================================================================== */

fn handle_ready_event(_app: tauri::AppHandle<tauri::Wry>, event_type: &str, payload: &Value) -> Result<(), String> {
    let url = payload.get("url").and_then(|v| v.as_str())
        .ok_or(format!("Missing or invalid 'url' field in Twitch '{event_type}' payload"))?;

    let channel_name = url.replace("https://www.twitch.tv/popout/", "").split("/").next()
        .ok_or("Failed to extract channel name from URL")?
        .to_lowercase();

    if let Ok(mut handle) = ASYNC_HANDLE.write() {
        if let Some(join_handle) = handle.take() {
            join_handle.abort();
        }

        *handle = Some(tauri::async_runtime::spawn(async move {
            let channel_name = channel_name.clone();
            let mills = rand::rng().random_range(10000..=99999);
            let nickname = format!("justinfan{}", mills);
            let config = Config {
                server: Some(String::from("irc.chat.twitch.tv")),
                port: Some(6667),
                ..Config::default()
            };

            let mut client = Client::from_config(config).await.unwrap();

            let capabilities = vec!["twitch.tv/commands", "twitch.tv/membership", "twitch.tv/tags"];
            let capabilities = capabilities.into_iter().map(|cap| Capability::Custom(cap)).collect::<Vec<_>>();
            client.send_cap_req(&capabilities).unwrap();
            client.send(Command::PASS(String::from("SCHMOOPIIE"))).unwrap();
            client.send(Command::NICK(nickname.clone())).unwrap();
            client.send(Command::USER(nickname.clone(), String::from("8"), nickname.clone())).unwrap();
            client.send(Command::JOIN(format!("#{}", channel_name), None, None)).unwrap();

            let mut stream = client.stream().unwrap();
            loop {
                match stream.next().await.transpose() {
                    Ok(Some(message)) => {
                        if let Command::PING(_server1, _server2) = message.command {
                            if let Err(e) = dispatch_event(json!({ "type": "ping" })) {
                                log::error!("Failed to handle Twitch PING event: {:?}", e);
                            }
                        } else if let Command::Response(response, _args) = message.command {
                            if response == Response::RPL_WELCOME {
                                if let Err(e) = dispatch_event(json!({ "type": "ping" })) {
                                    log::error!("Failed to handle Twitch PING event: {:?}", e);
                                }
                            }
                        } else if let Err(err) = handle_message_event(&message) {
                            log::error!("Failed to handle Twitch message event: {:?}", err);
                        }
                    }
                    Ok(None) => {},
                    Err(_cancelled) => {
                        log::info!("Twitch IRC task cancelled. Parting from channel: {}", channel_name);
                        if let Err(e) = client.send(Command::PART(format!("#{}", channel_name), None)) {
                            log::error!("Failed to send PART command: {:?}", e);
                        }

                        log::info!("Quitting from Twitch IRC server.");
                        if let Err(e) = client.send(Command::QUIT(None)) {
                            log::error!("Failed to send QUIT command: {:?}", e);
                        }

                        break;
                    }
                }
            }
        }));
    }

    return dispatch_event(payload.clone());
}

fn handle_idle_event(_app: tauri::AppHandle<tauri::Wry>, _event_type: &str, payload: &Value) -> Result<(), String> {
    if let Ok(mut handle) = ASYNC_HANDLE.write() {
        if let Some(join_handle) = handle.take() {
            join_handle.abort();
        }

        *handle = None;
    }

    return dispatch_event(payload.clone());
}

fn handle_badges_event(_app: tauri::AppHandle<tauri::Wry>, event_type: &str, payload: &Value) -> Result<(), String> {
    let badges_type = payload.get("badgesType").and_then(|v| v.as_str())
        .ok_or(format!("Missing or invalid 'badgesType' field in Twitch '{}' payload", event_type))?;
    let badges = payload.get("badges").and_then(|v| v.as_array()).cloned()
        .ok_or(format!("Missing or invalid 'badges' field in Twitch '{}' payload", event_type))?;

    let twitch_badges: Vec<TwitchRawBadge> = serde_json::from_value(serde_json::Value::Array(badges))
        .map_err(|e| format!("{:?}", e))?;

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

fn handle_cheermotes_event(_app: tauri::AppHandle<tauri::Wry>, event_type: &str, payload: &Value) -> Result<(), String> {
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

fn handle_message_event(message: &Message) -> Result<(), Box<dyn std::error::Error>> {
    let log_events: SettingLogEventLevel = settings::get_item(SettingsKeys::LogTwitchEvents)?;

    if is_dev() || log_events == SettingLogEventLevel::AllEvents {
        log_action("events-raw.log", &format!("{:?}", message));
    }

    if let Command::Raw(cmd, _args) = &message.command {
        if cmd == "ROOMSTATE" {
            let tags = parse_tags(&message.tags);
            if let Some(channel_id) = tags.get("room-id") {
                shared_emotes::fetch_shared_emotes(&channel_id)?;
                properties::set_item(PropertiesKey::TwitchChannelId, channel_id.clone())?;
            }

            return Ok(());
        }
    }

    match mapper::parse(message) {
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

fn decode_url(url: &str) -> Result<Url, Box<dyn std::error::Error>> {
    let mut url = url.to_string();

    if url.is_empty() || url == "about:blank" || !url.starts_with("https://") {
        if utils::is_dev() {
            url = String::from("http://localhost:1421/twitch-await.html");
        } else {
            url = String::from("tauri://localhost/twitch-await.html");
        }
    }

    return Url::parse(url.as_str()).map_err(|e| Box::new(e) as Box<dyn std::error::Error>);
}

#[tauri::command]
pub async fn get_twitch_scrapper_url(app: tauri::AppHandle<tauri::Wry>) -> Result<String, String> {
    let window = app.get_webview_window(TWITCH_CHAT_WINDOW).ok_or("Twitch chat window not found")?;
    let url = window.url().map_err(|e| format!("{:?}", e))?;

    return Ok(url.as_str().to_string());
}

#[tauri::command]
pub async fn set_twitch_scrapper_url(app: tauri::AppHandle<tauri::Wry>, url: &str) -> Result<(), String> {
    let window = app.get_webview_window(TWITCH_CHAT_WINDOW).ok_or("Twitch chat window not found")?;
    let tauri_url = decode_url(url).map_err(|e| format!("{:?}", e))?;

    window.navigate(tauri_url).map_err(|e| format!("{:?}", e))?;

    if url != "about:blank" {
        sleep(Duration::from_millis(500));
        window.eval(SCRAPPER_JS).map_err(|e| format!("{:?}", e))?;
    } else {
        window.hide().map_err(|e| format!("{:?}", e))?;
    }

    return Ok(());
}

/* ================================================================================================================== */

fn handle_event(app: tauri::AppHandle<tauri::Wry>, event: tauri::Event) -> Result<(), String> {
    let payload: Value = serde_json::from_str(event.payload()).map_err(|e| format!("{}", e))?;
    let event_type = payload.get("type").and_then(|v| v.as_str())
        .ok_or("Missing or invalid 'type' field in Twitch raw event payload")?;

    return match event_type {
        "ready" => handle_ready_event(app, event_type, &payload),
        "idle" => handle_idle_event(app, event_type, &payload),
        "badges" => handle_badges_event(app, event_type, &payload),
        "cheermotes" => handle_cheermotes_event(app, event_type, &payload),
        "message" => Ok(()),
        _ => dispatch_event(payload.clone())
    };
}

pub fn init(app: &mut tauri::App<tauri::Wry>) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle().clone();

    let window = app.get_webview_window(TWITCH_CHAT_WINDOW)
        .ok_or("Twitch chat window not found")?;

    window.listen(RAW_EVENT, move |event| {
        if let Err(err) = handle_event(app_handle.clone(), event) {
            log::error!("Failed to handle Twitch raw event: {:?}", err);
        }
    });

    return Ok(());
}


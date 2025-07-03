/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
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

use std::thread::sleep;
use std::time::Duration;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use futures::prelude::*;
use irc::client::prelude::*;
use rand::Rng;
use serde_json::Value;
use tauri::Emitter;
use tauri::Listener;
use tauri::Manager;
use tauri::Url;

use crate::utils;
use crate::utils::constants::TWITCH_CHAT_WINDOW;

static SCRAPPER_JS: &str = include_str!("./static/scrapper.js");
static RAW_EVENT: &str = "twitch_raw::event";

/* ================================================================================================================== */

fn dispatch_event(app: tauri::AppHandle<tauri::Wry>, mut payload: Value) -> Result<(), String> {
    if payload.get("type").is_none() {
        return Err("Missing 'type' field in Twitch raw event payload".to_string());
    }

    if payload.get("timestamp").is_none() {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| format!("{:?}", e))?;
        payload["timestamp"] = serde_json::json!(now.as_millis());
    }

    let window = app.get_webview_window("main").ok_or("Main window not found")?;
    return window.emit("unichat://twitch:event", payload).map_err(|e| format!("{:?}", e));
}

/* ================================================================================================================== */

fn handle_ready_event(app: tauri::AppHandle<tauri::Wry>, event_type: &str, payload: &Value) -> Result<(), String> {
    let url = payload.get("url").and_then(|v| v.as_str())
        .ok_or(format!("Missing or invalid 'url' field in Twitch '{event_type}' payload"))?;

    let channel_name = url.replace("https://www.twitch.tv/popout/", "").split("/").next()
        .ok_or("Failed to extract channel name from URL")?
        .to_lowercase();

    // shared_emotes::fetch_shared_emotes(channel_id).map_err(|e| format!("{:?}", e))?;

    tauri::async_runtime::spawn(async move {
        let mills = rand::rng().random_range(10000..=99999);
        let config = Config {
            nickname: Some(format!("justinfan{}", mills)),
            server: Some("irc.chat.twitch.tv".to_string()),
            port: Some(6667),
            channels: vec![format!("#{}", channel_name)],
            ..Config::default()
        };

        let mut client = Client::from_config(config).await.unwrap();
        client.identify().unwrap();

        let mut stream = client.stream().unwrap();
        while let Some(message) = stream.next().await.transpose().unwrap() {
            println!("{:?}", message);
        }
    });

    return dispatch_event(app, payload.clone());
}

fn handle_idle_event(app: tauri::AppHandle<tauri::Wry>, _event_type: &str, payload: &Value) -> Result<(), String> {
    return dispatch_event(app, payload.clone());
}

/* ================================================================================================================== */

fn handle_message_event(_app: tauri::AppHandle<tauri::Wry>, _event_type: &str, _payload: &Value) -> Result<(), String> {
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
    sleep(Duration::from_millis(500));
    window.eval(SCRAPPER_JS).map_err(|e| format!("{:?}", e))?;

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
        "message" => handle_message_event(app, event_type, &payload),
        _ => dispatch_event(app, payload.clone())
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


use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use serde_json::Value;
use tauri::Emitter;
use tauri::Listener;
use tauri::Manager;

use crate::events;
use crate::utils::constants::YOUTUBE_CHAT_WINDOW;
use crate::utils::is_dev;
use crate::utils::properties;
use crate::utils::properties::PropertiesKey;
use crate::utils::settings;
use crate::utils::settings::SettingsKeys;

mod mapper;

pub static SCRAPPING_JS: &str = include_str!("./static/scrapper.js");

pub static YOUTUBE_RAW_EVENT: &str = "youtube_raw::event";

/* ================================================================================================================== */

fn dispatch_event(app: tauri::AppHandle<tauri::Wry>, event_type: &str, mut payload: Value) -> Result<(), String> {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| format!("{}", e))?;
    payload["timestamp"] = serde_json::json!(now.as_millis());

    let window = app.get_webview_window("main").ok_or("Main window not found")?;
    return window.emit(event_type, payload).map_err(|e| format!("Failed to emit event: {}", e));
}

/* ================================================================================================================== */

fn handle_ready_event(app: tauri::AppHandle<tauri::Wry>, event_type: &str, payload: &Value) -> Result<(), String> {
    let channel_id = payload.get("channelId").and_then(|v| v.as_str())
        .ok_or(format!("Missing or invalid 'channelId' field in YouTube {event_type} payload"))?;
    let url = payload.get("url").and_then(|v| v.as_str())
        .ok_or(format!("Missing or invalid 'url' field in YouTube {event_type} payload"))?;

    properties::set_item(PropertiesKey::YouTubeChannelId, channel_id.to_string())?;
    let evt_payload = serde_json::json!({ "type": "ready", "channelId": channel_id, "url": url });

    return dispatch_event(app, "unichat://youtube:event", evt_payload);
}

/* ================================================================================================================== */

fn handle_idle_event(app: tauri::AppHandle<tauri::Wry>, _event_type: &str, _payload: &Value) -> Result<(), String> {
    let evt_payload = serde_json::json!({ "type": "idle" });

    return dispatch_event(app, "unichat://youtube:event", evt_payload);
}

/* ================================================================================================================== */

fn handle_ping_event(app: tauri::AppHandle<tauri::Wry>, _event_type: &str, _payload: &Value) -> Result<(), String> {
    let evt_payload = serde_json::json!({ "type": "working" });

    return dispatch_event(app, "unichat://youtube:event", evt_payload);
}

/* ================================================================================================================== */

fn handle_error_event(app: tauri::AppHandle<tauri::Wry>, event_type: &str, payload: &Value) -> Result<(), String> {
    let stack = payload.get("stack").and_then(|v| v.as_str())
        .ok_or(format!("Missing or invalid 'stack' field in '{event_type}' event payload"))?;

    log::error!("js-error:{}", stack);
    let evt_payload = serde_json::json!({ "type": "error", "error": stack });

    return dispatch_event(app, "unichat://youtube:event", evt_payload);
}

/* ================================================================================================================== */

fn log_action(file_name: &str, content: &impl std::fmt::Display) {
    use std::fs;
    use std::io::Write;

    use crate::utils::properties;
    use crate::utils::properties::AppPaths;

    let app_log_dir = properties::get_app_path(AppPaths::AppLogDir);
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

    let log_events = settings::get_item(SettingsKeys::LogYoutubeEvents).unwrap_or(Value::from("ONLY_ERRORS"));

    for action in actions {
        if is_dev() || log_events == Value::from("ALL") {
            log_action("events-raw.log", &action);
        }

        match mapper::parse(&action) {
            Ok(Some(parsed)) => {
                if is_dev() || log_events == Value::from("ALL") {
                    log_action("events-parsed.log", &format!("{}", serde_json::to_string(&parsed).unwrap()));
                }

                if let Err(err) = events::event_emitter().emit(parsed) {
                    log::error!("An error occurred on send unichat event: {}", err);
                }
            }

            Ok(None) => {
                if is_dev() || log_events == Value::from("UNKNOWN") {
                    log_action("events-unknown.log", &action);
                }
            }

            Err(err) => {
                log_action("events-error.log", &format!("{err} -- {action}"));
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
        "message" => handle_message_event(app, event_type, &payload),
        "error" => handle_error_event(app, event_type, &payload),
        "ready" => handle_ready_event(app, event_type, &payload),
        "ping" => handle_ping_event(app, event_type, &payload),
        "idle" => handle_idle_event(app, event_type, &payload),
        _ => Err(format!("Unknown YouTube raw event type: {}", event_type))
    };
}

pub fn init(app: &mut tauri::App<tauri::Wry>) {
    let app_handle = app.handle().clone();

    let window = app.get_webview_window(YOUTUBE_CHAT_WINDOW).expect("YouTube chat window not found");
    window.listen(YOUTUBE_RAW_EVENT, move |event| {
        if let Err(err) = handle_event(app_handle.clone(), event) {
            log::error!("Failed to handle YouTube raw event: {}", err);
        }
    });
}

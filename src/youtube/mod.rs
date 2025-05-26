use std::fs;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;
use std::io::Write;

use serde_json::Value;
use tauri::is_dev;
use tauri::{Emitter, Manager};

use crate::events;

mod mapper;

pub const SCRAPPING_JS: &str = r#"
    if (window.fetch.__WRAPPED__ == null) {
        const originalFetch = window.fetch;
        Object.defineProperty(window, "fetch", {
            value: async (...args) => {
                const res = await originalFetch(...args);

                if (res.url.startsWith("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat") && res.ok) {
                    res.clone().json().then(async (parsed) => {
                        const actions = parsed?.continuationContents?.liveChatContinuation?.actions;

                        if (actions != null && actions.length > 0) {
                            await window.__TAURI__.core.invoke("on_youtube_message", { actions });
                        }
                    }).catch((err) => {
                        window.__TAURI__.core.invoke("on_youtube_error", { error: JSON.stringify(err.stack) }).then(() => console.log("YouTube error event emitted!"));
                    });
                }

                return res;
            },
            configurable: true,
            writable: true
        });

        setInterval(() => {
            if (window.fetch.__WRAPPED__) {
                window.__TAURI__.core.invoke("on_youtube_ping").then(() => console.log("YouTube ping event emitted!"));
            }
        }, 5000);

        window.__TAURI__.core.invoke("on_youtube_ready", { url: window.location.href }).then(() => console.log("YouTube ready event emitted!"));
        Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, configurable: true, writable: true });
        console.log("Fetch wrapped!");

        const unichatWarn = document.createElement("div");
        unichatWarn.style.position = "absolute";
        unichatWarn.style.top = "8px";
        unichatWarn.style.right = "8px";
        unichatWarn.style.zIndex = "9999";
        unichatWarn.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        unichatWarn.style.color = "white";
        unichatWarn.style.padding = "10px";
        unichatWarn.style.borderRadius = "4px";
        unichatWarn.innerText = "UniChat installed! You can close this window.";
        document.body.appendChild(unichatWarn);
    } else {
        console.log("Fetch already was wrapped!");
    }
"#;

/* ================================================================================================================== */

fn dispatch_event<R: tauri::Runtime>(app: tauri::AppHandle<R>, event_type: &str, mut payload: Value) -> Result<(), String> {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| format!("Failed to get current time: {}", e))?;
    payload["timestamp"] = serde_json::json!(now.as_millis());

    return app.emit(event_type, payload).map_err(|e| format!("Failed to emit event: {}", e));
}

#[tauri::command]
pub async fn on_youtube_idle<R: tauri::Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    log::info!("YouTube scrapper js registered!");
    let payload = serde_json::json!({ "type": "idle" });

    return dispatch_event(app, "unichat://youtube:event", payload);
}

#[tauri::command]
pub async fn on_youtube_ready<R: tauri::Runtime>(app: tauri::AppHandle<R>, url: &str) -> Result<(), String> {
    log::info!("YouTube scrapper js registered!");
    let payload = serde_json::json!({ "type": "ready", "url": url });

    return dispatch_event(app, "unichat://youtube:event", payload);
}

#[tauri::command]
pub async fn on_youtube_ping<R: tauri::Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    let payload = serde_json::json!({ "type": "working" });

    return dispatch_event(app, "unichat://youtube:event", payload);
}

#[tauri::command]
pub async fn on_youtube_error<R: tauri::Runtime>(app: tauri::AppHandle<R>, error: &str) -> Result<(), String> {
    let payload = serde_json::json!({ "type": "error", "error": error });
    log::error!("js-error:{}", error);

    return dispatch_event(app, "unichat://youtube:event", payload);
}

/* ================================================================================================================== */

#[tauri::command]
pub async fn on_youtube_message<R: tauri::Runtime>(app: tauri::AppHandle<R>, actions: Vec<Value>) -> Result<(), String> {
    let unknown_action_path = app.path().app_data_dir().unwrap().join("unknown_actions.txt");
    let mut unknown_file = fs::OpenOptions::new().append(true).create(true).open(&unknown_action_path).unwrap();

    let parse_errors_path = app.path().app_data_dir().unwrap().join("parse_errors.txt");
    let mut errors_file = fs::OpenOptions::new().append(true).create(true).open(&parse_errors_path).unwrap();

    let debug_raw_events_path = app.path().app_data_dir().unwrap().join("debug_raw_events_log.txt");
    let mut debug_raw_file = fs::OpenOptions::new().append(true).create(true).open(&debug_raw_events_path).unwrap();

    let debug_parsed_events_path = app.path().app_data_dir().unwrap().join("debug_parsed_events_log.txt");
    let mut debug_parsed_file = fs::OpenOptions::new().append(true).create(true).open(&debug_parsed_events_path).unwrap();

    for action in actions.clone() {
        if is_dev() {
            writeln!(debug_raw_file, "{}", serde_json::to_string(&action).unwrap()).unwrap();
        }

        match mapper::parse(&action) {
            Ok(Some(parsed)) => {
                if is_dev() {
                    writeln!(debug_parsed_file, "{}", serde_json::to_string(&parsed).unwrap()).unwrap();
                }

                if let Err(err) = events::event_emitter().emit(parsed) {
                    log::error!("An error occurred on send unichat event: {}", err);
                }
            }

            Ok(None) => {
                writeln!(unknown_file, "{}", serde_json::to_string(&action).unwrap()).unwrap();
            }

            Err(err) => {
                writeln!(errors_file, "{}:{}:{} -- {}", err, err.line(), err.column(), serde_json::to_string(&action).unwrap()).unwrap();
            }
        }
    }

    return Ok(());
}

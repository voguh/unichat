use std::{fs, io::Write};

use serde_json::Value;
use tauri::Manager;

use crate::events;

mod mapper;

pub const SCRAPPING_JS: &str = r#"
    if (window.fetch.__WRAPPED__ == null) {
        const originalFetch = window.fetch
        Object.defineProperty(window, "fetch", {
            value: async (...args) => {
                const res = await originalFetch(...args)

                if (res.url.startsWith("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat") && res.ok) {
                    res.clone().json().then(async (parsed) => {
                        const actions = parsed?.continuationContents?.liveChatContinuation?.actions

                        if (actions != null && actions.length > 0) {
                            await window.__TAURI__.core.invoke('on_youtube_message', { actions })
                        }
                    }).catch(err => console.error(err))
                }

                return res
            },
            configurable: true,
            writable: true
        })

        Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, configurable: true, writable: true })
    } else {
        console.log("Fetch already was wrapped!")
    }
"#;

#[tauri::command]
pub async fn on_youtube_message<R: tauri::Runtime>(app: tauri::AppHandle<R>, actions: Vec<Value>) -> Result<(), String> {
    let unknown_action_path = app.path().app_data_dir().unwrap().join("unknown_actions.txt");
    let parse_errors_path = app.path().app_data_dir().unwrap().join("parse_errors.txt");

    for action in actions.clone() {
        match mapper::parse(&action) {
            Ok(Some(parsed)) => {
                if let Err(err) = events::event_emitter().emit(parsed) {
                    println!("An error occurred on send unichat event: {err}");
                }
            }

            Ok(None) => {
                let mut file = fs::OpenOptions::new().append(true).create(true).open(&unknown_action_path).unwrap();
                writeln!(file, "{}", serde_json::to_string(&action).unwrap()).unwrap();
            }

            Err(err) => {
                let mut file = fs::OpenOptions::new().append(true).create(true).open(&parse_errors_path).unwrap();
                writeln!(file, "{}:{}:{} -- {}", err, err.line(), err.column(), serde_json::to_string(&action).unwrap()).unwrap();
            }
        }
    }

    Ok(())
}

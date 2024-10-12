use std::{fs, io::Write};

use mapper::parse;
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
    for action in actions.clone() {
        #[cfg(debug_assertions)] {
            let events_path = app.path().app_data_dir().unwrap().join("events.txt");
            let mut file = fs::OpenOptions::new().append(true).create(true).open(&events_path).unwrap();
            writeln!(file, "{action}").unwrap();
        }

        if let Some(parsed) = parse(action) {
            #[cfg(debug_assertions)] {
                let events_parsed_path = app.path().app_data_dir().unwrap().join("events-parsed.txt");
                let mut file = fs::OpenOptions::new().append(true).create(true).open(&events_parsed_path).unwrap();
                writeln!(file, "{}", serde_json::to_string(&parsed).unwrap()).unwrap();
            }

            if let Err(err) = events::INSTANCE.lock().unwrap().tx.send(parsed) {
                println!("An error occurred on send unichat event: {err}")
            }
        }
    }

    Ok(())
}

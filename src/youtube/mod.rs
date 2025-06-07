use std::sync::Arc;
use std::time::SystemTime;
use std::time::UNIX_EPOCH;

use serde_json::Value;
use tauri::{Emitter, Manager};
use tauri_plugin_store::Store;

use crate::events;
use crate::utils::constants;

mod mapper;

pub const SCRAPPING_JS: &str = r#"
    if (window.fetch.__WRAPPED__ == null) {
        // Select live chat instead top chat
        document.querySelector('#live-chat-view-selector-sub-menu #trigger')?.click();
        document.querySelector('#live-chat-view-selector-sub-menu #dropdown a:nth-child(2)')?.click()

        // Wrap fetch to intercept YouTube live chat messages
        const originalFetch = window.fetch;
        Object.defineProperty(window, 'fetch', {
            value: async (...args) => {
                const res = await originalFetch(...args);

                if (res.url.startsWith('https://www.youtube.com/youtubei/v1/live_chat/get_live_chat') && res.ok) {
                    res.clone().json().then(async (parsed) => {
                        const actions = parsed?.continuationContents?.liveChatContinuation?.actions;

                        if (actions != null && actions.length > 0) {
                            await window.__TAURI__.core.invoke('on_youtube_message', { actions });
                        }
                    }).catch((err) => {
                        window.__TAURI__.core.invoke('on_youtube_error', { error: JSON.stringify(err.stack) }).then(() => console.log('YouTube error event emitted!'));
                    });
                }

                return res;
            },
            configurable: true,
            writable: true
        });
        Object.defineProperty(window.fetch, '__WRAPPED__', { value: true, configurable: true, writable: true });

        // Retrieve channel id
        function processMessageNode(node) {
        let newNode = node.closest('yt-live-chat-text-message-renderer');
            if (newNode == null) {
                newNode = node.closest('ytd-comment-renderer');
            }

            const data = newNode?.__data?.data ?? newNode?.data ?? newNode?.__data;
            const liveChatItemContextMenuEndpointParams = data?.contextMenuEndpoint?.liveChatItemContextMenuEndpoint?.params;
            const sendLiveChatMessageEndpointParams = data?.actionPanel?.liveChatMessageInputRenderer?.sendButton?.buttonRenderer?.serviceEndpoint?.sendLiveChatMessageEndpoint?.params;

            return liveChatItemContextMenuEndpointParams || sendLiveChatMessageEndpointParams;
        }

        for (const node of document.querySelectorAll('span#message')) {
            const data = processMessageNode(node);
            if (data != null) {
                const protoChannelId = atob(decodeURIComponent(atob(data)));
                const channelId = protoChannelId.split("*'\n\u0018")[1].split('\u0012\u000b')[0];

                window.__TAURI__.core.invoke('on_youtube_channel_id', { channelId }).then(() => console.log('YouTube channelId event emitted!'));
                break;
            }
        }

        // Attach status ping event
        setInterval(() => {
            if (window.fetch.__WRAPPED__) {
                window.__TAURI__.core.invoke('on_youtube_ping').then(() => console.log('YouTube ping event emitted!'));
            }
        }, 5000);

        // Add a warning message to the page
        const unichatWarn = document.createElement('div');
        unichatWarn.style.position = 'absolute';
        unichatWarn.style.top = '8px';
        unichatWarn.style.right = '8px';
        unichatWarn.style.zIndex = '9999';
        unichatWarn.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        unichatWarn.style.color = 'white';
        unichatWarn.style.padding = '10px';
        unichatWarn.style.borderRadius = '4px';
        unichatWarn.innerText = 'UniChat installed! You can close this window.';
        document.body.appendChild(unichatWarn);

        window.__TAURI__.core.invoke('on_youtube_ready', { url: window.location.href }).then(() => console.log('YouTube ready event emitted!'));
        console.log('Fetch wrapped!');
    } else {
        console.log('Fetch already was wrapped!');
    }
"#;

/* ================================================================================================================== */

fn dispatch_event<R: tauri::Runtime>(app: tauri::AppHandle<R>, event_type: &str, mut payload: Value) -> Result<(), String> {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| format!("Failed to get current time: {}", e))?;
    payload["timestamp"] = serde_json::json!(now.as_millis());

    return app.emit(event_type, payload).map_err(|e| format!("Failed to emit event: {}", e));
}

#[tauri::command]
pub async fn on_youtube_channel_id<R: tauri::Runtime>(app: tauri::AppHandle<R>, channel_id: &str) -> Result<(), String> {
    let store = app.state::<Arc<Store<R>>>();

    return Ok(store.set(constants::YOUTUBE_CHANNEL_ID_KEY, channel_id));
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
pub async fn on_youtube_message<R: tauri::Runtime>(_app: tauri::AppHandle<R>, actions: Vec<Value>) -> Result<(), String> {
    for action in actions.clone() {
        match mapper::parse(&action) {
            Ok(Some(parsed)) => {
                if let Err(err) = events::event_emitter().emit(parsed) {
                    log::error!("An error occurred on send unichat event: {}", err);
                }
            }

            Ok(None) => {
                log::debug!("Unknown YouTube action: {}", action);
            }

            Err(err) => {
                log::error!("An error occurred while parsing YouTube action: {}", err);
            }
        }
    }

    return Ok(());
}

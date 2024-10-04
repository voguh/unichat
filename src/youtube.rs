use serde_json::Value;

use crate::events;

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
                            await window.__TAURI__.core.invoke('on_message', { actions })
                        }
                    }).catch(err => console.error(err))
                }

                return res;
            },
            configurable: true,
            writable: true
        });

        Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, configurable: true, writable: true })
    } else {
        console.log("Fetch already was wrapped!")
    }
"#;

#[tauri::command]
pub async fn on_message(actions: Vec<Value>) -> Result<(), String> {
    for action in actions {
        events::INSTANCE.lock().unwrap().emit("unichat:event", action.to_string().as_str());
    }

    Ok(())
}

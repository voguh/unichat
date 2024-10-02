use serde_json::Value;

pub const SCRAPPING_JS: &str = r#"
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
                }).catch(err => window.__TAURI__.log.error(err.message))
            }

            return res;
        },
        configurable: true,
        writable: true
    });
"#;

#[tauri::command]
pub async fn on_message(actions: Vec<Value>) -> Result<(), String> {
    for action in actions {
        println!("Event payload: {}", action.to_string());
    }

    Ok(())
}

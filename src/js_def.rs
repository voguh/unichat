pub const SCRAPPING_JS: &str = r#"
    const originalFetch = window.fetch;
    Object.defineProperty(window, "fetch", {
        value: async (...args) => {
            const res = await originalFetch(...args);

            try {
                if (res.url.startsWith("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat") && res.ok) {
                    const parsed = await res.clone().json();
                    const actions = parsed?.continuationContents?.liveChatContinuation?.actions;

                    if (actions != null && actions.length > 0) {
                        console.log(actions);
                    }
                }
            } catch (err) {
                console.error(err);
            }

            return res;
        },
        configurable: true,
        writable: true
    });
"#;
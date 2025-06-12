if (window.fetch.__WRAPPED__ == null) {
    // Select live chat instead top chat
    document.querySelector("#live-chat-view-selector-sub-menu #trigger")?.click();
    document.querySelector("#live-chat-view-selector-sub-menu #dropdown a:nth-child(2)")?.click()

    /* ============================================================================================================== */

    // Wrap fetch to intercept YouTube live chat messages
    const originalFetch = window.fetch;
    Object.defineProperty(window, "fetch", {
        value: async (...args) => {
            const res = await originalFetch(...args);

            if (res.url.startsWith("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat") && res.ok) {
                res.clone().json().then(async (parsed) => {
                    const actions = parsed?.continuationContents?.liveChatContinuation?.actions;

                    if (actions != null && actions.length > 0) {
                        await window.__TAURI__.event.emit("youtube_raw::event", { type: "message", actions });
                    }
                }).catch(async (err) => {
                    await window.__TAURI__.event.emit("youtube_raw::event", { type: "error", stack: JSON.stringify(err.stack) });
                });
            }

            return res;
        },
        configurable: true,
        writable: true
    });
    Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, configurable: true, writable: true });

    /* ============================================================================================================== */

    // Retrieve channel id
    let channelId = null;
    function processMessageNode(node) {
        let newNode = node.closest("yt-live-chat-text-message-renderer");
        if (newNode == null) {
            newNode = node.closest("ytd-comment-renderer");
        }

        const data = newNode?.__data?.data ?? newNode?.data ?? newNode?.__data;
        const liveChatItemContextMenuEndpointParams = data?.contextMenuEndpoint?.liveChatItemContextMenuEndpoint?.params;
        const sendLiveChatMessageEndpointParams = data?.actionPanel?.liveChatMessageInputRenderer?.sendButton?.buttonRenderer?.serviceEndpoint?.sendLiveChatMessageEndpoint?.params;

        return liveChatItemContextMenuEndpointParams || sendLiveChatMessageEndpointParams;
    }

    for (const node of document.querySelectorAll("span#message")) {
        const data = processMessageNode(node);
        if (data != null) {
            const protoChannelId = atob(decodeURIComponent(atob(data)));
            channelId = protoChannelId.split("*'\n\u0018")[1].split("\u0012\u000b")[0];

            if (channelId != null && channelId.trim().length > 0) {
                break;
            }
        }
    }

    /* ============================================================================================================== */

    // Attach status ping event
    setInterval(() => {
        if (window.fetch.__WRAPPED__) {
            window.__TAURI__.event.emit("youtube_raw::event", { type: "ping" }).then(() => console.log("YouTube ping event emitted!"));
        }
    }, 5000);

    /* ============================================================================================================== */

    // Add a warning message to the page
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

    /* ============================================================================================================== */

    window.__TAURI__.event.emit("youtube_raw::event", { type: "ready", channelId, url: window.location.href });
    console.log("Fetch wrapped!");
} else {
    console.log("Fetch already was wrapped!");
}

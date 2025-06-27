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

function processInitializingProtoPuf(encodedProtoPuf) {
    if (encodedProtoPuf == null || encodedProtoPuf.length === 0) {
        return null;
    }

    const normalizedData = normalizeBase64(decodeURIComponent(encodedProtoPuf));
    const protoPufBytes = atob(normalizedData);

    // Extract second ProtoPuf
    let subProtoPuf = `${protoPufBytes.split("%3D")[0]}%3D`;
    subProtoPuf = subProtoPuf.substring(10, subProtoPuf.length);

    // Decode second ProtoPuf
    const decodedSubProtoPuf = normalizeBase64(decodeURIComponent(subProtoPuf));
    const subProtoPufBytes = atob(decodedSubProtoPuf);

    // Extract channel ID from second ProtoPuf
    const lines = subProtoPufBytes.split("\n");
    const channelIdLine = lines[2];
    const channelId = channelIdLine.replace("\x18", "").split("\x12")[0];

    return channelId;
}

function normalizeBase64(data) {
    data = data.replace(/-/g, "+").replace(/_/g, "/");

    const padLength = 4 - (data.length % 4);
    if (padLength < 4) {
        data += "=".repeat(padLength);
    }

    return data.replace(/\s+/g, "");
}

async function handleScrapEvent(response) {
    try {
        const parsed = await response.json();

        if (window.unichat.status == "READY") {
            const actions = parsed?.continuationContents?.liveChatContinuation?.actions;

            if (actions != null && actions.length > 0) {
                await window.__TAURI__.event.emit("youtube_raw::event", { type: "message", actions });
            }
        } else if (window.unichat.status == null) {
            window.unichat.status = "INITIALIZING";

            let continuation = parsed?.continuationContents?.liveChatContinuation?.continuations[0]?.timedContinuationData?.continuation;
            if( continuation == null) {
                continuation = parsed?.continuationContents?.liveChatContinuation?.continuations[0]?.invalidationContinuationData?.continuation;
            }

            const channelId = processInitializingProtoPuf(continuation);
            if (channelId == null) {
                console.error("YouTube channel ID could not be retrieved from the ProtoPuf data.");
                window.unichat.status = null;
                return;
            }

            /* ============================================================================================================== */

            // Select live chat instead top chat
            document.querySelector("#live-chat-view-selector-sub-menu #trigger")?.click();
            document.querySelector("#live-chat-view-selector-sub-menu #dropdown a:nth-child(2)")?.click()

            /* ============================================================================================================== */

            // Attach status ping event
            setInterval(() => {
                if (window.fetch.__WRAPPED__) {
                    window.__TAURI__.event.emit("youtube_raw::event", { type: "ping" }).then(() => console.log("YouTube ping event emitted!"));
                }
            }, 5000);

            /* ============================================================================================================== */

            window.unichat.status = "READY";
            await window.__TAURI__.event.emit("youtube_raw::event", { type: "ready", channelId, url: window.location.href });
        }
    } catch (err) {
        console.error(err)
        await window.__TAURI__.event.emit("youtube_raw::event", { type: "error", stack: JSON.stringify(err.stack) });
    }
}

if (window.fetch.__WRAPPED__ == null) {
    window.unichat = window.unichat || {};

    /* ============================================================================================================== */

    // Wrap fetch to intercept YouTube live chat messages
    const originalFetch = window.fetch;
    Object.defineProperty(window, "fetch", {
        value: async (...args) => {
            const res = await originalFetch(...args);

            if (res.url.startsWith("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat") && res.ok) {
                handleScrapEvent(res.clone());
            }

            return res;
        },
        configurable: true,
        writable: true
    });
    Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, configurable: true, writable: true });

    /* ============================================================================================================== */

    // Add a warning message to the page
    const style = document.createElement("style");
    style.textContent = `
        html::before {
            content: "UniChat installed! You can close this window.";
            position: fixed;
            top: 8px;
            right: 8px;
            z-index: 9999;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);

    /* ============================================================================================================== */

    window.__TAURI__.event.emit("youtube_raw::event", { type: "installed" }).then(() => console.log("YouTube scrapper initialized!"));
    window.__TAURI_PLUGIN_LOG__.info("Fetch wrapped!");
} else {
    window.__TAURI_PLUGIN_LOG__.warn("Fetch already was wrapped!");
}

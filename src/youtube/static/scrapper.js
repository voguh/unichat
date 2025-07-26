/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

async function dispatchEvent(payload) {
    payload.timestamp = Date.now();
    await window.__TAURI__.event.emit("youtube_raw::event", payload)
        .then(() => console.log(`Event with type '${payload.type}' dispatched successfully!`))
        .catch((err) => {
            console.error(`Failed to dispatch event with type '${payload.type}':`, err);
            window.__TAURI_PLUGIN_LOG__.error(err);
        });
}

async function dispatchPing() {
    await dispatchEvent({ type: "ping" });
    setTimeout(dispatchPing, 5000);
}

function normalizeBase64(data) {
    data = decodeURIComponent(data);
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
        const actions = parsed?.continuationContents?.liveChatContinuation?.actions;

        if (actions != null && actions.length > 0) {
            await dispatchEvent({ type: "message", actions });
        }
    } catch (err) {
        console.error(err);
        await window.__TAURI_PLUGIN_LOG__.error(err);
        await dispatchEvent({ type: "error", message: err.message ?? 'Unknown error occurred', stack: JSON.stringify(err.stack) });
    }
}

function init() {
    try {
        // Prevent right-click context menu in production
        window.__TAURI__.core.invoke("is_dev").then((isDev) => {
            if (!isDev) {
                window.addEventListener("contextmenu", async (event) => {
                    event.preventDefault();
                });
            }
        });

        /* ====================================================================================================== */

        // Retrieve channel ID from YouTube initial data
        const ytInitialData = window.ytInitialData;
        const timedContinuationData = ytInitialData?.contents?.liveChatRenderer?.continuations[0]?.timedContinuationData?.continuation;
        const invalidationContinuationData = ytInitialData?.contents?.liveChatRenderer?.continuations[0]?.invalidationContinuationData?.continuation;
        const encodedProtoPuf = timedContinuationData || invalidationContinuationData;
        const normalizedData = normalizeBase64(encodedProtoPuf);
        const protoPufBytes = atob(normalizedData);

        let subProtoPuf = `${protoPufBytes.split("%3D")[0]}%3D`;
        subProtoPuf = subProtoPuf.substring(10, subProtoPuf.length);

        const decodedSubProtoPuf = normalizeBase64(subProtoPuf);
        const subProtoPufBytes = atob(decodedSubProtoPuf);

        const lines = subProtoPufBytes.split("\n");
        const channelIdLine = lines[2];
        const channelId = channelIdLine.replace("\x18", "").split("\x12")[0];

        if (!channelId) {
            throw new Error("Channel ID not found in YouTube initial data.");
        }

        dispatchEvent({ type: "ready", channelId: channelId, url: window.location.href });

        /* ====================================================================================================== */

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
        window.__TAURI_PLUGIN_LOG__.info("Fetch wrapped!");

        /* ====================================================================================================== */

        // Add a warning message to the page
        const style = document.createElement("style");
        style.textContent = `
            html::before {
                content: "UniChat installed! You can close this window.";
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                white-space: nowrap;
                border-bottom-left-radius: 4px;
                border-bottom-right-radius: 4px;
            }
        `;
        document.head.appendChild(style);

        /* ====================================================================================================== */

        // Attach status ping event
        dispatchPing();

        /* ====================================================================================================== */

        // Select live chat instead top chat
        document.querySelector("#live-chat-view-selector-sub-menu #trigger")?.click();
        document.querySelector("#live-chat-view-selector-sub-menu #dropdown a:nth-child(2)")?.click()
    } catch (err) {
        console.error(err);
        window.__TAURI_PLUGIN_LOG__.error(err);
        dispatchEvent({ type: "error", message: err.message ?? 'Unknown error occurred', stack: JSON.stringify(err.stack) });
    }
}

if (document.readyState === "interactive" || document.readyState === "complete") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}

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

async function dispatchEvent(payload) {
    payload.timestamp = Date.now();
    await window.__TAURI__.event.emit("youtube_raw::event", payload);
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

try {
    if (window.fetch.__WRAPPED__ == null) {
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
        window.__TAURI_PLUGIN_LOG__.info("Fetch wrapped!");

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

        // Attach status ping event
        dispatchPing();

        /* ============================================================================================================== */

        // Select live chat instead top chat
        document.querySelector("#live-chat-view-selector-sub-menu #trigger")?.click();
        document.querySelector("#live-chat-view-selector-sub-menu #dropdown a:nth-child(2)")?.click()
    } else {
        window.__TAURI_PLUGIN_LOG__.warn("Fetch already was wrapped!");
    }
} catch (err) {
    console.error(err);
    window.__TAURI_PLUGIN_LOG__.error(err);
    dispatchEvent({ type: "error", message: err.message ?? 'Unknown error occurred', stack: JSON.stringify(err.stack) });
}

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

async function handleScrapEvent(response) {
    try {
        const parsed = await response.json();
        const actions = parsed?.continuationContents?.liveChatContinuation?.actions;

        // window.__TAURI_PLUGIN_LOG__.debug(`parsed: ${JSON.stringify(parsed)}`);
        // window.__TAURI_PLUGIN_LOG__.debug(`actions: ${actions ? actions.length : 0}`);
        if (actions != null && actions.length > 0) {
            await window.__TAURI__.event.emit("youtube_raw::event", { type: "message", actions });
        }
    } catch (err) {
        await window.__TAURI__.event.emit("youtube_raw::event", { type: "error", stack: JSON.stringify(err.stack) });
    }
}

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
                handleScrapEvent(res.clone());
            }

            return res;
        },
        configurable: true,
        writable: true
    });
    Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, configurable: true, writable: true });

    /* ============================================================================================================== */

    // Attach status ping event
    setInterval(() => {
        if (window.fetch.__WRAPPED__) {
            window.__TAURI__.event.emit("youtube_raw::event", { type: "ping" }).then(() => console.log("YouTube ping event emitted!"));
        }
    }, 5000);

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

    window.__TAURI__.event.emit("youtube_raw::event", { type: "ready", url: window.location.href });
    window.__TAURI_PLUGIN_LOG__.info("Fetch wrapped!");
} else {
    window.__TAURI_PLUGIN_LOG__.info("Fetch already was wrapped!");
}

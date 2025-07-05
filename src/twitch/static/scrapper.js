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
    await window.__TAURI__.event.emit("twitch_raw::event", payload)
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

async function handleScrapBadges(response) {
    try {
        const parsed = await response.json();
        if (Array.isArray(parsed)) {
            for (const item of parsed) {
                const extensions = item.extensions;
                const data = item.data;

                if (extensions.operationName === "GlobalBadges") {
                    await dispatchEvent({ type: "badges", badgesType: "global", badges: data.badges })
                } else if (extensions.operationName === "ChatList_Badges") {
                    await dispatchEvent({ type: "badges", badgesType: "user", badges: data.user.broadcastBadges });
                } else if (extensions.operationName === "BitsConfigContext_Global") {
                    const cheermotes = new Set();

                    for (const group of data.cheerConfig.groups) {
                        if (group["__typename"] === "CheermoteGroup") {
                            for (const node of group.nodes) {
                                if (node["__typename"] === "Cheermote") {
                                    cheermotes.add(node.prefix);
                                }
                            }
                        }
                    }

                    await dispatchEvent({ type: "cheermotes", cheermotes: Array.from(cheermotes) });
                }
            }
        }
    } catch (err) {
        console.error(err);
        await window.__TAURI_PLUGIN_LOG__.error(err);
        await dispatchEvent({ type: "error", message: err.message ?? 'Unknown error occurred', stack: JSON.stringify(err.stack) });
    }
}

if (window.fetch.__WRAPPED__ == null) {
    const originalFetch = window.fetch;
    Object.defineProperty(window, "fetch", {
        value: async (...args) => {
            const res = await originalFetch(...args);

            if (res.url.startsWith("https://gql.twitch.tv/gq") && res.ok) {
                handleScrapBadges(res.clone());
            }

            return res;
        },
        configurable: true,
        writable: true
    });
    Object.defineProperty(window.fetch, "__WRAPPED__", { value: true, configurable: true, writable: true });
    window.__TAURI_PLUGIN_LOG__.info("Fetch wrapped!");
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

        dispatchEvent({ type: "ready", url: window.location.href });

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

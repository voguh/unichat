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

async function handleFetchBadgesAndCheermotes() {
    try {
        const username = window.location.pathname.split("/")[2];
        const response = await fetch("https://gql.twitch.tv/gql#origin=twilight", {
            method: "POST",
            headers: {
                "Accept-Language": "eu-US",
                "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
                "Client-Session-Id": JSON.parse(localStorage.getItem("local_storage_app_session_id")),
                "Client-Version": window.__twilightBuildID,
                "X-Device-Id": JSON.parse(localStorage.getItem("local_copy_unique_id"))
            },
            body: JSON.stringify([
                {
                    "operationName": "GlobalBadges",
                    "variables": {},
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "9db27e18d61ee393ccfdec8c7d90f14f9a11266298c2e5eb808550b77d7bcdf6"
                        }
                    }
                },
                {
                    "operationName": "ChatList_Badges",
                    "variables": { "channelLogin": username },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "838a7e0b47c09cac05f93ff081a9ff4f876b68f7624f0fc465fe30031e372fc2"
                        }
                    }
                },
                {
                    "operationName": "BitsConfigContext_Global",
                    "variables": {},
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": "6a265b86f3be1c8d11bdcf32c183e106028c6171e985cc2584d15f7840f5fee6"
                        }
                    }
                }
            ])
        });

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

        handleFetchBadgesAndCheermotes()
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

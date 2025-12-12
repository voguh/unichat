/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

async function uniChatHandleFetchBadgesAndCheermotes() {
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
                    await unichatDispatchEvent({ type: "badges", badgesType: "global", badges: data.badges })
                } else if (extensions.operationName === "ChatList_Badges") {
                    await unichatDispatchEvent({ type: "badges", badgesType: "user", badges: data.user.broadcastBadges });
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

                    await unichatDispatchEvent({ type: "cheermotes", cheermotes: Array.from(cheermotes) });
                }
            }
        }
    } catch (err) {
        console.error(err);
        await window.__TAURI_PLUGIN_LOG__.error(err);
        await unichatDispatchEvent({ type: "error", message: err.message ?? 'Unknown error occurred', stack: JSON.stringify(err.stack) });
    }
}

/* ================================================================================================================== */

async function uniChatHandleRewardRedemption(payload) {
    const redemption = payload.redemption;
    await unichatDispatchEvent({ type: "redemption", rewardRedemption: redemption })
}

async function uniChatHandlePubSubNotification(pubsub) {
    if (pubsub.type === "reward-redeemed") {
        await uniChatHandleRewardRedemption(pubsub.data);
    }
}

async function uniChatHandleNotification(notification) {
    if (notification.type === "pubsub") {
        await uniChatHandlePubSubNotification(JSON.parse(notification.pubsub));
    }
}

/* ================================================================================================================== */

function uniChatInit() {
    try {
        if (window.unichat == null) {
            throw new Error("UniChat object is not initialized.");
        }

        /* ====================================================================================================== */

        window.unichat.onWebSocketMessage = async function(event, { wsInstance, url, protocols }) {
            const data = JSON.parse(event.data);

            if (url.startsWith("wss://hermes.twitch.tv/v1")) {
                if (data.type === "notification") {
                    await uniChatHandleNotification(data.notification);
                }
            } else if (url.startsWith("wss://irc-ws.chat.twitch.tv")) {
                // IRC WebSocket handling can be added here if needed
            }
        }

        /* ====================================================================================================== */

        uniChatDispatchEvent({ type: "ready", url: window.location.href });

        /* ====================================================================================================== */

        uniChatWebSocketInterceptor();
        uniChatHandleFetchBadgesAndCheermotes()
    } catch (err) {
        console.error(err);
        window.__TAURI_PLUGIN_LOG__.error(err);
        unichatDispatchEvent({ type: "error", message: err.message ?? 'Unknown error occurred', stack: JSON.stringify(err.stack) });
    }
}

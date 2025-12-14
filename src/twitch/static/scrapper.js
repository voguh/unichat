/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

/* ================================================================================================================== */

async function uniChatHandleRewardRedemption(payload) {
    const redemption = payload.redemption;
    await uniChat.dispatchEvent({ type: "redemption", rewardRedemption: redemption })
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

async function uniChatHandleGraphQLResponse(res) {
    try {
        const parsed = await res.json();
        if (Array.isArray(parsed)) {
            for (const item of parsed) {
                const extensions = item.extensions;
                const data = item.data;

                if (extensions.operationName === "GlobalBadges") {
                    await uniChat.dispatchEvent({ type: "badges", badgesType: "global", badges: data.badges })
                } else if (extensions.operationName === "ChatList_Badges") {
                    await uniChat.dispatchEvent({ type: "badges", badgesType: "user", badges: data.user.broadcastBadges });
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

                    await uniChat.dispatchEvent({ type: "cheermotes", cheermotes: Array.from(cheermotes) });
                }
            }
        }
    } catch (err) {
        uniChatLogger.error(err.message, err);
    }
}

/* ================================================================================================================== */

function uniChatInit() {
    if (!window.location.href.startsWith("https://www.twitch.tv/")) {
        throw new Error("This scrapper can only be initialized on Twitch pages.");
    }

    /* ====================================================================================================== */

    uniChat.onWebSocketMessage = async function(event, { wsInstance, url, protocols }) {
        if (url.startsWith("wss://hermes.twitch.tv/v1")) {
            const data = JSON.parse(event.data);

            if (data.type === "notification") {
                await uniChatHandleNotification(data.notification);
            }
        } else if (url.startsWith("wss://irc-ws.chat.twitch.tv")) {
            // IRC WebSocket handling can be added here if needed
        }
    }

    uniChat.onFetchResponse = async function(res) {
        if (res.url.startsWith("https://gql.twitch.tv/gql")) {
            await uniChatHandleGraphQLResponse(res);
        }
    }

    return {};
}

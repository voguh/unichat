/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025-2026 Voguh <voguhofc@protonmail.com>
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
        throw new Error("This scraper can only be initialized on Twitch pages.");
    }

    const obs = new MutationObserver(muts => {
        for (const m of muts) {
            for (const n of m.addedNodes) {
                if (n.tagName === "IFRAME" && n.src.includes("amazon-adsystem.com")) {
                    n.remove();
                }
            }
        }
    });

    obs.observe(document.documentElement, { childList: true, subtree: true });

    /* ====================================================================================================== */

    uniChat.onWebSocketMessage = async function(event, { wsInstance, url, protocols }) {
        if (url.startsWith("wss://hermes.twitch.tv/v1")) {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "notification") {
                    await uniChatHandleNotification(data.notification);
                }
            } catch (err) {
                uniChatLogger.error("Failed to parse Hermes message: {}\n\nRaw: {}", err.message, event.data, err);
            }
        } else if (url.startsWith("wss://irc-ws.chat.twitch.tv")) {
            try {
                let message = event.data.split("\r\n")[0];

                const tags = {};
                if (message.startsWith("@")) {
                    const [tagsRaw, ...rest] = message.slice(1).split(" ");
                    message = rest.join(" ");

                    for (const tag of tagsRaw.split(";")) {
                        const [key, value] = tag.split("=");
                        tags[key] = value || null;
                    }
                }

                const prefix = [];
                if (message.startsWith(":")) {
                    const [prefixRaw, ...rest] = message.slice(1).split(" ");
                    message = rest.join(" ");

                    if (prefixRaw.includes("!")) {
                        const [nick, ...rest] = prefixRaw.split("!");
                        const [user, host] = rest.join("!").split("@");
                        prefix.push(nick, user, host);
                    } else {
                        prefix.push(prefixRaw);
                    }
                }

                const [commandName, ...params] = message.split(" ");
                const command = { name: commandName, params: [] };
                while (params.length > 0) {
                    let param = params.shift();
                    if (param.startsWith(":")) {
                        param = param.slice(1) + " " + params.join(" ");
                        command.params.push(param);
                        break;
                    } else {
                        command.params.push(param);
                    }
                }

                const ircMessage = {
                    raw: event.data,
                    tags: tags,
                    prefix: prefix,
                    command: command
                };

                await uniChat.dispatchEvent({ type: "message", message: ircMessage } );
            } catch (err) {
                uniChatLogger.error("Failed to parse IRC message: {}\n\nRaw: {}", err.message, event.data, err);
            }
        }
    }

    uniChat.onFetchResponse = async function(res) {
        if (res.url.startsWith("https://gql.twitch.tv/gql")) {
            await uniChatHandleGraphQLResponse(res);
        }
    }

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Twitch scraper initialization timed out.")), 15000);

        uniChat.onWebSocketSend = async function(data, { wsInstance, url, protocols}) {
            if (url.startsWith("wss://hermes.twitch.tv/v1")) {
                const dataObj = JSON.parse(data);

                if (dataObj.type === "subscribe") {
                    const subscribe = dataObj.subscribe;

                    if (subscribe.type === "pubsub") {
                        const pubsub = subscribe.pubsub;

                        if (pubsub.topic.startsWith("community-points-channel-v1")) {
                            let splittedTopic = pubsub.topic.split(".");
                            const topicType = splittedTopic[0];
                            const channelId = splittedTopic[1];

                            clearTimeout(timeout);
                            resolve({ channelId });
                        }
                    }
                }
            }
        }
    })
}

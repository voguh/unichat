/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/
// biome-ignore-all format: biome doesn't need to format this file
// biome-ignore-all lint: biome doesn't need to lint this file

new MutationObserver((_, observer) => {
    if (document.head == null) {
        return;
    }

    observer.disconnect();

    const csp = document.createElement("meta");
    csp.httpEquiv = "Content-Security-Policy";
    csp.content = "frame-src 'none'";
    document.head.appendChild(csp);
}).observe(document, { childList: true, subtree: true });

async function uniChatHandleRewardRedemption(payload) {
    const redemption = payload.redemption;
    await uniChat.dispatchEvent({ type: "redemption", rewardRedemption: redemption });
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

/* ========================================================================== */

async function uniChatHandleGraphQLResponse(res) {
    try {
        const parsed = await res.json();
        if (Array.isArray(parsed)) {
            for (const item of parsed) {
                const extensions = item.extensions;
                const data = item.data;

                if (extensions.operationName === "GlobalBadges") {
                    await uniChat.dispatchEvent({ type: "badges", badgesType: "global", badges: data.badges });
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

/* ========================================================================== */

function uniChatParseIRCMessage(raw) {
    let message = raw;

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

    return { raw: raw, tags: tags, prefix: prefix, command: command };
}

/* ========================================================================== */

function uniChatInit() {
    if (!window.location.href.startsWith("https://www.twitch.tv/")) {
        throw new Error("This scraper can only be initialized on Twitch pages.");
    }

    /* ====================================================================== */

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Twitch scraper initialization timed out.")), 15000);

        uniChat.onWebSocketMessage = async function (event, { wsInstance, url, protocols }) {
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
                for (const line of event.data.split("\r\n")) {
                    if (line.length === 0) {
                        continue;
                    }

                    try {
                        const ircMessage = uniChatParseIRCMessage(line);
                        if (ircMessage.command.name === "ROOMSTATE" && ircMessage.tags["room-id"] != null) {
                            clearTimeout(timeout);
                            resolve({ channelId: ircMessage.tags["room-id"] });
                        }

                        await uniChat.dispatchEvent({ type: "message", message: ircMessage });
                    } catch (err) {
                        uniChatLogger.error("Failed to parse IRC message: {}\n\nRaw: {}", err.message, line, err);
                    }
                }
            }
        };

        uniChat.onFetchResponse = async function (res) {
            if (res.url.startsWith("https://gql.twitch.tv/gql")) {
                await uniChatHandleGraphQLResponse(res);
            }
        };
    });
}

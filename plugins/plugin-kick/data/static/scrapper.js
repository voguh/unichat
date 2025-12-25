/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

async function uniChatInit() {
    if (!window.location.href.startsWith("https://kick.com/")) {
        throw new Error("This scrapper can only be initialized on Kick pages.");
    }

    /* ====================================================================================================== */

    const waitForSetup = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout waiting for Kick scrapper setup.")), 5000);
        uniChat.onWebSocketMessage = async function(event, { wsInstance, url, protocols }) {
            try {
                const payload = JSON.parse(event.data);

                if (payload.event === "App\\Events\\ChatMessageEvent") {
                    await uniChat.dispatchEvent({ type: "chatMessage", data: JSON.parse(payload.data) })
                } else if (payload.event === "App\\Events\\MessageDeletedEvent") {
                    await uniChat.dispatchEvent({ type: "messageDeleted", data: JSON.parse(payload.data) })
                } else if (payload.event === "App\\Events\\UserBannedEvent") {
                    await uniChat.dispatchEvent({ type: "userBanned", data: JSON.parse(payload.data) })
                } else if (payload.event === "pusher_internal:subscription_succeeded" && payload.channel.startsWith("chatrooms.")) {
                    clearTimeout(timeout);

                    let channelId = payload.channel.split(".")[1];
                    resolve({ channelId });
                }
            } catch (err) {
                uniChatLogger.error("Failed to process WebSocket message: {}", err.message, err);
            }
        }
    })

    return waitForSetup;
}

/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

/* ================================================================================================================== */

async function uniChatHandleChatMessageEvent(data) {
    await uniChat.dispatchEvent({ type: "message", data });
}

/* ================================================================================================================== */

function uniChatInit() {
    if (!window.location.href.startsWith("https://kick.com/")) {
        throw new Error("This scrapper can only be initialized on Kick pages.");
    }

    /* ====================================================================================================== */

    uniChat.onWebSocketMessage = async function(event, { wsInstance, url, protocols }) {
        try {
            const payload = JSON.parse(event.data);

            if (payload.event === "App\\Events\\ChatMessageEvent") {
                await uniChatHandleChatMessageEvent(JSON.parse(payload.data));
            }
        } catch (err) {
            uniChatLogger.error("Failed to process WebSocket message: {}", err.message, err);
        }
    }

    return {};
}

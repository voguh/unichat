/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

async function uniChatDispatchPing() {
    await unichatDispatchEvent({ type: "ping" });
    setTimeout(uniChatDispatchPing, 5000);
}

function uniChatNormalizeBase64(data) {
    data = decodeURIComponent(data);
    data = data.replace(/-/g, "+").replace(/_/g, "/");

    const padLength = 4 - (data.length % 4);
    if (padLength < 4) {
        data += "=".repeat(padLength);
    }

    return data.replace(/\s+/g, "");
}

async function uniChatHandleScrapEvent(response) {
    try {
        const parsed = await response.json();
        const actions = parsed?.continuationContents?.liveChatContinuation?.actions;

        if (actions != null && actions.length > 0) {
            await unichatDispatchEvent({ type: "message", actions });
        }
    } catch (err) {
        console.error(err);
        await window.__TAURI_PLUGIN_LOG__.error(err);
        await unichatDispatchEvent({ type: "error", message: err.message ?? 'Unknown error occurred', stack: JSON.stringify(err.stack) });
    }
}

function uniChatInit() {
    try {
        if (window.unichat == null) {
            throw new Error("UniChat object is not initialized.");
        }

        /* ====================================================================================================== */

        // Retrieve channel ID from YouTube initial data
        const ytInitialData = window.ytInitialData;
        const timedContinuationData = ytInitialData?.contents?.liveChatRenderer?.continuations[0]?.timedContinuationData?.continuation;
        const invalidationContinuationData = ytInitialData?.contents?.liveChatRenderer?.continuations[0]?.invalidationContinuationData?.continuation;
        const encodedProtoPuf = timedContinuationData || invalidationContinuationData;
        const normalizedData = uniChatNormalizeBase64(encodedProtoPuf);
        const protoPufBytes = atob(normalizedData);

        let subProtoPuf = `${protoPufBytes.split("%3D")[0]}%3D`;
        subProtoPuf = subProtoPuf.substring(10, subProtoPuf.length);

        const decodedSubProtoPuf = uniChatNormalizeBase64(subProtoPuf);
        const subProtoPufBytes = atob(decodedSubProtoPuf);

        const lines = subProtoPufBytes.split("\n");
        const channelIdLine = lines[2];
        const channelId = channelIdLine.replace("\x18", "").split("\x12")[0];

        if (!channelId) {
            throw new Error("Channel ID not found in YouTube initial data.");
        }

        unichatDispatchEvent({ type: "ready", channelId: channelId, url: window.location.href });

        /* ====================================================================================================== */

        window.unichat.onFetchResponse = async function(res) {
            if (res.url.startsWith("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat") && res.ok) {
                await uniChatHandleScrapEvent(res);
            }
        }

        /* ====================================================================================================== */

        // Attach status ping event
        uniChatDispatchPing();

        /* ====================================================================================================== */

        // Select live chat instead top chat
        document.querySelector("#live-chat-view-selector-sub-menu #trigger")?.click();
        document.querySelector("#live-chat-view-selector-sub-menu #dropdown a:nth-child(2)")?.click()
    } catch (err) {
        console.error(err);
        window.__TAURI_PLUGIN_LOG__.error(err);
        unichatDispatchEvent({ type: "error", message: err.message ?? 'Unknown error occurred', stack: JSON.stringify(err.stack) });
    }
}

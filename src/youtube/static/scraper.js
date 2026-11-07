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

function uniChatNormalizeBase64(data) {
    data = decodeURIComponent(data);
    data = data.replace(/-/g, "+").replace(/_/g, "/");

    const padLength = 4 - (data.length % 4);
    if (padLength < 4) {
        data += "=".repeat(padLength);
    }

    return data.replace(/\s+/g, "");
}

function uniChatReadVarint(message, start) {
    let pos = start;
    let value = 0;
    let shift = 0;
    let byte = 0;
    do {
        byte = message.charCodeAt(pos++);
        value += (byte & 0x7f) * 2 ** shift;
        shift += 7;
    } while (byte >= 0x80);

    return { value, pos };
}

function uniChatReadProtobufField(message, field) {
    let pos = 0;
    while (pos < message.length) {
        const key = uniChatReadVarint(message, pos);
        pos = key.pos;

        const wireType = key.value % 8;
        if (wireType === 0) {
            pos = uniChatReadVarint(message, pos).pos;
        } else if (wireType === 1) {
            pos += 8;
        } else if (wireType === 5) {
            pos += 4;
        } else if (wireType === 2) {
            const length = uniChatReadVarint(message, pos);
            pos = length.pos;
            if (Math.floor(key.value / 8) === field) {
                return message.slice(pos, pos + length.value);
            }

            pos += length.value;
        } else {
            return null;
        }
    }

    return null;
}

function uniChatReadProtobuf(bytes, path) {
    let message = bytes;
    for (const field of path) {
        if (message == null) {
            return null;
        }

        message = uniChatReadProtobufField(message, field);
    }

    return message;
}

// Continuation token path: #119693434 > #3 (base64) > #1 > #5 > { #1: channel id, #2: video id }.
function uniChatExtractChannelId(continuation, videoId) {
    if (continuation == null) {
        return null;
    }

    const continuationBytes = atob(uniChatNormalizeBase64(continuation));
    const token = uniChatReadProtobuf(continuationBytes, [119693434, 3]);
    if (token == null) {
        return null;
    }

    const tokenBytes = atob(uniChatNormalizeBase64(token));
    const info = uniChatReadProtobuf(tokenBytes, [1, 5]);
    if (info == null || uniChatReadProtobuf(info, [2]) !== videoId) {
        return null;
    }

    return uniChatReadProtobuf(info, [1]);
}

/* ========================================================================== */

async function uniChatHandleScrapEvent(response) {
    try {
        const parsed = await response.json();
        const actions = parsed?.continuationContents?.liveChatContinuation?.actions;

        if (actions != null && actions.length > 0) {
            await uniChat.dispatchEvent({ type: "message", actions });
        }
    } catch (err) {
        uniChatLogger.error(err.message, err);
    }
}

function uniChatInit() {
    if (!window.location.href.startsWith("https://www.youtube.com/live_chat")) {
        throw new Error("This scraper can only be initialized on YouTube live chat pages.");
    }

    /* ====================================================================== */

    const continuations = window.ytInitialData?.contents?.liveChatRenderer?.continuations[0];
    const timedContinuationData = continuations?.timedContinuationData?.continuation;
    const invalidationContinuationData = continuations?.invalidationContinuationData?.continuation;
    const continuation = timedContinuationData || invalidationContinuationData;
    const videoId = new URL(window.location.href).searchParams.get("v");
    const channelId = uniChatExtractChannelId(continuation, videoId);

    if (!channelId) {
        throw new Error("Channel ID not found in YouTube initial data.");
    }

    /* ====================================================================== */

    uniChat.onFetchResponse = async function (res) {
        if (res.url.startsWith("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat") && res.ok) {
            await uniChatHandleScrapEvent(res);
        }
    };

    /* ====================================================================== */

    // Select live chat instead top chat
    document.querySelector("#live-chat-view-selector-sub-menu #trigger")?.click();
    document.querySelector("#live-chat-view-selector-sub-menu #dropdown a:nth-child(2)")?.click();

    return { channelId };
}

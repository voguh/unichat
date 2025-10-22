/*!******************************************************************************
 * UniChat
 * Copyright (C) 2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

import type { UniChatEvent, UniChatPlatform } from "unichat-widgets/unichat";
import { randomColorBySeed } from "unichat/utils/randomColorBySeed";
import { seededRandom } from "unichat/utils/seededRandom";

import { randomizeAuthorDisplayName } from "./randomizeAuthorDisplayName";
import { randomizeBadgeAndAuthorType } from "./randomizeBadgeAndAuthorType";
import { randomizeMessage } from "./randomizeMessage";
import { randomizeSponsorData, randomizeSponsorTier } from "./randomizeSponsorData";

const DUMMY_YOUTUBE_CHANNEL_ID = "UCBR8-60-B28hp2BmDPdntcQ";
// const DUMMY_YOUTUBE_CHANNEL_NAME = "YouTube";
const DUMMY_TWITCH_CHANNEL_ID = "12826";
const DUMMY_TWITCH_CHANNEL_NAME = "Twitch";

export async function buildEmulatedEventData<T extends UniChatEvent>(
    eventType: T["type"],
    requirePlatform: UniChatPlatform
): Promise<T["data"]> {
    const userDisplayName = randomizeAuthorDisplayName();
    const rng = seededRandom(userDisplayName);

    const platform = requirePlatform ?? (rng() < 0.5 ? "youtube" : "twitch");
    const channelId = platform === "youtube" ? DUMMY_YOUTUBE_CHANNEL_ID : DUMMY_TWITCH_CHANNEL_ID;
    const channelName = platform === "youtube" ? null : DUMMY_TWITCH_CHANNEL_NAME;

    const authorUsername = platform === "youtube" ? null : userDisplayName.toLowerCase();
    const authorDisplayName = userDisplayName;
    const authorDisplayColor = randomColorBySeed(userDisplayName);
    const authorProfilePictureUrl = platform === "twitch" ? null : "/ytimg/AIoZ1j2w1KXo3I9n1b0f6Yc0j6jR4s5X2Yk3s4k5l6m7n8o9p=s160-c-k-c0x00ffffff-no-rj"; // prettier-ignore
    const [authorBadges, authorType] = randomizeBadgeAndAuthorType(platform, rng);

    const [messageText, emotes] = await randomizeMessage(() => Math.random());

    let data = {
        channelId: channelId,
        channelName: channelName,

        platform: platform,
        flags: {},

        authorId: crypto.randomUUID(),
        authorUsername: authorUsername,
        authorDisplayName: authorDisplayName,
        authorDisplayColor: authorDisplayColor,
        authorProfilePictureUrl: authorProfilePictureUrl,
        authorBadges: authorBadges,
        authorType: authorType,

        timestamp: Date.now()
    } as T["data"];

    switch (eventType) {
        case "unichat:message": {
            data = {
                ...data,

                messageId: crypto.randomUUID(),
                messageText: messageText,
                emotes: emotes
            };

            break;
        }
        case "unichat:donate": {
            data = {
                ...data,

                value: Number(
                    platform === "youtube"
                        ? (Math.random() * 500 + 1).toFixed(2)
                        : Math.floor(Math.random() * 10000) + 100
                ),
                currency: platform === "youtube" ? "$" : "Bits",

                messageId: crypto.randomUUID(),
                messageText: messageText,
                emotes: emotes
            };

            break;
        }
        case "unichat:sponsor": {
            const [sponsorTier, sponsorMonths] = randomizeSponsorData(platform);
            data = {
                ...data,

                tier: sponsorTier,
                months: sponsorMonths,

                messageId: crypto.randomUUID(),
                messageText: messageText,
                emotes: emotes
            };

            break;
        }
        case "unichat:sponsor_gift": {
            const sponsorTier = randomizeSponsorTier(platform);

            data = {
                ...data,

                messageId: crypto.randomUUID(),
                tier: sponsorTier,
                count: Math.floor(Math.random() * 50 + 1)
            };

            break;
        }
        case "unichat:raid": {
            data = {
                ...data,
                authorId: platform === "youtube" ? null : crypto.randomUUID(),
                authorBadges: [],
                authorType: platform === "youtube" ? null : authorType,

                messageId: crypto.randomUUID(),
                viewerCount: platform === "youtube" ? null : Math.floor(Math.random() * 50 + 1)
            };

            break;
        }
        case "unichat:clear": {
            data = {
                platform: null,

                timestamp: Date.now()
            };
        }
    }

    return data;
}

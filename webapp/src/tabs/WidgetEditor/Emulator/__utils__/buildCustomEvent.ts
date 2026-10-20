/*!******************************************************************************
 * Copyright (c) 2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type { UniChatAuthorType, UniChatEmote, UniChatEvent } from "@voguh/unichat-api/widgets/events";

import {
    DUMMY_TWITCH_CHANNEL_ID,
    DUMMY_TWITCH_CHANNEL_NAME,
    DUMMY_TWITCH_PROFILE_PICTURE_URL,
    DUMMY_TWITCH_REWARD_ICON_URL,
    DUMMY_YOUTUBE_CHANNEL_ID,
    DUMMY_YOUTUBE_PROFILE_PICTURE_URL,
    type EmulatedEventData,
    type EmulatedEventType,
    fakeSuperChatTier,
    UNICHAT_FLAG_EMULATOR_GENERATED,
    UNICHAT_FLAG_YOUTUBE_SUPERCHAT_TIER
} from "./buildEmulatedEventData";
import { badgesForAuthorType } from "./randomizeBadgeAndAuthorType";

const UNICHAT_FLAG_TWITCH_STREAK_DAYS = "unichat:twitch_streak_days";
const UNICHAT_FLAG_TWITCH_GIF = "unichat:twitch_gif";
const UNICHAT_FLAG_YOUTUBE_SUPER_STICKER = "unichat:youtube_super_sticker";

export type CustomPlatform = "twitch" | "youtube" | "other";
export type CustomEventType = Exclude<EmulatedEventType, "unichat:clear">;
export type MessageMode = "random" | "custom";

export const CUSTOM_EVENT_LABELS: Record<CustomEventType, string> = {
    "unichat:message": "Message",
    "unichat:donate": "Donate",
    "unichat:sponsor": "Sponsor",
    "unichat:sponsor_gift": "Sponsor Gift",
    "unichat:raid": "Raid",
    "unichat:redemption": "Redemption",
    "unichat:cheer": "Cheer"
};

export const CUSTOM_EVENT_TYPES: Record<CustomPlatform, CustomEventType[]> = {
    twitch: [
        "unichat:message",
        "unichat:sponsor",
        "unichat:sponsor_gift",
        "unichat:raid",
        "unichat:redemption",
        "unichat:cheer"
    ],
    youtube: [
        "unichat:message",
        "unichat:donate",
        "unichat:sponsor",
        "unichat:sponsor_gift",
        "unichat:raid",
        "unichat:cheer"
    ],
    other: [
        "unichat:message",
        "unichat:donate",
        "unichat:sponsor",
        "unichat:sponsor_gift",
        "unichat:raid",
        "unichat:redemption",
        "unichat:cheer"
    ]
};

export interface CustomEventForm {
    platform: CustomPlatform;
    platformId: string;
    type: CustomEventType;

    authorDisplayName: string;
    authorType: UniChatAuthorType;

    withMessage: boolean;
    messageMode: MessageMode;
    messageText: string;

    streakDays: string;
    gifUrl: string;

    value: string;
    currency: string;
    converted: boolean;
    originalValue: string;
    originalCurrency: string;
    superSticker: boolean;

    months: string;
    tier: string;
    count: string;
    viewerCount: string;

    rewardTitle: string;
    rewardCost: string;
    rewardDescription: string;
    rewardIconUrl: string;

    cheerValue: string;
    cheerCurrency: string;
    cheerId: string;
    cheerTitle: string;
    cheerDescription: string;
    cheerIconUrl: string;
}

export interface CustomEventSeed {
    authorId: string;
    authorDisplayColor: string;
    messageId: string;
    randomMessageText: string;
    randomEmotes: UniChatEmote[];
    timestamp: number;
}

export function lockedAuthorType(form: CustomEventForm): UniChatAuthorType | null {
    const isTwitch = form.platform === "twitch";
    const isYouTube = form.platform === "youtube";

    const youtubeViewerOnly = form.type === "unichat:raid" || form.type === "unichat:cheer";
    if ((isTwitch && form.type === "unichat:redemption") || (isYouTube && youtubeViewerOnly)) {
        return "VIEWER";
    }

    return null;
}

export function giphyGif(url: string): UniChatEmote | null {
    const id = url.split("?")[0].split("/").filter(Boolean).pop()?.split("-").pop();
    if (id == null || id === "") {
        return null;
    }

    return { id, code: id, url: `https://media.giphy.com/media/${id}/giphy.gif` };
}

function nullable(text: string): string | null {
    return text === "" ? null : text;
}

function nullableNumber(text: string): number | null {
    return text === "" ? null : Number(text);
}

export function buildCustomEvent(form: CustomEventForm, seed: CustomEventSeed): UniChatEvent {
    const isTwitch = form.platform === "twitch";
    const isYouTube = form.platform === "youtube";
    const authorType = lockedAuthorType(form) ?? form.authorType;
    const platform = form.platform === "other" ? form.platformId : form.platform;
    const flags: Record<string, string | null> = { [UNICHAT_FLAG_EMULATOR_GENERATED]: "true" };

    const common: Omit<EmulatedEventData<"unichat:raid">, "messageId" | "viewerCount"> = {
        channelId: isTwitch ? DUMMY_TWITCH_CHANNEL_ID : isYouTube ? DUMMY_YOUTUBE_CHANNEL_ID : "emulator-channel",
        channelName: isTwitch ? DUMMY_TWITCH_CHANNEL_NAME : null,

        platform: platform,
        flags: flags,

        authorId: seed.authorId,
        authorUsername: isTwitch ? form.authorDisplayName.toLowerCase() : null,
        authorDisplayName: form.authorDisplayName,
        authorDisplayColor: seed.authorDisplayColor,
        authorProfilePictureUrl: isYouTube ? DUMMY_YOUTUBE_PROFILE_PICTURE_URL : null,
        authorBadges: badgesForAuthorType(platform, authorType),
        authorType: authorType,

        timestamp: seed.timestamp
    };

    const isCustomMessage = form.messageMode === "custom";
    const messageText = isCustomMessage ? form.messageText : seed.randomMessageText;
    const emotes = isCustomMessage ? [] : seed.randomEmotes;
    const optionalMessageText = form.withMessage ? messageText : null;
    const optionalEmotes = form.withMessage ? emotes : [];

    switch (form.type) {
        case "unichat:message": {
            if (isTwitch && Number(form.streakDays) > 0) {
                flags[UNICHAT_FLAG_TWITCH_STREAK_DAYS] = form.streakDays;
            }

            const gif = isTwitch ? giphyGif(form.gifUrl) : null;
            if (gif != null) {
                flags[UNICHAT_FLAG_TWITCH_GIF] = "true";
            }

            return {
                type: "unichat:message",
                data: {
                    ...common,
                    messageId: seed.messageId,
                    messageText: gif != null ? gif.code : messageText,
                    emotes: gif != null ? [gif] : emotes
                }
            };
        }
        case "unichat:donate": {
            const sticker = isYouTube && form.superSticker;
            if (sticker) {
                flags[UNICHAT_FLAG_YOUTUBE_SUPER_STICKER] = "true";
            } else if (isYouTube) {
                flags[UNICHAT_FLAG_YOUTUBE_SUPERCHAT_TIER] = fakeSuperChatTier(Number(form.value));
            }

            return {
                type: "unichat:donate",
                data: {
                    ...common,
                    value: Number(form.value),
                    currency: form.currency,
                    originalValue: form.converted ? Number(form.originalValue) : null,
                    originalCurrency: form.converted ? form.originalCurrency : null,
                    messageId: seed.messageId,
                    messageText: sticker ? "sticker" : optionalMessageText,
                    emotes: sticker ? [] : optionalEmotes
                }
            };
        }
        case "unichat:sponsor":
            return {
                type: "unichat:sponsor",
                data: {
                    ...common,
                    tier: isTwitch ? form.tier : nullable(form.tier),
                    months: Number(form.months),
                    messageId: seed.messageId,
                    messageText: optionalMessageText,
                    emotes: optionalEmotes
                }
            };
        case "unichat:sponsor_gift":
            return {
                type: "unichat:sponsor_gift",
                data: {
                    ...common,
                    tier: isTwitch ? form.tier : isYouTube ? null : nullable(form.tier),
                    count: Number(form.count),
                    messageId: seed.messageId
                }
            };
        case "unichat:raid":
            return {
                type: "unichat:raid",
                data: {
                    ...common,
                    authorProfilePictureUrl: isTwitch
                        ? DUMMY_TWITCH_PROFILE_PICTURE_URL
                        : common.authorProfilePictureUrl,
                    messageId: seed.messageId,
                    viewerCount: isYouTube ? null : nullableNumber(form.viewerCount)
                }
            };
        case "unichat:redemption":
            return {
                type: "unichat:redemption",
                data: {
                    ...common,
                    channelName: isTwitch ? null : common.channelName,
                    rewardId: `${seed.messageId}-reward`,
                    rewardTitle: form.rewardTitle,
                    rewardDescription: nullable(form.rewardDescription),
                    rewardCost: Number(form.rewardCost),
                    rewardIconUrl: isTwitch ? DUMMY_TWITCH_REWARD_ICON_URL : nullable(form.rewardIconUrl),
                    messageId: seed.messageId,
                    messageText: optionalMessageText,
                    emotes: optionalEmotes
                }
            };
        case "unichat:cheer":
            if (isTwitch) {
                return {
                    type: "unichat:cheer",
                    data: {
                        ...common,
                        value: Number(form.cheerValue),
                        currency: "Bits",
                        cheerId: null,
                        cheerTitle: null,
                        cheerDescription: null,
                        cheerIconUrl: null,
                        messageId: seed.messageId,
                        messageText: messageText,
                        emotes: emotes
                    }
                };
            } else if (isYouTube) {
                return {
                    type: "unichat:cheer",
                    data: {
                        ...common,
                        value: null,
                        currency: "Jewels",
                        cheerId: form.cheerTitle.toLowerCase().replaceAll(" ", "_"),
                        cheerTitle: form.cheerTitle,
                        cheerDescription: nullable(form.cheerDescription),
                        cheerIconUrl: form.cheerIconUrl,
                        messageId: seed.messageId,
                        messageText: null,
                        emotes: []
                    }
                };
            }

            return {
                type: "unichat:cheer",
                data: {
                    ...common,
                    value: nullableNumber(form.cheerValue),
                    currency: nullable(form.cheerCurrency),
                    cheerId: nullable(form.cheerId),
                    cheerTitle: nullable(form.cheerTitle),
                    cheerDescription: nullable(form.cheerDescription),
                    cheerIconUrl: nullable(form.cheerIconUrl),
                    messageId: seed.messageId,
                    messageText: optionalMessageText,
                    emotes: optionalEmotes
                }
            };
    }
}

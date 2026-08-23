/*!******************************************************************************
 * Copyright (c) 2025-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

import type {
    UniChatAuthorType,
    UniChatBadge,
    UniChatEmote,
    UniChatEvent,
    UniChatPlatform
} from "unichat-widgets/unichat";
import { randomColorBySeed } from "unichat/utils/randomColorBySeed";
import { seededRandom } from "unichat/utils/seededRandom";

import { randomizeAuthorDisplayName } from "./randomizeAuthorDisplayName";
import { randomizeBadgeAndAuthorType } from "./randomizeBadgeAndAuthorType";
import { randomizeMessage } from "./randomizeMessage";
import { randomizeSponsorData, randomizeSponsorTier } from "./randomizeSponsorData";

const DUMMY_YOUTUBE_CHANNEL_ID = "UCBR8-60-B28hp2BmDPdntcQ";
const DUMMY_TWITCH_CHANNEL_ID = "12826";
const DUMMY_TWITCH_CHANNEL_NAME = "Twitch";

const DUMMY_YOUTUBE_PROFILE_PICTURE_URL = "/proxy/aHR0cHM6Ly95dDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tLzNzNmV2cHFBaURVOXRRUjRzQzJzaUppcHBiSDJSV1ZQbndIZ3lsNFYwdGgyaXVRejBWRFFaYlVoUUJHbXN4TFlvLW1qRzZUcVpRPXMxNjAtYy1rLWMweDAwZmZmZmZmLW5vLXJq?referer=https://www.youtube.com/"; // prettier-ignore
const DUMMY_TWITCH_PROFILE_PICTURE_URL = "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png";

const DUMMY_TWITCH_REWARD_ICON_URL = "https://static-cdn.jtvnw.net/custom-reward-images/tree-4.png";
const DUMMY_YOUTUBE_GIFT_ASSET_URL = "https://www.gstatic.com/youtube/img/pdg/gift/assets/pastel.webp=w320-h320";

const UNICHAT_FLAG_EMULATOR_GENERATED = "unichat:emulator_generated";
const UNICHAT_FLAG_YOUTUBE_SUPERCHAT_TIER = "unichat:youtube_superchat_tier";

export type EmulatedEventType = Exclude<
    UniChatEvent["type"],
    "unichat:remove_message" | "unichat:remove_author" | "unichat:userstore_update" | "unichat:custom"
>;

type EmulatedEventData<K extends EmulatedEventType> = Extract<UniChatEvent, { type: K }>["data"];

interface EmulatorContext {
    rng: () => number;

    requestedPlatform: UniChatPlatform | null;
    platform: UniChatPlatform;
    channelId: string;
    channelName: string | null;
    flags: Record<string, string | null>;

    authorId: string;
    authorUsername: string | null;
    authorDisplayName: string;
    authorDisplayColor: string;
    authorProfilePictureUrl: string | null;
    authorBadges: UniChatBadge[];
    authorType: UniChatAuthorType;

    messageText: string;
    emotes: UniChatEmote[];

    timestamp: number;
}

function proxyYouTubeUrl(url: string): string {
    const encoded = btoa(url).replaceAll("+", "-").replaceAll("/", "_");

    return `/proxy/${encoded}?referer=https://www.youtube.com/`;
}

function fakeSuperChatTier(value: number): string {
    if (value >= 100) {
        return "7";
    } else if (value >= 50) {
        return "6";
    } else if (value >= 20) {
        return "5";
    } else if (value >= 10) {
        return "4";
    } else if (value >= 5) {
        return "3";
    } else if (value >= 2) {
        return "2";
    }

    return "1";
}

function fakeGiftTitle(giftId: string): string {
    const spaced = giftId.replaceAll("_", " ");

    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

type EmulatedCommonData = Omit<EmulatedEventData<"unichat:message">, "messageId" | "messageText" | "emotes">;

function buildCommonData(ctx: EmulatorContext): EmulatedCommonData {
    return {
        channelId: ctx.channelId,
        channelName: ctx.channelName,

        platform: ctx.platform,
        flags: ctx.flags,

        authorId: ctx.authorId,
        authorUsername: ctx.authorUsername,
        authorDisplayName: ctx.authorDisplayName,
        authorDisplayColor: ctx.authorDisplayColor,
        authorProfilePictureUrl: ctx.authorProfilePictureUrl,
        authorBadges: ctx.authorBadges,
        authorType: ctx.authorType,

        timestamp: ctx.timestamp
    };
}

const EMULATED_EVENT_BUILDERS: {
    [K in EmulatedEventType]: (ctx: EmulatorContext) => EmulatedEventData<K>;
} = {
    "unichat:clear": (ctx) => ({
        platform: ctx.requestedPlatform,

        timestamp: ctx.timestamp
    }),

    "unichat:message": (ctx) => ({
        ...buildCommonData(ctx),

        messageId: crypto.randomUUID(),
        messageText: ctx.messageText,
        emotes: ctx.emotes
    }),

    "unichat:donate": (ctx) => {
        const flags = { ...ctx.flags };
        const withMessage = ctx.platform === "twitch" || ctx.rng() < 0.6;

        let value: number;
        let currency: string;
        let originalValue: number | null = null;
        let originalCurrency: string | null = null;

        if (ctx.platform === "youtube") {
            const purchaseValue = Number((ctx.rng() * 500 + 1).toFixed(2));

            if (ctx.rng() < 0.5) {
                originalValue = purchaseValue;
                originalCurrency = "R$";
                value = Number((purchaseValue / 5.4).toFixed(2));
            } else {
                value = purchaseValue;
            }

            currency = "$";
            flags[UNICHAT_FLAG_YOUTUBE_SUPERCHAT_TIER] = fakeSuperChatTier(purchaseValue);
        } else {
            value = Math.floor(ctx.rng() * 10000) + 100;
            currency = "Bits";
        }

        return {
            ...buildCommonData(ctx),
            flags: flags,

            value: value,
            currency: currency,

            originalValue: originalValue,
            originalCurrency: originalCurrency,

            messageId: crypto.randomUUID(),
            messageText: withMessage ? ctx.messageText : null,
            emotes: withMessage ? ctx.emotes : []
        };
    },

    "unichat:sponsor": (ctx) => {
        const [tier, months] = randomizeSponsorData(ctx.platform);
        const isMilestone = ctx.platform === "twitch" || ctx.rng() < 0.5;
        const withMessage = isMilestone && ctx.rng() < 0.5;

        return {
            ...buildCommonData(ctx),

            tier: isMilestone ? tier : null,
            months: isMilestone ? months : 1,

            messageId: crypto.randomUUID(),
            messageText: withMessage ? ctx.messageText : null,
            emotes: withMessage ? ctx.emotes : []
        };
    },

    "unichat:sponsor_gift": (ctx) => ({
        ...buildCommonData(ctx),

        tier: ctx.platform === "twitch" ? randomizeSponsorTier(ctx.platform) : null,
        count: Math.floor(ctx.rng() * 50 + 1),

        messageId: crypto.randomUUID()
    }),

    "unichat:raid": (ctx) => {
        const isYouTube = ctx.platform === "youtube";
        const actionId = crypto.randomUUID();

        return {
            ...buildCommonData(ctx),

            authorId: isYouTube ? actionId : ctx.authorId,
            authorProfilePictureUrl: isYouTube ? DUMMY_YOUTUBE_PROFILE_PICTURE_URL : DUMMY_TWITCH_PROFILE_PICTURE_URL,
            authorBadges: isYouTube ? [] : ctx.authorBadges,
            authorType: isYouTube ? "VIEWER" : ctx.authorType,

            messageId: actionId,
            viewerCount: isYouTube ? null : Math.floor(ctx.rng() * 50 + 1)
        };
    },

    "unichat:redemption": (ctx) => {
        const withMessage = ctx.rng() < 0.7;

        return {
            ...buildCommonData(ctx),
            channelName: withMessage ? ctx.channelName : null,

            authorBadges: withMessage ? ctx.authorBadges : [],
            authorType: withMessage ? ctx.authorType : "VIEWER",

            rewardId: crypto.randomUUID(),
            rewardTitle: "Sample Reward",
            rewardDescription: ctx.rng() < 0.5 ? "Sample reward prompt" : null,
            rewardCost: Math.floor(ctx.rng() * 10000 + 100),
            rewardIconUrl: ctx.rng() < 0.8 ? DUMMY_TWITCH_REWARD_ICON_URL : null,

            messageId: crypto.randomUUID(),
            messageText: withMessage ? ctx.messageText : null,
            emotes: withMessage ? ctx.emotes : []
        };
    },

    "unichat:gift": (ctx) => {
        const giftId = "pastel";

        return {
            ...buildCommonData(ctx),

            authorBadges: [],
            authorType: "VIEWER",

            giftId: giftId,
            giftTitle: fakeGiftTitle(giftId),
            giftDescription: ctx.rng() < 0.5 ? "Sample Gift" : null,
            giftCost: null,
            giftIconUrl: proxyYouTubeUrl(DUMMY_YOUTUBE_GIFT_ASSET_URL),

            messageId: crypto.randomUUID(),
            messageText: null,
            emotes: []
        };
    }
};

export async function buildEmulatedEventData<K extends EmulatedEventType>(
    eventType: K,
    requirePlatform?: UniChatPlatform
): Promise<EmulatedEventData<K>> {
    const userDisplayName = randomizeAuthorDisplayName();
    const seededRng = seededRandom(userDisplayName);

    const platform = requirePlatform ?? (seededRng() < 0.5 ? "youtube" : "twitch");
    const [authorBadges, authorType] = randomizeBadgeAndAuthorType(platform, seededRng);
    const [messageText, emotes] = await randomizeMessage(() => Math.random());

    const ctx: EmulatorContext = {
        rng: Math.random,

        requestedPlatform: requirePlatform ?? null,
        platform: platform,
        channelId: platform === "youtube" ? DUMMY_YOUTUBE_CHANNEL_ID : DUMMY_TWITCH_CHANNEL_ID,
        channelName: platform === "youtube" ? null : DUMMY_TWITCH_CHANNEL_NAME,
        flags: { [UNICHAT_FLAG_EMULATOR_GENERATED]: "true" },

        authorId: crypto.randomUUID(),
        authorUsername: platform === "youtube" ? null : userDisplayName.toLowerCase(),
        authorDisplayName: userDisplayName,
        authorDisplayColor: randomColorBySeed(userDisplayName),
        authorProfilePictureUrl: platform === "twitch" ? null : DUMMY_YOUTUBE_PROFILE_PICTURE_URL,
        authorBadges: authorBadges,
        authorType: authorType,

        messageText: messageText,
        emotes: emotes,

        timestamp: Date.now()
    };

    return EMULATED_EVENT_BUILDERS[eventType](ctx);
}

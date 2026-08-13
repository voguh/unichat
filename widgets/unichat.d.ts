/*!******************************************************************************
 * Copyright (c) 2024-2026 Voguh
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

export type UniChatPlatform = "twitch" | "youtube" | (string & {});
export type UniChatAuthorType = "VIEWER" | "SPONSOR" | "MODERATOR" | "BROADCASTER" | (string & {});

export interface UniChatEmote {
    id: string;
    code: string;
    url: string;
}

export interface UniChatBadge {
    code: string;
    url: string;
}

export type UniChatEvent = UniChatEventClear | UniChatEventRemoveMessage | UniChatEventRemoveAuthor | UniChatEventMessage | UniChatEventRaid | UniChatEventSponsor | UniChatEventSponsorGift | UniChatEventDonate | UniChatEventRedemption | UniChatEventGift | UniChatEventUserstoreUpdate | UniChatEventCustom;

/* <============================================================================================> */

export interface UniChatEventClear {
    type: "unichat:clear";
    data: {
        /** When filled, indicates that some platform triggered the clear. */
        platform: UniChatPlatform | null;

        timestamp: number;
    };
}

/* <============================================================================================> */

export interface UniChatEventRemoveMessage {
    type: "unichat:remove_message";
    data: {
        channelId: string;
        /** **Disclaimer:** On YouTube, this field is always null. */
        channelName: string | null;

        platform: UniChatPlatform;
        flags: Record<string, string | null>;

        messageId: string;

        timestamp: number;
    };
}

/* <============================================================================================> */

export interface UniChatEventRemoveAuthor {
    type: "unichat:remove_author";
    data: {
        channelId: string;
        /** **Disclaimer:** On YouTube, this field is always null. */
        channelName: string | null;

        platform: UniChatPlatform;
        flags: Record<string, string | null>;

        authorId: string;

        timestamp: number;
    };
}

/* <============================================================================================> */

export interface UniChatEventMessage {
    type: "unichat:message";
    data: {
        channelId: string;
        /** **Disclaimer:** On YouTube, this field is always null. */
        channelName: string | null;

        platform: UniChatPlatform;
        flags: Record<string, string | null>;

        authorId: string;
        /** **Disclaimer:** On YouTube, this field is null when name doesn't starts with `@`. */
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        /** **Disclaimer:** On Twitch, this field is always null. */
        authorProfilePictureUrl: string | null;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        messageId: string;
        messageText: string;
        emotes: UniChatEmote[];

        timestamp: number;
    };
}

/* <============================================================================================> */

export interface UniChatEventDonate {
    type: "unichat:donate";
    data: {
        channelId: string;
        /** **Disclaimer:** On YouTube, this field is always null. */
        channelName: string | null;

        platform: UniChatPlatform;
        flags: Record<string, string | null>;

        authorId: string;
        /** **Disclaimer:** On YouTube, this field is null when name doesn't starts with `@`. */
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        /** **Disclaimer:** On Twitch, this field is always null. */
        authorProfilePictureUrl: string | null;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        value: number;
        currency: string;

        /** **Disclaimer:** `null` when no conversion happened. */
        originalValue: number | null;
        /** **Disclaimer:** `null` when no conversion happened. */
        originalCurrency: string | null;

        messageId: string;
        messageText: string | null;
        emotes: UniChatEmote[];

        timestamp: number;
    };
}

/* <============================================================================================> */

export interface UniChatEventSponsor {
    type: "unichat:sponsor";
    data: {
        channelId: string;
        /** **Disclaimer:** On YouTube, this field is always null. */
        channelName: string | null;

        platform: UniChatPlatform;
        flags: Record<string, string | null>;

        authorId: string;
        /** **Disclaimer:** On YouTube, this field is null when name doesn't starts with `@`. */
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        /** **Disclaimer:** On Twitch, this field is always null. */
        authorProfilePictureUrl: string | null;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        /** **Disclaimer:** On YouTube, this field is null for new members; it is only present on membership milestone events. */
        tier: string | null;
        months: number;

        messageId: string;
        messageText: string | null;
        emotes: UniChatEmote[];

        timestamp: number;
    };
}

/* <============================================================================================> */

export interface UniChatEventSponsorGift {
    type: "unichat:sponsor_gift";
    data: {
        channelId: string;
        /** **Disclaimer:** On YouTube, this field is always null. */
        channelName: string | null;

        platform: UniChatPlatform;
        flags: Record<string, string | null>;

        authorId: string;
        /** **Disclaimer:** On YouTube, this field is null when name doesn't starts with `@`. */
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        /** **Disclaimer:** On Twitch, this field is always null. */
        authorProfilePictureUrl: string | null;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        /** **Disclaimer:** On YouTube, this field is always null. */
        tier: string | null;
        count: number;

        messageId: string;

        timestamp: number;
    };
}

/* <============================================================================================> */

export interface UniChatEventRaid {
    type: "unichat:raid";
    data: {
        channelId: string;
        /** **Disclaimer:** On YouTube, this field is always null. */
        channelName: string | null;

        platform: UniChatPlatform;
        flags: Record<string, string | null>;

        /** **Disclaimer:** On YouTube, the raid banner carries no channel id, so this field holds a temporary value derived from the event itself. */
        authorId: string;
        /** **Disclaimer:** On YouTube, this field is null when name doesn't starts with `@`. */
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string | null;
        /** **Disclaimer:** On YouTube, this field is an empty list. */
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        messageId: string;
        /** **Disclaimer:** On YouTube, this field is always null. */
        viewerCount: number | null;

        timestamp: number;
    };
}

/* <============================================================================================> */

/** **Disclaimer:** This event is exclusive for Twitch */
export interface UniChatEventRedemption {
    type: "unichat:redemption";
    data: {
        channelId: string;
        /** **Disclaimer:** On Twitch, this field is only filled on rewards that require a message from the viewer; it is null otherwise. */
        channelName: string | null;

        platform: UniChatPlatform;
        flags: Record<string, string | null>;

        authorId: string;
        /** **Disclaimer:** On YouTube, this field is null when name doesn't starts with `@`. */
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        /** **Disclaimer:** On Twitch, this field is always null. */
        authorProfilePictureUrl: string | null;
        /** **Disclaimer:** On Twitch, this list is only filled on rewards that require a message from the viewer; it is empty otherwise. */
        authorBadges: UniChatBadge[];
        /** **Disclaimer:** On Twitch, the real type is only known on rewards that require a message from the viewer; it falls back to `VIEWER` otherwise. */
        authorType: UniChatAuthorType;

        rewardId: string;
        rewardTitle: string;
        rewardDescription: string | null;
        rewardCost: number;
        rewardIconUrl: string | null;

        messageId: string;
        messageText: string | null;
        emotes: UniChatEmote[];

        timestamp: number;
    }
}

/* <============================================================================================> */

/** **Disclaimer:** This event is exclusive for YouTube */
export interface UniChatEventGift {
    type: "unichat:gift";
    data: {
        channelId: string;
        /** **Disclaimer:** On YouTube, this field is always null. */
        channelName: string | null;

        platform: UniChatPlatform;
        flags: Record<string, string | null>;

        authorId: string;
        /** **Disclaimer:** On YouTube, this field is null when name doesn't starts with `@`. */
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string | null;
        /** **Disclaimer:** On YouTube, this field is always an empty list. */
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        /** **Disclaimer:** On YouTube, derived from the gift asset filename. Stable per gift type, but not an id issued by the platform. */
        giftId: string | null;
        /** **Disclaimer:** On YouTube, derived from the gift asset filename - an approximation of the real name. */
        giftTitle: string | null;
        giftDescription: string | null;
        /** **Disclaimer:** On YouTube, this field is always null. */
        giftCost: number | null;
        giftIconUrl: string | null;

        messageId: string;
        /** **Disclaimer:** On YouTube, this field is always null. */
        messageText: string | null;
        /** **Disclaimer:** On YouTube, this field is always an empty list. */
        emotes: UniChatEmote[];

        timestamp: number;
    }
}

/* <============================================================================================> */

export interface UniChatEventUserstoreUpdate {
    type: "unichat:userstore_update";
    data: {
        key: string;
        /** **Disclaimer:** `null` means the key was removed. */
        value: string | null;
    }
}

/* <============================================================================================> */

/** **Disclaimer:** The payload is whatever the emitting plugin decided to send. */
export interface UniChatEventCustom {
    type: "unichat:custom";
    data: Record<string, unknown>;
}

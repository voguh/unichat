/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2026 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

export type UniChatPlatform = "twitch" | "youtube" | (string & {});
export type UniChatAuthorType = "VIEWER" | "SPONSOR" | "VIP" | "MODERATOR" | "BROADCASTER" | (string & {});

export interface UniChatEmote {
    id: string;
    code: string;
    url: string;
}

export interface UniChatBadge {
    code: string;
    url: string;
}

export type UniChatEvent = UniChatEventClear | UniChatEventRemoveMessage | UniChatEventRemoveAuthor | UniChatEventMessage | UniChatEventRaid | UniChatEventSponsor | UniChatEventSponsorGift | UniChatEventDonate | UniChatEventRedemption;

/* <============================================================================================> */

export interface UniChatEventClear {
    type: "unichat:clear";
    data: {
        /** When filled, indicates that some platform triggered the clear. */
        platform: string | null;

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

        /** **Disclaimer:** On YouTube, this field could be null. */
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

        /** **Disclaimer:** On YouTube, this field could be null. */
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

        /** **Disclaimer:** On YouTube, this field is always null. */
        authorId: string | null;
        /** **Disclaimer:** On YouTube, this field is null when name doesn't starts with `@`. */
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string | null;
        /** **Disclaimer:** On YouTube, this field is an empty list. */
        authorBadges: UniChatBadge[];
        /** **Disclaimer:** On YouTube, this field is always null. */
        authorType: UniChatAuthorType | null;

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
        /** **Disclaimer:** This field is always null. */
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
        /** **Disclaimer:** On Twitch, this field is an empty list. */
        authorBadges: UniChatBadge[];
        /** **Disclaimer:** On Twitch, this field is always null. */
        authorType: UniChatAuthorType | null;

        rewardId: string;
        rewardTitle: string;
        rewardDescription: string | null;
        rewardCost: number;
        rewardIconUrl: string;

        messageId: string;
        messageText: string | null;
        emotes: UniChatEmote[];

        timestamp: number;
    }
}

/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 ******************************************************************************/

export type UniChatPlatform = "youtube" | "twitch";
export type UniChatAuthorType = "VIEWER" | "SPONSOR" | "VIP" | "MODERATOR" | "BROADCASTER";

export interface UniChatEmote {
    id: string;
    code: string;
    url: string;
}

export interface UniChatBadge {
    code: string;
    url: string;
}

export interface UniChatEventClear {
    type: "unichat:clear";
    data: {
        platform: UniChatPlatform | null;

        timestamp: number;
    };
}

export interface UniChatEventMessage {
    type: "unichat:message";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string | null;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        messageId: string;
        messageText: string;
        emotes: UniChatEmote[];

        timestamp: number;
    };
}

export interface UniChatEventRemoveMessage {
    type: "unichat:remove_message";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        messageId: string;

        timestamp: number;
    };
}

export interface UniChatEventRemoveAuthor {
    type: "unichat:remove_author";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;

        timestamp: number;
    };
}

export interface UniChatEventRaid {
    type: "unichat:raid";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string | null;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType | null;

        messageId: string;
        viewerCount: number | null;

        timestamp: number;
    };
}

export interface UniChatEventSponsor {
    type: "unichat:sponsor";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string | null;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        tier: string;
        months: number;

        messageId: string;
        messageText: string | null;
        emotes: UniChatEmote[];

        timestamp: number;
    };
}

export interface UniChatEventSponsorGift {
    type: "unichat:sponsor_gift";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string | null;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        messageId: string;
        tier: string | null;
        count: number;

        timestamp: number;
    };
}

export interface UniChatEventDonate {
    type: "unichat:donate";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | null;
        authorDisplayName: string;
        authorDisplayColor: string;
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

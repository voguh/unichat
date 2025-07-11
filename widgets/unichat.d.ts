/*!******************************************************************************
 * UniChat
 * Copyright (C) 2024-2025 Voguh <voguhofc@protonmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public License
 * version 3 only, as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
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

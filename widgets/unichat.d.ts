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
    type: string;
    tooltip: string;
    url: string;
}

export interface UniChatEventLoad {
    type: "unichat:load";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;
    };
}

export interface UniChatEventClear {
    type: "unichat:clear";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;
    };
}

export interface UniChatEventMessage {
    type: "unichat:message";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | string;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        messageId: string;
        messageText: string;
        emotes: UniChatEmote[];
    };
}

export interface UniChatEventRemoveMessage {
    type: "unichat:remove_message";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        messageId: string;
    };
}

export interface UniChatEventRemoveAuthor {
    type: "unichat:remove_author";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
    };
}

export interface UniChatEventRaid {
    type: "unichat:raid";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | string;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string;

        messageId: string;
        viewerCount: number | null;
    };
}

export interface UniChatEventSponsor {
    type: "unichat:sponsor";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | string;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        messageId: string;
        tier: string;
        months: number;
        messageText: string | null;
        emotes: UniChatEmote[];
    };
}

export interface UniChatSponsorGiftEvent {
    type: "unichat:sponsor_gift";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | string;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        messageId: string;
        tier: string | null;
        count: number;
    };
}

export interface UniChatDonateEvent {
    type: "unichat:donate";
    data: {
        channelId: string;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | string;
        authorDisplayName: string;
        authorDisplayColor: string;
        authorProfilePictureUrl: string;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        value: number;
        currency: string;

        messageId: string;
        messageText: string | null;
        emotes: UniChatEmote[];
    };
}

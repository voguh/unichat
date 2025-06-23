export type UniChatPlatform = "youtube" | "twitch";
export type UniChatAuthorType = "VIEWER" | "SPONSOR" | "MODERATOR" | "BROADCASTER";

export interface UniChatEmote {
    type: string;
    tooltip: string;
    url: string;
}

export interface UniChatBadge {
    type: string;
    tooltip: string;
    url: string;
}

export interface UniChatEventMessage {
    type: "unichat:message";
    data: {
        channelId: string | null;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | null;
        authorDisplayName: string;
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
        channelId: string | null;
        channelName: string | null;
        platform: UniChatPlatform;

        messageId: string;
    };
}

export interface UniChatEventRemoveAuthor {
    type: "unichat:remove_author";
    data: {
        channelId: string | null;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
    };
}

export interface UniChatEventRaid {
    type: "unichat:raid";
    data: {
        channelId: string | null;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | null;
        authorDisplayName: string;
        authorProfilePictureUrl: string;

        viewerCount: number | null;
    };
}

export interface UniChatEventSponsor {
    type: "unichat:sponsor";
    data: {
        channelId: string | null;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | null;
        authorDisplayName: string;
        authorProfilePictureUrl: string;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        tier: string;
        months: number;
        messageText: string | null;
    };
}

export interface UniChatSponsorGiftEvent {
    type: "unichat:sponsor_gift";
    data: {
        channelId: string | null;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | null;
        authorDisplayName: string;
        authorProfilePictureUrl: string;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        tier: string;
        count: number;
    };
}

export interface UniChatDonateEvent {
    type: "unichat:donate";
    data: {
        channelId: string | null;
        channelName: string | null;
        platform: UniChatPlatform;

        authorId: string;
        authorUsername: string | null;
        authorDisplayName: string;
        authorProfilePictureUrl: string;
        authorBadges: UniChatBadge[];
        authorType: UniChatAuthorType;

        value: number;
        currency: string;

        messageId: string;
        messageText: string;
        emotes: UniChatEmote[];
    };
}

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
        platform: "youtube" | "twitch";

        authorId: string;
        authorUserName: string | null;
        authorDisplayName: string;
        authorProfilePictureUrl: string;
        authorBadges: UniChatBadge[];
        authorType: "VIEWER" | "SPONSOR" | "MODERATOR" | "BROADCASTER";

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
        platform: "youtube" | "twitch";

        messageId: string;
    };
}

export interface UniChatEventRemoveAuthor {
    type: "unichat:remove_author";
    data: {
        channelId: string | null;
        channelName: string | null;
        platform: "youtube" | "twitch";

        authorId: string;
    };
}

export interface UniChatEventRaid {
    type: "unichat:raid";
    data: {
        channelId: string | null;
        channelName: string | null;
        platform: "youtube" | "twitch";

        authorId: string;
        authorUserName: string | null;
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
        platform: "youtube" | "twitch";

        authorId: string;
        authorUserName: string | null;
        authorDisplayName: string;
        authorProfilePictureUrl: string;

        tier: string;
        months: number;
        message: string | null;
    };
}

export interface UniChatSponsorGiftEvent {
    type: "unichat:sponsor_gift";
    data: {
        channelId: string | null;
        channelName: string | null;
        platform: "youtube" | "twitch";

        authorId: string;
        authorUserName: string | null;
        authorDisplayName: string;
        authorProfilePictureUrl: string;

        tier: string;
        count: number;
    };
}

export interface UniChatDonateEvent {
    type: "unichat:donate";
    data: {
        channelId: string | null;
        channelName: string | null;
        platform: "youtube" | "twitch";

        authorId: string;
        authorUserName: string | null;
        authorDisplayName: string;
        authorProfilePictureUrl: string;
        authorBadges: UniChatBadge[];
        authorType: "VIEWER" | "SPONSOR" | "MODERATOR" | "BROADCASTER";

        value: number;
        currency: string;

        messageId: string;
        messageText: string;
        emotes: UniChatEmote[];
    };
}

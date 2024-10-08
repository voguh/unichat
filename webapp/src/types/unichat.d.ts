export type UniChatEvent =
  | UniChatMessageEvent
  | UniChatRemoveMessageEvent
  | UniChatRemoveUserEvent
  | UniChatRaidEvent
  | UniChatSponsorEvent
  | UniChatSponsorGiftEvent
  | UniChatDonateEvent

export interface UniChatEmote {
  type: string
  tooltip: string
  url: string
}

export type UniChatAuthorType = 'BROADCASTER' | 'MODERATOR' | 'VIP' | 'SPONSOR' | 'VIEWER'

/* ============================================================================================== */

export interface UniChatMessageEvent {
  type: 'unichat:message'
  detail: {
    channelId: string
    channelName: string
    platform: string

    messageId: string
    messageHtml: string
    messageRaw: string
    emotes: UniChatEmote[]

    authorId: string
    authorUsername: string
    authorDisplayName: string
    authorDisplayColor: string
    authorProfilePictureUrl: string
    authorBadges: UniChatAuthorBadge[]
    authorType: UniChatAuthorType

    timestamp: number
  }
}

export interface UniChatAuthorBadge {
  type: string
  tooltip: string
  url: string
}

/* ============================================================================================== */

export interface UniChatRemoveMessageEvent {
  type: 'unichat:remove_message'
  detail: {
    channelId: string
    channelName: string
    platform: string

    messageId: string
  }
}

/* ============================================================================================== */

export interface UniChatRemoveUserEvent {
  type: 'unichat:remove_user'
  detail: {
    channelId: string
    channelName: string
    platform: string

    authorId: string
  }
}

/* ============================================================================================== */

export interface UniChatRaidEvent {
  type: 'unichat:raid'
  detail: {
    channelId: string
    channelName: string
    platform: string

    authorId: string
    authorUsername: string
    authorDisplayName: string
    authorProfilePictureUrl: string

    viewerCount: number
  }
}

/* ============================================================================================== */

export interface UniChatSponsorEvent {
  type: 'unichat:sponsor'
  detail: {
    channelId: string
    channelName: string
    platform: string

    authorId: string
    authorUsername: string
    authorDisplayName: string
    authorProfilePictureUrl: string

    tier: number
    tierName: string
    months: number
  }
}

/* ============================================================================================== */

export interface UniChatSponsorGiftEvent {
  type: 'unichat:sponsor_gift'
  detail: {
    channelId: string
    channelName: string
    platform: string

    authorId: string
    authorUsername: string
    authorDisplayName: string
    authorProfilePictureUrl: string

    tier: number
    tierName: string
    count: number
  }
}

/* ============================================================================================== */

export interface UniChatDonateEvent {
  type: 'unichat:donate'
  detail: {
    channelId: string
    channelName: string
    platform: string

    authorId: string
    authorUsername: string
    authorDisplayName: string
    authorProfilePictureUrl: string

    value: string
    currency: string
    message: string
  }
}

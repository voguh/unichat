export type UniChatEvent =
  | UniChatMessageEvent
  | UniChatRemoveMessageEvent
  | UniChatRemoveUserEvent
  | UniChatRaidEvent
  | UniChatSponsorEvent
  | UniChatSponsorGiftEvent
  | UniChatDonateEvent

export interface UniChatEmote {
  key: string
  url: string
}

export type UniChatAuthorType = 'BROADCASTER' | 'MODERATOR' | 'VIP' | 'SPONSOR' | 'VIEWER'

/* ============================================================================================== */

export interface UniChatMessageEvent {
  type: 'unichat:message'
  detail: {
    platform: string

    messageId: string
    message: UniChatMessageEventDetailMessage

    authorId: string
    authorUsername: string
    authorDisplayName: string
    authorProfilePictureUrl: string
    authorBadges: UniChatAuthorBadge[]
    authorType: UniChatAuthorType

    timestamp: number
  }
}

export interface UniChatMessageEventDetailMessage {
  html: string
  raw: string
  emotes: UniChatEmote[]
}

/* ============================================================================================== */

export interface UniChatRemoveMessageEvent {
  type: 'unichat:remove_message'
  detail: {
    platform: string

    messageId: string
  }
}

/* ============================================================================================== */

export interface UniChatRemoveUserEvent {
  type: 'unichat:remove_user'
  detail: {
    platform: string

    authorId: string
  }
}

/* ============================================================================================== */

export interface UniChatRaidEvent {
  type: 'unichat:raid'
  detail: {
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

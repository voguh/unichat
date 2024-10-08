import { Accessibility, AuthorName, AuthorPhoto } from './__utils'
import { YouTubeBadge } from './splited/badges'
import { YouTubeEmote } from './splited/emotes'

export interface AddChatItemAction {
  addChatItemAction: AddChatItemActionPayload
}

/* ============================================================================================== */

export interface AddChatItemActionPayload {
  clientId: string
  item: { liveChatTextMessageRenderer: LiveChatTextMessageRenderer }
}

/* ========================================================================== */

export interface LiveChatTextMessageRenderer {
  id: string
  message: { runs: LiveChatTextMessageRenderRuns[] }
  authorExternalChannelId: string
  authorName: AuthorName
  authorPhoto: AuthorPhoto
  authorBadges: { liveChatAuthorBadgeRenderer: YouTubeBadge }[]
  timestampUsec: string
  contextMenuEndpoint: ContextMenuEndpoint
  contextMenuAccessibility: Accessibility
}

/* ========================================================================== */

export interface LiveChatTextMessageRenderRunEmoji {
  emoji: YouTubeEmote
}

export interface LiveChatTextMessageRenderRunText {
  text: string
}

export interface LiveChatTextMessageRenderRunLink {
  text: string
  navigationEndpoint: LiveChatTextMessageRenderRunLinkNavigatorEndpoint
}

export interface LiveChatTextMessageRenderRunLinkNavigatorEndpoint {
  commandMetadata: LiveChatTextMessageRenderRunLinkNavigatorEndpointCommandMeta
  urlEndpoint: LiveChatTextMessageRenderRunLinkNavigatorEndpointUrlEndpoint
}

export interface LiveChatTextMessageRenderRunLinkNavigatorEndpointCommandMeta {
  webCommandMetadata: {
    rootVe: number
    url: string
    webPageType: string
  }
}

export interface LiveChatTextMessageRenderRunLinkNavigatorEndpointUrlEndpoint {
  nofollow: boolean
  target: string
  url: string
}

export type LiveChatTextMessageRenderRuns = LiveChatTextMessageRenderRunEmoji | LiveChatTextMessageRenderRunText

/* ============================================================================================== */

export interface ContextMenuEndpoint {
  commandMetadata: { webCommandMetadata: { ignoreNavigation: boolean } }
  liveChatItemContextMenuEndpoint: { params: string }
}

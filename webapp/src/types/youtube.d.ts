export interface Thumbnail {
  url: string
  width: number
  height: number
}

export interface Accessibility {
  accessibilityData: { label: string }
}

export type YouTubeAction = AddChatItemAction | RemoveChatItemAction | RemoveChatItemByAuthorAction

/* ================================================================================================================== */

export interface AddChatItemAction {
  addChatItemAction: AddChatItemActionPayload
}

/* ============================================================================================== */

export interface AddChatItemActionPayload {
  clientId: string
  item: { liveChatTextMessageRenderer: LiveChatTextMessageRenderer }
}

/* ============================================================================================== */

export interface LiveChatTextMessageRenderer {
  id: string
  message: { runs: LiveChatTextMessageRenderRuns[] }
  authorExternalChannelId: string
  authorName: { simpleText: string }
  authorPhoto: { thumbnails: Thumbnail[] }
  authorBadges: LiveChatAuthorBadgeRenderer[]
  timestampUsec: string
  contextMenuEndpoint: ContextMenuEndpoint
  contextMenuAccessibility: { accessibilityData: { label: string } }
}

/* ============================================================================================== */

export interface LiveChatTextMessageRenderRunEmoji {
  emoji: {
    emojiId: string
    shortcuts: string[]
    searchTerms: string[]
    isCustomEmoji: boolean
    image: LiveChatTextMessageRenderRunEmojiImage
  }
}

export interface LiveChatTextMessageRenderRunEmojiImage {
  thumbnails: Thumbnail[]
  accessibility: Accessibility
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

export interface LiveChatAuthorBadgeRendererInternal {
  icon: { iconType: string }
  tooltip: string
  accessibility: Accessibility
}

export interface LiveChatAuthorBadgeRendererCustom {
  customThumbnail: { thumbnails: Thumbnail[] }
  tooltip: string
  accessibility: Accessibility
}

export type LiveChatAuthorBadgeRenderer = {
  liveChatAuthorBadgeRenderer: LiveChatAuthorBadgeRendererInternal | LiveChatAuthorBadgeRendererCustom
}

/* ============================================================================================== */

export interface ContextMenuEndpoint {
  commandMetadata: { webCommandMetadata: { ignoreNavigation: boolean } }
  liveChatItemContextMenuEndpoint: { params: string }
}

/* ================================================================================================================== */

export interface RemoveChatItemAction {
  removeChatItemAction: { targetItemId: string }
}

/* ================================================================================================================== */

export interface RemoveChatItemByAuthorAction {
  removeChatItemByAuthorAction: { externalChannelId: string }
}

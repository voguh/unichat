export interface Thumbnail {
  url: string
  width: number
  height: number
}

export interface Accessibility {
  accessibilityData: { label: string }
}

export type YouTubeAction =
  | AddChatItemAction
  | RemoveChatItemAction
  | RemoveChatItemByAuthorAction
  | AddBannerToLiveChatCommand

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
  contextMenuAccessibility: Accessibility
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

/* ================================================================================================================== */

export interface AddBannerToLiveChatCommand {
  addBannerToLiveChatCommand: {
    bannerProperties: BannerProperties
    bannerRenderer: { liveChatBannerRenderer: LiveChatBannerRenderer }
  }
}

export interface BannerProperties {
  bannerTimeoutMs: string
  isExperimental: boolean
}

export interface LiveChatBannerRenderer {
  actionId: string
  bannerType: 'LIVE_CHAT_BANNER_TYPE_CROSS_CHANNEL_REDIRECT' | string
  isStackable: boolean
  targetId: string
  contents: { liveChatBannerRedirectRenderer: LiveChatBannerRedirectRenderer }
}

export interface LiveChatBannerRedirectRenderer {
  authorPhoto: { thumbnails: Thumbnail[] }
  bannerMessage: { runs: LiveChatBannerRedirectRendererRun[] }
  contextMenuButton: { buttonRenderer: ContextMenuButtonRenderer }
}

export interface LiveChatBannerRedirectRendererRun {
  bold: boolean
  fontFace: string
  text: string
  textColor: number
}

export interface ContextMenuButtonRenderer {
  accessibility: { label: string }
  accessibilityData: Accessibility
  command: ContextMenuButtonRendererCommand
  icon: { iconType: string }
  trackingParams: string
}

export interface ContextMenuButtonRendererCommand {
  clickTrackingParams: string
  commandMetadata: { webCommandMetadata: { ignoreNavigation: boolean } }
  liveChatItemContextMenuEndpoint: { params: string }
}

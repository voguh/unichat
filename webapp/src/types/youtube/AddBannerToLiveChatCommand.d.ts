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

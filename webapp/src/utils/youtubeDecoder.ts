import { UniChatAuthorBadge, UniChatAuthorType, UniChatEmote, UniChatEvent } from '~/types/unichat'
import { LiveChatAuthorBadgeRenderer, LiveChatTextMessageRenderRuns, YouTubeAction } from '~/types/youtube'

function buildMessageHtml(runs: LiveChatTextMessageRenderRuns[]): string {
  return runs
    .map((run) => {
      if ('text' in run) {
        return run.text.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()
      } else {
        const emote = run.emoji

        return `<img src="${emote.image.thumbnails.at(-1).url}" aria-label="${emote.searchTerms[0]}" />`
      }
    })
    .join(' ')
    .trim()
}

function buildMessageRaw(runs: LiveChatTextMessageRenderRuns[]): string {
  return runs
    .map((run) => {
      if ('text' in run) {
        return run.text.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()
      } else {
        return run.emoji.searchTerms[0]
      }
    })
    .join(' ')
    .trim()
}

function buildEmotes(runs: LiveChatTextMessageRenderRuns[]): UniChatEmote[] {
  return runs
    .map((run) => {
      if ('emoji' in run) {
        return {
          type: run.emoji.searchTerms[0],
          tooltip: run.emoji.searchTerms[0],
          url: run.emoji.image.thumbnails.at(-1).url
        }
      }
    })
    .filter((e) => e)
}

function buildBadges(badges: LiveChatAuthorBadgeRenderer[]): UniChatAuthorBadge[] {
  return (badges ?? [])
    .map((badge) => {
      const render = badge.liveChatAuthorBadgeRenderer

      if ('customThumbnail' in render) {
        return {
          type: 'sponsor',
          tooltip: render.tooltip,
          url: render.customThumbnail.thumbnails.at(-1).url
        }
      } else if (render.icon.iconType.toLowerCase() === 'moderator') {
        return {
          type: 'moderator',
          tooltip: render.tooltip,
          url: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1'
        }
      } else if (render.icon.iconType.toLowerCase() === 'verified') {
        return {
          type: 'verified',
          tooltip: render.tooltip,
          url: 'https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/1'
        }
      } else if (render.icon.iconType.toLowerCase() === 'owner') {
        return {
          type: 'broadcaster',
          tooltip: render.tooltip,
          url: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1'
        }
      }
    })
    .filter((e) => e)
}

function getUserTypeByBadges(badges: UniChatAuthorBadge[]): UniChatAuthorType {
  if (badges.some((badge) => badge.type === 'broadcaster')) {
    return 'BROADCASTER'
  } else if (badges.some((badge) => badge.type === 'moderator')) {
    return 'MODERATOR'
  } else if (badges.some((badge) => badge.type === 'sponsor')) {
    return 'SPONSOR'
  } else {
    return 'VIEWER'
  }
}

function getUserColorByBadges(badges: UniChatAuthorBadge[]): string {
  if (badges.some((badge) => badge.type === 'broadcaster')) {
    return '#ffd600'
  } else if (badges.some((badge) => badge.type === 'moderator')) {
    return '#5e84f1'
  } else if (badges.some((badge) => badge.type === 'sponsor')) {
    return '#2ba640'
  } else {
    return '#ffffffb2'
  }
}

function youtubeiToUnichatEvent(action: YouTubeAction): UniChatEvent {
  if ('addChatItemAction' in action) {
    const payload = action.addChatItemAction.item.liveChatTextMessageRenderer

    if (payload != null) {
      const badges = buildBadges(payload.authorBadges)

      return {
        type: 'unichat:message',
        detail: {
          channelId: '',
          channelName: '',
          platform: 'youtube',

          messageId: payload.id,
          messageHtml: buildMessageHtml(payload.message.runs),
          messageRaw: buildMessageRaw(payload.message.runs),
          emotes: buildEmotes(payload.message.runs),

          authorId: payload.authorExternalChannelId,
          authorUsername: null,
          authorDisplayName: payload.authorName.simpleText,
          authorDisplayColor: getUserColorByBadges(badges),
          authorProfilePictureUrl: payload.authorPhoto.thumbnails.at(-1).url,
          authorBadges: badges,
          authorType: getUserTypeByBadges(badges),

          timestamp: parseInt(payload.timestampUsec, 10)
        }
      }
    }
  } else if ('removeChatItemAction' in action) {
    const payload = action.removeChatItemAction

    if (payload != null) {
      return {
        type: 'unichat:remove_message',
        detail: {
          channelId: '',
          channelName: '',
          platform: 'youtube',

          messageId: payload.targetItemId
        }
      }
    }
  } else if ('removeChatItemByAuthorAction' in action) {
    const payload = action.removeChatItemByAuthorAction

    if (payload != null) {
      return {
        type: 'unichat:remove_user',
        detail: {
          channelId: '',
          channelName: '',
          platform: 'youtube',

          authorId: payload.externalChannelId
        }
      }
    }
  } else if ('addBannerToLiveChatCommand' in action) {
    const payload = action.addBannerToLiveChatCommand

    if (payload != null) {
      const bannerType = payload.bannerRenderer.liveChatBannerRenderer.bannerType

      if (bannerType === 'LIVE_CHAT_BANNER_TYPE_CROSS_CHANNEL_REDIRECT') {
        const render = payload.bannerRenderer.liveChatBannerRenderer.contents.liveChatBannerRedirectRenderer

        if ('bold' in render.bannerMessage.runs[0]) {
          const raider = render.bannerMessage.runs[0].text.trim()

          return {
            type: 'unichat:raid',
            detail: {
              channelId: '',
              channelName: '',
              platform: 'youtube',

              authorId: '',
              authorUsername: '',
              authorDisplayName: raider,
              authorProfilePictureUrl: render.authorPhoto.thumbnails.at(-1).url,

              viewerCount: -1
            }
          }
        }
      }
    }
  }
}

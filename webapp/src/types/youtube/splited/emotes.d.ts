import { Accessibility, Thumbnail } from '../__utils'

export interface YouTubeEmote {
  emojiId: string
  shortcuts: string[]
  searchTerms: string[]
  isCustomEmoji: boolean
  image: { thumbnails: Thumbnail[]; accessibility: Accessibility }
}

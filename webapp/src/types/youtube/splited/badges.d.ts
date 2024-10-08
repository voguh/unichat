import { Accessibility, Thumbnail } from '../__utils'

export interface YouTubeBadgeCustom {
  customThumbnail: { thumbnails: Thumbnail[] }
  tooltip: string
  accessibility: Accessibility
}

export interface YouTubeBadgeInternal {
  icon: { iconType: string }
  tooltip: string
  accessibility: Accessibility
}

export type YouTubeBadge = YouTubeBadgeInternal | YouTubeBadgeCustom

export interface Thumbnail {
  url: string
  width: number
  height: number
}

export interface Accessibility {
  accessibilityData: { label: string }
}

export interface AuthorName {
  simpleText: string
}

export interface AuthorPhoto {
  thumbnails: Thumbnail[]
}

export interface Photo {
  kind: 'photo'
  src: string
  width: number
  height: number
  alt: string
}

export interface Video {
  kind: 'video'
  src: string
  /** Shown before the video plays, and instead of it when motion is reduced. */
  poster: string
  width: number
  height: number
  alt: string
}

export type Media = Photo | Video

/** Placeholder colours from the design, used while a slot has no photograph yet. */
export type Tone = 'sand' | 'sand-light' | 'sand-pale' | 'umber' | 'forest' | 'forest-light' | 'forest-dark' | 'charcoal'

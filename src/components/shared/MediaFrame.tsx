import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'
import type { Media, Tone } from '@/types/media'

const toneClass: Record<Tone, string> = {
  sand: 'bg-sand-400 text-ink',
  'sand-light': 'bg-sand-200 text-ink',
  'sand-pale': 'bg-sand-300 text-ink',
  umber: 'bg-umber text-cream',
  forest: 'bg-forest-700 text-cream',
  'forest-light': 'bg-forest-600 text-cream',
  'forest-dark': 'bg-forest-900 text-cream',
  charcoal: 'bg-charcoal text-cream',
}

interface Props {
  media: Media | null
  /** Colour of the empty slot (and behind a photo while it loads). */
  tone: Tone
  /** Width over height of the slot, e.g. 4 / 5. Leave out when the class gives the slot its size. */
  ratio?: number
  /**
   * "contain" shows the whole picture over a blurred copy of itself, for a portrait phone frame in a wide slot.
   * By default it is chosen from `ratio`, or "cover" without one.
   */
  fit?: 'cover' | 'contain'
  className?: string
  /** Load at once (the first screen) instead of when scrolled near. */
  eager?: boolean
  /** Videos play muted while on screen. With false they show their poster only. */
  play?: boolean
  /** Shown in an empty slot, under the caption. */
  emptyNote?: string
  /** The caption, drawn over the bottom-left corner. */
  children?: ReactNode
  style?: CSSProperties
}

/**
 * A photograph or muted video filling a slot from the design, or the design's placeholder while there is none.
 * When the picture's shape is far from the slot's (a portrait phone frame in a wide slot), the whole picture is
 * shown over a blurred copy of itself instead of being cropped to a sliver.
 */
export function MediaFrame({ media, tone, ratio, fit, className, eager, play = true, emptyNote, children, style }: Props) {
  const mediaRatio = media ? media.width / media.height : 1
  const contain =
    media !== null &&
    (fit ? fit === 'contain' : ratio !== undefined && (ratio / mediaRatio > 1.7 || mediaRatio / ratio > 1.7))
  const still = media?.kind === 'video' ? media.poster : media?.src

  return (
    <div
      className={cn('relative isolate overflow-hidden', toneClass[tone], className)}
      style={{ ...(ratio ? { aspectRatio: String(ratio) } : null), ...style }}
    >
      {media && contain && still && (
        <img src={still} alt="" aria-hidden loading={eager ? 'eager' : 'lazy'} className="absolute inset-0 -z-10 size-full scale-125 object-cover opacity-75 blur-2xl" />
      )}
      {media?.kind === 'photo' && (
        <img
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={cn('absolute inset-0 size-full', contain ? 'object-contain' : 'object-cover')}
        />
      )}
      {media?.kind === 'video' && (
        <AmbientVideo src={media.src} poster={media.poster} label={media.alt} play={play} eager={eager} className={cn('absolute inset-0 size-full', contain ? 'object-contain' : 'object-cover')} />
      )}

      {media === null && (
        <span aria-hidden className="pointer-events-none absolute inset-2.5 border border-dashed border-current opacity-25" />
      )}
      {children && (
        <div className={cn('absolute inset-x-0 bottom-0 z-10 px-[1.15rem] pb-5 pt-16 sm:px-5', media && 'bg-gradient-to-t from-black/55 via-black/20 to-transparent text-cream')}>
          {children}
          {media === null && emptyNote && <p className="mt-1 text-[0.62rem] uppercase tracking-label opacity-60">{emptyNote}</p>}
        </div>
      )}
    </div>
  )
}

interface VideoProps {
  src: string
  poster: string
  label: string
  play: boolean
  eager?: boolean
  className?: string
}

/** A muted, looping clip that only plays while on screen, and never under reduced motion. */
export function AmbientVideo({ src, poster, label, play, eager, className }: VideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const onScreen = useInView(ref, { rootMargin: '120px' })
  const reduced = useReducedMotion()
  const shouldPlay = play && onScreen && !reduced

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (shouldPlay) {
      // Autoplay can still be refused (data saver); the poster then stays.
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [shouldPlay])

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload={eager ? 'auto' : 'none'}
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}

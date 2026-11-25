import { useEffect, useRef, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { categoryLabel, type GalleryItem } from '@/content/gallery'
import { useScrollLock } from '@/hooks/useScrollLock'
import { cn } from '@/lib/cn'

interface Props {
  items: GalleryItem[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')
const circle = 'grid size-11 place-items-center rounded-full border border-cream/35 text-cream transition-colors hover:border-cream hover:bg-cream/10'

/**
 * The full-screen viewer (design: "Gallery lightbox"). Arrow keys, the buttons or a swipe move through the items in
 * the current filter; Escape, the close button or a click on the backdrop closes it. Videos play with sound controls.
 */
export function Lightbox({ items, index, onIndexChange, onClose }: Props) {
  const item = items[index]
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const swipeStart = useRef<number | null>(null)
  useScrollLock(true)

  const go = (step: number) => onIndexChange((index + step + items.length) % items.length)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onIndexChange((index + 1) % items.length)
      else if (e.key === 'ArrowLeft') onIndexChange((index - 1 + items.length) % items.length)
      else if (e.key === 'Tab') keepFocusInside(e, dialogRef.current)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, items.length, onClose, onIndexChange])

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') swipeStart.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return
    const dx = e.clientX - swipeStart.current
    swipeStart.current = null
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  }

  if (!item) return null
  const { media } = item

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Gallery"
      className="fixed inset-0 z-50 flex flex-col bg-forest-975 text-cream motion-safe:animate-fade-in"
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-10 sm:py-6">
        <p className="text-[0.68rem] uppercase tracking-label" aria-live="polite">
          {pad(index + 1)} / {pad(items.length)} · {categoryLabel(item.category)}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className={circle} aria-label="Close">
          <X className="size-5" strokeWidth={1.25} />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-24"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        {media.kind === 'photo' ? (
          <img key={media.src} src={media.src} alt={media.alt} className="max-h-full max-w-full object-contain motion-safe:animate-fade-in" />
        ) : (
          <video
            key={media.src}
            src={media.src}
            poster={media.poster}
            controls
            autoPlay
            playsInline
            aria-label={media.alt}
            className="max-h-full max-w-full bg-black motion-safe:animate-fade-in"
          />
        )}

        <button type="button" onClick={() => go(-1)} className={cn(circle, 'absolute left-6 top-1/2 hidden -translate-y-1/2 sm:grid lg:left-10')} aria-label="Previous">
          <ChevronLeft className="size-5" strokeWidth={1.25} />
        </button>
        <button type="button" onClick={() => go(1)} className={cn(circle, 'absolute right-6 top-1/2 hidden -translate-y-1/2 sm:grid lg:right-10')} aria-label="Next">
          <ChevronRight className="size-5" strokeWidth={1.25} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-6 px-5 py-5 sm:px-10 sm:py-7">
        <p className="font-serif text-xl italic leading-snug sm:text-2xl">{media.alt}</p>
        <p className="hidden shrink-0 text-[0.64rem] uppercase tracking-label text-cream/70 lg:block">Arrow keys to browse · Esc to close</p>
        <div className="flex shrink-0 gap-3 sm:hidden">
          <button type="button" onClick={() => go(-1)} className={circle} aria-label="Previous">
            <ChevronLeft className="size-5" strokeWidth={1.25} />
          </button>
          <button type="button" onClick={() => go(1)} className={circle} aria-label="Next">
            <ChevronRight className="size-5" strokeWidth={1.25} />
          </button>
        </div>
      </div>
    </div>
  )
}

/** Keeps Tab and Shift+Tab cycling through the dialog's own controls. */
function keepFocusInside(e: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return
  const focusable = [...root.querySelectorAll<HTMLElement>('button, video[controls], [href]')].filter((el) => el.offsetParent !== null)
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

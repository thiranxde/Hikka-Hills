import { useMemo, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { sectionIds } from '@/config/routes'
import { categoryLabel, galleryCategories, galleryItems, type GalleryCategory, type GalleryItem } from '@/content/gallery'
import { cn } from '@/lib/cn'
import { Lightbox } from './Lightbox'

type Filter = GalleryCategory | 'all'

// Tile shapes repeat in this order, so the masonry columns step like the design's.
const SHAPES = ['aspect-[4/5]', 'aspect-[1/1]', 'aspect-[3/4]', 'aspect-[5/6]', 'aspect-[6/5]', 'aspect-[2/3]', 'aspect-[4/5]', 'aspect-[1/1]']

/** "Photographs & film": the filterable gallery. A tile opens the lightbox. */
export function GallerySection() {
  const [filter, setFilter] = useState<Filter>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)

  // Only categories that have something in them get a button.
  const filters = useMemo(
    () => [
      { id: 'all' as const, label: 'All' },
      ...galleryCategories.filter((c) => galleryItems.some((item) => item.category === c.id)),
    ],
    [],
  )
  const items = useMemo(() => (filter === 'all' ? galleryItems : galleryItems.filter((item) => item.category === filter)), [filter])

  return (
    <section id={sectionIds.gallery} aria-labelledby="gallery-title" className="py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-12">
          <div>
            <Eyebrow className="text-ink-soft">Gallery</Eyebrow>
            <h2 id="gallery-title" className="mt-6 font-serif text-5xl font-light leading-[1.05] lg:mt-8 lg:text-[3.4rem]">
              Photographs <br className="hidden lg:block" />& film.
            </h2>
          </div>

          <div
            role="group"
            aria-label="Show"
            className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:-mx-10 sm:px-10 lg:mx-0 lg:flex-wrap lg:justify-end lg:overflow-visible lg:px-0"
          >
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'shrink-0 border px-4 py-2.5 text-[0.64rem] uppercase tracking-[0.16em] transition-colors',
                  filter === f.id ? 'border-forest-900 bg-forest-900 text-cream' : 'border-forest-900/70 text-ink-soft hover:bg-forest-900/5',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-10 columns-2 gap-2.5 sm:gap-3 lg:mt-12 lg:columns-3" aria-live="polite">
          {items.map((item, i) => (
            <li key={item.id} className="mb-2.5 break-inside-avoid sm:mb-3">
              <GalleryTile
                item={item}
                shape={SHAPES[i % SHAPES.length]}
                onOpen={(button) => {
                  openerRef.current = button
                  setOpenIndex(i)
                }}
              />
            </li>
          ))}
        </ul>
      </div>

      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => {
            setOpenIndex(null)
            openerRef.current?.focus()
          }}
        />
      )}
    </section>
  )
}

function GalleryTile({ item, shape, onOpen }: { item: GalleryItem; shape: string; onOpen: (button: HTMLButtonElement) => void }) {
  const { media } = item
  const isVideo = media.kind === 'video'
  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      className={cn('group relative block w-full overflow-hidden bg-sand-200', shape)}
      aria-label={`${isVideo ? 'Play video' : 'Enlarge photo'}: ${media.alt}`}
    >
      <img
        src={isVideo ? media.poster : media.src}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      {isVideo && (
        <span aria-hidden className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cream/80 text-cream backdrop-blur-[2px] sm:size-14">
          <Play className="ml-0.5 size-4 fill-current" strokeWidth={1} />
        </span>
      )}
      <span aria-hidden className="absolute bottom-3 left-3 text-[0.58rem] uppercase tracking-label text-cream sm:bottom-4 sm:left-4">
        {categoryLabel(item.category)}
      </span>
    </button>
  )
}

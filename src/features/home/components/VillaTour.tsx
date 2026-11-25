import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/ui/Reveal'
import { MediaFrame } from '@/components/shared/MediaFrame'
import { tour, type TourStop } from '@/content/villa'
import { cn } from '@/lib/cn'
import { TourCaption } from './TourCaption'

interface Cell {
  /** Where the slot sits: two columns on phones, the design's staggered twelve-column collage on wide screens. */
  cell: string
  frame: string
  fit?: 'cover' | 'contain'
}

// The collage from the design, slot by slot (01 Architecture ... 08 Views).
const CELLS: Cell[] = [
  { cell: 'col-span-2 lg:col-span-7', frame: 'aspect-[4/5] sm:aspect-[4/3]' },
  { cell: 'col-span-2 lg:col-span-4 lg:col-start-9 lg:mt-[4.5rem]', frame: 'aspect-[3/2] lg:aspect-[3/4]' },
  { cell: 'lg:col-span-4', frame: 'aspect-[3/4] lg:aspect-[16/17]' },
  { cell: 'lg:col-span-4 lg:col-start-5 lg:mt-[4.5rem]', frame: 'aspect-[3/4]' },
  { cell: 'lg:col-span-3 lg:col-start-10 lg:mt-[9rem]', frame: 'aspect-[3/4] lg:aspect-[2/3]' },
  { cell: 'lg:col-span-6', frame: 'aspect-[3/4] lg:aspect-[4/3]' },
  { cell: 'col-span-2 lg:col-span-5 lg:col-start-8 lg:mt-6', frame: 'aspect-[4/3] lg:aspect-[6/5]' },
  { cell: 'col-span-2 lg:col-span-12', frame: 'aspect-[4/3] sm:aspect-[2/1] lg:aspect-[29/10]', fit: 'contain' },
]

// Slots that share a row of the collage on wide screens.
const ROWS = [
  [0, 1],
  [2, 3, 4],
  [5, 6],
  [7],
]

/** "The Villa": a first look through the property. */
export function VillaTour() {
  return (
    <section aria-labelledby="tour-title" className="pb-24 lg:pb-36">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <Eyebrow className="text-ink-soft">The Villa</Eyebrow>
            <h2 id="tour-title" className="mt-6 font-serif text-5xl font-light leading-[1.05] lg:mt-8 lg:text-[3.4rem]">
              Space, light <br className="hidden lg:block" />
              and shade.
            </h2>
          </div>
          <p className="max-w-sm text-[0.95rem] leading-relaxed text-muted lg:justify-self-end lg:pb-2 lg:text-sm">
            A first look through the property, from the architecture to the garden.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 lg:mt-14 lg:block">
          {ROWS.map((row) => (
            <div key={row.join()} className="contents lg:grid lg:grid-cols-12 lg:items-start lg:gap-3 lg:[&+&]:mt-3">
              {row.map((i) => (
                <TourSlot key={tour[i].number} stop={tour[i]} layout={CELLS[i]} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TourSlot({ stop, layout }: { stop: TourStop; layout: Cell }) {
  return (
    <Reveal className={cn(layout.cell)}>
      <MediaFrame media={stop.media} tone={stop.tone} fit={layout.fit} className={layout.frame} emptyNote={stop.media ? undefined : 'Photograph to come'}>
        <TourCaption number={stop.number} kicker={stop.kicker} title={stop.title} />
      </MediaFrame>
    </Reveal>
  )
}

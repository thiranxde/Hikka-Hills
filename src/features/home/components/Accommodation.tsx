import { Check } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Fact, Pending } from '@/components/ui/Pending'
import { Reveal } from '@/components/ui/Reveal'
import { MediaFrame } from '@/components/shared/MediaFrame'
import { sectionIds } from '@/config/routes'
import { amenities, bedrooms, type Bedroom } from '@/content/villa'
import { TourCaption } from './TourCaption'

/** "Where you will rest": one card per bedroom, then the amenities. */
export function Accommodation() {
  const confirmed = amenities.filter((a) => a.confirmed)
  const waiting = amenities.filter((a) => !a.confirmed)

  return (
    <section id={sectionIds.accommodation} aria-labelledby="rooms-title" className="bg-linen py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <Eyebrow className="text-ink-soft">Accommodation</Eyebrow>
            <h2 id="rooms-title" className="mt-6 font-serif text-5xl font-light leading-[1.05] lg:mt-8 lg:text-[3.4rem]">
              Where you <br className="hidden lg:block" />
              will rest.
            </h2>
          </div>
          <p className="max-w-sm text-[0.95rem] leading-relaxed text-muted lg:pb-2 lg:text-sm">
            Calm, simply furnished bedrooms with crisp white linen and a splash of colour.
          </p>
        </div>

        <ul className="mt-12 grid gap-14 md:grid-cols-2 md:gap-7 lg:mt-14">
          {bedrooms.map((room, i) => (
            <li key={room.label}>
              <Reveal delay={i * 0.08}>
                <BedroomCard room={room} />
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-6 border-t border-forest-700 pt-8 lg:mt-20 lg:grid-cols-2">
          <h3 className="font-serif text-[1.75rem] font-light">Amenities</h3>
          <div className="text-sm">
            {confirmed.length > 0 && (
              <ul className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
                {confirmed.map((a) => (
                  <li key={a.label} className="flex items-center gap-2.5">
                    <Check className="size-4 text-forest-700" strokeWidth={1.5} aria-hidden />
                    {a.label}
                  </li>
                ))}
              </ul>
            )}
            {waiting.length > 0 && (
              <p className="leading-loose text-muted">
                Listed only once confirmed:{' '}
                {waiting.map((a) => (
                  <span key={a.label} data-pending className="mb-1 mr-1 inline-block bg-sand-100 px-1.5 py-0.5 text-[0.72rem] leading-normal text-ink">
                    {a.label}
                  </span>
                ))}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function BedroomCard({ room }: { room: Bedroom }) {
  const facts = [
    { label: 'Bed', value: room.bed },
    { label: 'Sleeps', value: room.sleeps },
    { label: 'Size', value: room.size },
    { label: 'Bathroom', value: room.bathroom },
  ]
  return (
    <article aria-label={room.label}>
      <MediaFrame media={room.media} tone={room.tone} className="aspect-[4/5] sm:aspect-[5/4]">
        <TourCaption title={room.label} />
      </MediaFrame>
      <h3 className="mt-6 flex flex-wrap items-center gap-2 border-b border-line pb-3 font-serif text-[1.65rem] font-light">
        {room.label}
        {room.name ? <span className="italic">· {room.name}</span> : <Pending note="name" className="font-sans" />}
      </h3>
      <dl className="grid grid-cols-2 gap-x-6">
        {facts.map((fact) => (
          <div key={fact.label} className="border-b border-line py-3">
            <dt className="text-[0.6rem] uppercase tracking-label text-ink-soft">{fact.label}</dt>
            <dd className="mt-1.5 text-sm">
              <Fact value={fact.value} />
            </dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

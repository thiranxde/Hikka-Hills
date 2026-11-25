import { ArrowUpRight } from 'lucide-react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Pending } from '@/components/ui/Pending'
import { Reveal } from '@/components/ui/Reveal'
import { sectionIds } from '@/config/routes'
import { site } from '@/config/site'
import { locationText, nearby } from '@/content/villa'

/** "Hikkaduwa, south-west coast": where the villa is, distances, and the map. */
export function Location() {
  const distancesPending = nearby.some((n) => n.distance === null)

  return (
    <section id={sectionIds.location} aria-labelledby="location-title" className="py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Eyebrow className="text-ink-soft">Location</Eyebrow>
          <h2 id="location-title" className="mt-6 font-serif text-5xl font-light leading-[1.05] lg:mt-8 lg:text-[3.6rem]">
            Hikkaduwa, <br className="hidden lg:block" />
            south-west coast.
          </h2>
          <div className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
            <p>{locationText.lead}</p>
            {locationText.approach ? <p className="mt-3">{locationText.approach}</p> : <Pending note="exact address and approach" className="mt-2" />}
          </div>

          <h3 className="mt-12 text-[0.64rem] uppercase tracking-label text-ink-soft">
            Nearby{distancesPending && ' — distances to confirm'}
          </h3>
          <ul className="mt-4 max-w-md border-t border-line">
            {nearby.map((n) => (
              <li key={n.place} className="flex items-center justify-between gap-4 border-b border-line py-3.5 text-[0.95rem] sm:text-sm">
                <span>{n.place}</span>
                {n.distance ? (
                  <span className="text-muted">{n.distance}</span>
                ) : (
                  <span data-pending className="bg-sand-100 px-1.5 py-0.5 text-[0.72rem]">
                    [km / min]
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          {site.location.mapEmbedUrl ? (
            <iframe
              title="Map showing Hikka Hills"
              src={site.location.mapEmbedUrl}
              loading="lazy"
              className="aspect-square w-full border-0 sm:aspect-[6/7]"
            />
          ) : (
            <DrawnMap />
          )}
          {site.location.mapLink && (
            <a href={site.location.mapLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline">
              Open in maps <ArrowUpRight className="size-4" strokeWidth={1.25} />
            </a>
          )}
        </Reveal>
      </div>
    </section>
  )
}

/** The design's stand-in for the map until the exact pin is confirmed (config/site.ts > location.mapEmbedUrl). */
function DrawnMap() {
  return (
    <div
      role="img"
      aria-label="Map placeholder: Hikka Hills, Hikkaduwa"
      className="relative aspect-square w-full bg-map sm:aspect-[6/7]"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgb(120 100 70 / 0.16) 1px, transparent 1px), linear-gradient(to bottom, rgb(120 100 70 / 0.16) 1px, transparent 1px)',
        backgroundSize: '11.6% 10%',
      }}
    >
      <div className="absolute left-1/2 top-[36%] flex -translate-x-1/2 flex-col items-center">
        <span className="bg-forest-900 px-3.5 py-2 text-[0.62rem] uppercase tracking-label text-cream sm:px-4">{site.name}</span>
        <span className="h-6 w-px bg-forest-900" />
        <span className="size-3 rounded-full border-2 border-forest-900 bg-sand-500" />
      </div>
      <div className="absolute bottom-5 left-5 right-5 text-[0.6rem] uppercase leading-relaxed tracking-label text-ink-soft">
        <p>Hikkaduwa, Sri Lanka</p>
        <Pending note="map pin" className="mt-1.5 normal-case tracking-wide" />
      </div>
    </div>
  )
}

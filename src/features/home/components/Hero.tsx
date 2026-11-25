import { Link } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/Button'
import { AmbientVideo } from '@/components/shared/MediaFrame'
import { routes, sectionIds } from '@/config/routes'
import { site } from '@/config/site'
import { media } from '@/content/media'

/**
 * The opening screen. The walk-up clip fills the background, darkened; on wide screens it also plays at its own
 * portrait shape on the right, where its 360 x 640 frames stay sharp.
 */
export function Hero() {
  const clip = media.hero
  return (
    <section id={sectionIds.top} aria-label="Welcome" className="relative isolate overflow-hidden bg-forest-950 text-cream">
      <AmbientVideo
        src={clip.src}
        poster={clip.poster}
        label={clip.alt}
        play
        eager
        className="absolute inset-0 -z-20 size-full object-cover opacity-60 lg:scale-110 lg:opacity-30 lg:blur-md"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950 via-forest-950/55 to-forest-950/35 lg:bg-gradient-to-r lg:from-forest-950 lg:via-forest-950/85 lg:to-forest-950/40"
      />

      <div className="shell flex min-h-[100svh] flex-col justify-end pb-14 pt-32 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:pb-24 lg:pt-36">
        <div className="motion-safe:animate-rise-in">
          <p className="text-[0.7rem] uppercase tracking-label text-sand-200 lg:text-[0.66rem] lg:text-cream/80">{site.place}</p>
          <h1 className="mt-5 font-serif text-[clamp(4.4rem,23vw,7rem)] font-light uppercase leading-[0.9] tracking-[0.02em] lg:mt-7 lg:text-[clamp(4.5rem,7.4vw,7.6rem)] lg:leading-none">
            <span className="block lg:inline">Hikka</span> <span className="block lg:inline">Hills</span>
          </h1>
          <p className="mt-6 font-serif text-[1.9rem] font-light italic leading-tight sm:text-4xl lg:mt-8 lg:text-[2rem]">{site.tagline}</p>
          <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-cream/85 lg:text-[0.95rem]">
            A private villa in Hikkaduwa, on Sri Lanka’s southern coast
            <span className="hidden sm:inline"> — made for unhurried days and quiet evenings</span>.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row lg:mt-10">
            <ButtonLink to={routes.villa} variant="cream" className="py-5 sm:py-3.5">
              Discover the villa
            </ButtonLink>
            <ButtonLink to={routes.book} variant="ghost-light" className="py-5 sm:py-3.5">
              Book your stay
            </ButtonLink>
          </div>
        </div>

        <figure className="hidden shrink-0 lg:block motion-safe:animate-rise-in [animation-delay:0.25s]">
          <div className="border border-cream/15 p-2.5">
            <AmbientVideo
              src={clip.src}
              poster={clip.poster}
              label={clip.alt}
              play
              eager
              className="aspect-[9/16] w-[clamp(220px,20vw,290px)] object-cover"
            />
          </div>
          <figcaption className="mt-3 text-[0.62rem] uppercase tracking-label text-cream/60">Arriving at Hikka Hills</figcaption>
        </figure>
      </div>

      <Link
        to={routes.villa}
        className="absolute bottom-10 right-6 hidden flex-col items-center gap-4 text-[0.6rem] uppercase tracking-label text-cream/60 transition-colors hover:text-cream xl:flex"
        aria-label="Scroll to the villa"
      >
        <span className="[writing-mode:vertical-rl]">Scroll</span>
        <span className="h-12 w-px bg-brass" />
      </Link>
    </section>
  )
}

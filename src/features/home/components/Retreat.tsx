import { Eyebrow } from '@/components/ui/Eyebrow'
import { Fact, Pending } from '@/components/ui/Pending'
import { Reveal } from '@/components/ui/Reveal'
import { MediaFrame } from '@/components/shared/MediaFrame'
import { sectionIds } from '@/config/routes'
import { media } from '@/content/media'
import { intro, keyFacts } from '@/content/villa'

/** "The Retreat": what the villa is, and its key facts. */
export function Retreat() {
  return (
    <section id={sectionIds.villa} aria-labelledby="retreat-title" className="py-20 sm:py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
        <Reveal>
          <Eyebrow className="text-ink-soft">The Retreat</Eyebrow>
          <h2 id="retreat-title" className="mt-6 font-serif text-[2.9rem] font-light leading-[1.08] sm:text-6xl lg:mt-8 lg:text-[3.6rem]">
            A private villa, <br className="hidden sm:block" />
            made for <em className="font-light">slow days</em> <br className="hidden sm:block" />
            in Hikkaduwa.
          </h2>
          <div className="mt-8 max-w-md text-[1.05rem] leading-relaxed text-ink-soft lg:text-[0.95rem]">
            <p>
              {intro.lead} {intro.more}
            </p>
            {!intro.more && <Pending note="2–3 sentences in the owner’s words" className="mt-2" />}
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-2 gap-x-6 gap-y-6">
            {keyFacts.map((fact) => (
              <div key={fact.label} className="border-t border-forest-700/60 pt-4">
                <dt className="text-[0.62rem] uppercase tracking-label text-ink-soft">{fact.label}</dt>
                <dd className="mt-2 text-[0.95rem]">
                  <Fact value={fact.value} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.1} className="lg:justify-self-end lg:w-full lg:max-w-[460px]">
          <MediaFrame media={media.cottageDusk} tone="sand" ratio={3 / 4} />
        </Reveal>
      </div>
    </section>
  )
}

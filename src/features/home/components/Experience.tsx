import { useId, useState } from 'react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Pending } from '@/components/ui/Pending'
import { Reveal } from '@/components/ui/Reveal'
import { MediaFrame } from '@/components/shared/MediaFrame'
import { sectionIds } from '@/config/routes'
import { experiences, type Experience as Item } from '@/content/villa'
import { cn } from '@/lib/cn'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * "The Experience": six things a stay offers. One is open at a time; on wide screens its photograph shows beside the
 * list, on phones inside the open item.
 */
export function Experience() {
  const [active, setActive] = useState(0)
  const baseId = useId()
  const current = experiences[active]

  return (
    <section id={sectionIds.experience} aria-labelledby="experience-title" className="bg-forest-900 py-20 text-cream sm:py-24 lg:py-32">
      <div className="shell">
        <Eyebrow className="text-sand-200">The Experience</Eyebrow>
        <h2 id="experience-title" className="mt-6 font-serif text-[2.9rem] font-light leading-[1.08] sm:text-6xl lg:mt-8 lg:text-[3.6rem]">
          Nothing to do, <br className="hidden lg:block" />
          <em className="font-light">and all day to do it.</em>
        </h2>

        <div className="mt-12 grid gap-12 lg:mt-14 lg:grid-cols-2 lg:gap-16">
          <ul className="border-b border-cream/12 lg:self-start">
            {experiences.map((item, i) => (
              <ExperienceRow
                key={item.title}
                item={item}
                index={i}
                open={i === active}
                panelId={`${baseId}-panel-${i}`}
                onOpen={() => setActive(i)}
              />
            ))}
          </ul>

          <Reveal className="hidden lg:block">
            <div className="sticky top-28">
              <MediaFrame key={active} media={current.media} tone={current.tone} ratio={4 / 4.4} className="motion-safe:animate-fade-in">
                <p className="text-[0.6rem] uppercase tracking-label">
                  {pad(active + 1)} / {pad(experiences.length)}
                </p>
                <p className="mt-1.5 font-serif text-[1.4rem]">{current.title}</p>
                {!current.media && <p className="mt-1 text-[0.6rem] uppercase tracking-label opacity-60">Photograph to come</p>}
              </MediaFrame>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

interface RowProps {
  item: Item
  index: number
  open: boolean
  panelId: string
  onOpen: () => void
}

function ExperienceRow({ item, index, open, panelId, onOpen }: RowProps) {
  return (
    <li className="border-t border-cream/12">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onOpen}
          onMouseEnter={onOpen}
          className="group flex w-full items-baseline gap-5 py-5 text-left lg:py-[1.15rem]"
        >
          <span className={cn('w-6 shrink-0 text-xs tabular-nums transition-colors', open ? 'text-sand-200' : 'text-cream/50')}>
            {pad(index + 1)}
          </span>
          <span
            className={cn(
              'font-serif text-[2rem] font-light leading-tight transition-colors sm:text-[2.2rem] lg:text-[1.75rem]',
              open ? 'italic text-cream' : 'text-cream/70 group-hover:text-cream',
            )}
          >
            {item.title}
          </span>
        </button>
      </h3>
      <div id={panelId} role="region" aria-label={item.title} hidden={!open} className="pb-6 pl-11">
        <p className="max-w-sm text-[0.95rem] leading-relaxed text-cream/80 lg:text-sm">
          {item.text ?? null}
          {item.text && item.confirm && ' '}
          {!item.text && <Pending surface="dark" note="add a verified description" />}
          {item.text && item.confirm && <Pending surface="dark" note={item.confirm} />}
        </p>
        <MediaFrame media={item.media} tone={item.tone} ratio={4 / 5} className="mt-6 max-w-sm lg:hidden" />
      </div>
    </li>
  )
}

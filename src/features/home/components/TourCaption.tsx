interface Props {
  number?: string
  kicker?: string
  title: string
}

/** The caption in a photo slot: a small number or label above a serif title. */
export function TourCaption({ number, kicker, title }: Props) {
  const top = [number, kicker].filter(Boolean).join(' · ')
  return (
    <>
      {top && <p className="text-[0.6rem] uppercase tracking-label">{top}</p>}
      <p className="mt-1.5 font-serif text-[1.55rem] leading-tight sm:text-[1.35rem] lg:text-[1.4rem]">{title}</p>
    </>
  )
}

import { cn } from '@/lib/cn'

interface Props {
  /** What is to be confirmed, e.g. "response time". Without it the chip just says "Confirm". */
  note?: string
  /** "dark" on the green bands. */
  surface?: 'light' | 'dark'
  className?: string
}

/**
 * Marks a fact the owner has not confirmed yet, as the design does ("CONFIRM: ..."). Filling the value in
 * config/site.ts or content/ removes the marker. Search the code for `<Pending` to list every open question.
 */
export function Pending({ note, surface = 'light', className }: Props) {
  return (
    <span
      data-pending
      className={cn(
        'inline-block px-1.5 py-0.5 align-middle text-[0.72rem] font-normal tracking-wide',
        surface === 'light' ? 'bg-sand-100 text-ink' : 'bg-umber/70 text-cream/90',
        className,
      )}
    >
      {note ? `CONFIRM: ${note}` : 'CONFIRM'}
    </span>
  )
}

/** A value, or a "CONFIRM" marker while it is unknown. */
export function Fact({ value, note, surface }: { value: string | null; note?: string; surface?: 'light' | 'dark' }) {
  return value ? <>{value}</> : <Pending note={note} surface={surface} />
}

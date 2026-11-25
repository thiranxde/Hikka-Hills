import { cn } from '@/lib/cn'
import { site } from '@/config/site'

/** "HIKKA HILLS" in widely spaced serif capitals. `stacked` puts the words on two lines, as in the footer. */
export function Wordmark({ stacked, className }: { stacked?: boolean; className?: string }) {
  const [first, second] = site.name.toUpperCase().split(' ')
  return (
    <span className={cn('font-serif font-normal leading-none tracking-wordmark', className)}>
      {stacked ? (
        <>
          <span className="block">{first}</span>
          <span className="mt-1.5 block">{second}</span>
        </>
      ) : (
        `${first} ${second}`
      )}
    </span>
  )
}

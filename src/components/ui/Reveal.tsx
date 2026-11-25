import { useRef, type ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/cn'

interface Props {
  children: ReactNode
  className?: string
  /** Seconds to wait, to stagger neighbours. */
  delay?: number
}

/** Lets its content rise into place the first time it scrolls into view. Still under reduced motion. */
export function Reveal({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const seen = useInView(ref, { once: true, rootMargin: '0px 0px -8% 0px' })
  return (
    <div
      ref={ref}
      className={cn(seen ? 'motion-safe:animate-rise-in' : 'motion-safe:opacity-0', className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}

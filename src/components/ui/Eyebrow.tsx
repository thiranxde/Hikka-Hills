import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** The small spaced capitals above each heading ("THE RETREAT"). */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-[0.68rem] font-normal uppercase tracking-label', className)}>{children}</p>
}

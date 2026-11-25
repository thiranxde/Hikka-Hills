import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'cream' | 'ghost-light' | 'forest' | 'forest-outline' | 'brass'

const base =
  'inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[0.7rem] font-normal uppercase tracking-label transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  cream: 'bg-cream text-forest-900 hover:bg-sand-100',
  'ghost-light': 'border border-cream/45 text-cream hover:border-cream hover:bg-cream/8',
  forest: 'bg-forest-900 text-cream hover:bg-forest-950',
  'forest-outline': 'border border-forest-900 text-forest-900 hover:bg-forest-900 hover:text-cream',
  brass: 'border border-brass text-cream hover:bg-brass hover:text-forest-950',
}

function buttonClass(variant: ButtonVariant, className?: string) {
  return cn(base, variants[variant], className)
}

interface LinkProps {
  to: string
  variant: ButtonVariant
  className?: string
  children: ReactNode
  onClick?: () => void
}

export function ButtonLink({ to, variant, className, children, onClick }: LinkProps) {
  return (
    <Link to={to} className={buttonClass(variant, className)} onClick={onClick}>
      {children}
    </Link>
  )
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant
}

export function Button({ variant, className, type = 'button', ...rest }: Props) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />
}

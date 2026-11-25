import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Wordmark } from '@/components/shared/Wordmark'
import { mainNav, routes } from '@/config/routes'
import { site } from '@/config/site'
import { useScrollLock } from '@/hooks/useScrollLock'

interface Props {
  open: boolean
  onClose: () => void
}

/** The full-screen menu on phones and tablets (design: "Mobile menu"). */
export function MobileMenu({ open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-forest-925 px-6 pb-8 pt-5 text-cream motion-safe:animate-fade-in sm:px-10"
    >
      <div className="flex items-center justify-between">
        <Link to={routes.top} onClick={onClose} className="text-[1.05rem] sm:text-[1.2rem]">
          <Wordmark />
        </Link>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close the menu" className="-mr-2 grid size-11 place-items-center">
          <X className="size-7" strokeWidth={1} />
        </button>
      </div>

      <nav aria-label="Main" className="mt-10 flex-1">
        <ul>
          {mainNav.map((item, i) => (
            <li key={item.to} className={i > 0 ? 'border-t border-cream/12' : undefined}>
              <Link to={item.to} onClick={onClose} className="block py-4 font-serif text-[2.4rem] leading-tight sm:text-5xl">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10">
        <ButtonLink to={routes.book} variant="brass" onClick={onClose} className="w-full py-4 text-[0.72rem]">
          Book your stay
        </ButtonLink>
        <p className="mt-6 text-center text-[0.68rem] uppercase tracking-label text-sand-200/80">{site.place}</p>
      </div>
    </div>
  )
}

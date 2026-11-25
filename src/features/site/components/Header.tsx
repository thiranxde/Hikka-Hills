import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '@/components/ui/Button'
import { Wordmark } from '@/components/shared/Wordmark'
import { mainNav, routes } from '@/config/routes'
import { cn } from '@/lib/cn'
import { MobileMenu } from './MobileMenu'

/** Fixed header: see-through over the hero, solid green once the page scrolls. */
export function Header() {
  const [solid, setSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const update = () => setSolid(window.scrollY > 40)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 text-cream transition-[background-color,box-shadow,padding] duration-500',
          solid ? 'bg-forest-950/95 py-3.5 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-md' : 'bg-transparent py-5 lg:py-6',
        )}
      >
        <div className="shell flex items-center justify-between gap-6">
          <Link to={routes.top} className="shrink-0 text-[1.05rem] sm:text-[1.2rem]" aria-label="Hikka Hills, back to the top">
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex xl:gap-10">
            {mainNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[0.66rem] uppercase tracking-[0.18em] text-cream/85 transition-colors hover:text-cream"
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink to={routes.book} variant="brass" className="ml-2 px-[1.15rem] py-2.5 text-[0.64rem]">
              Book your stay
            </ButtonLink>
          </nav>

          <button
            type="button"
            className="-mr-2 flex h-11 w-14 flex-col items-center justify-center gap-[7px] lg:hidden"
            aria-label="Open the menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span className="block h-px w-8 bg-cream" />
            <span className="block h-px w-8 bg-cream" />
          </button>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

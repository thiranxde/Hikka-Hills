import { Link } from 'react-router-dom'
import { Wordmark } from '@/components/shared/Wordmark'
import { mainNav } from '@/config/routes'
import { site } from '@/config/site'
import { ContactLines } from './ContactLines'

export function Footer() {
  const social = [
    { label: 'Instagram', href: site.social.instagram },
    { label: 'Facebook', href: site.social.facebook },
    { label: 'WhatsApp', href: site.contact.whatsapp ? `https://wa.me/${site.contact.whatsapp}` : null },
  ]

  return (
    <footer className="bg-forest-925 text-cream">
      <div className="shell pb-8 pt-16 lg:pt-[4.5rem]">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <Link to="/" className="inline-block text-2xl sm:text-[1.65rem]" aria-label="Hikka Hills, home">
              <Wordmark stacked className="max-sm:[&>span]:inline max-sm:[&>span+span]:ml-[0.4em]" />
            </Link>
            <p className="mt-5 max-w-[15rem] font-serif text-lg italic leading-snug text-sand-200">{site.tagline}</p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-4 text-[0.95rem] sm:grid-cols-1 sm:gap-y-[1.1rem] sm:text-sm">
              {mainNav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-cream/90 hover:text-cream">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-sm">
            <p className="text-[0.64rem] uppercase tracking-label text-cream/70">Contact</p>
            <ContactLines className="mt-4 space-y-1.5 text-cream/90" />
            <p className="mt-5 text-cream/90">{site.location.region}</p>
            <p className="mt-1 text-cream/90">
              {site.contact.address ?? (
                <span data-pending className="inline-block bg-umber/70 px-1.5 py-0.5 text-cream/90">
                  [FULL ADDRESS]
                </span>
              )}
            </p>
          </div>

          <div className="text-sm">
            <p className="text-[0.64rem] uppercase tracking-label text-cream/70">Follow</p>
            <ul className="mt-4 flex gap-6 sm:block sm:space-y-3.5">
              {social.map((s) => (
                <li key={s.label}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noreferrer" className="text-cream/90 hover:text-cream">
                      {s.label}
                    </a>
                  ) : (
                    <span className="text-cream/45" title={`${s.label} link to be confirmed`}>
                      {s.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-cream/12 pt-6 text-xs text-cream/60 sm:flex-row sm:justify-between">
          <p>
            © {site.year} {site.name}. All rights reserved.
          </p>
          <p>{site.place}</p>
        </div>
      </div>
    </footer>
  )
}

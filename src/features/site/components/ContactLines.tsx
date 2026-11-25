import { site } from '@/config/site'

/**
 * Phone, WhatsApp and email as links, or "[PHONE]"-style markers while they are not confirmed (on the green bands
 * only). Fill them in under `contact` in config/site.ts.
 */
export function ContactLines({ className, itemClassName }: { className?: string; itemClassName?: string }) {
  const { phone, whatsapp, email } = site.contact
  const lines = [
    { key: 'phone', label: 'Phone', value: phone, href: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null, placeholder: '[PHONE]' },
    { key: 'whatsapp', label: 'WhatsApp', value: whatsapp ? `+${whatsapp}` : null, href: whatsapp ? `https://wa.me/${whatsapp}` : null, placeholder: '[WHATSAPP]' },
    { key: 'email', label: 'Email', value: email, href: email ? `mailto:${email}` : null, placeholder: '[EMAIL]' },
  ]
  return (
    <ul className={className}>
      {lines.map((line) => (
        <li key={line.key} className={itemClassName}>
          {line.value && line.href ? (
            <a href={line.href} className="underline-offset-4 hover:underline">
              <span className="sr-only">{line.label}: </span>
              {line.value}
            </a>
          ) : (
            <span data-pending className="inline-block bg-umber/70 px-1.5 py-0.5 text-cream/90" title={`${line.label} to be confirmed`}>
              {line.placeholder}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

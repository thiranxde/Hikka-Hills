import { Eyebrow } from '@/components/ui/Eyebrow'
import { Pending } from '@/components/ui/Pending'
import { Reveal } from '@/components/ui/Reveal'
import { sectionIds } from '@/config/routes'
import { site } from '@/config/site'
import { ContactLines } from '@/features/site/components/ContactLines'
import { EnquiryForm } from './EnquiryForm'

/** "Book your stay": the enquiry form, with the direct contact details beside it. */
export function BookingSection() {
  return (
    <section id={sectionIds.book} aria-labelledby="book-title" className="bg-forest-900 py-20 text-cream sm:py-24 lg:py-32">
      <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Eyebrow className="text-sand-200">Book your stay</Eyebrow>
          <h2 id="book-title" className="mt-6 font-serif text-[2.9rem] font-light leading-[1.08] sm:text-6xl lg:mt-8 lg:text-[3.6rem]">
            Tell us when <br className="hidden lg:block" />
            you would <br className="hidden lg:block" />
            <em className="font-light">like to arrive.</em>
          </h2>
          <p className="mt-8 max-w-sm text-[0.95rem] leading-relaxed text-cream/85">
            Send an enquiry and we will reply personally with availability and rates.{' '}
            {site.contact.responseTime ? `We usually reply ${site.contact.responseTime}.` : <Pending surface="dark" note="response time" />}
          </p>
          <ContactLines className="mt-10 space-y-1.5 text-sm" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bg-cream px-6 py-9 text-ink sm:px-10 sm:py-11">
            <EnquiryForm />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

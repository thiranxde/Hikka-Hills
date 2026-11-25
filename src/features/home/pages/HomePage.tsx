import { BookingSection } from '@/features/booking/components/BookingSection'
import { GallerySection } from '@/features/gallery/components/GallerySection'
import { Accommodation } from '../components/Accommodation'
import { Experience } from '../components/Experience'
import { Hero } from '../components/Hero'
import { Location } from '../components/Location'
import { Retreat } from '../components/Retreat'
import { VillaTour } from '../components/VillaTour'

/** The whole site is this one page, in the design's order. The menu links jump to its sections. */
export function HomePage() {
  return (
    <>
      <Hero />
      <Retreat />
      <VillaTour />
      <Experience />
      <GallerySection />
      <Accommodation />
      <Location />
      <BookingSection />
    </>
  )
}

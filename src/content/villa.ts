import { media } from '@/content/media'
import type { Media, Tone } from '@/types/media'

/*
 * The words and pictures on the page. A `null` value is a fact the owner has not confirmed yet; the page shows a
 * "CONFIRM" marker for it (components/ui/Pending). Fill them in here; no component needs to change.
 */

/** The short introduction under "The Retreat", in the owner's words. */
export const intro = {
  lead: 'Hikka Hills is a private getaway in the Hikkaduwa area of Sri Lanka’s south-west coast.',
  more: null as string | null,
}

export const keyFacts: { label: string; value: string | null }[] = [
  { label: 'Location', value: 'Hikkaduwa, Sri Lanka' },
  { label: 'Bedrooms', value: null },
  { label: 'Guests', value: null },
  { label: 'Outdoors', value: 'Veranda and garden' },
]

export interface TourStop {
  number: string
  title: string
  /** Small label above the title, e.g. "Panoramic". */
  kicker?: string
  media: Media | null
  tone: Tone
}

/** "The Villa": a first look through the property. Captions are section names only. */
export const tour: TourStop[] = [
  { number: '01', title: 'Architecture', media: media.verandaFretwork, tone: 'sand' },
  { number: '02', title: 'The veranda', media: media.verandaBench, tone: 'forest-light' },
  { number: '03', title: 'Living spaces', media: media.livingGardenView, tone: 'sand-light' },
  { number: '04', title: 'Bedrooms', media: media.bedroomArt, tone: 'forest-dark' },
  { number: '05', title: 'Bathrooms', media: media.bathroomTiled, tone: 'sand-pale' },
  { number: '06', title: 'Dining', media: media.diningRoom, tone: 'umber' },
  { number: '07', title: 'Outdoor spaces', media: media.verandaPillar, tone: 'sand' },
  { number: '08', title: 'Views and surroundings', kicker: 'Panoramic', media: media.walkFields, tone: 'forest' },
]

export interface Experience {
  title: string
  /** What the stay offers; `null` until the owner confirms the detail. */
  text: string | null
  /** Text that still needs the owner's word, shown with a "CONFIRM" marker. */
  confirm?: string
  media: Media | null
  tone: Tone
}

export const experiences: Experience[] = [
  {
    title: 'Relaxation',
    text: 'Long, unhurried hours on a shaded veranda, in a private setting.',
    confirm: 'replace with verified detail',
    media: media.verandaChairs,
    tone: 'forest-light',
  },
  {
    title: 'Tropical surroundings',
    text: 'Mango trees, lawns and planted borders around the house, with open fields and palms beyond.',
    media: media.gardenLawn,
    tone: 'forest-light',
  },
  {
    title: 'Dining',
    text: 'A dining room with a long table for the whole party, and a kitchen alongside.',
    confirm: 'meals, and whether a cook is available',
    media: media.diningTable,
    tone: 'umber',
  },
  {
    title: 'Indoor comfort',
    text: 'Airy rooms with polished floors, timber furniture and crisp white bedding.',
    confirm: 'air conditioning and other comforts',
    media: media.plantersChair,
    tone: 'sand-light',
  },
  {
    title: 'Nearby',
    text: 'Hikkaduwa town, its beach and the coast road are close by.',
    confirm: 'distances',
    media: media.fieldsLane,
    tone: 'forest',
  },
]

export interface Bedroom {
  label: string
  name: string | null
  media: Media | null
  tone: Tone
  bed: string | null
  sleeps: string | null
  size: string | null
  bathroom: string | null
}

/**
 * One card per bedroom. The owner's photos show more than two rooms (including one with a single bed and one with
 * two beds): confirm the count, then add a card for each here with its own photo from content/media.ts.
 */
export const bedrooms: Bedroom[] = [
  { label: 'Bedroom 1', name: null, media: media.bedroomWide, tone: 'sand-pale', bed: null, sleeps: null, size: null, bathroom: null },
  { label: 'Bedroom 2', name: null, media: media.bedroomBright, tone: 'umber', bed: null, sleeps: null, size: null, bathroom: null },
]

/** Listed only once confirmed: until then each shows as a "CONFIRM" chip. */
export const amenities: { label: string; confirmed: boolean }[] = [
  { label: 'Air conditioning', confirmed: false },
  { label: 'Wi-Fi', confirmed: false },
  { label: 'Kitchen / chef', confirmed: false },
  { label: 'Parking', confirmed: false },
  { label: 'Housekeeping', confirmed: false },
  { label: 'Check-in / out times', confirmed: false },
]

export const locationText = {
  lead: 'Hikkaduwa is a coastal town on Sri Lanka’s south-west coast, known for its beaches and marine life.',
  approach: null as string | null,
}

/** Distances from the villa, e.g. "2 km · 5 min". */
export const nearby: { place: string; distance: string | null }[] = [
  { place: 'Hikkaduwa Beach', distance: null },
  { place: 'Hikkaduwa National Park', distance: null },
  { place: 'Galle Fort', distance: null },
  { place: 'Nearest airport', distance: null },
]

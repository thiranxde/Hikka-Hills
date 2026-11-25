/** Ids of the home page's sections. Links to them go through `routes`, never a hard-coded "#...". */
export const sectionIds = {
  top: 'top',
  villa: 'villa',
  experience: 'experience',
  gallery: 'gallery',
  accommodation: 'accommodation',
  location: 'location',
  book: 'book',
} as const

export type SectionId = (typeof sectionIds)[keyof typeof sectionIds]

const section = (id: SectionId) => `/#${id}`

/** Every URL on the site. */
export const routes = {
  home: '/',
  top: section(sectionIds.top),
  villa: section(sectionIds.villa),
  experience: section(sectionIds.experience),
  gallery: section(sectionIds.gallery),
  accommodation: section(sectionIds.accommodation),
  location: section(sectionIds.location),
  book: section(sectionIds.book),
} as const

/** The main menu, in the order of the design. "Contact" opens the enquiry form. */
export const mainNav = [
  { label: 'Home', to: routes.top },
  { label: 'The Villa', to: routes.villa },
  { label: 'Experience', to: routes.experience },
  { label: 'Gallery', to: routes.gallery },
  { label: 'Location', to: routes.location },
  { label: 'Contact', to: routes.book },
] as const

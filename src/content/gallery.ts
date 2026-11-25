import { media } from '@/content/media'
import type { Media } from '@/types/media'

export const galleryCategories = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'interiors', label: 'Interiors' },
  { id: 'bedrooms', label: 'Bedrooms' },
  { id: 'dining', label: 'Dining' },
  { id: 'surroundings', label: 'Surroundings' },
  { id: 'video', label: 'Video' },
] as const

export type GalleryCategory = (typeof galleryCategories)[number]['id']

export interface GalleryItem {
  id: string
  category: GalleryCategory
  media: Media
}

/**
 * The gallery, in the order shown under "All" (mixed, so neighbouring tiles differ). A category with no items has no
 * filter button. Bathrooms are under Interiors.
 */
export const galleryItems: GalleryItem[] = [
  { id: 'house-front', category: 'exterior', media: media.houseFront },
  { id: 'bedroom-art', category: 'bedrooms', media: media.bedroomArt },
  { id: 'dining-room', category: 'dining', media: media.diningRoom },
  { id: 'veranda-fretwork', category: 'exterior', media: media.verandaFretwork },
  { id: 'living-garden-view', category: 'interiors', media: media.livingGardenView },
  { id: 'walk-veranda', category: 'video', media: media.walkVeranda },
  { id: 'cottage-dusk', category: 'exterior', media: media.cottageDusk },
  { id: 'garden-fountain', category: 'surroundings', media: media.gardenFountain },
  { id: 'bedroom-pillows', category: 'bedrooms', media: media.bedroomPillows },
  { id: 'planters-chair', category: 'interiors', media: media.plantersChair },
  { id: 'fields-palms', category: 'surroundings', media: media.fieldsPalms },
  { id: 'dining-table', category: 'dining', media: media.diningTable },
  { id: 'veranda-bench', category: 'exterior', media: media.verandaBench },
  { id: 'bedroom-window', category: 'bedrooms', media: media.bedroomWindow },
  { id: 'walk-garden', category: 'video', media: media.walkGarden },
  { id: 'sitting-room', category: 'interiors', media: media.sittingRoom },
  { id: 'veranda-pillar', category: 'surroundings', media: media.verandaPillar },
  { id: 'front-doors', category: 'exterior', media: media.frontDoors },
  { id: 'bathroom-tiled', category: 'interiors', media: media.bathroomTiled },
  { id: 'bedroom-centred', category: 'bedrooms', media: media.bedroomCentred },
  { id: 'garden-lawn', category: 'surroundings', media: media.gardenLawn },
  { id: 'kitchen', category: 'dining', media: media.kitchen },
  { id: 'walk-living', category: 'video', media: media.walkLiving },
  { id: 'veranda-chairs', category: 'exterior', media: media.verandaChairs },
  { id: 'living-chairs', category: 'interiors', media: media.livingChairs },
  { id: 'bedroom-single', category: 'bedrooms', media: media.bedroomSingle },
  { id: 'garden-sculpture', category: 'surroundings', media: media.gardenSculpture },
  { id: 'lamp-corner', category: 'interiors', media: media.lampCorner },
  { id: 'cottage-porch', category: 'exterior', media: media.cottagePorch },
  { id: 'bedroom-desk', category: 'bedrooms', media: media.bedroomDesk },
  { id: 'walk-bedroom', category: 'video', media: media.walkBedroom },
  { id: 'artwork', category: 'interiors', media: media.artwork },
  { id: 'mango-tree', category: 'surroundings', media: media.mangoTree },
  { id: 'dining-long', category: 'dining', media: media.diningLong },
  { id: 'bedroom-two-beds', category: 'bedrooms', media: media.bedroomTwoBeds },
  { id: 'veranda-windows', category: 'exterior', media: media.verandaWindows },
  { id: 'bathroom-basin', category: 'interiors', media: media.bathroomBasin },
  { id: 'garden-trees', category: 'surroundings', media: media.gardenTrees },
  { id: 'walk-fields', category: 'video', media: media.walkFields },
  { id: 'lounge', category: 'interiors', media: media.lounge },
  { id: 'bedroom-doorway', category: 'bedrooms', media: media.bedroomDoorway },
  { id: 'veranda-plants', category: 'surroundings', media: media.verandaPlants },
  { id: 'living-room', category: 'interiors', media: media.livingRoom },
  { id: 'veranda-plant', category: 'exterior', media: media.verandaPlant },
]

export function categoryLabel(id: GalleryCategory): string {
  return galleryCategories.find((c) => c.id === id)?.label ?? id
}

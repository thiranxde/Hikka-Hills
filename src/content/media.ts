import type { Photo, Video } from '@/types/media'
import sizes from './mediaSizes.json'

/*
 * Every photograph and clip on the site. The files are in public/media and their sizes in mediaSizes.json, both made
 * by `npm run media:prepare` (scripts/prepare-media.mjs) from the owner's originals in media/source: photos sent by the
 * owner, frames taken from the 4K walk-through videos, and the videos themselves. To change a picture, change the
 * lists in that script and run it again; a name used here must exist there.
 */
type PhotoName = keyof typeof sizes.photos
type VideoName = keyof typeof sizes.videos

const photo = (name: PhotoName, alt: string): Photo => ({
  kind: 'photo',
  src: `/media/photos/${name}.jpg`,
  alt,
  ...sizes.photos[name],
})

const video = (name: VideoName, alt: string): Video => ({
  kind: 'video',
  src: `/media/video/${name}.mp4`,
  poster: `/media/video/${name}.jpg`,
  alt,
  ...sizes.videos[name],
})

export const media = {
  // Outside
  houseFront: photo('house-front', 'The front of the villa, with its long veranda and garden'),
  cottageDusk: photo('cottage-dusk', 'A cottage porch lit up at dusk'),
  cottagePorch: photo('cottage-porch', 'The lit porch and stone steps of a cottage on the grounds'),
  verandaFretwork: photo('veranda-fretwork', 'The veranda, with carved fretwork, shuttered windows and a timber bench'),
  verandaBench: photo('veranda-bench', 'Looking along the veranda past shuttered windows and a timber bench'),
  verandaWindows: photo('veranda-windows', 'Shuttered windows and a bench on the veranda'),
  verandaPlant: photo('veranda-plant', 'A shuttered window and potted plant on the veranda'),
  verandaPillar: photo('veranda-pillar', 'A white pillar and fretwork framing the garden'),
  verandaChairs: photo('veranda-chairs', 'A cushioned timber chair on the shaded veranda'),
  verandaGarden: photo('veranda-garden', 'A hanging chair on the veranda, looking over the garden'),
  verandaPlants: photo('veranda-plants', 'Hanging plants between the veranda pillars'),
  frontDoors: photo('front-doors', 'Tall timber doors opening from the veranda into the house'),
  gardenFountain: photo('garden-fountain', 'A stone fountain in the garden beside the veranda'),
  gardenLawn: photo('garden-lawn', 'A mango tree on the lawn, with the boundary planting behind'),
  gardenTrees: photo('garden-trees', 'Shade trees and lawn along the side of the house'),
  gardenSculpture: photo('garden-sculpture', 'A planted tree-stump sculpture by the house'),
  mangoTree: photo('mango-tree', 'The trunk of an old mango tree in the garden'),
  fieldsPalms: photo('fields-palms', 'Open green fields and coconut palms beyond the garden'),
  fieldsLane: photo('fields-lane', 'The quiet lane past the villa, between fields'),

  // Living and dining
  livingGardenView: photo('living-garden-view', 'The sitting room, with doors open to the veranda and garden'),
  livingChairs: photo('living-chairs', 'Cushioned timber armchairs by the open veranda doors'),
  livingRoom: photo('living-room', 'Armchairs and a low table between tall windows'),
  sittingRoom: photo('sitting-room', 'A sitting room with a sofa, a timber chest and curtained windows'),
  lounge: photo('lounge', 'A lounge with a long sofa, looking through to the next room'),
  plantersChair: photo('planters-chair', 'A traditional planter’s chair beside the veranda doors'),
  lampCorner: photo('lamp-corner', 'A table lamp glowing in a quiet corner'),
  artwork: photo('artwork', 'A tall painting above a timber sideboard'),
  diningRoom: photo('dining-room', 'The dining room, with a long table, and the kitchen beyond'),
  diningTable: photo('dining-table', 'The dining table, set with a checked cloth'),
  diningLong: photo('dining-long', 'The dining room, looking towards the garden door'),
  kitchen: photo('kitchen', 'Kitchen cupboards and counter'),

  // Bedrooms and bathrooms
  bedroomArt: photo('bedroom-art', 'A double bed under an orange and ochre wall hanging'),
  bedroomDoorway: photo('bedroom-doorway', 'A double bed with striped throw, beside the doorway'),
  bedroomPillows: photo('bedroom-pillows', 'Crisp white pillows and orange cushions'),
  bedroomCentred: photo('bedroom-centred', 'A double bed beneath a striped wall hanging'),
  bedroomWindow: photo('bedroom-window', 'A double bed by a curtained window'),
  bedroomDesk: photo('bedroom-desk', 'A bed with a dressing table and mirror'),
  bedroomSingle: photo('bedroom-single', 'A single bed under a curtained window'),
  bedroomWide: photo('bedroom-wide', 'A bedroom with a double bed and striped wall hanging'),
  bedroomBright: photo('bedroom-bright', 'A bright bedroom with a double bed'),
  bedroomTwoBeds: photo('bedroom-two-beds', 'A bedroom with two beds and a wardrobe'),
  bathroomTiled: photo('bathroom-tiled', 'A tiled bathroom with basin, mirror and shower'),
  bathroomBasin: photo('bathroom-basin', 'A bathroom basin and mirror'),

  // Clips
  hero: video('hero', 'Walking up to the front of the villa'),
  walkVeranda: video('walk-veranda', 'A walk along the veranda to the front doors'),
  walkGarden: video('walk-garden', 'A walk around the garden'),
  walkLiving: video('walk-living', 'A walk through the sitting room'),
  walkBedroom: video('walk-bedroom', 'A walk through one of the bedrooms'),
  walkFields: video('walk-fields', 'The fields and palms around the villa'),
} as const

// Makes the web copies in public/media from the owner's originals, and records their sizes in
// src/content/mediaSizes.json for src/content/media.ts.
//
//   npm run media:prepare
//
// Sources, best first:
//   media/source/     the full-resolution files from the owner: iPhone videos (IMG_xxxx.MOV, 4K HDR) and photos.
//   media/originals/  the reduced copies from the shared iCloud album (npm run media:fetch), used only for a video
//                     that is not in media/source.
// Both folders are git-ignored; public/media and mediaSizes.json are what the site serves and are kept.
//
// What goes where is decided here: PHOTOS (copied as they are), STILLS (frames taken from the videos) and CLIPS.
// The names are used in src/content/media.ts.
import { execFileSync, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import ffmpeg from 'ffmpeg-static'

const root = join(import.meta.dirname, '..')
const sourceDir = join(root, 'media', 'source')
const albumDir = join(root, 'media', 'originals')
const photosOut = join(root, 'public', 'media', 'photos')
const videosOut = join(root, 'public', 'media', 'video')
const sizesFile = join(root, 'src', 'content', 'mediaSizes.json')

/** Photos sent by the owner (WhatsApp copies, already web-sized): copied without recompressing. */
const PHOTOS = {
  'cottage-dusk': 'WhatsApp Image 2026-11-25 at 1.10.32 AM (2).jpeg',
  'cottage-porch': 'WhatsApp Image 2026-11-25 at 1.10.33 AM.jpeg',
  'veranda-fretwork': 'WhatsApp Image 2026-11-25 at 1.10.29 AM (1).jpeg',
  'veranda-bench': 'WhatsApp Image 2026-11-25 at 1.10.28 AM (1).jpeg',
  'veranda-windows': 'WhatsApp Image 2026-11-25 at 1.10.28 AM (2).jpeg',
  'veranda-plant': 'WhatsApp Image 2026-11-25 at 1.10.30 AM (2).jpeg',
  'veranda-pillar': 'WhatsApp Image 2026-11-25 at 1.10.27 AM.jpeg',
  'front-doors': 'WhatsApp Image 2026-11-25 at 1.10.26 AM (1).jpeg',
  'garden-sculpture': 'WhatsApp Image 2026-11-25 at 12.49.54 AM.jpeg',
  'living-garden-view': 'WhatsApp Image 2026-11-25 at 1.10.33 AM (1).jpeg',
  'living-chairs': 'WhatsApp Image 2026-11-25 at 1.10.24 AM (2).jpeg',
  'living-room': 'WhatsApp Image 2026-11-25 at 1.10.25 AM (1).jpeg',
  'sitting-room': 'WhatsApp Image 2026-11-25 at 1.10.22 AM (1).jpeg',
  lounge: 'WhatsApp Image 2026-11-25 at 1.10.21 AM (1).jpeg',
  'planters-chair': 'WhatsApp Image 2026-11-25 at 1.10.25 AM.jpeg',
  'lamp-corner': 'WhatsApp Image 2026-11-25 at 1.10.26 AM.jpeg',
  artwork: 'WhatsApp Image 2026-11-25 at 12.53.17 AM.jpeg',
  'dining-room': 'WhatsApp Image 2026-11-25 at 12.53.34 AM.jpeg',
  'dining-table': 'WhatsApp Image 2026-11-25 at 12.53.00 AM.jpeg',
  'dining-long': 'WhatsApp Image 2026-11-25 at 1.10.15 AM.jpeg',
  kitchen: 'WhatsApp Image 2026-11-25 at 1.10.21 AM.jpeg',
  'bedroom-art': 'WhatsApp Image 2026-11-25 at 12.51.16 AM (1).jpeg',
  'bedroom-doorway': 'WhatsApp Image 2026-11-25 at 12.51.16 AM.jpeg',
  'bedroom-pillows': 'WhatsApp Image 2026-11-25 at 12.51.17 AM (1).jpeg',
  'bedroom-centred': 'WhatsApp Image 2026-11-25 at 12.51.11 AM (1).jpeg',
  'bedroom-window': 'WhatsApp Image 2026-11-25 at 12.51.15 AM (2).jpeg',
  'bedroom-desk': 'WhatsApp Image 2026-11-25 at 12.51.17 AM.jpeg',
  'bedroom-single': 'WhatsApp Image 2026-11-25 at 12.51.18 AM (2).jpeg',
  'bedroom-wide': 'WhatsApp Image 2026-11-25 at 1.10.19 AM (1).jpeg',
  'bedroom-bright': 'WhatsApp Image 2026-11-25 at 12.51.14 AM.jpeg',
  'bedroom-two-beds': 'WhatsApp Image 2026-11-25 at 12.50.18 AM.jpeg',
  'bathroom-tiled': 'WhatsApp Image 2026-11-25 at 12.51.14 AM (2).jpeg',
  'bathroom-basin': 'WhatsApp Image 2026-11-25 at 1.10.32 AM.jpeg',
}

/** name: [video, position in it from 0 to 1]. Frames come out upright at 1080 x 1920 from the 4K originals. */
const STILLS = {
  'house-front': ['IMG_1165', 0.02],
  'veranda-chairs': ['IMG_1171', 0.22],
  'veranda-garden': ['IMG_1183', 0.1],
  'veranda-plants': ['IMG_1182', 0.4],
  'garden-fountain': ['IMG_1165', 0.55],
  'garden-lawn': ['IMG_1172', 0.55],
  'garden-trees': ['IMG_1185', 0.05],
  'mango-tree': ['IMG_1174', 0.02],
  'fields-palms': ['IMG_1194', 0.38],
  'fields-lane': ['IMG_1194', 0.55],
}

/** name: [video, start second, length in seconds (null for all), keep sound]. 720 x 1280, 30 fps, H.264. */
const CLIPS = {
  hero: ['IMG_1165', 0, 20, false],
  'walk-veranda': ['IMG_1171', 0, null, true],
  'walk-garden': ['IMG_1185', 0, null, true],
  'walk-living': ['IMG_1175', 0, 30, true],
  'walk-bedroom': ['IMG_1191', 0, 30, true],
  'walk-fields': ['IMG_1194', 0, 30, true],
}

const STILL_WIDTH = 1080
const CLIP_WIDTH = 720

const run = (args) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })

/** What ffmpeg says about a file: its size as shown (after the phone's rotation), length and colour transfer. */
function probe(path) {
  const info = spawnSync(ffmpeg, ['-hide_banner', '-i', path], { encoding: 'utf8' }).stderr
  const video = info.match(/Stream #\d+:\d+[^\n]*Video:[^\n]*?(\d{2,5})x(\d{2,5})/)
  if (!video) throw new Error(`No picture found in ${path}`)
  let [w, h] = [Number(video[1]), Number(video[2])]
  if (/rotation of -?90/.test(info)) [w, h] = [h, w]
  const d = info.match(/Duration: (\d+):(\d+):([\d.]+)/)
  const seconds = d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : 0
  const transfer = /arib-std-b67/.test(info) ? 'arib-std-b67' : /smpte2084/.test(info) ? 'smpte2084' : null
  return { width: w, height: h, seconds, transfer }
}

const album = existsSync(join(albumDir, 'album.json')) ? JSON.parse(readFileSync(join(albumDir, 'album.json'), 'utf8')) : { items: [] }

/** The best copy of a video: the original if the owner supplied it, otherwise the album's reduced copy. */
function video(name) {
  for (const ext of ['MOV', 'mov', 'MP4', 'mp4']) {
    const path = join(sourceDir, `${name}.${ext}`)
    if (existsSync(path)) return { path, ...probe(path) }
  }
  const item = album.items.find((i) => i.filename.toUpperCase().startsWith(`${name.toUpperCase()}.`))
  if (item) {
    console.warn(`  ${name}: original not in media/source, using the reduced album copy`)
    const path = join(albumDir, item.files.main.file)
    return { path, ...probe(path) }
  }
  throw new Error(`${name} is in neither media/source nor media/originals`)
}

/** Scale to `width`, and turn an HDR iPhone video into standard colour so browsers show it as filmed. */
function pictureFilter(src, width) {
  const target = Math.min(width, src.width)
  const scale = `scale=${target}:-2:flags=lanczos`
  if (!src.transfer) return `${scale},format=yuv420p`
  return [
    scale,
    `zscale=tin=${src.transfer}:min=bt2020nc:pin=bt2020:t=linear:npl=100`,
    'format=gbrpf32le',
    'zscale=p=bt709',
    'tonemap=tonemap=hable:desat=0',
    'zscale=t=bt709:m=bt709:r=tv',
    'format=yuv420p',
  ].join(',')
}

// Start clean, so a file dropped from the lists above does not linger on the site.
rmSync(photosOut, { recursive: true, force: true })
rmSync(videosOut, { recursive: true, force: true })
mkdirSync(photosOut, { recursive: true })
mkdirSync(videosOut, { recursive: true })
const sizes = { photos: {}, videos: {} }

for (const [name, file] of Object.entries(PHOTOS)) {
  const path = join(sourceDir, file)
  if (!existsSync(path)) throw new Error(`Photo for "${name}" not found: media/source/${file}`)
  copyFileSync(path, join(photosOut, `${name}.jpg`))
  const { width, height } = probe(path)
  sizes.photos[name] = { width, height }
}
console.log(`${Object.keys(PHOTOS).length} photos copied`)

for (const [name, [clip, at]] of Object.entries(STILLS)) {
  const src = video(clip)
  const t = Math.min(Math.max(at * src.seconds, 0.05), src.seconds - 0.2).toFixed(2)
  const out = join(photosOut, `${name}.jpg`)
  run(['-ss', t, '-i', src.path, '-frames:v', '1', '-vf', pictureFilter(src, STILL_WIDTH), '-q:v', '3', out])
  sizes.photos[name] = { width: probe(out).width, height: probe(out).height }
}
console.log(`${Object.keys(STILLS).length} stills taken from the videos`)

for (const [name, [clip, start, length, sound]] of Object.entries(CLIPS)) {
  const src = video(clip)
  const out = join(videosOut, `${name}.mp4`)
  const filter = `fps=30,${pictureFilter(src, CLIP_WIDTH)}`
  run([
    '-ss', String(start), ...(length ? ['-t', String(length)] : []),
    '-i', src.path,
    '-map', '0:v:0', ...(sound ? ['-map', '0:a:0?', '-c:a', 'aac', '-b:a', '96k'] : ['-an']),
    '-vf', filter,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', name === 'hero' ? '25' : '24', '-maxrate', '2.5M', '-bufsize', '5M',
    '-profile:v', 'high', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-movflags', '+faststart',
    out,
  ])
  // A poster for each clip, so a slot shows a picture before the video loads.
  run(['-ss', String(start + 0.5), '-i', src.path, '-frames:v', '1', '-vf', pictureFilter(src, CLIP_WIDTH), '-q:v', '3', join(videosOut, `${name}.jpg`)])
  sizes.videos[name] = { width: probe(out).width, height: probe(out).height }
  console.log(`  clip ${name} done`)
}

writeFileSync(sizesFile, JSON.stringify(sizes, null, 2) + '\n')
console.log(`Sizes written to src/content/mediaSizes.json`)

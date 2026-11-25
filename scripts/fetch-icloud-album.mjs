// Downloads every photo and video from a public iCloud shared album ("photos.icloud.com/shared/album/<key>") into
// media/originals/, and writes media/originals/album.json describing them.
//
//   npm run media:fetch                      the Hikka Hills album
//   npm run media:fetch -- <album url|key>   another album
//   npm run media:fetch -- --dump            also writes the raw API answers to media/originals/raw.json
//
// It asks the same public CloudKit endpoints the iCloud web page uses, without signing in. Shared album links expire
// (this one on 24 Dec 2026); after that, ask for a new link. The originals are not served to visitors: see
// scripts/prepare-media.mjs for the web copies in public/media.
//
// A public link only gives Apple's reduced copies (videos at 360 x 640, photos at 480 x 360), whatever the phone
// recorded. For full resolution, export the originals from the Photos app and put them in public/media by hand.
import { mkdir, writeFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const DEFAULT_ALBUM = '0fexQBt4ET_2Bq-l2A9cg8dpw'
const args = process.argv.slice(2)
const dump = args.includes('--dump')
const target = args.find((a) => !a.startsWith('--')) ?? DEFAULT_ALBUM
const key = target.split('/').filter(Boolean).pop()
const outDir = join(import.meta.dirname, '..', 'media', 'originals')
const headers = { 'Content-Type': 'text/plain', Origin: 'https://photos.icloud.com', Referer: 'https://photos.icloud.com/' }
const base = 'database/1/com.apple.photos.cloud/production'

async function post(url, body) {
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status} from ${url.split('?')[0]}: ${text.slice(0, 300)}`)
  return JSON.parse(text)
}

// 1. Resolve the short link to its zone, partition and an anonymous access token.
const resolved = await post(
  `https://ckdatabasews.icloud.com/${base}/public/records/resolve?remapEnums=true&getCurrentSyncToken=true&sharing_url_key=${key}`,
  { shortGUIDs: [{ value: key }] },
)
const share = resolved.results?.[0]
if (!share?.zoneID) throw new Error('The album link did not resolve. It may have expired.')
const token = share.anonymousPublicAccess?.token
const partition = share.anonymousPublicAccess?.databasePartition ?? 'https://p124-ckdatabasews.icloud.com:443'
if (!token) {
  console.error('No anonymous access token in the answer. Keys seen:', Object.keys(share))
  process.exit(1)
}
const host = partition.replace(/:443$/, '')
const qs = `remapEnums=true&getCurrentSyncToken=true&sharing_url_key=${key}&publicAccessAuthToken=${encodeURIComponent(token)}`
const zoneID = share.zoneID

// 2. List the assets (CPLAsset) and their masters (CPLMaster, which carry the downloadable resources).
const records = []
for (let rank = 0; ; ) {
  const page = await post(`${host}/${base}/shared/records/query?${qs}`, {
    query: {
      recordType: 'CPLAssetAndMasterByAddedDate',
      filterBy: [
        { fieldName: 'direction', comparator: 'EQUALS', fieldValue: { value: 'ASCENDING', type: 'STRING' } },
        { fieldName: 'startRank', comparator: 'EQUALS', fieldValue: { value: rank, type: 'INT64' } },
      ],
    },
    zoneID,
    resultsLimit: 200,
  })
  const got = page.records ?? []
  records.push(...got)
  const assets = got.filter((r) => r.recordType === 'CPLAsset').length
  if (assets === 0 || got.length < 200) break
  rank += assets
}
await mkdir(outDir, { recursive: true })
if (dump) await writeFile(join(outDir, 'raw.json'), JSON.stringify({ share, records }, null, 1))

const masters = new Map(records.filter((r) => r.recordType === 'CPLMaster').map((r) => [r.recordName, r]))
const assets = records.filter((r) => r.recordType === 'CPLAsset')
const decode = (f) => (f?.value ? Buffer.from(f.value, 'base64').toString('utf8') : undefined)

// The biggest resource of each kind wins. Videos: the full-resolution render (resVidFullRes) if the album has one,
// otherwise the original. Photos: the original (HEIC is converted later), plus the full-size JPEG when there is one.
function resources(fields) {
  return Object.entries(fields)
    .filter(([, f]) => f?.value?.downloadURL)
    .map(([name, f]) => ({
      name,
      url: f.value.downloadURL,
      size: f.value.size,
      width: fields[name.replace(/Res$/, 'Width')]?.value,
      height: fields[name.replace(/Res$/, 'Height')]?.value,
      type: fields[name.replace(/Res$/, 'FileType')]?.value,
    }))
}

const items = []
let index = 0
for (const asset of assets) {
  const masterName = asset.fields.masterRef?.value?.recordName
  const master = masters.get(masterName)
  if (!master) continue
  index += 1
  const fields = { ...master.fields, ...asset.fields }
  const all = resources(fields)
  const isVideo = (master.fields.itemType?.value ?? '').includes('movie') || all.some((r) => r.name.startsWith('resVid'))
  const pick = (names) => names.map((n) => all.find((r) => r.name === n)).find(Boolean)
  const main = isVideo
    ? pick(['resVidFullRes', 'resOriginalVidComplRes', 'resOriginalRes', 'resVidMedRes'])
    : pick(['resJPEGFullRes', 'resOriginalRes', 'resJPEGMedRes'])
  const poster = pick(['resJPEGFullRes', 'resJPEGMedRes', 'resJPEGThumbRes'])
  const filename = decode(master.fields.filenameEnc) ?? `${masterName}`
  const stem = String(index).padStart(2, '0') + '-' + filename.replace(/\.[^.]+$/, '')
  const item = {
    index,
    filename,
    kind: isVideo ? 'video' : 'photo',
    durationMs: asset.fields.duration?.value,
    takenAt: asset.fields.assetDate?.value,
    resources: all.map(({ url: _url, ...r }) => r),
    files: {},
  }
  for (const [role, res] of [['main', main], ['poster', poster]]) {
    if (!res) continue
    const ext = res.name.startsWith('resJPEG') ? 'jpg' : (filename.split('.').pop() ?? 'bin').toLowerCase()
    const file = `${stem}${role === 'poster' ? '.poster' : ''}.${role === 'main' && isVideo && res.name.startsWith('resVid') ? 'mov' : ext}`
    const path = join(outDir, file)
    const existing = await stat(path).catch(() => null)
    if (!existing || existing.size !== res.size) {
      const dl = await fetch(res.url.replace('${f}', encodeURIComponent(file)))
      if (!dl.ok) throw new Error(`${dl.status} downloading ${file}`)
      await writeFile(path, Buffer.from(await dl.arrayBuffer()))
    }
    item.files[role] = { file, resource: res.name, width: res.width, height: res.height, size: res.size }
  }
  items.push(item)
  console.log(`${stem}  ${item.kind}  ${item.files.main?.resource} ${item.files.main?.width}x${item.files.main?.height}`)
}

await writeFile(join(outDir, 'album.json'), JSON.stringify({ key, fetchedAt: new Date().toISOString(), items }, null, 2))
console.log(`${items.length} items saved in media/originals`)

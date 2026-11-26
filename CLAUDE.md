# Hikka Hills — villa website

One-page marketing site for Hikka Hills, a private villa in Hikkaduwa, Sri Lanka. Built from the approved design
`Hikka Hills.pdf` (desktop, mobile, gallery lightbox and mobile menu artboards). The only backend is `backend/`, a small
Laravel 13 API that emails booking enquiries (its own `backend/CLAUDE.md` has the details).

## Stack
The same libraries as `C:\Gift\custom-gifting-platform\frontend`, at the same versions:
- React 19 + TypeScript, built with Vite
- Tailwind CSS v4 (design tokens in `src/index.css` under `@theme`), `lucide-react` icons, `clsx` (`lib/cn.ts`)
- `react-router-dom` v7 (one page plus a not-found page; menu links are `/#section`)
- Fonts from Fontsource: Cormorant Garamond (serif) and Jost (sans), as in the design
- Playwright (`@playwright/test`, pinned to 1.65.0 to use the browsers already installed) for end-to-end tests
- `oxlint` for linting
- Dev only: `ffmpeg-static`, used by the media scripts. Never shipped to visitors.
- Backend: Laravel 13 on PHP 8.3+ (`C:php`), as the gifting platform's backend. No database.

## Commands
- `npm run dev` — dev server at http://localhost:5173 (also on the local network, for phones). Forwards `/api` to the backend on port 8000 (`API_PROXY_TARGET` changes it)
- `npm run dev:api` — the backend (`php artisan serve`) at http://127.0.0.1:8000. Run it beside `npm run dev` to send enquiries locally (mail goes to `backend/storage/logs/laravel.log`)
- `npm run build` — type-check and production build into `dist/`
- `npm run lint` — lint
- `npm run test:e2e` — Playwright, desktop Chrome and a Pixel 7. Starts its own dev server on port 5174 (`E2E_PORT` changes it). Fakes the backend's answers, so it does not need it running
- `npm run test:api` — the backend's PHPUnit tests
- `npm run media:fetch` — downloads the owner's shared iCloud album into `media/originals/` (git-ignored). Takes another album link or key as an argument; `--dump` also saves the raw API answers
- `npm run media:prepare` — makes the web copies in `public/media/` and `src/content/mediaSizes.json` from the owner's files in `media/source/` (see Media). Takes about 10 minutes, mostly decoding the 4K videos

## Structure
```
src/
  app/        App (router provider), router, Root (scrolls to the "#section" in the address on every navigation)
  layouts/    SiteLayout: skip link, Header, main, Footer
  features/
    home/     HomePage and its sections, in the design's order: Hero, Retreat, VillaTour, Experience, Accommodation, Location
    gallery/  GallerySection (filters, masonry) and Lightbox (keys, swipe, focus kept inside, focus returned on close)
    booking/  BookingSection, EnquiryForm; lib/enquiry.ts (validation, text), lib/submitEnquiry.ts (where an enquiry goes)
    site/     Header, MobileMenu, Footer, ContactLines
  components/
    ui/       Button/ButtonLink, Eyebrow, Pending/Fact ("CONFIRM" markers), Reveal (entrance animation)
    shared/   MediaFrame (photo, muted in-view video or the design's placeholder), Wordmark
  content/    The words and pictures: villa.ts (facts, tour, experiences, bedrooms, amenities, nearby), gallery.ts, media.ts
  config/     routes.ts (section ids, every link, the menu), site.ts (contact details, social links, map, booking settings)
  hooks/      useInView, useReducedMotion, useScrollLock
  types/      media.ts
public/media/ photos/ and video/, made by `npm run media:prepare`
scripts/      fetch-icloud-album.mjs, prepare-media.mjs
e2e/          home, gallery and booking specs
backend/      Laravel API: POST /api/enquiries, emails to the owner and the guest (see backend/CLAUDE.md)
```

## Conventions
- Function components and hooks only; no `any`. Import with the `@/` alias (maps to `src/`).
- Links use `config/routes.ts`; never hard-code a path or "#id" in a component.
- Colours and fonts come from the theme tokens (`forest-*`, `sand-*`, `cream`, `linen`, `umber`, `brass`, `ink`, `muted`, `line`, ...). No hex values in components.
- Content lives in `src/content/` and `src/config/site.ts`, not in components. **A `null` value means "not confirmed by the owner"**: the page shows a `CONFIRM` marker (`components/ui/Pending`, or `[PHONE]`-style markers on the green bands) until it is filled in. Never invent a fact (bedroom count, distances, amenities, prices) to fill one.
- **The villa has no swimming pool** (confirmed by the owner, 24 Nov 2026). The design's pool slots were replaced: tour 02 is "The veranda", the "Swimming pool" key fact is "Outdoors: Veranda and garden", and the "Poolside" experience and the gallery's Pool filter are gone. Never add pool wording or imagery; `e2e/home.spec.ts` checks the page never says "pool".
- Every marker carries `data-pending`, so `document.querySelectorAll('[data-pending]')` lists what is still open on the page.
- Motion uses only transform and opacity and stops under `prefers-reduced-motion` (`motion-safe:` variants; videos stay on their poster).
- Do not edit source files with PowerShell `Get-Content`/`Set-Content`: Windows PowerShell 5.1 reads UTF-8 as ANSI (it turned "©" into "Â©") and writes a BOM. Use the editor tools or Node.
- Every user-facing feature gets a Playwright spec in `e2e/`.

## Media
- **Source: `media/source/`** (git-ignored, about 3 GB), supplied by the owner on 25 Nov 2026: 15 iPhone walk-through videos (`IMG_1165` to `IMG_1194`, 4K, 60 fps, HDR HLG, 10-bit HEVC) and 82 photos sent over WhatsApp (1280 px on the long side; two sets, an older camera set and a brighter phone set).
- `scripts/prepare-media.mjs` decides what goes where: `PHOTOS` (the chosen WhatsApp photos, copied without recompressing, under readable names), `STILLS` (frames from the videos, 1080 × 1920) and `CLIPS` (720 × 1280, 30 fps, H.264, with posters). The HDR videos are tone-mapped to standard colour (zscale + Hable, which matched Apple's own SDR copy best); without that they look washed out in browsers. It writes every file's size to `src/content/mediaSizes.json`, which `content/media.ts` reads, so a name used there must exist in the script.
- About 44 of the 82 photos are used; the rest are near-duplicates or detail shots. To use another, add it to `PHOTOS`, run the script, then name it in `content/media.ts`.
- `IMG_1164` (the walk up the drive) is not in `media/source`; the hero clip is now `IMG_1165`, which opens on the front of the house. The script falls back to the reduced iCloud album copy (`media/originals`, from `npm run media:fetch`, link expires 24 Dec 2026) for any video missing from `media/source`.
- `cottage-dusk` and `cottage-porch` show a separate, smaller building on the grounds (lit porch at dusk), not the main bungalow; their captions say so.
- `MediaFrame` shows a portrait frame in a wide slot whole, over a blurred copy of itself (only the "Views" panorama does this now).
- Every slot has a real picture; no "Photograph to come" placeholder remains (`e2e/home.spec.ts` checks it).

## Open questions for the owner (each is a `null` today)
Intro copy in their words; bedroom count, names, beds, sleeps, sizes and bathrooms (the photos show several rooms, including one with a single bed and one with two beds; the design has two cards); guest capacity; meals and whether a cook is available; amenities (the photos show air conditioning units, ceiling fans and a kitchen, but the owner should confirm what guests get); check-in and out times; phone, WhatsApp, email, full address; response time; Instagram and Facebook links; distances to the beach, the national park, Galle Fort and the airport; the exact map pin; the inbox enquiries go to (`ENQUIRY_TO`) and the account that sends them (`MAIL_*`), both in `backend/.env`.

## Enquiries
`features/booking/lib/submitEnquiry.ts` is the single hook the design asks for. `site.booking.channel` chooses: `api` (today) posts the enquiry to the backend (`site.booking.endpoint`: `VITE_API_URL` + `/api/enquiries`, or the site's own `/api` when that is empty), which checks it again, writes it to its log and emails it to the owner (Reply-To the guest) with a short copy to the guest; `whatsapp` opens WhatsApp with the enquiry typed out (needs `contact.whatsapp`); `email` opens the visitor's mail app (needs `contact.email`); `none` checks the form and says nothing was sent.

The form only reads the hook's result: `sent` (with a reference), `handed-off`, `not-connected` (also what the backend answers until `ENQUIRY_TO` is set, so the page keeps its CONFIRM marker), `invalid` (backend field errors, shown under the fields) or `failed` (an alert above the button; the form keeps what was typed). The form has a hidden `website` field as a spam trap. The backend's checks repeat `lib/enquiry.ts` with the same wording: change both together.

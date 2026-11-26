# Hikka Hills

The website for Hikka Hills, a private villa in Hikkaduwa, Sri Lanka.

```
npm install
npm run dev        # http://localhost:5173
npm run build      # production files in dist/
npm run test:e2e   # end-to-end tests
```

`dist/` is a static site: any static host works (Netlify, Vercel, Cloudflare Pages, S3). Serve `index.html` for
unknown paths so the not-found page shows.

Booking enquiries are emailed by the small Laravel API in `backend/` (PHP 8.3+). Locally, run `npm run dev:api` beside
`npm run dev`; see `backend/README.md` to set it up and `backend/CLAUDE.md` to put it live. Build the site with
`VITE_API_URL` set to the API's address when it is not served under the site's own `/api`.

To fill in the details still marked **CONFIRM** on the page, edit `src/config/site.ts` and the files in `src/content/`.
See `CLAUDE.md` for how the project is put together and how the photographs are made.

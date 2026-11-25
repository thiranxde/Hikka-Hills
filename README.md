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

To fill in the details still marked **CONFIRM** on the page, edit `src/config/site.ts` and the files in `src/content/`.
See `CLAUDE.md` for how the project is put together and how the photographs are made.

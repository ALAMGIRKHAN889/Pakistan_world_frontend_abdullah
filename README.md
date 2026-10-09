# Products World — Frontend

React 19 + Vite storefront and admin panel for Products World. Talks to the separate
`products-world-backend` API.

## Run locally
```bash
npm install
cp .env.example .env     # optional – only needed if your backend is not on :5000
npm run dev              # http://localhost:5173
```
Start the backend first (see its README) — requests to `/api` and `/uploads` are proxied to it.

## Deploy on Vercel
1. Push this repo to GitHub → Vercel → **Add New Project** → import it (Vite is detected automatically).
2. **Settings → Environment Variables:** add `VITE_API_URL` = `https://<your-backend>.vercel.app/api`
3. Deploy. (Env vars are baked in at build time — after changing one, redeploy.)

## Build for production
```bash
VITE_API_URL=https://your-backend.example.com/api npm run build   # output in dist/
```
Deploy `dist/` to Vercel / Netlify / any static host. `vercel.json` and `public/_redirects`
already make page refreshes work on `/shop`, `/admin`, etc.
On the backend, add your site's address to `CLIENT_URL` so CORS allows it.

## What's new in this version
- Transparent Products World logo (with a separate night-mode version), favicon + Apple touch icon.
- Day / Night mode: toggle in the header, mobile menu and admin sidebar. Remembers the choice,
  follows the phone/computer setting on first visit, no white flash on load.
- Search box lives inside the header (and at the top of the mobile menu) – it no longer drops below.

## Theme notes
Colours are CSS variables in `src/index.css` (`:root` = day, `:root[data-theme="dark"]` = night).
Use `var(--white)`, `var(--ink)`, `var(--line)` … instead of hard-coded colours so new UI follows the theme.

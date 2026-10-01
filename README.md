# GeoRepute landing page (portfolio)

A single-page, English-only, front-end-only version of the GeoRepute marketing site. No backend, database or
third-party services.

- Next.js (App Router), plain CSS, three.js (`@react-three/fiber`) for the 3D network background, GSAP and Lenis for scroll motion.
- The home page is composed in `components/pages/HomePage.tsx` from sections in `components/sections/`. Add or remove a
  section there; sections not listed there are not rendered. The 3D camera and the scroll rail follow the sections on the page.
- Copy lives in `lib/content.ts` and the `en` pack in `lib/i18n.ts`.

```bash
npm install
npm run dev
```

`NEXT_PUBLIC_SITE_URL` is optional (canonical, share and sitemap URLs); see `.env.example`.

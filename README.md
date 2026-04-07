# daftscientist.dev

Personal portfolio site for Leo Johnston Mesia. Built with Next.js, statically exported, and deployed on Cloudflare Pages.

## Stack

- **Framework**: Next.js 15 (App Router, `output: 'export'`)
- **Styling**: Plain CSS (`app/globals.css`)
- **Map**: Leaflet (loaded client-side via `dynamic`)
- **Deployment**: Cloudflare Pages

## Backend

The site calls [daft-api](https://api.daftscientist.dev) for:
- `GET /spotify/now-playing` — current or last played track
- `POST /suggestions` — song suggestions from visitors

## Local dev

```bash
npm install
npm run dev       # http://localhost:3000
```

## Build & deploy

Cloudflare Pages runs `npm run build` on push to `main`. Output directory is `out`.

## Project structure

```
app/
  layout.tsx          # Root layout, metadata, fonts
  globals.css         # All styles
  page.tsx            # Home route
  terminal/page.tsx   # /terminal easter egg
components/
  HomePage.tsx        # Main page component
  TerminalPage.tsx    # Terminal UI
  MapSection.tsx      # Leaflet map (client-only)
public/
  assets/
    figure.svg        # Site mascot/figure
    logo-mark.png     # Brand mark
  favicon.png
```

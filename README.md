# Smart Mirror

Svelte/Vite kiosk UI for the Raspberry Pi mirror.

The Pi serves the built frontend from `~/Smart-Mirror/dist` through the
`eip-platform` Flask app at `/mirror/`.

## Run locally

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

## Build

```bash
npm run build
```

The production build is written to `dist/` with Vite base path `/mirror/`.

## Data contract

The frontend polls:

```text
/mirror/api/data
```

Expected shape:

```json
{
  "goals": [],
  "calendar": [],
  "mirror_notes": [],
  "last_updated": null,
  "error": null
}
```

Runtime data lives on the Pi at:

```text
~/mirror-data/mirror.json
```

Update mirror content by copying a new JSON file to that path. No Notion,
Canvas, iCal, or frontend rebuild is required for data-only updates.

## Navigation

- Arrow right/down: next panel
- Arrow left/up: previous panel
- `R`: refresh local mirror data immediately
- Two minutes of inactivity: return to Home

Panels: Home, Focus, Today, Week, Month.

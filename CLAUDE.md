# CLAUDE.md — Smart-Mirror

## What This Is
Svelte/Vite kiosk UI for a Raspberry Pi mirror host.

The app compiles to static `dist/`, served by `eip-platform` at `/mirror/`.
The browser kiosk is launched from the Pi login shell (`~/.profile`)
with cage + Chromium pointed at `http://localhost:5000/mirror/`.

## Current Architecture

- `src/App.svelte` owns the shell: background, topbar, active panel, notes/status
  strip, keyboard navigation, and inactivity return-to-home.
- Page components are bounded panels. They do not own global fixed chrome,
  full-screen overlays, or app-level z-index.
- `src/lib/store.js` polls `/mirror/api/data` every 15 seconds.
- `src/lib/calendar.js` owns local-date-safe calendar helpers.
- Runtime data is local Pi JSON, not Notion/Canvas/iCal.

## Data Contract

Frontend expects:

```json
{
  "goals": [],
  "calendar": [],
  "mirror_notes": [],
  "last_updated": null,
  "error": null
}
```

Backend source path on Pi:

```text
~/mirror-data/mirror.json
```

Data-only updates should push JSON to that file. Code/UI updates rebuild and
copy `dist/`.

## Files

| File | What / Why |
|------|------------|
| `src/App.svelte` | Persistent shell + panel routing |
| `src/components/Home.svelte` | Large ambient clock, weather, quote, quick next/notes |
| `src/components/Goals.svelte` | Focus board grouped by horizon |
| `src/components/DailySchedule.svelte` | Today timeline |
| `src/components/WeeklySchedule.svelte` | Seven-day card grid |
| `src/components/MonthlyCalendar.svelte` | Month grid + selected-day detail |
| `src/components/ui/AnimatedClock.svelte` | Shared clock/date renderer |
| `src/lib/store.js` | Single API polling store |
| `src/lib/calendar.js` | Date/event helpers |

## Design Rules

- Dark ambient dashboard; no scroll, no visible cursor.
- One shell owns page transitions; page components stay inside their panel box.
- Avoid overlay stacks that transform whole pages over one another.
- Keep kiosk-friendly text large, sparse, and glanceable.
- Use local dates (`dateKey`) instead of UTC slicing for today/week/month logic.

## Commands

```bash
npm install
npm run build
```

Deploy built assets to:

```text
~/Smart-Mirror/dist
```

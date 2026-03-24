# CLAUDE.md — Smart-Mirror

## Context Loading
Read these Notion pages before starting work (use Notion MCP):
- **Core Context:** `32c062d6840b81388422e7452c1c5437` — who the user is, interaction style, active goals
- **Smart Mirror Project Doc:** `32c062d6840b8105a80ad51d36bf6e92` — full architecture, decisions, open items
- **Handoff Notes:** `32c062d6840b81deb1b0f1037da6e57a` — where we left off

## This Repo
Svelte frontend for the Smart Mirror kiosk. Compiles to static dist, served by the mirror Blueprint in `eip-platform`.

Build: `npx vite build` (output: `dist/`)
Base path: `/mirror/` (set in `vite.config.js`)
API calls: go through `src/lib/api.js` → `API_BASE = '/mirror/api'`
No router library — state-based page switching in `App.svelte`
Navigation: arrow keys, 2min inactivity → Home

## Pages
- `src/components/Home.svelte` — clock, weather, quote
- `src/components/Dashboard.svelte` — goals, calendar strip, mirror notes sticky
- `src/components/Calendar.svelte` — vertical timeline

## Key Files
- `src/lib/api.js` — API base path (change here if platform prefix changes)
- `src/lib/weather.js` — Open-Meteo, coords hardcoded (Livingston NJ)
- `src/lib/quotes.js` — 30 quotes, date-seeded
- `src/lib/navigation.js` — keyboard handler + inactivity tracker
- `src/lib/time.js` — clock store, updates every second

## After Changes
1. `npx vite build`
2. Restart kiosk: `sudo kill -9 $(pgrep cage)` (autologin respawns)
3. Or restart platform: `sudo systemctl restart eip-platform`

## Conventions
- Dark theme only (background #000, text #e0e0e0)
- Responsive clamp() for font sizes
- No external CSS frameworks
- Commit messages: short, imperative

## Working Style
- User skims — keep explanations short, give exact commands
- Ask before destructive changes
- If updating Notion after a session: write to Handoff Notes and Smart Mirror project doc

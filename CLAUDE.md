# CLAUDE.md — Smart-Mirror

## Context Loading
Read these Notion pages before starting work (use Notion MCP):
- **Core Context:** `32c062d6840b81388422e7452c1c5437` — who the user is, interaction style, active goals
- **Smart Mirror Project Doc:** `32c062d6840b8105a80ad51d36bf6e92` — full architecture, decisions, open items
- **Handoff Notes:** `32c062d6840b81deb1b0f1037da6e57a` — where we left off

## What This Is
Svelte SPA kiosk on a Raspberry Pi (rasplient, 100.66.29.15), cage/wayland kiosk mode. No mouse, no scroll. Compiles to static `dist/`, served by the mirror Blueprint in `eip-platform`. Frontend never talks to Notion directly — all data comes from one Flask polling endpoint.

## Build & Deploy
```bash
cd ~/Smart-Mirror && npx vite build
sudo kill -9 $(pgrep cage)   # autologin respawns kiosk
# or: sudo systemctl restart eip-platform
```
Base path: `/mirror/` (vite.config.js). API: `/mirror/api` (src/lib/api.js).

## Pages (5, arrow keys cycle, 2-min inactivity → Home)

| # | File | Content |
|---|------|---------|
| 0 | `Home.svelte` | Weather + daily quote. Clock rendered by App.svelte, not this component. |
| 1 | `Goals.svelte` | Daily/Weekly/Monthly Notion goals + Mirror Notes sticky note. |
| 2 | `DailySchedule.svelte` | Hour-by-hour grid (7 AM–10 PM), events as absolute-positioned blocks. |
| 3 | `WeeklySchedule.svelte` | 7-column week grid, recurring classes filtered by `days` property. |
| 4 | `MonthlyCalendar.svelte` | Calendar grid (left 2/3) + day detail panel (right 1/3). Starts from first Monday of month. |

## Key Design Decisions

**Persistent clock in App.svelte** — single `AnimatedClock` instance, never unmounts. Positioned entirely via CSS `transform` so the browser animates position + scale in one transition:
```
Home:   transform: translate(50vw, 30vh) translateX(-50%)
Corner: transform: translate(calc(100vw - 2rem), 1.5rem) scale(0.22) translateX(-100%)
```
Why: avoids remounting (no flash), single source of truth for time display.

**Single data store** — `src/lib/store.js` polls `/mirror/api/data` every 60s. All pages read from `$mirrorData`. No component fetches independently.

## File Map

### `src/components/ui/` — shared widgets
| File | What / Why |
|------|-----------|
| `AnimatedClock.svelte` | Time + date with minute-tick fade animation. Props: `align`, `timeSize`, `dateSize`, `showDate`. Only instantiated once in App.svelte. |
| `StickyNote.svelte` | Post-it style note block. Caveat handwriting font, yellow background, sharp corners, tape strip. Props: `notes: string[]`, `max: number`. |

### `src/lib/` — utilities
| File | What / Why |
|------|-----------|
| `api.js` | `API_BASE` — one place to change if platform prefix moves |
| `store.js` | `mirrorData` writable store + polling loop |
| `calendar.js` | `eventsOnDate()`, `fmtTime()`, `fmtHour()`, `WEEK_ORDER` — all schedule filtering |
| `time.js` | `time` readable store (1s tick), `formatTime`, `formatDateLong` |
| `navigation.js` | Arrow key listener + inactivity tracker |
| `weather.js` | Open-Meteo fetch, 30-min cache. Coords: Livingston NJ (40.79, -74.32) |
| `quotes.js` | 30 stoic quotes, date-seeded (rotates daily) |

## Conventions
- Dark theme: bg `#000`, text `#e0e0e0`, accent `#4fc3f7`
- All font sizes via `clamp()` — no hardcoded px
- `tabular-nums` on clock elements (prevents layout shift)
- No CSS frameworks, no router library
- Page components own content only — App.svelte owns chrome (clock, dots, transitions)
- Commit: short, imperative

## Do Not Touch
`.profile`, kiosk boot flow, nocursor.so, systemd services, cage config.

## Working Style
- User skims — short answers, exact commands
- Ask before destructive changes
- After sessions: update Handoff Notes + Smart Mirror project doc in Notion

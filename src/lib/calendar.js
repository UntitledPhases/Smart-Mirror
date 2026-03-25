/**
 * Shared calendar utilities — event filtering and time formatting.
 * Used by DailySchedule, WeeklySchedule, and MonthlyCalendar.
 */

export const DAY_NAMES  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEK_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Returns true if `event` should appear on `dateStr` (YYYY-MM-DD).
 * Handles both recurring events (days[] property) and one-off events.
 */
export function eventOnDate(evt, dateStr) {
  if (!evt.when?.start) return false;
  const start = evt.when.start.slice(0, 10);
  const end   = evt.when.end ? evt.when.end.slice(0, 10) : start;
  const inRange = start <= dateStr && dateStr <= end;

  if (evt.days?.length > 0) {
    const dayName = DAY_NAMES[new Date(dateStr + 'T12:00:00').getDay()];
    return inRange && evt.days.includes(dayName);
  }
  return start === dateStr;
}

/**
 * Filter and enrich events for a given date string.
 * Returns events sorted by start time, with `startH` and `endH` as
 * fractional hours (e.g. 14.5 = 2:30 PM) for timeline positioning.
 */
export function eventsOnDate(events, dateStr) {
  return events
    .filter(e => eventOnDate(e, dateStr))
    .map(e => {
      const startH = _toFractionalHour(e.start_time) ?? _dtFractionalHour(e.when?.start);
      const endH   = _toFractionalHour(e.end_time)   ?? _dtFractionalHour(e.when?.end);
      return { ...e, startH, endH };
    })
    .sort((a, b) => (a.startH ?? Infinity) - (b.startH ?? Infinity));
}

/**
 * Format a "HH:MM" string to a readable time like "2:30 PM".
 */
export function fmtTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Format a fractional hour (e.g. 14.5) to "2:30 PM".
 */
export function fmtHour(h) {
  if (h == null) return '';
  const hours = Math.floor(h);
  const mins  = Math.round((h % 1) * 60);
  const d = new Date();
  d.setHours(hours, mins, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function _toFractionalHour(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h + m / 60;
}

function _dtFractionalHour(isoString) {
  if (!isoString?.includes('T')) return null;
  const d = new Date(isoString);
  return d.getHours() + d.getMinutes() / 60;
}

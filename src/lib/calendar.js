/**
 * Calendar/date utilities shared by mirror panels.
 */

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEK_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function weekDates(refDate) {
  const monday = startOfWeek(refDate);
  return WEEK_ORDER.map((name, i) => {
    const date = addDays(monday, i);
    return { name, date, key: dateKey(date), day: date.getDate() };
  });
}

export function monthGrid(refDate) {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const first = new Date(year, month, 1, 12);
  const start = startOfWeek(first);
  const cells = [];

  for (let i = 0; i < 42; i += 1) {
    const date = addDays(start, i);
    cells.push({
      date,
      key: dateKey(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
    });
  }

  return { year, month, label: `${MONTH_NAMES[month]} ${year}`, cells };
}

export function eventOnDate(evt, key) {
  if (!evt?.when?.start) return false;

  const start = String(evt.when.start).slice(0, 10);
  const end = evt.when.end ? String(evt.when.end).slice(0, 10) : start;
  const inRange = start <= key && key <= end;

  if (Array.isArray(evt.days) && evt.days.length > 0) {
    const dayName = DAY_NAMES[new Date(`${key}T12:00:00`).getDay()];
    return inRange && evt.days.includes(dayName);
  }

  return start === key;
}

export function eventsOnDate(events, key) {
  return (events || [])
    .filter(e => eventOnDate(e, key))
    .map(e => {
      const startH = toFractionalHour(e.start_time) ?? datetimeHour(e.when?.start);
      const endH = toFractionalHour(e.end_time) ?? datetimeHour(e.when?.end);
      return { ...e, startH, endH };
    })
    .sort((a, b) => (a.startH ?? 99) - (b.startH ?? 99) || String(a.event).localeCompare(String(b.event)));
}

export function upcomingEvents(events, fromDate = new Date(), limit = 5) {
  const days = [];
  for (let i = 0; i < 21; i += 1) {
    const date = addDays(fromDate, i);
    const key = dateKey(date);
    for (const evt of eventsOnDate(events, key)) {
      days.push({ ...evt, date, key });
    }
  }
  return days.slice(0, limit);
}

export function fmtTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = String(hhmm).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function fmtHour(h) {
  if (h == null || Number.isNaN(h)) return '';
  const hours = Math.floor(h);
  const mins = Math.round((h % 1) * 60);
  const d = new Date();
  d.setHours(hours, mins, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function eventTimeLabel(evt) {
  if (evt.start_time) {
    return `${fmtTime(evt.start_time)}${evt.end_time ? ` – ${fmtTime(evt.end_time)}` : ''}`;
  }
  if (evt.when?.start?.includes('T')) {
    return new Date(evt.when.start).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return 'All day';
}

function toFractionalHour(hhmm) {
  if (!hhmm) return null;
  const [h, m] = String(hhmm).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h + m / 60;
}

function datetimeHour(isoString) {
  if (!isoString?.includes('T')) return null;
  const d = new Date(isoString);
  return d.getHours() + d.getMinutes() / 60;
}

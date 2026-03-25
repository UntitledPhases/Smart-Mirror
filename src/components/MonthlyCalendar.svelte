<script>
  import { time } from '../lib/time.js';
  import { mirrorData } from '../lib/store.js';
  import { eventsOnDate, fmtTime } from '../lib/calendar.js';

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  let selectedDate = null;

  function getMonthGrid(refDate) {
    const year = refDate.getFullYear();
    const month = refDate.getMonth();
    const rawFirst = new Date(year, month, 1).getDay();
    const firstDay = (rawFirst + 6) % 7;           // 0=Mon … 6=Sun
    const firstMonday = 1 + (7 - firstDay) % 7;   // first Monday in month (may be 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let d = firstMonday; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return { year, month, cells, firstMonday };
  }

  function ds(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  $: now         = $time.now;
  $: todayStr    = now.toISOString().slice(0, 10);
  $: grid        = getMonthGrid(now);
  $: displayDay  = selectedDate ?? now.getDate();
  $: displayDs   = ds(grid.year, grid.month, displayDay);
  $: selEvents   = eventsOnDate($mirrorData.calendar || [], displayDs);
  $: calendar    = $mirrorData.calendar || [];
</script>

<div class="monthly-page">
  <header class="header">
    <h1 class="title">{MONTH_NAMES[grid.month]} {grid.year}</h1>
  </header>

  <div class="body">
    <!-- LEFT: calendar grid -->
    <div class="cal-section">
      <div class="cal-grid">
        {#each ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as d}
          <div class="col-header">{d}</div>
        {/each}

        {#each grid.cells as day}
          {@const dateStr   = day ? ds(grid.year, grid.month, day) : null}
          {@const dayEvts   = day ? eventsOnDate(calendar, dateStr) : []}
          {@const isToday   = dateStr === todayStr}
          {@const isSelected = day === displayDay}
          <div class="cal-cell"
            class:today={isToday}
            class:selected={isSelected && !isToday}
            class:empty={!day}
            role="button"
            tabindex={day ? 0 : -1}
            on:click={() => { if (day) selectedDate = (day === selectedDate ? null : day); }}
            on:keydown={e => { if (day && (e.key === 'Enter' || e.key === ' ')) selectedDate = (day === selectedDate ? null : day); }}
          >
            {#if day}
              <span class="day-num">{day}</span>
              {#if dayEvts.length > 0}
                <div class="dots">
                  {#each dayEvts.slice(0, 3) as _}<span class="dot"></span>{/each}
                </div>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <div class="divider"></div>

    <!-- RIGHT: day detail -->
    <div class="detail-section">
      <div class="detail-date">
        <span class="detail-day-num">{displayDay}</span>
        <span class="detail-month">{MONTH_NAMES[grid.month]}</span>
        {#if displayDs === todayStr}<span class="today-badge">Today</span>{/if}
      </div>

      {#if selEvents.length === 0}
        <p class="no-events">No events</p>
      {:else}
        <div class="detail-list">
          {#each selEvents as evt}
            <div class="detail-evt">
              <div class="detail-time">
                {#if evt.start_time}
                  {fmtTime(evt.start_time)}{#if evt.end_time}<br><span class="detail-end">– {fmtTime(evt.end_time)}</span>{/if}
                {:else if evt.when?.start?.includes('T')}
                  {new Date(evt.when.start).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit',hour12:true})}
                {:else}<span class="all-day">All day</span>{/if}
              </div>
              <div class="detail-body">
                <span class="detail-name">{evt.event}</span>
                {#if evt.location}<div class="detail-loc">📍 {evt.location}</div>{/if}
                {#if evt.type}<div class="detail-type">{evt.type}</div>{/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  {#if $mirrorData.error}<div class="error-bar">⚠ {$mirrorData.error}</div>{/if}
</div>

<style>
  .monthly-page {
    padding: 1.5rem 2rem 1rem;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.25rem; flex-shrink: 0; }
  .title  { font-size: clamp(22px, 4vw, 34px); font-weight: 300; }

  .body { display: grid; grid-template-columns: 2fr 1px 1fr; gap: 0 1.5rem; flex: 1; min-height: 0; }

  .divider { background: rgba(255,255,255,0.1); align-self: stretch; }

  .cal-section { display: flex; flex-direction: column; min-height: 0; }

  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }

  .col-header { text-align: center; font-size: clamp(10px, 1.3vw, 13px); font-weight: 600; opacity: 0.35; text-transform: uppercase; letter-spacing: 0.07em; padding-bottom: 0.5rem; }

  .cal-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; aspect-ratio: 1; border-radius: 7px; background: rgba(255,255,255,0.02); cursor: pointer; transition: background 0.15s; gap: 0.15rem; }
  .cal-cell:hover:not(.empty) { background: rgba(255,255,255,0.06); }
  .cal-cell.empty   { background: transparent; cursor: default; pointer-events: none; }
  .cal-cell.today   { background: rgba(79,195,247,0.14); outline: 1px solid rgba(79,195,247,0.4); }
  .cal-cell.selected { background: rgba(255,255,255,0.09); outline: 1px solid rgba(255,255,255,0.25); }

  .day-num { font-size: clamp(13px, 1.8vw, 19px); font-weight: 300; line-height: 1; }
  .today .day-num { color: #4fc3f7; font-weight: 500; }

  .dots { display: flex; gap: 3px; }
  .dot  { width: 4px; height: 4px; border-radius: 50%; background: rgba(79,195,247,0.65); }

  .detail-section { display: flex; flex-direction: column; min-height: 0; overflow: hidden; padding-left: 0.25rem; }

  .detail-date { display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 1.25rem; flex-shrink: 0; }
  .detail-day-num { font-size: clamp(36px, 5vw, 56px); font-weight: 200; line-height: 1; color: #4fc3f7; }
  .detail-month   { font-size: clamp(14px, 1.8vw, 18px); opacity: 0.5; }
  .today-badge    { font-size: clamp(10px, 1.2vw, 12px); color: #4fc3f7; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid rgba(79,195,247,0.4); padding: 0.1rem 0.4rem; border-radius: 3px; }

  .no-events  { opacity: 0.25; font-style: italic; font-size: clamp(13px, 1.6vw, 15px); }
  .detail-list { display: flex; flex-direction: column; gap: 1rem; overflow: hidden; }

  .detail-evt { display: grid; grid-template-columns: 4.5rem 1fr; gap: 0.75rem; align-items: start; }

  .detail-time { font-size: clamp(11px, 1.4vw, 13px); opacity: 0.5; text-align: right; line-height: 1.4; white-space: nowrap; padding-top: 0.1rem; }
  .detail-end { font-size: 0.9em; opacity: 0.8; }
  .all-day    { font-style: italic; }

  .detail-body { display: flex; flex-direction: column; gap: 0.2rem; border-left: 2px solid rgba(79,195,247,0.35); padding-left: 0.65rem; }
  .detail-name { font-size: clamp(13px, 1.8vw, 16px); font-weight: 500; line-height: 1.3; }
  .detail-loc  { font-size: clamp(11px, 1.3vw, 13px); opacity: 0.45; }
  .detail-type { font-size: clamp(10px, 1.1vw, 11px); opacity: 0.3; text-transform: uppercase; letter-spacing: 0.06em; }

  .error-bar { position: fixed; bottom: 2.5rem; left: 50%; transform: translateX(-50%); background: rgba(255,80,80,0.2); color: #ff6b6b; padding: 0.5rem 1.5rem; border-radius: 6px; font-size: 0.85rem; }
</style>

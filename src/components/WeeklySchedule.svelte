<script>
  import { time } from '../lib/time.js';
  import { mirrorData } from '../lib/store.js';
  import { eventsOnDate, fmtTime, WEEK_ORDER } from '../lib/calendar.js';

  function getWeekDates(refDate) {
    const d = new Date(refDate);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const dates = {};
    WEEK_ORDER.forEach((name, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      dates[name] = day.toISOString().slice(0, 10);
    });
    return dates;
  }

  $: now       = $time.now;
  $: todayStr  = now.toISOString().slice(0, 10);
  $: weekDates = getWeekDates(now);
  $: calendar  = $mirrorData.calendar || [];
</script>

<div class="weekly-page">
  <header class="header">
    <h1 class="title">This Week</h1>
  </header>

  <div class="week-grid">
    {#each WEEK_ORDER as dayName}
      {@const dateStr   = weekDates[dayName]}
      {@const dayEvents = eventsOnDate(calendar, dateStr)}
      {@const isToday   = dateStr === todayStr}
      <div class="day-col" class:today={isToday}>
        <div class="day-header">
          <span class="day-name">{dayName}</span>
          <span class="day-num">{new Date(dateStr + 'T12:00:00').getDate()}</span>
        </div>
        <div class="day-events">
          {#if dayEvents.length === 0}
            <span class="no-events">—</span>
          {:else}
            {#each dayEvents as evt}
              <div class="week-evt" class:routine={evt.type === 'Routine'}>
                {#if evt.startH != null}<span class="week-time">{fmtTime(evt.start_time)}</span>{/if}
                <span class="week-name">{evt.event}</span>
                {#if evt.location}<span class="week-loc">{evt.location}</span>{/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    {/each}
  </div>

  {#if $mirrorData.error}<div class="error-bar">⚠ {$mirrorData.error}</div>{/if}
</div>

<style>
  .weekly-page {
    padding: 1.5rem 2rem;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    height: 100vh;
    box-sizing: border-box;
    overflow: hidden;
  }

  .header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.25rem; }
  .title { font-size: clamp(24px, 4vw, 36px); font-weight: 300; }

  .week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.75rem; height: calc(100vh - 7rem); }

  .day-col { display: flex; flex-direction: column; background: rgba(255,255,255,0.03); border-radius: 8px; overflow: hidden; }
  .day-col.today { background: rgba(79,195,247,0.07); outline: 1px solid rgba(79,195,247,0.25); }

  .day-header { display: flex; flex-direction: column; align-items: center; padding: 0.6rem 0.4rem 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.07); }

  .day-name { font-size: clamp(11px, 1.5vw, 14px); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.5; }
  .today .day-name { color: #4fc3f7; opacity: 0.9; }
  .day-num  { font-size: clamp(18px, 2.5vw, 26px); font-weight: 300; line-height: 1.1; }
  .today .day-num  { color: #4fc3f7; }

  .day-events { flex: 1; padding: 0.5rem 0.4rem; display: flex; flex-direction: column; gap: 0.4rem; overflow: hidden; }
  .no-events  { opacity: 0.15; font-size: 0.85rem; text-align: center; padding-top: 0.5rem; }

  .week-evt { display: flex; flex-direction: column; gap: 0.1rem; padding: 0.3rem 0.4rem; background: rgba(255,255,255,0.05); border-radius: 4px; border-left: 2px solid rgba(255,255,255,0.15); }
  .week-evt.routine { border-left-color: rgba(79,195,247,0.4); }

  .week-time { font-size: clamp(10px, 1.2vw, 12px); opacity: 0.5; white-space: nowrap; }
  .week-name { font-size: clamp(11px, 1.4vw, 14px); line-height: 1.2; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .week-loc  { font-size: clamp(9px, 1.1vw, 11px); opacity: 0.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .error-bar { position: fixed; bottom: 2.5rem; left: 50%; transform: translateX(-50%); background: rgba(255,80,80,0.2); color: #ff6b6b; padding: 0.5rem 1.5rem; border-radius: 6px; font-size: 0.85rem; }
</style>

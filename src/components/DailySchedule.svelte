<script>
  import { time } from '../lib/time.js';
  import { mirrorData } from '../lib/store.js';
  import { eventsOnDate, fmtHour } from '../lib/calendar.js';

  const HOUR_START  = 7;
  const HOUR_END    = 22;
  const TOTAL_HOURS = HOUR_END - HOUR_START;
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => HOUR_START + i);

  function toPercent(h)             { return ((h - HOUR_START) / TOTAL_HOURS) * 100; }
  function heightPercent(s, e)      { return Math.max(((( e ?? s + 1) - s) / TOTAL_HOURS) * 100, 1.5); }
  function nowPercent(now) {
    const h = now.getHours() + now.getMinutes() / 60;
    return (h >= HOUR_START && h <= HOUR_END) ? toPercent(h) : null;
  }

  function hrLabel(h) {
    const d = new Date(); d.setHours(h, 0);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true });
  }

  $: now        = $time.now;
  $: todayStr   = now.toISOString().slice(0, 10);
  $: events     = eventsOnDate($mirrorData.calendar || [], todayStr);
  $: nowPct     = nowPercent(now);
  $: curH       = now.getHours() + now.getMinutes() / 60;
</script>

<div class="daily-page">
  <header class="header">
    <h1 class="title">Today</h1>
  </header>

  <div class="grid-wrap">
    <div class="time-col">
      {#each hours as h}
        <div class="hour-label">{hrLabel(h)}</div>
      {/each}
    </div>

    <div class="event-col">
      {#each hours as _, i}
        <div class="hour-line" style="top: {(i / TOTAL_HOURS) * 100}%"></div>
      {/each}

      {#if nowPct !== null}
        <div class="now-line" style="top: {nowPct}%">
          <span class="now-dot"></span>
        </div>
      {/if}

      {#each events as evt}
        {@const top    = toPercent(evt.startH)}
        {@const height = heightPercent(evt.startH, evt.endH)}
        {@const past    = evt.endH != null && curH > evt.endH}
        {@const current = evt.endH != null && curH >= evt.startH && curH <= evt.endH}
        <div class="evt-block"
          class:evt-past={past && !current}
          class:evt-current={current}
          style="top:{top}%; height:{height}%;"
        >
          <span class="evt-name">{evt.event}</span>
          {#if height > 4}
            <span class="evt-range">{fmtHour(evt.startH)}{evt.endH != null ? ' – ' + fmtHour(evt.endH) : ''}</span>
            {#if evt.location}<span class="evt-loc">📍 {evt.location}</span>{/if}
          {/if}
        </div>
      {/each}
    </div>
  </div>

  {#if $mirrorData.error}<div class="error-bar">⚠ {$mirrorData.error}</div>{/if}
</div>

<style>
  .daily-page {
    padding: 1.5rem 2rem 0.5rem;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1rem; flex-shrink: 0; }
  .title { font-size: clamp(24px, 4vw, 38px); font-weight: 300; }

  .grid-wrap { display: grid; grid-template-columns: 5rem 1fr; flex: 1; min-height: 0; }

  .time-col { display: flex; flex-direction: column; justify-content: space-between; padding-right: 0.75rem; }
  .hour-label { font-size: clamp(11px, 1.6vw, 14px); opacity: 0.4; text-align: right; line-height: 1; transform: translateY(-50%); }

  .event-col { position: relative; border-left: 1px solid rgba(255,255,255,0.06); }

  .hour-line { position: absolute; left: 0; right: 0; border-top: 1px solid rgba(255,255,255,0.07); }

  .now-line { position: absolute; left: 0; right: 0; border-top: 1px solid rgba(79,195,247,0.7); z-index: 10; }
  .now-dot { position: absolute; left: -4px; top: -4px; width: 7px; height: 7px; border-radius: 50%; background: #4fc3f7; box-shadow: 0 0 6px rgba(79,195,247,0.8); }

  .evt-block {
    position: absolute; left: 0.5rem; right: 0.5rem;
    background: rgba(79,195,247,0.15);
    border-left: 3px solid rgba(79,195,247,0.7);
    border-radius: 0 5px 5px 0;
    padding: 0.25rem 0.5rem;
    overflow: hidden;
    display: flex; flex-direction: column; gap: 0.15rem;
    box-sizing: border-box;
    transition: opacity 0.3s;
  }
  .evt-block.evt-past   { opacity: 0.3; background: rgba(255,255,255,0.05); border-left-color: rgba(255,255,255,0.2); }
  .evt-block.evt-current { background: rgba(79,195,247,0.22); border-left-color: #4fc3f7; box-shadow: 0 0 12px rgba(79,195,247,0.12); }

  .evt-name  { font-size: clamp(12px, 1.8vw, 15px); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; }
  .evt-range { font-size: clamp(10px, 1.3vw, 12px); opacity: 0.55; white-space: nowrap; }
  .evt-loc   { font-size: clamp(10px, 1.2vw, 11px); opacity: 0.45; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .error-bar { position: fixed; bottom: 2.5rem; left: 50%; transform: translateX(-50%); background: rgba(255,80,80,0.2); color: #ff6b6b; padding: 0.5rem 1.5rem; border-radius: 6px; font-size: 0.85rem; }
</style>

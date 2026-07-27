<script>
  import { time } from '../lib/time.js';
  import { mirrorData } from '../lib/store.js';
  import { dateKey, eventsOnDate, fmtHour } from '../lib/calendar.js';

  const HOUR_START = 7;
  const HOUR_END = 22;
  const TOTAL_HOURS = HOUR_END - HOUR_START;
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => HOUR_START + i);

  function toPercent(h) {
    return ((h - HOUR_START) / TOTAL_HOURS) * 100;
  }

  function heightPercent(start, end) {
    return Math.max((((end ?? start + 1) - start) / TOTAL_HOURS) * 100, 2.2);
  }

  function nowPercent(now) {
    const h = now.getHours() + now.getMinutes() / 60;
    return h >= HOUR_START && h <= HOUR_END ? toPercent(h) : null;
  }

  function hourLabel(h) {
    const d = new Date();
    d.setHours(h, 0, 0, 0);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true });
  }

  $: now = $time.now;
  $: todayKey = dateKey(now);
  $: events = eventsOnDate($mirrorData.calendar || [], todayKey);
  $: nowPct = nowPercent(now);
  $: curH = now.getHours() + now.getMinutes() / 60;
</script>

<div class="daily-panel">
  <section class="mirror-card timeline-card">
    <div class="time-col">
      {#each hours as h}
        <span>{hourLabel(h)}</span>
      {/each}
    </div>

    <div class="event-col">
      {#each hours as _, i}
        <div class="hour-line" style="top: {(i / TOTAL_HOURS) * 100}%"></div>
      {/each}

      {#if nowPct !== null}
        <div class="now-line" style="top: {nowPct}%">
          <span></span>
        </div>
      {/if}

      {#each events as evt}
        {@const top = toPercent(evt.startH ?? HOUR_START)}
        {@const height = heightPercent(evt.startH ?? HOUR_START, evt.endH)}
        {@const past = evt.endH != null && curH > evt.endH}
        {@const current = evt.endH != null && curH >= evt.startH && curH <= evt.endH}
        <article
          class="timeline-event"
          class:past={past && !current}
          class:current={current}
          style="top:{top}%; height:{height}%;"
        >
          <span class="event-time">{fmtHour(evt.startH)}{evt.endH != null ? ` – ${fmtHour(evt.endH)}` : ''}</span>
          <span class="event-name">{evt.event}</span>
          {#if evt.location}<span class="event-meta">{evt.location}</span>{/if}
        </article>
      {/each}

      {#if events.length === 0}
        <p class="empty-state center-empty">No events today</p>
      {/if}
    </div>
  </section>

  <aside class="today-sidebar">
    <div class="mirror-card stat-card">
      <p class="kicker">Count</p>
      <strong>{events.length}</strong>
      <span class="muted">events today</span>
    </div>
    <div class="mirror-card stat-card">
      <p class="kicker">Window</p>
      <strong>{hourLabel(HOUR_START)}–{hourLabel(HOUR_END)}</strong>
      <span class="muted">visible timeline</span>
    </div>
  </aside>
</div>

<style>
  .daily-panel {
    height: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(11rem, 16vw);
    gap: clamp(0.9rem, 1.8vw, 1.3rem);
    min-height: 0;
  }

  .timeline-card {
    min-height: 0;
    padding: clamp(0.8rem, 1.5vw, 1.15rem);
    display: grid;
    grid-template-columns: 4.8rem minmax(0, 1fr);
    gap: 0.9rem;
    overflow: hidden;
  }

  .time-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: var(--faint);
    text-align: right;
    font-size: clamp(0.72rem, 1.25vw, 0.86rem);
  }

  .time-col span {
    transform: translateY(-50%);
  }

  .event-col {
    position: relative;
    min-height: 0;
    border-left: 1px solid rgba(255, 255, 255, 0.09);
  }

  .hour-line {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .now-line {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 8;
    border-top: 1px solid var(--accent);
    box-shadow: 0 0 18px rgba(101, 217, 255, 0.22);
  }

  .now-line span {
    position: absolute;
    left: -5px;
    top: -5px;
    width: 9px;
    height: 9px;
    border-radius: 99px;
    background: var(--accent);
  }

  .timeline-event {
    position: absolute;
    left: 0.65rem;
    right: 0.55rem;
    display: grid;
    align-content: start;
    gap: 0.13rem;
    padding: 0.48rem 0.65rem;
    border-left: 3px solid rgba(101, 217, 255, 0.72);
    border-radius: 0 14px 14px 0;
    background: rgba(101, 217, 255, 0.1);
    overflow: hidden;
    transition: opacity 0.25s ease, background 0.25s ease;
  }

  .timeline-event.past {
    opacity: 0.36;
    background: rgba(255, 255, 255, 0.045);
    border-left-color: rgba(255, 255, 255, 0.18);
  }

  .timeline-event.current {
    background: rgba(101, 217, 255, 0.18);
    box-shadow: 0 0 24px rgba(101, 217, 255, 0.12);
  }

  .center-empty {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .today-sidebar {
    display: grid;
    align-content: start;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
    display: grid;
    gap: 0.3rem;
  }

  .stat-card strong {
    color: var(--text);
    font-size: clamp(1.45rem, 3vw, 2.4rem);
    font-weight: 250;
    letter-spacing: -0.05em;
  }
</style>

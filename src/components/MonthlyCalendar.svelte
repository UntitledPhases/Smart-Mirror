<script>
  import { time } from '../lib/time.js';
  import { mirrorData } from '../lib/store.js';
  import { dateKey, eventTimeLabel, eventsOnDate, monthGrid, WEEK_ORDER } from '../lib/calendar.js';

  let selectedKey = null;

  $: now = $time.now;
  $: todayKey = dateKey(now);
  $: grid = monthGrid(now);
  $: calendar = $mirrorData.calendar || [];
  $: activeKey = selectedKey || todayKey;
  $: activeDate = new Date(`${activeKey}T12:00:00`);
  $: activeEvents = eventsOnDate(calendar, activeKey);
</script>

<div class="month-panel">
  <section class="mirror-card calendar-card">
    <div class="month-label">
      <p class="kicker">{grid.label}</p>
      <span>{calendar.length} visible source events</span>
    </div>

    <div class="cal-grid">
      {#each WEEK_ORDER as day}
        <div class="weekday">{day}</div>
      {/each}

      {#each grid.cells as cell}
        {@const dayEvents = eventsOnDate(calendar, cell.key)}
        <button
          type="button"
          class="cal-cell"
          class:today={cell.key === todayKey}
          class:selected={cell.key === activeKey && cell.key !== todayKey}
          class:muted-day={!cell.inMonth}
          on:click={() => selectedKey = cell.key}
        >
          <span>{cell.day}</span>
          {#if dayEvents.length}
            <div class="dot-row">
              {#each dayEvents.slice(0, 4) as _}
                <i></i>
              {/each}
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </section>

  <aside class="mirror-card detail-card">
    <div class="detail-date">
      <strong>{activeDate.getDate()}</strong>
      <div>
        <p>{activeDate.toLocaleDateString(undefined, { weekday: 'long' })}</p>
        <span>{activeDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
      </div>
    </div>

    <div class="detail-list">
      {#if activeEvents.length}
        {#each activeEvents as evt}
          <article class="event-chip" class:routine={evt.type === 'Routine'}>
            <span class="event-time">{eventTimeLabel(evt)}</span>
            <span class="event-name">{evt.event}</span>
            {#if evt.location}<span class="event-meta">{evt.location}</span>{/if}
            {#if evt.notes}<span class="event-meta">{evt.notes}</span>{/if}
          </article>
        {/each}
      {:else}
        <p class="empty-state">No events here</p>
      {/if}
    </div>
  </aside>
</div>

<style>
  .month-panel {
    height: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(17rem, 27vw);
    gap: clamp(0.9rem, 1.8vw, 1.35rem);
    min-height: 0;
  }

  .calendar-card,
  .detail-card {
    min-height: 0;
    padding: clamp(0.9rem, 1.6vw, 1.25rem);
    overflow: hidden;
  }

  .calendar-card {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 1rem;
  }

  .month-label {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  .month-label span {
    color: var(--faint);
    font-size: clamp(0.72rem, 1.1vw, 0.82rem);
  }

  .cal-grid {
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: auto repeat(6, minmax(0, 1fr));
    gap: 0.42rem;
  }

  .weekday {
    color: var(--faint);
    text-align: center;
    font-size: clamp(0.65rem, 1vw, 0.76rem);
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .cal-cell {
    min-width: 0;
    min-height: 0;
    display: grid;
    place-items: center;
    gap: 0.25rem;
    border: 1px solid rgba(255,255,255,0.055);
    border-radius: 15px;
    background: rgba(255,255,255,0.035);
    color: var(--text);
  }

  .cal-cell.muted-day {
    opacity: 0.25;
  }

  .cal-cell.today {
    border-color: var(--line-bright);
    background: rgba(101, 217, 255, 0.14);
    color: var(--accent);
  }

  .cal-cell.selected {
    border-color: rgba(255, 255, 255, 0.24);
    background: rgba(255, 255, 255, 0.09);
  }

  .cal-cell span {
    font-size: clamp(0.92rem, 1.7vw, 1.26rem);
    font-weight: 290;
  }

  .dot-row {
    display: flex;
    gap: 0.18rem;
  }

  .dot-row i {
    display: block;
    width: 0.28rem;
    height: 0.28rem;
    border-radius: 99px;
    background: var(--accent);
    opacity: 0.75;
  }

  .detail-card {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 1.1rem;
  }

  .detail-date {
    display: flex;
    align-items: center;
    gap: 0.9rem;
  }

  .detail-date strong {
    color: var(--accent);
    font-size: clamp(2.5rem, 6vw, 4.7rem);
    font-weight: 190;
    line-height: 0.9;
    letter-spacing: -0.07em;
  }

  .detail-date p {
    font-size: clamp(1rem, 1.8vw, 1.25rem);
  }

  .detail-date span {
    color: var(--faint);
    font-size: clamp(0.75rem, 1.2vw, 0.9rem);
  }

  .detail-list {
    min-height: 0;
    display: grid;
    align-content: start;
    gap: 0.7rem;
    overflow: hidden;
  }
</style>

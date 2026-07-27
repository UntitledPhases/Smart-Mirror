<script>
  import { time } from '../lib/time.js';
  import { mirrorData } from '../lib/store.js';
  import { dateKey, eventTimeLabel, eventsOnDate, weekDates } from '../lib/calendar.js';

  $: now = $time.now;
  $: todayKey = dateKey(now);
  $: days = weekDates(now);
  $: calendar = $mirrorData.calendar || [];
</script>

<div class="week-panel">
  {#each days as day}
    {@const dayEvents = eventsOnDate(calendar, day.key)}
    {@const isToday = day.key === todayKey}
    <section class="mirror-card day-card" class:today={isToday}>
      <header>
        <span class="day-name">{day.name}</span>
        <strong>{day.day}</strong>
      </header>

      <div class="day-events">
        {#if dayEvents.length}
          {#each dayEvents.slice(0, 5) as evt}
            <article class="event-chip" class:routine={evt.type === 'Routine'}>
              <span class="event-time">{eventTimeLabel(evt)}</span>
              <span class="event-name">{evt.event}</span>
              {#if evt.location}<span class="event-meta">{evt.location}</span>{/if}
            </article>
          {/each}
        {:else}
          <p class="empty-state">open</p>
        {/if}
      </div>
    </section>
  {/each}
</div>

<style>
  .week-panel {
    height: 100%;
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: clamp(0.65rem, 1.25vw, 1rem);
    min-height: 0;
  }

  .day-card {
    min-width: 0;
    min-height: 0;
    padding: clamp(0.72rem, 1.35vw, 1rem);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow: hidden;
  }

  .day-card.today {
    border-color: var(--line-bright);
    background: linear-gradient(180deg, rgba(101, 217, 255, 0.12), rgba(255,255,255,0.04));
  }

  header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .day-name {
    color: var(--muted);
    font-size: clamp(0.68rem, 1.18vw, 0.82rem);
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .today .day-name,
  .today strong {
    color: var(--accent);
  }

  strong {
    font-size: clamp(1.35rem, 2.8vw, 2.15rem);
    font-weight: 260;
    line-height: 1;
  }

  .day-events {
    min-height: 0;
    display: grid;
    align-content: start;
    gap: 0.55rem;
    overflow: hidden;
  }
</style>

<script>
  import { onMount } from 'svelte';
  import AnimatedClock from './ui/AnimatedClock.svelte';
  import { mirrorData } from '../lib/store.js';
  import { upcomingEvents, eventTimeLabel } from '../lib/calendar.js';
  import { getWeather, weatherIcon } from '../lib/weather.js';
  import { getQuoteOfDay } from '../lib/quotes.js';

  let weather = null;
  const quote = getQuoteOfDay();

  $: events = upcomingEvents($mirrorData.calendar || [], new Date(), 3);
  $: notes = $mirrorData.mirror_notes || [];

  onMount(() => {
    getWeather().then(w => weather = w);
    const interval = setInterval(() => getWeather().then(w => weather = w), 30 * 60 * 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="home-grid">
  <section class="hero">
    <p class="kicker">rasplient</p>
    <AnimatedClock
      align="center"
      timeSize="clamp(4.3rem, 13vw, 9.4rem)"
      dateSize="clamp(1.1rem, 2.6vw, 2rem)"
    />

    <div class="weather-quote">
      {#if weather}
        <div class="weather">
          <span>{weatherIcon(weather.weathercode)}</span>
          <span>{Math.round(weather.temperature)}°F</span>
        </div>
      {/if}

      {#if quote}
        <p class="quote">“{quote.text}” <span>— {quote.author}</span></p>
      {/if}
    </div>
  </section>

  <aside class="side-stack">
    <div class="mirror-card home-card">
      <p class="kicker">Next</p>
      {#if events.length}
        <div class="upcoming-list">
          {#each events as evt}
            <div class="upcoming-item">
              <span class="event-time">{eventTimeLabel(evt)}</span>
              <span class="event-name">{evt.event}</span>
              <span class="event-meta">{evt.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="empty-state">No upcoming events</p>
      {/if}
    </div>

    <div class="mirror-card home-card">
      <p class="kicker">Notes</p>
      {#if notes.length}
        <ul class="notes">
          {#each notes.slice(0, 3) as note}
            <li>{note}</li>
          {/each}
        </ul>
      {:else}
        <p class="empty-state">No notes loaded</p>
      {/if}
    </div>
  </aside>
</div>

<style>
  .home-grid {
    width: min(1180px, 94vw);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(17rem, 25vw);
    gap: clamp(1rem, 3vw, 2.2rem);
    align-items: center;
  }

  .hero {
    display: grid;
    justify-items: center;
    gap: clamp(0.65rem, 1.6vw, 1.1rem);
    text-align: center;
  }

  .weather-quote {
    display: grid;
    justify-items: center;
    gap: 0.85rem;
    max-width: 660px;
    margin-top: 0.5rem;
  }

  .weather {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--muted);
    font-size: clamp(1.15rem, 2.3vw, 1.75rem);
    font-weight: 250;
  }

  .quote {
    color: var(--faint);
    font-size: clamp(0.8rem, 1.55vw, 1.03rem);
    line-height: 1.7;
  }

  .quote span {
    color: rgba(232, 243, 248, 0.24);
  }

  .side-stack {
    display: grid;
    gap: 1rem;
  }

  .home-card {
    padding: clamp(0.95rem, 1.7vw, 1.35rem);
    display: grid;
    gap: 0.85rem;
  }

  .upcoming-list,
  .notes {
    display: grid;
    gap: 0.7rem;
  }

  .upcoming-item {
    display: grid;
    gap: 0.1rem;
    padding-bottom: 0.7rem;
    border-bottom: 1px solid var(--line);
  }

  .upcoming-item:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .notes {
    list-style: none;
    color: var(--muted);
    font-size: clamp(0.82rem, 1.35vw, 0.95rem);
    line-height: 1.45;
  }

  .notes li {
    padding-left: 0.85rem;
    border-left: 2px solid rgba(101, 217, 255, 0.35);
  }
</style>

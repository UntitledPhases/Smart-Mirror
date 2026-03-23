<script>
  import { time, formatTime, formatDateLong } from '../lib/time.js';
  import { API_BASE } from '../lib/api.js';
  import { onMount, onDestroy } from 'svelte';

  let calendar = [];
  let goals = [];
  let error = null;
  let pollTimer;

  async function fetchData() {
    try {
      const resp = await fetch(`${API_BASE}/data`);
      const data = await resp.json();
      calendar = data.calendar || [];
      goals = data.goals || [];
      error = data.error;
    } catch (e) {
      error = e.message;
    }
  }

  function getTimeEvents() {
    const today = new Date().toISOString().slice(0, 10);
    const events = [];

    for (const evt of calendar) {
      if (!evt.when || !evt.when.start || !evt.when.start.includes('T')) continue;
      if (evt.when.start.slice(0, 10) !== today) continue;
      events.push({
        time: new Date(evt.when.start),
        endTime: evt.when.end ? new Date(evt.when.end) : null,
        title: evt.event,
        type: evt.type || 'event',
        priority: evt.priority,
        location: evt.location,
        source: 'calendar',
      });
    }

    for (const g of goals) {
      if (!g.target || !g.target.start || !g.target.start.includes('T')) continue;
      if (g.target.start.slice(0, 10) !== today) continue;
      if (g.status === 'Done') continue;
      events.push({
        time: new Date(g.target.start),
        endTime: g.target.end ? new Date(g.target.end) : null,
        title: g.goal,
        type: g.category || 'goal',
        priority: g.priority,
        location: null,
        source: 'goal',
      });
    }

    events.sort((a, b) => a.time - b.time);
    return events;
  }

  function formatEventTime(date) {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  function isNowOrPast(eventTime) {
    return new Date() >= eventTime;
  }

  function isCurrentEvent(start, end) {
    const now = new Date();
    if (!end) return false;
    return now >= start && now <= end;
  }

  onMount(() => {
    fetchData();
    pollTimer = setInterval(fetchData, 60000);
  });

  onDestroy(() => {
    if (pollTimer) clearInterval(pollTimer);
  });

  $: timeEvents = getTimeEvents();
  $: now = $time.now;
  $: void now;
</script>

<div class="calendar-page">
  <header class="header">
    <h1 class="title">Today's Schedule</h1>
    <div class="date-time">
      <span class="date">{formatDateLong($time.now)}</span>
      <span class="time">{formatTime($time.now)}</span>
    </div>
  </header>

  {#if timeEvents.length === 0}
    <div class="empty-state">
      <p>No scheduled events today</p>
    </div>
  {:else}
    <div class="timeline">
      {#each timeEvents as evt}
        <div
          class="timeline-item"
          class:past={isNowOrPast(evt.time) && !isCurrentEvent(evt.time, evt.endTime)}
          class:current={isCurrentEvent(evt.time, evt.endTime)}
        >
          <div class="timeline-marker">
            <span class="marker-dot"></span>
            <span class="marker-line"></span>
          </div>
          <div class="timeline-time">
            {formatEventTime(evt.time)}
            {#if evt.endTime}
              <span class="time-end">— {formatEventTime(evt.endTime)}</span>
            {/if}
          </div>
          <div class="timeline-content">
            <span class="event-title">{evt.title}</span>
            <div class="event-meta">
              {#if evt.priority}
                <span class="event-priority {evt.priority === 'P1' ? 'p1' : evt.priority === 'P2' ? 'p2' : 'p3'}">{evt.priority}</span>
              {/if}
              <span class="event-type">{evt.type}</span>
              {#if evt.location}
                <span class="event-location">📍 {evt.location}</span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if error}
    <div class="error-bar">⚠ {error}</div>
  {/if}
</div>

<style>
  .calendar-page {
    padding: 2rem 3rem;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    height: 100vh;
    overflow-y: auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 2rem;
  }

  .title {
    font-size: clamp(24px, 5vw, 40px);
    font-weight: 300;
  }

  .date-time {
    display: flex;
    gap: 1.5rem;
    align-items: baseline;
  }

  .date {
    font-size: clamp(14px, 2.5vw, 20px);
    opacity: 0.5;
  }

  .time {
    font-size: clamp(18px, 3vw, 28px);
    font-weight: 200;
    opacity: 0.8;
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    opacity: 0.3;
    font-size: clamp(16px, 3vw, 24px);
    font-style: italic;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-left: 1rem;
  }

  .timeline-item {
    display: grid;
    grid-template-columns: 24px 7rem 1fr;
    gap: 1rem;
    align-items: start;
    padding: 1rem 0;
    transition: opacity 0.3s ease;
  }

  .timeline-item.past { opacity: 0.3; }
  .timeline-item.current { opacity: 1; }
  .timeline-item.current .marker-dot {
    background: #4fc3f7;
    box-shadow: 0 0 8px rgba(79, 195, 247, 0.5);
  }

  .timeline-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 0.35rem;
  }

  .marker-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    flex-shrink: 0;
  }

  .marker-line {
    width: 1px;
    flex: 1;
    min-height: 2rem;
    background: rgba(255, 255, 255, 0.1);
  }

  .timeline-time {
    font-size: clamp(14px, 2.5vw, 18px);
    font-weight: 300;
    opacity: 0.7;
    padding-top: 0.15rem;
    white-space: nowrap;
  }

  .time-end { opacity: 0.5; font-size: 0.85em; }

  .timeline-content { padding-top: 0.1rem; }

  .event-title {
    font-size: clamp(16px, 3vw, 22px);
    font-weight: 400;
  }

  .event-meta {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.3rem;
    align-items: center;
  }

  .event-priority {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
  }

  .event-priority.p1 { color: #ff6b6b; }
  .event-priority.p2 { color: #ffd93d; }
  .event-priority.p3 { color: #6bcb77; }

  .event-type {
    font-size: 0.75rem;
    opacity: 0.4;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .event-location { font-size: 0.8rem; opacity: 0.5; }

  .error-bar {
    position: fixed;
    bottom: 2.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 80, 80, 0.2);
    color: #ff6b6b;
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    font-size: 0.85rem;
  }
</style>

<script>
  import { time, formatTime, formatDateLong } from '../lib/time.js';
  import { API_BASE } from '../lib/api.js';
  import { onMount, onDestroy } from 'svelte';

  let goals = [];
  let calendar = [];
  let mirrorNotes = [];
  let lastUpdated = null;
  let error = null;
  let pollTimer;

  function groupByHorizon(goals) {
    const groups = { Daily: [], Weekly: [], Monthly: [] };
    for (const g of goals) {
      const h = g.horizon || 'Daily';
      if (groups[h]) groups[h].push(g);
    }
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => (a.priority || 'P3').localeCompare(b.priority || 'P3'));
    }
    return groups;
  }

  function todayEvents(events) {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter(e => {
      if (!e.when || !e.when.start) return false;
      return e.when.start.slice(0, 10) === today;
    }).sort((a, b) => (a.when.start || '').localeCompare(b.when.start || ''));
  }

  async function fetchData() {
    try {
      const resp = await fetch(`${API_BASE}/data`);
      const data = await resp.json();
      goals = data.goals || [];
      calendar = data.calendar || [];
      mirrorNotes = data.mirror_notes || [];
      lastUpdated = data.last_updated;
      error = data.error;
    } catch (e) {
      error = e.message;
    }
  }

  function priorityClass(p) {
    if (p === 'P1') return 'priority-1';
    if (p === 'P2') return 'priority-2';
    return 'priority-3';
  }

  onMount(() => {
    fetchData();
    pollTimer = setInterval(fetchData, 60000);
  });

  onDestroy(() => {
    if (pollTimer) clearInterval(pollTimer);
  });

  $: grouped = groupByHorizon(goals);
  $: todaysCal = todayEvents(calendar);
  $: topNotes = mirrorNotes.slice(0, 2);
</script>

<div class="dashboard">
  <header class="header">
    <h1 class="date">{formatDateLong($time.now)}</h1>
    <div class="time">{formatTime($time.now)}</div>
  </header>

  {#if topNotes.length > 0}
    <div class="sticky-note">
      <div class="sticky-label">📌</div>
      <div class="sticky-content">
        {#each topNotes as note}
          <p class="sticky-text">{note}</p>
        {/each}
      </div>
    </div>
  {/if}

  {#if todaysCal.length > 0}
    <section class="calendar-strip">
      {#each todaysCal as evt}
        <div class="cal-event">
          <span class="cal-time">
            {#if evt.when && evt.when.start && evt.when.start.includes('T')}
              {new Date(evt.when.start).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}
            {:else}
              All day
            {/if}
          </span>
          <span class="cal-name">{evt.event}</span>
          {#if evt.type}
            <span class="cal-type">{evt.type}</span>
          {/if}
        </div>
      {/each}
    </section>
  {/if}

  <div class="categories">
    {#each ['Daily', 'Weekly', 'Monthly'] as horizon}
      <div class="category">
        <h2>{horizon}</h2>
        {#if grouped[horizon].length === 0}
          <p class="empty">No {horizon.toLowerCase()} goals</p>
        {:else}
          <ul class="goal-list">
            {#each grouped[horizon] as goal}
              <li class="goal-item {priorityClass(goal.priority)}" class:done={goal.status === 'Done'}>
                <span class="goal-priority">{goal.priority || '—'}</span>
                <span class="goal-text">{goal.goal}</span>
                {#if goal.category}
                  <span class="goal-category">{goal.category}</span>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}
  </div>

  {#if error}
    <div class="error-bar">⚠ {error}</div>
  {/if}
</div>

<style>
  .dashboard {
    padding: 1.5rem 2rem;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: start;
    width: 100%;
    margin-bottom: 1rem;
  }

  .date {
    grid-column: 2;
    justify-self: center;
    font-size: clamp(24px, 5vw, 48px);
    font-weight: 300;
  }

  .time {
    grid-column: 3;
    justify-self: end;
    font-size: clamp(20px, 4vw, 32px);
    font-weight: 200;
    opacity: 0.8;
  }

  .sticky-note {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    background: rgba(255, 214, 102, 0.08);
    border-left: 3px solid rgba(255, 214, 102, 0.4);
    border-radius: 0 6px 6px 0;
  }

  .sticky-label {
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .sticky-content {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .sticky-text {
    font-size: clamp(13px, 2.2vw, 16px);
    line-height: 1.4;
    opacity: 0.75;
  }

  .calendar-strip {
    display: flex;
    gap: 1.5rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow-x: auto;
  }

  .cal-event {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }

  .cal-time {
    font-size: 0.85rem;
    opacity: 0.6;
    min-width: 5rem;
  }

  .cal-name {
    font-size: 1rem;
  }

  .cal-type {
    font-size: 0.75rem;
    opacity: 0.4;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .categories {
    display: flex;
    justify-content: space-evenly;
    gap: 2rem;
    text-align: left;
  }

  .category {
    flex: 1;
    min-width: 0;
  }

  .category h2 {
    margin-bottom: 0.75rem;
    font-size: clamp(18px, 3vw, 24px);
    font-weight: 400;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .goal-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .goal-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: clamp(14px, 2.5vw, 18px);
  }

  .goal-item.done {
    opacity: 0.35;
    text-decoration: line-through;
  }

  .goal-priority {
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 1.8rem;
    text-align: center;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
  }

  .priority-1 .goal-priority { color: #ff6b6b; }
  .priority-2 .goal-priority { color: #ffd93d; }
  .priority-3 .goal-priority { color: #6bcb77; }

  .goal-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .goal-category {
    font-size: 0.7rem;
    opacity: 0.4;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .empty {
    opacity: 0.3;
    font-style: italic;
    font-size: 0.9rem;
  }

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

  @media (max-width: 480px) {
    .categories {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>

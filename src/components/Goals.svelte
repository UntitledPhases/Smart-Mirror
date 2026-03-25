<script>
  import { mirrorData } from '../lib/store.js';
  import StickyNote from './ui/StickyNote.svelte';

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

  function priorityClass(p) {
    if (p === 'P1') return 'priority-1';
    if (p === 'P2') return 'priority-2';
    return 'priority-3';
  }

  $: goals    = $mirrorData.goals || [];
  $: notes    = $mirrorData.mirror_notes || [];
  $: grouped  = groupByHorizon(goals);
  $: error    = $mirrorData.error;
</script>

<div class="goals-page">
  <header class="header">
    <h1 class="title">Goals</h1>
  </header>

  <div class="main-row">
    <div class="categories">
      {#each ['Daily', 'Weekly', 'Monthly'] as horizon, i}
        {#if i > 0}<div class="col-divider"></div>{/if}
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

    <!-- Sticky note floats to the right of goals -->
    <div class="sticky-col">
      <StickyNote {notes} max={4} />
    </div>
  </div>

  {#if error}<div class="error-bar">⚠ {error}</div>{/if}
</div>

<style>
  .goals-page {
    padding: 1.5rem 2rem;
    color: #e0e0e0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .header { flex-shrink: 0; }
  .title { font-size: clamp(20px, 3.5vw, 32px); font-weight: 300; opacity: 0.7; }

  .main-row {
    display: flex;
    gap: 2.5rem;
    flex: 1;
    min-height: 0;
    align-items: flex-start;
  }

  .categories {
    display: flex;
    gap: 0;
    flex: 1;
    min-width: 0;
  }

  .col-divider {
    width: 1px;
    align-self: stretch;
    background: rgba(255, 255, 255, 0.18);
    flex-shrink: 0;
    margin: 0 2rem;
  }

  .sticky-col {
    flex-shrink: 0;
    padding-top: 0.75rem; /* accounts for tape hanging above */
  }

  .category { flex: 1; min-width: 0; }

  .category h2 {
    margin-bottom: 0.75rem;
    font-size: clamp(18px, 3vw, 24px);
    font-weight: 400;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .goal-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }

  .goal-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: clamp(14px, 2.5vw, 18px);
  }

  .goal-item.done { opacity: 0.35; text-decoration: line-through; }

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

  .goal-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .goal-category { font-size: 0.7rem; opacity: 0.4; text-transform: uppercase; letter-spacing: 0.05em; }
  .empty { opacity: 0.3; font-style: italic; font-size: 0.9rem; }

  .error-bar {
    position: fixed;
    bottom: 2.5rem; left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 80, 80, 0.2);
    color: #ff6b6b;
    padding: 0.5rem 1.5rem;
    border-radius: 6px;
    font-size: 0.85rem;
  }
</style>

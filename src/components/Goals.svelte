<script>
  import { mirrorData } from '../lib/store.js';

  const horizons = ['Daily', 'Weekly', 'Monthly'];

  function groupByHorizon(goals) {
    const groups = { Daily: [], Weekly: [], Monthly: [] };
    for (const goal of goals) {
      const key = groups[goal.horizon] ? goal.horizon : 'Daily';
      groups[key].push(goal);
    }
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));
    }
    return groups;
  }

  function priorityRank(priority) {
    if (priority === 'P1') return 1;
    if (priority === 'P2') return 2;
    return 3;
  }

  $: goals = $mirrorData.goals || [];
  $: notes = $mirrorData.mirror_notes || [];
  $: grouped = groupByHorizon(goals);
</script>

<div class="focus-panel">
  <div class="goal-columns">
    {#each horizons as horizon}
      <section class="mirror-card goal-column">
        <div class="column-head">
          <p class="kicker">{horizon}</p>
          <span>{grouped[horizon].length}</span>
        </div>

        {#if grouped[horizon].length}
          <ul class="goal-list">
            {#each grouped[horizon] as goal}
              <li class="goal-item" class:done={goal.status === 'Done'} class:p1={goal.priority === 'P1'} class:p2={goal.priority === 'P2'}>
                <span class="priority">{goal.priority || 'P3'}</span>
                <div class="goal-body">
                  <span class="goal-text">{goal.goal}</span>
                  {#if goal.category || goal.notes}
                    <span class="goal-meta">{goal.category || goal.notes}</span>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="empty-state">Nothing here yet</p>
        {/if}
      </section>
    {/each}
  </div>

  <aside class="notes-card mirror-card">
    <p class="kicker">Mirror notes</p>
    {#if notes.length}
      <ul>
        {#each notes.slice(0, 6) as note}
          <li>{note}</li>
        {/each}
      </ul>
    {:else}
      <p class="empty-state">Push notes into local mirror data to pin them here.</p>
    {/if}
  </aside>
</div>

<style>
  .focus-panel {
    height: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(15rem, 24vw);
    gap: clamp(0.9rem, 1.8vw, 1.35rem);
    min-height: 0;
  }

  .goal-columns {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(0.85rem, 1.6vw, 1.2rem);
    min-height: 0;
  }

  .goal-column,
  .notes-card {
    min-height: 0;
    padding: clamp(0.9rem, 1.6vw, 1.25rem);
    overflow: hidden;
  }

  .goal-column {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .column-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .column-head span {
    color: var(--faint);
    font-size: 0.9rem;
  }

  .goal-list {
    list-style: none;
    display: grid;
    gap: 0.65rem;
    min-height: 0;
    overflow: hidden;
  }

  .goal-item {
    display: grid;
    grid-template-columns: 2.4rem minmax(0, 1fr);
    gap: 0.65rem;
    align-items: center;
    padding: 0.7rem;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.045);
    border: 1px solid rgba(255, 255, 255, 0.055);
  }

  .goal-item.done {
    opacity: 0.4;
  }

  .priority {
    display: grid;
    place-items: center;
    height: 1.55rem;
    border-radius: 999px;
    color: var(--ok);
    background: rgba(141, 240, 180, 0.08);
    font-size: 0.7rem;
    font-weight: 800;
  }

  .p1 .priority {
    color: var(--danger);
    background: rgba(255, 125, 125, 0.09);
  }

  .p2 .priority {
    color: var(--warn);
    background: rgba(255, 224, 139, 0.09);
  }

  .goal-body {
    min-width: 0;
    display: grid;
    gap: 0.12rem;
  }

  .goal-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: clamp(0.86rem, 1.55vw, 1.08rem);
  }

  .goal-meta {
    color: var(--faint);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: clamp(0.68rem, 1.1vw, 0.78rem);
  }

  .notes-card {
    display: grid;
    align-content: start;
    gap: 0.85rem;
  }

  .notes-card ul {
    list-style: none;
    display: grid;
    gap: 0.75rem;
    color: var(--muted);
    font-size: clamp(0.82rem, 1.4vw, 0.98rem);
    line-height: 1.45;
  }

  .notes-card li {
    padding-left: 0.8rem;
    border-left: 2px solid rgba(101, 217, 255, 0.36);
  }
</style>

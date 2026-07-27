<script>
  import { onDestroy, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import Home from './components/Home.svelte';
  import Goals from './components/Goals.svelte';
  import DailySchedule from './components/DailySchedule.svelte';
  import WeeklySchedule from './components/WeeklySchedule.svelte';
  import MonthlyCalendar from './components/MonthlyCalendar.svelte';
  import AnimatedClock from './components/ui/AnimatedClock.svelte';
  import { mirrorData, refreshMirrorData } from './lib/store.js';
  import { setupKeyboardNav, trackInactivity, INACTIVITY_LIMIT_MS } from './lib/navigation.js';

  const pages = [
    { id: 'home', label: 'Home', title: 'Ambient mirror', component: Home },
    { id: 'focus', label: 'Focus', title: 'Focus board', component: Goals },
    { id: 'today', label: 'Today', title: 'Today timeline', component: DailySchedule },
    { id: 'week', label: 'Week', title: 'Week map', component: WeeklySchedule },
    { id: 'month', label: 'Month', title: 'Month view', component: MonthlyCalendar },
  ];

  let currentPage = 0;
  let cleanupNav;
  let tracker;

  $: active = pages[currentPage];
  $: onHome = active.id === 'home';
  $: notes = $mirrorData.mirror_notes || [];
  $: lastUpdated = $mirrorData.last_updated ? new Date($mirrorData.last_updated) : null;
  $: updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : 'not loaded';

  function next() {
    currentPage = (currentPage + 1) % pages.length;
    tracker?.reset();
  }

  function prev() {
    currentPage = (currentPage - 1 + pages.length) % pages.length;
    tracker?.reset();
  }

  function goHome() {
    currentPage = 0;
  }

  function handleKey(e) {
    if (e.key?.toLowerCase() === 'r') {
      refreshMirrorData();
      tracker?.reset();
    }
  }

  onMount(() => {
    cleanupNav = setupKeyboardNav(next, prev);
    tracker = trackInactivity(goHome, INACTIVITY_LIMIT_MS);
    tracker.start();
    window.addEventListener('keydown', handleKey);
  });

  onDestroy(() => {
    cleanupNav?.();
    tracker?.stop();
    window.removeEventListener('keydown', handleKey);
  });
</script>

<div class="mirror-shell" class:home-mode={onHome}>
  <div class="ambient-grid"></div>
  <div class="ambient-glow one"></div>
  <div class="ambient-glow two"></div>

  {#if !onHome}
    <header class="topbar" in:fly={{ y: -10, duration: 260 }} out:fade={{ duration: 140 }}>
      <div class="title-stack">
        <p class="kicker">{active.label}</p>
        <h1>{active.title}</h1>
      </div>

      <div class="top-clock mirror-card subtle">
        <AnimatedClock
          align="right"
          timeSize="clamp(1.25rem, 2.4vw, 2.1rem)"
          dateSize="clamp(0.68rem, 1vw, 0.82rem)"
        />
      </div>
    </header>
  {/if}

  <main class="stage" class:home-stage={onHome}>
    {#key active.id}
      <section
        class="panel"
        class:home-panel={onHome}
        in:fly={{ y: 18, duration: 320 }}
        out:fade={{ duration: 150 }}
      >
        <svelte:component this={active.component} />
      </section>
    {/key}
  </main>

  <footer class="status-strip" class:home-strip={onHome}>
    <div class="note-line">
      {#if $mirrorData.error}
        <span class="status-error">⚠ {$mirrorData.error}</span>
      {:else if notes.length}
        <span class="note-label">note</span>
        <span>{notes[0]}</span>
      {:else}
        <span class="muted">No mirror notes</span>
      {/if}
    </div>

    <div class="pager">
      <span class="updated">data {updatedLabel}</span>
      {#each pages as page, i}
        <span class="dot" class:active={i === currentPage} aria-label={page.label}></span>
      {/each}
    </div>
  </footer>
</div>

<style>
  .mirror-shell {
    position: relative;
    width: 100vw;
    height: 100vh;
    padding: clamp(1rem, 2vw, 1.55rem);
    overflow: hidden;
    isolation: isolate;
  }

  .ambient-grid {
    position: fixed;
    inset: 0;
    z-index: -3;
    background-image:
      linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(circle at center, black, transparent 78%);
    opacity: 0.35;
  }

  .ambient-glow {
    position: fixed;
    z-index: -2;
    width: 40vw;
    height: 40vw;
    border-radius: 999px;
    filter: blur(72px);
    opacity: 0.22;
  }

  .ambient-glow.one {
    left: -13vw;
    bottom: -16vw;
    background: var(--accent);
  }

  .ambient-glow.two {
    right: -18vw;
    top: -18vw;
    background: #8f7bff;
  }

  .topbar {
    position: relative;
    z-index: 4;
    height: clamp(4rem, 10vh, 5.8rem);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2rem;
    padding: 0.2rem 0.25rem 0;
  }

  .title-stack {
    display: grid;
    gap: 0.35rem;
  }

  .title-stack h1 {
    font-size: clamp(1.9rem, 4.2vw, 3.9rem);
    font-weight: 230;
    line-height: 0.95;
    letter-spacing: -0.055em;
  }

  .top-clock {
    min-width: clamp(10rem, 19vw, 17rem);
    padding: 0.85rem 1rem;
    display: flex;
    justify-content: flex-end;
  }

  .stage {
    position: relative;
    z-index: 2;
    height: calc(100vh - clamp(1rem, 2vw, 1.55rem) * 2 - clamp(4rem, 10vh, 5.8rem) - 3.4rem);
    padding-top: clamp(0.35rem, 1vh, 0.7rem);
  }

  .stage.home-stage {
    height: calc(100vh - clamp(1rem, 2vw, 1.55rem) * 2 - 3.4rem);
    padding-top: 0;
  }

  .panel {
    position: absolute;
    inset: 0;
    min-width: 0;
    min-height: 0;
  }

  .panel.home-panel {
    display: grid;
    place-items: center;
  }

  .status-strip {
    position: fixed;
    left: clamp(1rem, 2vw, 1.55rem);
    right: clamp(1rem, 2vw, 1.55rem);
    bottom: clamp(0.8rem, 1.6vw, 1.2rem);
    z-index: 8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 2rem;
    color: var(--muted);
    font-size: clamp(0.72rem, 1.15vw, 0.86rem);
    pointer-events: none;
  }

  .note-line {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 0.55rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .note-label {
    color: var(--accent);
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .status-error {
    color: var(--danger);
  }

  .pager {
    display: flex;
    align-items: center;
    gap: 0.48rem;
    flex-shrink: 0;
  }

  .updated {
    color: var(--faint);
    margin-right: 0.45rem;
  }

  .dot {
    width: 0.42rem;
    height: 0.42rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    transition: width 0.25s ease, background 0.25s ease;
  }

  .dot.active {
    width: 1.3rem;
    background: var(--accent);
  }
</style>

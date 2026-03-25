<script>
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import Home from './components/Home.svelte';
  import Goals from './components/Goals.svelte';
  import DailySchedule from './components/DailySchedule.svelte';
  import WeeklySchedule from './components/WeeklySchedule.svelte';
  import MonthlyCalendar from './components/MonthlyCalendar.svelte';
  import AnimatedClock from './components/ui/AnimatedClock.svelte';
  import { setupKeyboardNav, trackInactivity, INACTIVITY_LIMIT_MS } from './lib/navigation.js';

  const pages = [Home, Goals, DailySchedule, WeeklySchedule, MonthlyCalendar];
  let currentPage = 0;
  let cleanupNav;
  let tracker;

  // Scale factor: corner time font ÷ home time font ≈ 24px / 110px
  const SCALE = 0.22;

  // Single-element positioning via transform only.
  // Home: centered at 30vh.
  // Corner: right edge at (100vw - 2rem), top at 1.5rem, shrunk by SCALE.
  //
  // How the corner transform works (applied right-to-left):
  //   1. translateX(-100%)  → move element left by its own width (right edge to x=0)
  //   2. scale(SCALE)       → shrink around top-left origin
  //   3. translate(100vw - 2rem, 1.5rem) → move to final position
  //
  // Result: right edge sits exactly at (100vw - 2rem), top at 1.5rem.

  $: onHome = currentPage === 0;
  $: clockTransform = onHome
    ? 'translate(50vw, 30vh) translateX(-50%)'
    : `translate(calc(100vw - 2rem), 1.5rem) scale(${SCALE}) translateX(-100%)`;

  function next()   { currentPage = (currentPage + 1) % pages.length; tracker?.reset(); }
  function prev()   { currentPage = (currentPage - 1 + pages.length) % pages.length; tracker?.reset(); }
  function goHome() { currentPage = 0; }

  onMount(() => {
    cleanupNav = setupKeyboardNav(next, prev);
    tracker = trackInactivity(goHome, INACTIVITY_LIMIT_MS);
    tracker.start();
  });

  onDestroy(() => {
    cleanupNav?.();
    tracker?.stop();
  });
</script>

<!--
  Single clock instance — never unmounts.
  Anchored at (0,0); ALL positioning is via transform so CSS can animate it smoothly.
-->
<div
  class="global-clock"
  style="transform: {clockTransform}"
>
  <AnimatedClock
    align="center"
    timeSize="clamp(64px, 10vw, 110px)"
    dateSize="clamp(26px, 4vw, 42px)"
  />
</div>

<!-- Page content fades independently of the clock -->
{#key currentPage}
  <div class="page-wrap" in:fade={{ duration: 220, delay: 60 }} out:fade={{ duration: 160 }}>
    <svelte:component this={pages[currentPage]} />
  </div>
{/key}

<div class="page-dots">
  {#each pages as _, i}
    <span class="dot" class:active={i === currentPage}></span>
  {/each}
</div>

<style>
  /* Single persistent clock — anchored top-left, moved entirely by transform */
  .global-clock {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 50;
    pointer-events: none;
    transform-origin: top left;
    /* Smooth spring-like motion for position + scale together */
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    text-align: center;
  }

  .page-wrap {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .page-dots {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    z-index: 100;
    pointer-events: none;
  }

  .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: background 0.3s ease;
  }
  .dot.active { background: rgba(255, 255, 255, 0.8); }
</style>

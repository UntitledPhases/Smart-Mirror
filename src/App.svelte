<script>
  import { onMount, onDestroy } from 'svelte';
  import Home from './components/Home.svelte';
  import Dashboard from './components/Dashboard.svelte';
  import Calendar from './components/Calendar.svelte';
  import { setupKeyboardNav, trackInactivity, INACTIVITY_LIMIT_MS } from './lib/navigation.js';

  const pages = [Home, Dashboard, Calendar];
  let currentPage = 0;
  let cleanupNav;
  let tracker;

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

<svelte:component this={pages[currentPage]} />

<div class="page-dots">
  {#each pages as _, i}
    <span class="dot" class:active={i === currentPage}></span>
  {/each}
</div>

<style>
  .page-dots {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    z-index: 100;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: background 0.3s ease;
  }
  .dot.active {
    background: rgba(255, 255, 255, 0.8);
  }
</style>

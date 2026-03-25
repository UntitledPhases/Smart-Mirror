<!--
  AnimatedClock — shared time + date display used across pages.
  Props:
    align: 'center' | 'right' | 'split'  (default: 'center')
    showDate: boolean (default: true)
    timeSize: CSS clamp string (optional override)
    dateSize: CSS clamp string (optional override)
-->
<script>
  import { time, formatTime, formatDateLong } from '../../lib/time.js';

  export let align     = 'center';   // 'center' | 'right' | 'split'
  export let showDate  = true;
  export let timeSize  = 'clamp(48px, 9vw, 88px)';
  export let dateSize  = 'clamp(16px, 2.8vw, 26px)';

  // Track the previous minute to trigger animation only on minute change
  let prevMinute = -1;
  let tickClass  = '';

  $: {
    const m = $time.now.getMinutes();
    if (m !== prevMinute) {
      prevMinute = m;
      tickClass = '';
      // micro-task so Svelte can clear the class first
      setTimeout(() => { tickClass = 'tick'; }, 0);
    }
  }

  $: timeStr = formatTime($time.now);
  $: dateStr = formatDateLong($time.now);
</script>

<div class="clock-wrap" class:align-center={align === 'center'} class:align-right={align === 'right'} class:align-split={align === 'split'}>
  {#if showDate && align !== 'split'}
    <div class="date-line {tickClass}" style="font-size:{dateSize}">{dateStr}</div>
  {/if}

  <div class="time-line {tickClass}" style="font-size:{timeSize}">
    {#if align === 'split'}
      <!-- split: date left, time right — used in page headers -->
      <span class="split-date" style="font-size:{dateSize}">{dateStr}</span>
      <span class="split-time">{timeStr}</span>
    {:else}
      {timeStr}
    {/if}
  </div>
</div>

<style>
  .clock-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
  }

  .align-center { align-items: center; text-align: center; }
  .align-right  { align-items: flex-end; text-align: right; }
  .align-split  { flex-direction: row; align-items: baseline; justify-content: space-between; width: 100%; }

  .time-line {
    font-weight: 200;
    line-height: 1;
    letter-spacing: -0.01em;
  }

  .date-line {
    font-weight: 300;
    opacity: 0.55;
    line-height: 1;
  }

  /* Split layout */
  .split-date {
    font-weight: 300;
    opacity: 0.5;
    font-variant-numeric: tabular-nums;
  }

  .split-time {
    font-weight: 200;
    font-variant-numeric: tabular-nums;
  }

  /* Minute-tick fade-in */
  @keyframes clockTick {
    0%   { opacity: 0.5; transform: translateY(-3px); }
    100% { opacity: 1;   transform: translateY(0); }
  }

  .tick {
    animation: clockTick 0.35s ease-out forwards;
  }
</style>

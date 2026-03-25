<!--
  StickyNote — displays mirror_notes nudges as a real Post-it style note.
  Props:
    notes: string[]   — lines to display (pass mirrorData.mirror_notes)
    max:   number     — max lines to show (default 3)
-->
<script>
  export let notes = [];
  export let max   = 3;

  $: visible = notes.slice(0, max);
</script>

{#if visible.length > 0}
  <div class="sticky">
    <div class="sticky-tape"></div>
    <p class="sticky-label">notes</p>
    <ul class="sticky-lines">
      {#each visible as line}
        <li>{line}</li>
      {/each}
    </ul>
    {#if notes.length > max}
      <p class="sticky-more">+{notes.length - max} more</p>
    {/if}
  </div>
{/if}

<style>
  .sticky {
    position: relative;
    background: #fde047;
    color: #1a1a1a;
    border-radius: 0;                        /* sharp corners — it's a Post-it */
    padding: 1.1rem 1.2rem 0.9rem;
    font-family: 'Caveat', cursive;
    display: inline-flex;
    flex-direction: column;
    gap: 0.3rem;
    transform: rotate(-1.2deg);
    box-shadow:
      2px 3px 8px rgba(0,0,0,0.45),
      4px 6px 20px rgba(0,0,0,0.25);
    min-width: 220px;
    max-width: 380px;

    /* Paper texture via subtle gradient */
    background-image: linear-gradient(
      160deg,
      #fef08a 0%,
      #fde047 40%,
      #facc15 100%
    );
  }

  /* Tape strip at top-center */
  .sticky-tape {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%) rotate(1deg);
    width: 52px;
    height: 20px;
    background: rgba(253, 224, 71, 0.55);
    border-radius: 1px;
    backdrop-filter: blur(1px);
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    border: 1px solid rgba(202, 138, 4, 0.2);
  }

  /* "notes" header label */
  .sticky-label {
    font-size: clamp(13px, 1.8vw, 16px);
    font-weight: 700;
    text-transform: lowercase;
    letter-spacing: 0.08em;
    opacity: 0.45;
    margin-bottom: 0.2rem;
    font-family: 'Caveat', cursive;
  }

  .sticky-lines {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sticky-lines li {
    font-size: clamp(16px, 2.4vw, 22px);
    font-weight: 500;
    line-height: 1.3;
    /* Ruled-line underline per item */
    border-bottom: 1px solid rgba(161, 107, 0, 0.2);
    padding-bottom: 0.35rem;
    font-family: 'Caveat', cursive;
  }

  .sticky-lines li:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .sticky-more {
    font-size: clamp(11px, 1.5vw, 14px);
    opacity: 0.5;
    text-align: right;
    font-family: 'Caveat', cursive;
    margin-top: 0.1rem;
  }
</style>

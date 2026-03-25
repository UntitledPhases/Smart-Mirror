<script>
  import { getWeather, weatherIcon } from '../lib/weather.js';
  import { getQuoteOfDay } from '../lib/quotes.js';
  import { onMount } from 'svelte';

  let weather = null;
  const quote = getQuoteOfDay();

  onMount(() => {
    getWeather().then(w => weather = w);
    const interval = setInterval(() => getWeather().then(w => weather = w), 30 * 60 * 1000);
    return () => clearInterval(interval);
  });
</script>

<!-- Clock lives in App.svelte (fixed, centered). This page owns only weather + quote. -->
<div class="home-lower">
  {#if weather}
    <div class="weather">
      <span class="weather-icon">{weatherIcon(weather.weathercode)}</span>
      <span class="weather-temp">{Math.round(weather.temperature)}°F</span>
    </div>
  {/if}

  {#if quote}
    <div class="quote">
      <p class="quote-text">"{quote.text}"</p>
      <p class="quote-author">— {quote.author}</p>
    </div>
  {/if}
</div>

<style>
  /* Anchored to the lower portion of the screen — clear of the centered clock */
  .home-lower {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: 0 2rem 3.5rem;
  }

  .weather {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: clamp(20px, 3.5vw, 30px);
    font-weight: 200;
    opacity: 0.55;
    font-variant-numeric: tabular-nums;
  }

  .weather-icon { font-size: 1.2em; }

  .quote {
    max-width: 560px;
    text-align: center;
  }

  .quote-text {
    font-size: clamp(13px, 2.2vw, 18px);
    font-style: italic;
    opacity: 0.38;
    line-height: 1.65;
  }

  .quote-author {
    font-size: clamp(11px, 1.6vw, 14px);
    opacity: 0.25;
    margin-top: 0.4rem;
  }
</style>

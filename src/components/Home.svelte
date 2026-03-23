<script>
  import { time, formatTime, formatDateLong } from '../lib/time.js';
  import { getWeather, weatherIcon } from '../lib/weather.js';
  import { getQuoteOfDay } from '../lib/quotes.js';
  import { onMount } from 'svelte';

  let weather = null;
  let quote = getQuoteOfDay();

  onMount(async () => {
    weather = await getWeather();
    const interval = setInterval(async () => {
      weather = await getWeather();
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="container">
  <h1 class="clock">{formatTime($time.now)}</h1>
  <h2 class="date">{formatDateLong($time.now)}</h2>

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
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    text-align: center;
    gap: 0.5rem;
  }
  .clock {
    font-size: clamp(64px, 15vw, 120px);
    font-weight: 200;
    letter-spacing: -0.02em;
  }
  .date {
    font-size: clamp(24px, 5vw, 40px);
    font-weight: 300;
    opacity: 0.7;
  }
  .weather {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    font-size: clamp(20px, 4vw, 32px);
    font-weight: 200;
    opacity: 0.6;
  }
  .weather-icon {
    font-size: 1.2em;
  }
  .quote {
    margin-top: 2.5rem;
    max-width: 600px;
    padding: 0 2rem;
  }
  .quote-text {
    font-size: clamp(14px, 2.5vw, 20px);
    font-style: italic;
    opacity: 0.45;
    line-height: 1.6;
  }
  .quote-author {
    font-size: clamp(12px, 2vw, 16px);
    opacity: 0.3;
    margin-top: 0.5rem;
  }
</style>

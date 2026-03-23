const LAT = 40.79;
const LON = -74.32;
const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&temperature_unit=fahrenheit`;

let cached = null;
let lastFetch = 0;
const CACHE_MS = 30 * 60 * 1000;

export async function getWeather() {
  const now = Date.now();
  if (cached && now - lastFetch < CACHE_MS) return cached;

  try {
    const resp = await fetch(API_URL);
    const data = await resp.json();
    cached = data.current_weather;
    lastFetch = now;
    return cached;
  } catch (e) {
    console.error('Weather fetch failed:', e);
    return cached;
  }
}

export function weatherIcon(code) {
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 57) return '🌧️';
  if (code <= 65) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌡️';
}

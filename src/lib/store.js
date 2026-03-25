/**
 * Shared data store — single poll cycle for the whole app.
 * All components subscribe to `mirrorData` instead of fetching individually.
 */
import { writable } from 'svelte/store';
import { API_BASE } from './api.js';

const POLL_INTERVAL_MS = 60_000;

const _empty = { goals: [], calendar: [], mirror_notes: [], last_updated: null, error: null };

export const mirrorData = writable({ ..._empty });

async function _fetch() {
  try {
    const resp = await fetch(`${API_BASE}/data`);
    const data = await resp.json();
    mirrorData.set(data);
  } catch (e) {
    mirrorData.update(d => ({ ...d, error: e.message }));
  }
}

// Start polling immediately on import — store lives for the app lifetime.
_fetch();
setInterval(_fetch, POLL_INTERVAL_MS);

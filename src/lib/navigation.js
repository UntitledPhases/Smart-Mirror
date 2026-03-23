export const INACTIVITY_LIMIT_MS = 120000;

export function trackInactivity(callback, timeout = INACTIVITY_LIMIT_MS) {
  let timer;

  function reset() {
    clearTimeout(timer);
    timer = setTimeout(callback, timeout);
  }

  function start() {
    reset();
    window.addEventListener('keydown', reset);
  }

  function stop() {
    clearTimeout(timer);
    window.removeEventListener('keydown', reset);
  }

  return { start, stop, reset };
}

export function setupKeyboardNav(onNext, onPrev) {
  function handler(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onNext();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onPrev();
    }
  }

  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}

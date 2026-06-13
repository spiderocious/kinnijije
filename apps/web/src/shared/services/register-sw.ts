// Registers the service worker (PWA offline shell). Production only — in dev the
// SW would cache Vite's HMR assets and fight the dev server. Fails silently if
// service workers aren't supported.
export function registerServiceWorker(): void {
  if (import.meta.env.DEV) return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration failure is non-fatal — the app still works online.
    });
  });
}

// The service worker caches static files (hashed JS/CSS, fonts, images) so
// repeat visits do not re-download them. API data is cached separately in
// services/apiClient.js and is never touched by the worker.
export const registerServiceWorker = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  if (!import.meta.env.PROD) {
    // A worker left over from a production build would serve stale files to the dev server.
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {});
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
};

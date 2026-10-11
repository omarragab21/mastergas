export const logPayment = (tag, message, data = null) => {
  if (!import.meta.env.DEV) return;

  const formattedTag = `[PayTabs ${tag}]`;

  if (data !== null) {
    console.log(formattedTag, message, data);
  } else {
    console.log(formattedTag, message);
  }

  const endpoint = import.meta.env.VITE_TERMINAL_LOG_ENDPOINT
    || (typeof window !== 'undefined' ? window.__MASTERGAS_TERMINAL_LOG_ENDPOINT__ : '');

  if (endpoint && typeof fetch === 'function') {
    try {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: formattedTag,
          message,
          data,
          timestamp: new Date().toLocaleTimeString(),
        }),
      }).catch(() => {});
    } catch (_) {
      // Ignore errors when dev server endpoint is offline or building for prod
    }
  }
};

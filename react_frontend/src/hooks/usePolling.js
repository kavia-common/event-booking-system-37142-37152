import React from 'react';

/**
 * Generic polling hook.
 * - Calls fetcher() at a given interval and updates state via onData.
 * - Automatically pauses when document is hidden for efficiency.
 * - Returns controls to start/stop and a boolean 'active' flag.
 *
 * Example:
 * const { active, start, stop } = usePolling({
 *   fetcher: () => fetchEvents(),
 *   onData: setEvents,
 *   intervalMs: 5000
 * });
 */
// PUBLIC_INTERFACE
export function usePolling({ fetcher, onData, intervalMs = 5000, enabled = true }) {
  /** Polls a fetcher function on an interval and calls onData with results. */
  const timerRef = React.useRef(null);
  const enabledRef = React.useRef(enabled);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const tick = React.useCallback(async () => {
    try {
      const data = await fetcher();
      onData?.(data);
    } catch (e) {
      // Swallow errors during background polling to avoid UI noise.
      // Console for developer visibility.
      // eslint-disable-next-line no-console
      console.debug('Polling error (non-fatal):', e?.message || e);
    }
  }, [fetcher, onData]);

  const start = React.useCallback(() => {
    enabledRef.current = true;
    clearTimer();
    // Immediate tick for snappy update, then interval
    tick();
    timerRef.current = setInterval(() => {
      if (document?.hidden) return; // pause when not visible
      tick();
    }, intervalMs);
  }, [clearTimer, tick, intervalMs]);

  const stop = React.useCallback(() => {
    enabledRef.current = false;
    clearTimer();
  }, [clearTimer]);

  React.useEffect(() => {
    if (enabled) start();
    return () => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs]);

  const active = Boolean(timerRef.current);
  return { active, start, stop };
}

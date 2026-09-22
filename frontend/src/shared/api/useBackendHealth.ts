import { useCallback, useEffect, useState } from 'react';

const API_BASE = '/api';

export type HealthStatus = 'checking' | 'ok' | 'down';

export function useBackendHealth(pollMs = 15000) {
  const [status, setStatus] = useState<HealthStatus>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const check = useCallback(async () => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000); // таймаут 5 сек

    try {
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        signal: ctrl.signal,
        cache: 'no-store',
      });
      setStatus(res.ok ? 'ok' : 'down');
    } catch {
      setStatus('down');
    } finally {
      clearTimeout(timer);
      setLastCheck(new Date());
    }
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, pollMs);
    return () => clearInterval(id);
  }, [check, pollMs]);

  return { status, lastCheck, recheck: check };
}

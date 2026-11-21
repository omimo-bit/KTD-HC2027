'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDashboard } from '@/lib/api';
import type { DashboardData } from '@/lib/types';

export function useLiveDashboard(token: string, intervalMs = 15000) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    if (!token) return;
    try { const result = await getDashboard(token); setData(result); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load dashboard'); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => {
    let timer: number | undefined; let stopped = false;
    const schedule = () => {
      if (stopped) return;
      const jitter = Math.round((Math.random() - 0.5) * Math.min(4000, intervalMs * 0.2));
      timer = window.setTimeout(async () => {
        if (document.visibilityState === 'visible') await refresh();
        schedule();
      }, Math.max(5000, intervalMs + jitter));
    };
    void refresh().finally(schedule);
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { stopped = true; if (timer) window.clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [refresh, intervalMs]);
  return { data, loading, error, refresh };
}

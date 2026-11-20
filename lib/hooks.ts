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
  useEffect(() => { void refresh(); const timer = window.setInterval(() => void refresh(), intervalMs); return () => window.clearInterval(timer); }, [refresh, intervalMs]);
  return { data, loading, error, refresh };
}

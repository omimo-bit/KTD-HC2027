'use client';

import { useCallback, useEffect, useState } from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import { getOfflineQueue, syncOfflineQueue } from '@/lib/offline-queue';

export default function OfflineQueueSync() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    try { setPending((await getOfflineQueue()).length); } catch { setPending(0); }
  }, []);

  const synchronize = useCallback(async () => {
    if (!navigator.onLine) { await refresh(); return; }
    setSyncing(true);
    try { await syncOfflineQueue(); } catch { /* keep unsent items for the next attempt */ }
    await refresh();
    setSyncing(false);
  }, [refresh]);

  useEffect(() => {
    void refresh();
    void synchronize();
    const online = () => void synchronize();
    const changed = () => void refresh();
    window.addEventListener('online', online);
    window.addEventListener('kd-offline-queue-change', changed);
    const timer = window.setInterval(() => void synchronize(), 30_000);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('kd-offline-queue-change', changed);
      window.clearInterval(timer);
    };
  }, [refresh, synchronize]);

  if (!pending) return null;
  return <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800" title="Transaksi tersimpan di perangkat dan menunggu sinkronisasi.">
    {syncing ? <Cloud size={13} /> : <CloudOff size={13} />}
    {syncing ? 'Syncing' : `${pending} pending`}
  </span>;
}

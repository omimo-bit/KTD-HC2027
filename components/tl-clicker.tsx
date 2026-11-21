'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, Camera, Minus, Plus, Sparkles, Users } from 'lucide-react';
import { apiPost, getBooths } from '@/lib/api';
import { useLiveDashboard } from '@/lib/hooks';
import type { Booth, SessionUser } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

type Metric = 'VISITOR' | 'UNIQUE_MIRROR' | 'PHOTO_BOOTH';
const METRICS: { id: Metric; label: string; icon: typeof Users }[] = [
  { id: 'VISITOR', label: 'Booth Visitors', icon: Users },
  { id: 'UNIQUE_MIRROR', label: 'Unique Mirror', icon: Sparkles },
  { id: 'PHOTO_BOOTH', label: 'Photo Booth', icon: Camera }
];

export default function TlClicker({ token, user }: { token: string; user: SessionUser }) {
  const { data, refresh } = useLiveDashboard(token, 15000);
  const [metric, setMetric] = useState<Metric>('VISITOR');
  const [booths, setBooths] = useState<Booth[]>([]);
  const [venueId, setVenueId] = useState(user.venueId || '');
  const [counts, setCounts] = useState<Record<Metric, number>>({ VISITOR: 0, UNIQUE_MIRROR: 0, PHOTO_BOOTH: 0 });
  const [busy, setBusy] = useState(false);
  const pendingClicks = useRef(0);
  const pendingMetric = useRef<Metric>('VISITOR');
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tapFlash, setTapFlash] = useState(false);
  const venueStats = data?.venues.find(v => v.venueId === venueId);
  useEffect(() => { getBooths(token).then(list => { setBooths(list); setVenueId(current => current || list[0]?.venueId || ''); }).catch(() => undefined); }, [token]);
  useEffect(() => { if (venueStats && pendingClicks.current === 0) setCounts({ VISITOR: venueStats.visitors, UNIQUE_MIRROR: venueStats.uniqueMirror, PHOTO_BOOTH: venueStats.photoBooth }); }, [venueStats]);

  async function flushClicks() {
    if (pendingClicks.current === 0 || !venueId || busy) return;
    const amount = pendingClicks.current; const metricToSend = pendingMetric.current; const venueToSend = venueId;
    pendingClicks.current = 0; setBusy(true);
    try {
      const result = await apiPost<{ total: number; delta: number }>('visitorClickBatch', token, { venueId: venueToSend, metric: metricToSend, delta: amount });
      if (mounted.current && metricToSend === metric && venueToSend === venueId) setCounts(current => ({ ...current, [metricToSend]: result.total + pendingClicks.current }));
      if (mounted.current) setMessage(`${amount} click tersimpan`);
      void refresh();
    } catch (e) {
      if (mounted.current) setError((e instanceof Error ? e.message : 'Click belum terkonfirmasi.') + ' Periksa total di dashboard sebelum mengulang hitungan.');
    } finally { if (mounted.current) { setBusy(false); if (pendingClicks.current > 0) flushTimer.current = setTimeout(() => { void flushClicks(); }, 250); } }
  }

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (flushTimer.current) clearTimeout(flushTimer.current); }; }, []);

  function click(delta: 1 | -1) {
    if (delta < 0) {
      if (busy || counts[metric] <= 0) return;
      setCounts(current => ({ ...current, [metric]: Math.max(0, current[metric] - 1) }));
      void apiPost<{ total: number }>('visitorClick', token, { venueId, metric, delta: -1 }).then(result => setCounts(current => ({ ...current, [metric]: result.total }))).catch(e => setError(e instanceof Error ? e.message : 'Undo gagal disimpan.'));
      return;
    }
    setError(''); setMessage(''); setTapFlash(true);
    if (pendingClicks.current === 0) pendingMetric.current = metric;
    if (pendingClicks.current > 0 && pendingMetric.current !== metric) { void flushClicks(); pendingMetric.current = metric; }
    pendingClicks.current += 1;
    setCounts(current => ({ ...current, [metric]: current[metric] + 1 }));
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(18);
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => { void flushClicks(); }, 350);
    window.setTimeout(() => setTapFlash(false), 120);
  }
  const current = counts[metric];
  return <div className="mx-auto max-w-3xl space-y-5">
    <div className="panel flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-kd-blue">Primary TL control</p><h3 className="mt-1 text-lg font-black">Digital Visitor Clicker</h3><p className="mt-1 text-xs text-slate-500">{venueId} · {venueStats?.name || 'Assigned venue'}</p></div><span className="tag bg-emerald-50 text-emerald-700"><span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> LIVE SYNC</span></div>
    <div className="panel panel-pad">
      {user.role === 'ADMIN' && <div className="mb-4"><label className="field-label">Select venue to count</label><select className="field-input" value={venueId} onChange={e=>setVenueId(e.target.value)}>{booths.map(b=><option key={b.venueId} value={b.venueId}>{b.name}</option>)}</select></div>}
      <div className="grid grid-cols-3 gap-2">{METRICS.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => setMetric(item.id)} className={`rounded-xl border p-3 text-left transition ${metric === item.id ? 'border-kd-blue bg-blue-50 text-kd-blue' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}><Icon size={18} /><p className="mt-2 text-[11px] font-bold leading-4">{item.label}</p></button>; })}</div>
      <div className="py-10 text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">{METRICS.find(m => m.id === metric)?.label} · TOTAL COUNT</p><p className="mt-2 text-7xl font-black tabular-nums tracking-tighter text-slate-900 md:text-8xl">{formatNumber(current)}</p><p className="mt-2 text-xs text-slate-400">Angka bertambah langsung. Simpan otomatis dalam batch singkat.</p></div>
      {error && <div className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-xl bg-emerald-50 px-3 py-2.5 text-center text-xs font-bold text-emerald-700">{message}</div>}
      <div className="grid grid-cols-[.75fr_1.7fr] gap-3">
        <button onClick={() => void click(-1)} disabled={current <= 0 || busy || pendingClicks.current > 0} className="flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-kd-red disabled:opacity-35"><Minus size={25} /><span className="text-xs font-black uppercase tracking-wider">Undo -1</span></button>
        <button onClick={() => void click(1)} disabled={!venueId} className={`flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-2xl bg-kd-blue text-white shadow-[0_12px_26px_rgba(0,51,153,.22)] transition hover:bg-blue-900 active:scale-[.985] disabled:opacity-60 ${tapFlash ? 'scale-[.985]' : ''}`}><Plus size={31} strokeWidth={3} /><span className="text-base font-black tracking-wider">+1 {metric === 'VISITOR' ? 'VISITOR' : metric === 'UNIQUE_MIRROR' ? 'MIRROR USER' : 'PHOTO BOOTH'}</span><span className="text-[10px] text-blue-200">FAST TAP · AUTO BATCH SAVE</span></button>
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">{METRICS.map(m => <div key={m.id} className="panel p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-500">{m.label}</p><Activity size={15} className="text-kd-blue" /></div><p className="mt-2 text-2xl font-black">{formatNumber(counts[m.id])}</p></div>)}</div>
    <p className="px-1 text-[11px] leading-5 text-slate-400">Undo only removes one count from the active metric and is recorded as a negative event in the audit log. Use venue handover to reconcile larger discrepancies.</p>
  </div>;
}

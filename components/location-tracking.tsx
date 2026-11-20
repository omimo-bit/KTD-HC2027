'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, RefreshCw, Users } from 'lucide-react';
import { getLiveLocations } from '@/lib/api';
import type { StaffLocation } from '@/lib/types';

const StaffLocationMap = dynamic(() => import('@/components/staff-location-map'), {
  ssr: false,
  loading: () => <div className="flex h-[430px] items-center justify-center text-sm text-slate-500">Loading map…</div>
});

type Filter = 'ALL' | 'TL' | 'SPG' | 'CREW';

export default function LocationTracking({ token, role }: { token: string; role: string }) {
  const [locations, setLocations] = useState<StaffLocation[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshedAt, setRefreshedAt] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await getLiveLocations<StaffLocation[]>(token);
      setLocations(data);
      setRefreshedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lokasi belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const filtered = useMemo(() => filter === 'ALL' ? locations : locations.filter(item => item.role === filter), [locations, filter]);
  const liveCount = locations.filter(item => item.status === 'LIVE').length;
  const canViewAll = role === 'ADMIN' || role === 'CLIENT';

  return (
    <div className="space-y-4">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-kd-blue">Team location monitor</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">Live Staff Tracking</h3>
          <p className="mt-1 text-xs text-slate-500">{canViewAll ? 'All activation points · TL, SPG, and Crew' : 'Your assigned venue · Team location'}</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="btn-secondary"><RefreshCw size={14} /> Refresh</button>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="panel p-4"><p className="text-xs text-slate-500">Staff reporting</p><p className="mt-1 text-2xl font-bold tabular-nums">{locations.length}</p></div>
        <div className="panel p-4"><p className="text-xs text-slate-500">Live · under 3 minutes</p><p className="mt-1 text-2xl font-bold tabular-nums text-emerald-700">{liveCount}</p></div>
        <div className="panel p-4"><p className="text-xs text-slate-500">Last refresh</p><p className="mt-1 text-lg font-semibold tabular-nums">{refreshedAt || '—'}</p></div>
      </div>
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="flex items-center gap-2"><MapPin size={17} className="text-kd-blue" /><h3 className="text-sm font-bold text-slate-900">Staff map</h3></div>
          <select className="field-input max-w-[180px]" value={filter} onChange={e => setFilter(e.target.value as Filter)}>
            <option value="ALL">All roles</option><option value="TL">Team Leader</option><option value="SPG">SPG</option><option value="CREW">Crew</option>
          </select>
        </div>
        <div className="h-[430px] p-2"><StaffLocationMap locations={filtered} /></div>
      </div>
      <div className="panel overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3"><Users size={16} className="text-kd-blue" /><h3 className="text-sm font-bold text-slate-900">Location report ({filtered.length})</h3></div>
        {filtered.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">{loading ? 'Loading location data…' : 'Belum ada lokasi. Pastikan staf membuka PWA dan memberikan izin GPS.'}</div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3">Staff</th><th className="px-3 py-3">Role / Shift</th><th className="px-3 py-3">Venue</th><th className="px-3 py-3">Last update</th><th className="px-3 py-3">GPS accuracy</th><th className="px-3 py-3">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{filtered.map(person => <tr key={person.userId}><td className="px-4 py-3 font-semibold text-slate-800">{person.name}</td><td className="px-3 py-3 text-xs text-slate-600">{person.role} · {person.shift}</td><td className="px-3 py-3 text-xs text-slate-600">{person.venueId}</td><td className="px-3 py-3 text-xs text-slate-600">{person.ageMinutes} min ago</td><td className="px-3 py-3 text-xs text-slate-600">±{Math.round(person.accuracy)} m</td><td className="px-3 py-3"><span className={`tag ${person.status === 'LIVE' ? 'bg-emerald-50 text-emerald-700' : person.status === 'RECENT' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{person.status}</span></td></tr>)}</tbody>
          </table></div>
        )}
      </div>
      <p className="px-1 text-xs leading-5 text-slate-500">GPS dikirim berkala saat PWA terbuka, perangkat online, dan izin lokasi diberikan. Browser/PWA biasa tidak menjamin pelacakan terus berjalan saat aplikasi ditutup atau sistem membatasi aktivitas latar belakang.</p>
    </div>
  );
}

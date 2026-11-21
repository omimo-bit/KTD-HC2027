'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Camera, ExternalLink, MapPin, Navigation, Users, RefreshCw } from 'lucide-react';
import { getBooths, getMapData } from '@/lib/api';
import { formatIDR, formatNumber } from '@/lib/utils';
import type { Booth, StaffLocation } from '@/lib/types';
import { useAuth } from '@/components/auth-provider';

const LeafletMap = dynamic(() => import('@/components/leaflet-map'), { ssr: false, loading: () => <div className="flex h-[470px] items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">Loading OpenStreetMap…</div> });

export default function MudikMap({ token }: { token: string }) {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selected, setSelected] = useState<Booth | null>(null);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState<StaffLocation[]>([]);
  const [lastLocationRefresh, setLastLocationRefresh] = useState('');
  const { user } = useAuth();
  const canTrack = ['ADMIN', 'CLIENT', 'TL'].includes(user?.role || '');
  const [data, setData] = useState<import('@/lib/types').DashboardData | null>(null);
  const loadMapData = useCallback(async () => { if (!canTrack) return; try { const result = await getMapData(token); setData(result.dashboard); setLocations(result.locations); setLastLocationRefresh(new Date().toLocaleTimeString('id-ID')); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Data peta belum dapat dimuat.'); } }, [token, canTrack]);
  useEffect(() => { getBooths(token).then(setBooths).catch(e => setError(e.message)); void loadMapData(); let timer: number; let stopped = false; const schedule = () => { if (stopped) return; timer = window.setTimeout(async () => { if (document.visibilityState === 'visible') await loadMapData(); schedule(); }, 15000 + Math.round((Math.random() - .5) * 3000)); }; schedule(); return () => { stopped = true; window.clearTimeout(timer); }; }, [token, loadMapData]);
  const selectedStats = useMemo(() => data?.venues.find(v => v.venueId === selected?.venueId), [data, selected]);
  const activeBooths = booths.filter(b => b.isActive === true || String(b.isActive).toLowerCase() === 'true');

  return <div className="space-y-5">
    <div className="grid gap-4 md:grid-cols-3"><div className="panel p-4"><p className="text-xs font-semibold text-slate-500">Mapped activation points</p><p className="mt-2 text-2xl font-black">{activeBooths.length} <span className="text-xs font-semibold text-slate-400">/ 12</span></p></div><div className="panel p-4"><p className="text-xs font-semibold text-slate-500">Rest Areas</p><p className="mt-2 text-2xl font-black text-kd-blue">{activeBooths.filter(b => b.type === 'REST_AREA').length}</p></div><div className="panel p-4"><p className="text-xs font-semibold text-slate-500">Pelabuhan</p><p className="mt-2 text-2xl font-black text-kd-red">{activeBooths.filter(b => b.type === 'PORT').length}</p></div></div>
    {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-4 xl:grid-cols-[1.7fr_.8fr]">
      <div className="panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h3 className="section-title">Indonesia Mudik Activation Map</h3><p className="section-subtitle">Venue pins and staff GPS · refresh 15 seconds · map zoom stays where you set it</p></div><div className="flex gap-3 text-[11px] font-semibold"><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-kd-blue" /> Rest Area</span><span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-kd-red" /> Pelabuhan</span></div></div><div className="h-[520px] p-2"><LeafletMap booths={activeBooths} stats={data?.venues || []} locations={locations} onSelect={setSelected} /></div><div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 text-[10px] text-slate-400"><span>Team GPS: {locations.filter(x => x.status === 'LIVE').length} live / {locations.length} reported · updated {lastLocationRefresh || '—'}</span><button onClick={() => { void loadMapData(); }} className="inline-flex items-center gap-1 font-semibold text-kd-blue"><RefreshCw size={12}/> Refresh data</button><span>Map coordinates are approximate planning pins. Verify final booth GPS locations with each venue team before deployment. Map data © OpenStreetMap contributors.</span></div></div>
      <div className="panel panel-pad min-h-[300px]">
        {selected ? <>
          <div className="flex items-start justify-between gap-3"><div><span className={`tag ${selected.type === 'REST_AREA' ? 'bg-blue-50 text-kd-blue' : 'bg-red-50 text-kd-red'}`}>{selected.type === 'REST_AREA' ? 'REST AREA' : 'PELABUHAN'}</span><h3 className="mt-3 text-xl font-black">{selected.name}</h3><p className="mt-1 text-xs text-slate-500">{selected.region} · {selected.province}</p></div><button onClick={() => setSelected(null)} className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100">Close</button></div>
          <div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-500">Visitors</p><p className="mt-1 text-lg font-black">{formatNumber(selectedStats?.visitors)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-500">Bottle sales</p><p className="mt-1 text-lg font-black">{formatNumber(selectedStats?.bottles)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-500">Sampling</p><p className="mt-1 text-lg font-black">{formatNumber(selectedStats?.sampling)} <small className="text-[10px] text-slate-400">cups</small></p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-500">Revenue</p><p className="mt-1 text-sm font-black">{formatIDR(selectedStats?.revenue)}</p></div></div>
          <div className="mt-4 rounded-xl border border-slate-100 p-3"><div className="flex items-center justify-between"><p className="text-xs font-bold text-slate-700">Venue operations</p><span className="tag bg-slate-100 text-slate-500">{selected.trafficStatus || 'TRAFFIC UNKNOWN'}</span></div><p className="mt-2 text-[11px] text-slate-500">{selected.startDate} — {selected.endDate} · {selected.manpower} manpower</p><p className="mt-1 text-[11px] text-slate-500">Target: {formatNumber(selectedStats?.target || selected.targetTotal)} bottles</p></div>
          {selectedStats?.latestPhoto && <a href={selectedStats.latestPhoto} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-semibold text-kd-blue"><Camera size={15} /> View latest booth photo <ExternalLink size={13} className="ml-auto" /></a>}
          <div className="mt-4">{selected.cctvUrl ? <a href={selected.cctvUrl} target="_blank" rel="noreferrer" className="btn-primary w-full"><Activity size={15} /> Open venue CCTV <ExternalLink size={14} /></a> : <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">CCTV stream URL has not been configured for this venue yet.</div>}</div>
        </> : <div className="flex h-full min-h-[330px] flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-kd-blue"><Navigation size={24} /></div><h3 className="mt-4 font-bold text-slate-900">Select a venue pin</h3><p className="mt-1 max-w-[230px] text-xs leading-5 text-slate-500">Click one of the blue or red pins to view its KPI, targets, latest photo, and CCTV link.</p></div>}
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{activeBooths.map(b => <button key={b.venueId} onClick={() => setSelected(b)} className="panel flex items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${b.type === 'REST_AREA' ? 'bg-blue-50 text-kd-blue' : 'bg-red-50 text-kd-red'}`}><MapPin size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{b.name}</p><p className="text-[11px] text-slate-500">{b.region} · {b.type === 'REST_AREA' ? 'Rest Area' : 'Pelabuhan'}</p></div><span className="text-[10px] font-bold text-slate-400">{formatNumber(b.targetTotal || 0)} btl</span></button>)}</div>
  </div>;
}

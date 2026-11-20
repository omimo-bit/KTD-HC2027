'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Expand, Radio, RefreshCw, VideoOff } from 'lucide-react';
import { getBooths } from '@/lib/api';
import type { Booth } from '@/lib/types';

function normalizeYouTube(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}?autoplay=0&mute=1`;
    if (parsed.hostname.includes('youtube.com') && parsed.pathname === '/watch') return `https://www.youtube.com/embed/${parsed.searchParams.get('v')}?autoplay=0&mute=1`;
    return url;
  } catch { return url; }
}

function HlsPlayer({ url, name }: { url: string; name: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let hls: { destroy: () => void } | null = null;
    let active = true;
    async function attach() {
      const video = videoRef.current;
      if (!video || !url) return;
      try {
        const module = await import('hls.js');
        if (!active) return;
        const Hls = module.default;
        if (Hls.isSupported()) {
          const instance = new Hls({ enableWorker: true, lowLatencyMode: true, liveSyncDurationCount: 3 });
          hls = instance;
          instance.loadSource(url);
          instance.attachMedia(video);
          instance.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) setError('Stream unavailable. Check camera URL / HLS access.'); });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else setError('HLS playback is not supported in this browser.');
      } catch { setError('Unable to load HLS player.'); }
    }
    void attach();
    return () => { active = false; hls?.destroy(); };
  }, [url]);
  return <div className="relative h-full w-full bg-[#0b1220]"><video ref={videoRef} className="video-frame" controls playsInline muted autoPlay /><div className="pointer-events-none absolute left-2 top-2 rounded bg-black/55 px-2 py-1 text-[9px] font-bold text-white">{name}</div>{error && <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-3 text-center text-[11px] text-white">{error}</div>}</div>;
}

function CameraTile({ booth }: { booth: Booth }) {
  const url = String(booth.cctvUrl || '').trim();
  const type = String(booth.cctvType || 'HLS').toUpperCase();
  const tileRef = useRef<HTMLDivElement>(null);
  const fullscreen = () => { if (tileRef.current?.requestFullscreen) void tileRef.current.requestFullscreen(); };
  return <div ref={tileRef} className="group relative flex min-h-[178px] flex-col overflow-hidden rounded-xl bg-[#0b1220]">
    <div className={`absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-black tracking-wider text-white ${url ? 'bg-red-600' : 'bg-slate-600'}`}>{url && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}{url ? 'STREAM SET' : 'NO STREAM'}</div>
    <button onClick={fullscreen} className="absolute right-2 top-2 z-10 rounded-lg bg-black/50 p-1.5 text-white opacity-70 transition hover:opacity-100" title="Fullscreen"><Expand size={13} /></button>
    {url ? type === 'YOUTUBE' ? <iframe className="h-full min-h-[178px] w-full" src={normalizeYouTube(url)} title={`${booth.name} CCTV`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : type === 'IP_CAM' ? <iframe className="h-full min-h-[178px] w-full" src={url} title={`${booth.name} IP camera`} allow="autoplay; fullscreen" /> : <HlsPlayer url={url} name={booth.name} /> : <div className="flex min-h-[178px] flex-1 flex-col items-center justify-center px-4 text-center text-slate-400"><VideoOff size={25} /><p className="mt-2 text-xs font-bold text-slate-200">No camera configured</p><p className="mt-1 text-[10px]">{booth.name}</p></div>}
    <div className="flex items-center justify-between gap-2 bg-[#111c32] px-3 py-2 text-white"><div className="min-w-0"><p className="truncate text-[11px] font-bold">{booth.name}</p><p className="text-[9px] text-slate-400">{booth.region} · {type}</p></div><span className="shrink-0 rounded bg-white/10 px-2 py-1 text-[9px] font-bold text-slate-300">{booth.type === 'REST_AREA' ? 'RA' : 'PORT'}</span></div>
  </div>;
}

export default function CctvWall({ token }: { token: string }) {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [layout, setLayout] = useState('4');
  const [region, setRegion] = useState('ALL');
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const load = () => getBooths(token).then((list) => { setBooths(list); setSelected(current => current || list[0]?.venueId || ''); }).catch(e => setError(e.message));
  useEffect(() => { void load(); }, [token]);
  const regions = useMemo(() => Array.from(new Set(booths.map(b => b.region))).sort(), [booths]);
  const filtered = booths.filter(b => region === 'ALL' || b.region === region);
  const count = layout === '1' ? 1 : layout === '4' ? 4 : layout === '9' ? 9 : 12;
  const display = layout === '1' ? filtered.filter(b => b.venueId === selected).concat(filtered.filter(b => b.venueId !== selected)).slice(0, 1) : filtered.slice(0, count);
  const gridClass = layout === '1' ? 'grid-cols-1' : layout === '4' ? 'grid-cols-1 sm:grid-cols-2' : layout === '9' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

  return <div className="space-y-5">
    {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="panel flex flex-wrap items-center justify-between gap-4 p-4"><div><div className="flex items-center gap-2"><Radio className="text-kd-red" size={18} /><h3 className="font-bold">Live Booth CCTV Wall</h3></div><p className="mt-1 text-[11px] text-slate-500">HLS.js · YouTube Unlisted · IP Webcam embed</p></div><div className="flex flex-wrap items-center gap-2"><select className="field-input !w-auto !py-2 text-xs" value={region} onChange={e => setRegion(e.target.value)}><option value="ALL">All regions</option>{regions.map(r => <option key={r}>{r}</option>)}</select><div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">{[['1','1×1'],['4','2×2'],['9','3×3'],['12','All 12']].map(([v,l]) => <button key={v} onClick={() => setLayout(v)} className={`rounded-lg px-3 py-2 text-[11px] font-bold ${layout === v ? 'bg-kd-blue text-white shadow-sm' : 'text-slate-500 hover:bg-white'}`}>{l}</button>)}</div><button className="btn-secondary !px-3 !py-2" onClick={() => void load()} title="Refresh cameras"><RefreshCw size={15} /></button></div></div>
    <div className={`grid gap-3 ${gridClass}`}>{display.map(b => <CameraTile key={b.venueId} booth={b} />)}</div>
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[11px] text-slate-500"><span><Activity size={13} className="mr-1 inline text-emerald-600" /> {display.length} camera slot(s) shown · {booths.length} venues accessible</span><span>Stream availability depends on camera URL, network, and provider permissions.</span></div>
  </div>;
}

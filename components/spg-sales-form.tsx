'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Gift, PlusCircle, ShoppingCart, Sparkles, Store, Waves } from 'lucide-react';
import { getBooths, getMySales, apiPost } from '@/lib/api';
import { REST_PACKAGES, PORT_PACKAGES, IDM_PACKAGES, PRIZES } from '@/lib/campaign';
import type { Booth, SessionUser } from '@/lib/types';
import { formatIDR, formatNumber } from '@/lib/utils';

type ProductMode = 'REST_AREA' | 'PORT' | 'IDM';

export default function SpgSalesForm({ token, user }: { token: string; user: SessionUser }) {
  const [booth, setBooth] = useState<Booth | null>(null);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [venueId, setVenueId] = useState(user.venueId || '');
  const [mode, setMode] = useState<ProductMode>('REST_AREA');
  const [packageCode, setPackageCode] = useState('RA_P1');
  const [qty, setQty] = useState('1');
  const [storeCode, setStoreCode] = useState('');
  const [cups, setCups] = useState('');
  const [samplingType, setSamplingType] = useState('Kratingdaeng');
  const [igStories, setIgStories] = useState('');
  const [selectedPrize, setSelectedPrize] = useState('');
  const [selectedTier, setSelectedTier] = useState('TIER_1');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [lastSale, setLastSale] = useState<{ bottles: number; cans: number; revenue: number; luckyDipChances: number } | null>(null);
  const [luckyAvailable, setLuckyAvailable] = useState(0);

  useEffect(() => { getBooths(token).then(list => { setBooths(list); setVenueId(current => current || list.find(b => b.venueId === user.venueId)?.venueId || list[0]?.venueId || ''); }).catch(e => setError(e.message)); if (['SPG','ADMIN'].includes(user.role)) getMySales<{ luckyDip: { available: number } }>(token).then(result => setLuckyAvailable(result.luckyDip.available)).catch(() => undefined); }, [token, user.venueId, user.role]);
  useEffect(() => { const selected = booths.find(b => b.venueId === venueId) || null; setBooth(selected); if (selected) { setMode(selected.type === 'PORT' ? 'PORT' : 'REST_AREA'); setPackageCode(selected.type === 'PORT' ? 'PORT_P1' : 'RA_P1'); setStoreCode(''); } }, [booths, venueId]);
  const packages = mode === 'PORT' ? PORT_PACKAGES : mode === 'IDM' ? IDM_PACKAGES : REST_PACKAGES;
  const selectedPackage = packages.find(p => p.code === packageCode) || packages[0];
  const total = useMemo(() => Number(qty || 0) * (selectedPackage?.price || 0), [qty, selectedPackage]);
  const allowedStores = (booth?.idmCodes || '').split(',').map(s => s.trim()).filter(Boolean);

  async function submitSale(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const result = await apiPost<{ bottles: number; cans: number; revenue: number; luckyDipChances: number }>('recordSale', token, { venueId, productMode: mode, packageCode, qty: Number(qty), storeCode, spgName: user.name });
      setLastSale(result); setLuckyAvailable(v => v + result.luckyDipChances); setNotice(`Sale saved · ${formatNumber(result.bottles)} bottles · ${formatNumber(result.cans)} cans · ${result.luckyDipChances} Lucky Dip chance(s)`); setQty('1');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save sale.'); }
    finally { setBusy(false); }
  }
  async function submitSampling(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { const result = await apiPost<{ cups: number; igStories: number }>('recordSampling', token, { venueId, cups: Number(cups || 0), samplingType, igStories: Number(igStories || 0), spgName: user.name }); setNotice(`Sampling & engagement saved · ${formatNumber(result.cups)} cups · ${formatNumber(result.igStories)} IG Stories`); setCups(''); setIgStories(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save sampling.'); }
    finally { setBusy(false); }
  }
  async function redeem(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { const result = await apiPost<{ prize: string; remaining: number }>('redeemPrize', token, { venueId, prize: selectedPrize, tier: selectedTier }); setLuckyAvailable(v => Math.max(0, v - 1)); setNotice(`${result.prize} redeemed. Remaining stock: ${formatNumber(result.remaining)}.`); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to redeem prize.'); }
    finally { setBusy(false); }
  }

  return <div className="space-y-5">
    <div className="panel flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-kd-blue">SPG dedicated sales package</p><h3 className="mt-1 text-lg font-black">{booth?.name || 'Assigned venue'}</h3><p className="mt-1 text-xs text-slate-500">{booth?.type === 'PORT' ? 'Pelabuhan Selling Mode' : 'Rest Area Selling Mode'} · {user.shift || 'Shift not assigned'}</p></div><span className="tag bg-blue-50 text-kd-blue">{booth?.type === 'PORT' ? 'PORT' : 'REST AREA'}</span></div>
    {user.role === 'ADMIN' && <div className="panel p-4"><label className="field-label">Admin · Select venue for sales entry</label><select className="field-input" value={venueId} onChange={e=>setVenueId(e.target.value)}>{booths.map(b=><option key={b.venueId} value={b.venueId}>{b.name}</option>)}</select></div>}
    {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}{notice && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={17} /> {notice}</div>}
    <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <div className="space-y-5">
        <form onSubmit={submitSale} className="panel panel-pad"><div className="flex items-center gap-2"><ShoppingCart size={19} className="text-kd-blue" /><h3 className="section-title">Package selling logger</h3></div><p className="section-subtitle">Select the correct selling mode and record each transaction batch.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">{([{id:'REST_AREA',label:'Rest Area',icon:Store},{id:'PORT',label:'Pelabuhan',icon:Waves},{id:'IDM',label:'MT Indomaret',icon:Store}] as const).filter(m => m.id !== 'PORT' || booth?.type === 'PORT').filter(m => m.id !== 'REST_AREA' || booth?.type !== 'PORT').filter(m => m.id !== 'IDM' || booth?.type === 'REST_AREA').map(item => { const Icon = item.icon; return <button type="button" key={item.id} onClick={() => { setMode(item.id); setPackageCode(item.id === 'REST_AREA' ? 'RA_P1' : item.id === 'PORT' ? 'PORT_P1' : 'IDM_PACK3'); }} className={`rounded-xl border p-3 text-left transition ${mode === item.id ? 'border-kd-blue bg-blue-50 text-kd-blue' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}><Icon size={17} /><p className="mt-2 text-[11px] font-bold">{item.label}</p></button>; })}</div>
          {mode === 'IDM' && <div className="mt-4"><label className="field-label">Indomaret Store Code</label><select className="field-input" value={storeCode} onChange={e => setStoreCode(e.target.value)} required><option value="">Select assigned store</option>{allowedStores.map(s => <option key={s}>{s}</option>)}</select></div>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{packages.map(p => <button type="button" key={p.code} onClick={() => setPackageCode(p.code)} className={`rounded-xl border p-4 text-left transition ${packageCode === p.code ? 'border-kd-blue bg-blue-50 ring-1 ring-blue-100' : 'border-slate-200 hover:bg-slate-50'}`}><div className="flex items-start justify-between gap-2"><p className="text-sm font-bold text-slate-900">{p.label}</p>{packageCode === p.code && <CheckCircle2 size={16} className="text-kd-blue" />}</div><p className="mt-1 text-xs text-slate-500">{p.detail}</p><p className="mt-3 text-lg font-black text-kd-blue">{p.price === 0 ? 'Sell-out count' : formatIDR(p.price)}</p></button>)}</div>
          <div className="mt-4 grid grid-cols-2 gap-3"><div><label className="field-label">Quantity / transaction count</label><input className="field-input" type="number" min="1" max="500" value={qty} onChange={e => setQty(e.target.value)} required /></div><div><label className="field-label">Transaction value</label><div className="field-input flex items-center bg-slate-50 font-bold text-slate-700">{mode === 'IDM' ? 'Not captured' : formatIDR(total)}</div></div></div>
          {mode !== 'IDM' && <div className="mt-3 rounded-xl bg-amber-50 p-3 text-[11px] leading-5 text-amber-900"><b>Lucky Dip rule:</b> 1 chance requires both minimum Rp20.000 transaction value and 4 product pieces. The API calculates the eligible chances automatically.</div>}
          <button disabled={busy || !booth} className="btn-primary mt-5 w-full"><PlusCircle size={16} /> {busy ? 'Saving transaction…' : 'Save Sales Transaction'}</button>
        </form>
        <form onSubmit={submitSampling} className="panel panel-pad"><div className="flex items-center gap-2"><Sparkles size={18} className="text-amber-600" /><h3 className="section-title">Sampling & engagement counter</h3></div><p className="section-subtitle">Fast input for free sampling cups and social media engagement.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><div><label className="field-label">Sampling product</label><select className="field-input" value={samplingType} onChange={e => setSamplingType(e.target.value)}><option>Kratingdaeng</option><option>Torpedo XL</option></select></div><div><label className="field-label">Cups distributed</label><input className="field-input" type="number" min="0" value={cups} onChange={e => setCups(e.target.value)} placeholder="0" /></div><div><label className="field-label">IG Story mentions</label><input className="field-input" type="number" min="0" value={igStories} onChange={e => setIgStories(e.target.value)} placeholder="0" /></div></div><button disabled={busy} className="btn-secondary mt-4 w-full"><Sparkles size={15} /> Save Sampling & Engagement</button></form>
      </div>
      <div className="space-y-5">
        <div className="panel panel-pad"><div className="flex items-center gap-2"><Gift size={19} className="text-kd-red" /><h3 className="section-title">Auto Lucky Dip & gimmick deduction</h3></div><p className="section-subtitle">Redeem one prize only when you have an unused eligible chance.</p><div className="mt-4 rounded-xl bg-blue-50 p-4"><p className="text-xs font-bold text-blue-800">Available chances (this session)</p><p className="mt-1 text-3xl font-black text-kd-blue">{luckyAvailable}</p><p className="mt-1 text-[10px] text-blue-700">The backend also validates daily earned and used chances.</p></div>
          <form onSubmit={redeem} className="mt-4 space-y-3"><div><label className="field-label">Prize tier</label><select className="field-input" value={selectedTier} onChange={e => { setSelectedTier(e.target.value); setSelectedPrize(PRIZES.find(p => p.tier === e.target.value)?.items[0] || ''); }}><option value="TIER_1">Tier 1 · Kaos / Topi</option><option value="TIER_2">Tier 2 · Umbrella / Raincoat / Toll Stick / Bag Cover</option><option value="TIER_3">Tier 3 · Shopping Bag</option></select></div><div><label className="field-label">Select prize</label><select className="field-input" value={selectedPrize || PRIZES.find(p => p.tier === selectedTier)?.items[0]} onChange={e => setSelectedPrize(e.target.value)}>{(PRIZES.find(p => p.tier === selectedTier)?.items || []).map(i => <option key={i}>{i}</option>)}</select></div><button disabled={busy} className="btn-primary w-full"><Gift size={15} /> Redeem & Deduct Stock</button></form>
        </div>
        <div className="panel panel-pad"><h3 className="section-title">Last transaction</h3>{lastSale ? <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-500">Bottles</p><p className="mt-1 text-xl font-black">{formatNumber(lastSale.bottles)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-500">Cans</p><p className="mt-1 text-xl font-black">{formatNumber(lastSale.cans)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-500">Revenue</p><p className="mt-1 text-sm font-black">{formatIDR(lastSale.revenue)}</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-500">Lucky Dip</p><p className="mt-1 text-xl font-black">{lastSale.luckyDipChances}</p></div></div> : <div className="mt-4 rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-500">No transaction recorded in this session yet.</div>}</div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[11px] leading-5 text-slate-500">Personal target guidance: Rest Area SPG target is expected around 88–123 bottles/day; Port SPG target around 100–200 bottles/day. Final individual targets should be assigned by TL / Admin for the active staffing roster.</div>
      </div>
    </div>
  </div>;
}

'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CarFront, MapPin, PlusCircle, ShoppingBag } from 'lucide-react';
import { apiPost, apiGet, getBooths } from '@/lib/api';
import type { Booth, SessionUser } from '@/lib/types';

export default function MobileSales({ token, user }: { token: string; user: SessionUser }) {
  const [activityType, setActivityType] = useState('MOBILE_TROLLEY_SALE');
  const [venueId, setVenueId] = useState(user.venueId || '');
  const [booths, setBooths] = useState<Booth[]>([]);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('BOTTLE');
  const [location, setLocation] = useState('PARKING');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [activityLogs, setActivityLogs] = useState<Array<Record<string, unknown>>>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (user.role === 'ADMIN') getBooths(token).then(list => { setBooths(list); setVenueId(current => current || list[0]?.venueId || ''); }).catch(e => setError(e.message)); }, [token, user.role]);
  useEffect(() => { if (venueId || user.role !== 'ADMIN') apiGet<Array<Record<string, unknown>>>('mobileActivity', token, venueId ? { venueId } : {}).then(setActivityLogs).catch(e => setError(e.message)); }, [token, venueId, user.role]);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { const result = await apiPost<{ message: string }>('logMobileSale', token, { venueId:venueId || user.venueId, activityType, quantity:Number(quantity), unit, location, note }); setNotice(result.message); setQuantity('1'); setNote(''); apiGet<Array<Record<string, unknown>>>('mobileActivity', token, venueId ? { venueId } : {}).then(setActivityLogs).catch(() => undefined); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save activity.'); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-2xl space-y-5">
    <div className="panel p-5"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-kd-blue"><CarFront size={22} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-kd-blue">Mobile & Sandwich Man</p><h3 className="text-lg font-black">Roaming activity logger</h3><p className="text-xs text-slate-500">{venueId || user.venueId}</p></div></div></div>
    {user.role === 'ADMIN' && <div className="panel p-4"><label className="field-label">Admin · Select venue for activity log</label><select className="field-input" value={venueId} onChange={e=>setVenueId(e.target.value)}>{booths.map(b=><option key={b.venueId} value={b.venueId}>{b.name}</option>)}</select></div>}
    {notice && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}{error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <form onSubmit={submit} className="panel panel-pad space-y-4"><div><label className="field-label">Activity type</label><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setActivityType('MOBILE_TROLLEY_SALE')} className={`rounded-xl border p-4 text-left ${activityType === 'MOBILE_TROLLEY_SALE' ? 'border-kd-blue bg-blue-50 text-kd-blue' : 'border-slate-200'}`}><ShoppingBag size={18} /><p className="mt-2 text-xs font-bold">Mobile Trolley</p></button><button type="button" onClick={() => setActivityType('SANDWICH_MAN_SALE')} className={`rounded-xl border p-4 text-left ${activityType === 'SANDWICH_MAN_SALE' ? 'border-kd-blue bg-blue-50 text-kd-blue' : 'border-slate-200'}`}><CarFront size={18} /><p className="mt-2 text-xs font-bold">Sandwich Man</p></button></div></div><div className="grid grid-cols-2 gap-3"><div><label className="field-label">Quantity</label><input className="field-input" type="number" min="1" max="500" value={quantity} onChange={e => setQuantity(e.target.value)} /></div><div><label className="field-label">Unit</label><select className="field-input" value={unit} onChange={e => setUnit(e.target.value)}><option value="BOTTLE">Bottle</option><option value="CAN">Can</option><option value="UNIT">Unit / package</option></select></div></div><div><label className="field-label">Activity location</label><select className="field-input" value={location} onChange={e => setLocation(e.target.value)}><option value="PARKING">Parking lot</option><option value="WAITING_ROOM">Waiting room</option><option value="TRUCK_QUEUE">Truck queue</option><option value="GATE">Gate / access lane</option><option value="OTHER">Other</option></select></div><div><label className="field-label">Field notes</label><textarea className="field-input min-h-[100px]" value={note} onChange={e => setNote(e.target.value)} placeholder="Selling route, crowd condition, stock carried, exception…" /></div><button className="btn-primary w-full" disabled={busy}><PlusCircle size={16} /> {busy ? 'Saving…' : 'Log Mobile Activity'}</button></form>
    <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-5 text-slate-500"><MapPin size={15} className="mt-0.5 shrink-0 text-kd-blue" /> Mobile/Sandwich Man sales are recorded as operational activity logs and are not automatically added to the SPG package revenue ledger. TL can reconcile the quantity in the final closing report.</div>
    <section className="panel overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold">Recent mobile activity</h3><p className="mt-1 text-[11px] text-slate-500">{activityLogs.length} latest records · {venueId || user.venueId}</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-4 py-3">Time</th><th className="px-3 py-3">Activity</th><th className="px-3 py-3">Qty</th><th className="px-3 py-3">Location</th><th className="px-3 py-3">Note</th></tr></thead><tbody className="divide-y divide-slate-100">{activityLogs.slice(0,30).map((r,i)=><tr key={String(r.id||i)}><td className="px-4 py-3 text-[11px] text-slate-500">{String(r.timestamp||'—')}</td><td className="px-3 py-3 text-xs font-semibold">{String(r.activityType||'—').replaceAll('_',' ')}</td><td className="px-3 py-3 text-xs font-bold">{String(r.quantity||0)} {String(r.unit||'')}</td><td className="px-3 py-3 text-xs">{String(r.location||'—')}</td><td className="px-3 py-3 text-xs text-slate-500">{String(r.note||'—')}</td></tr>)}</tbody></table>{activityLogs.length===0 && <p className="p-5 text-center text-xs text-slate-400">Belum ada aktivitas tercatat.</p>}</div></section>
  </div>;
}

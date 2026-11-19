'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CarFront, MapPin, PlusCircle, ShoppingBag } from 'lucide-react';
import { apiPost, getBooths } from '@/lib/api';
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
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (user.role === 'ADMIN') getBooths(token).then(list => { setBooths(list); setVenueId(current => current || list[0]?.venueId || ''); }).catch(e => setError(e.message)); }, [token, user.role]);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { const result = await apiPost<{ message: string }>('logMobileSale', token, { venueId:venueId || user.venueId, activityType, quantity:Number(quantity), unit, location, note }); setNotice(result.message); setQuantity('1'); setNote(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save activity.'); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-2xl space-y-5">
    <div className="panel p-5"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-kd-blue"><CarFront size={22} /></div><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-kd-blue">Mobile & Sandwich Man</p><h3 className="text-lg font-black">Roaming activity logger</h3><p className="text-xs text-slate-500">{venueId || user.venueId}</p></div></div></div>
    {user.role === 'ADMIN' && <div className="panel p-4"><label className="field-label">Admin · Select venue for activity log</label><select className="field-input" value={venueId} onChange={e=>setVenueId(e.target.value)}>{booths.map(b=><option key={b.venueId} value={b.venueId}>{b.name}</option>)}</select></div>}
    {notice && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}{error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <form onSubmit={submit} className="panel panel-pad space-y-4"><div><label className="field-label">Activity type</label><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setActivityType('MOBILE_TROLLEY_SALE')} className={`rounded-xl border p-4 text-left ${activityType === 'MOBILE_TROLLEY_SALE' ? 'border-kd-blue bg-blue-50 text-kd-blue' : 'border-slate-200'}`}><ShoppingBag size={18} /><p className="mt-2 text-xs font-bold">Mobile Trolley</p></button><button type="button" onClick={() => setActivityType('SANDWICH_MAN_SALE')} className={`rounded-xl border p-4 text-left ${activityType === 'SANDWICH_MAN_SALE' ? 'border-kd-blue bg-blue-50 text-kd-blue' : 'border-slate-200'}`}><CarFront size={18} /><p className="mt-2 text-xs font-bold">Sandwich Man</p></button></div></div><div className="grid grid-cols-2 gap-3"><div><label className="field-label">Quantity</label><input className="field-input" type="number" min="1" max="500" value={quantity} onChange={e => setQuantity(e.target.value)} /></div><div><label className="field-label">Unit</label><select className="field-input" value={unit} onChange={e => setUnit(e.target.value)}><option value="BOTTLE">Bottle</option><option value="CAN">Can</option><option value="UNIT">Unit / package</option></select></div></div><div><label className="field-label">Activity location</label><select className="field-input" value={location} onChange={e => setLocation(e.target.value)}><option value="PARKING">Parking lot</option><option value="WAITING_ROOM">Waiting room</option><option value="TRUCK_QUEUE">Truck queue</option><option value="GATE">Gate / access lane</option><option value="OTHER">Other</option></select></div><div><label className="field-label">Field notes</label><textarea className="field-input min-h-[100px]" value={note} onChange={e => setNote(e.target.value)} placeholder="Selling route, crowd condition, stock carried, exception…" /></div><button className="btn-primary w-full" disabled={busy}><PlusCircle size={16} /> {busy ? 'Saving…' : 'Log Mobile Activity'}</button></form>
    <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-[11px] leading-5 text-slate-500"><MapPin size={15} className="mt-0.5 shrink-0 text-kd-blue" /> Mobile/Sandwich Man sales are recorded as operational activity logs and are not automatically added to the SPG package revenue ledger. TL can reconcile the quantity in the final closing report.</div>
  </div>;
}

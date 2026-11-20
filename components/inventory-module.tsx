'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeftRight, Package, RefreshCw, Save, ShieldAlert } from 'lucide-react';
import { apiGet, apiPost, getInventory, getBooths } from '@/lib/api';
import type { Booth, InventoryItem, SessionUser } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

export default function InventoryModule({ token, user }: { token: string; user: SessionUser }) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [opnameVenue, setOpnameVenue] = useState(user.venueId || '');
  const [item, setItem] = useState('Kratingdaeng Bottle');
  const [opening, setOpening] = useState('');
  const [closing, setClosing] = useState('');
  const [location, setLocation] = useState('STORAGE_TENT');
  const [entryType, setEntryType] = useState<string>(user.role === 'CREW' ? 'TRANSFER_REQUEST' : 'SHIFT_OPNAME');
  const [fromLocation, setFromLocation] = useState('STORAGE_TENT');
  const [toLocation, setToLocation] = useState('MAIN_BOOTH');
  const [shift, setShift] = useState(user.shift && user.shift !== 'ALL' ? user.shift : 'S1');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const isAdmin = user.role === 'ADMIN';

  const load = () => getInventory(token).then(setItems).catch(e => setError(e.message));
  const loadLogs = () => apiGet<Array<Record<string, unknown>>>('inventoryLogs', token, opnameVenue ? { venueId: opnameVenue } : {}).then(setLogs).catch(e => setError(e.message));
  useEffect(() => { void load(); getBooths(token).then(list => { setBooths(list); setOpnameVenue(current => current || list[0]?.venueId || ''); }).catch(e => setError(e.message)); }, [token]);
  useEffect(() => { if (opnameVenue || !isAdmin) void loadLogs(); }, [token, opnameVenue, isAdmin]);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { const result = await apiPost<{ message: string }>('saveInventory', token, { venueId: opnameVenue || user.venueId, item, openingQty: Number(opening), closingQty: Number(closing), location, shift, note, entryType, fromLocation, toLocation }); setNotice(result.message); setOpening(''); setClosing(''); setNote(''); void loadLogs(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save opname.'); }
    finally { setBusy(false); }
  }
  async function saveMaster(row: InventoryItem, value: string) {
    setBusy(true); setError(''); setNotice('');
    try { await apiPost('updateInventoryMaster', token, { item: row.item, initialQty: value }); setNotice(`${row.item} master stock updated. 5% buffer recalculated.`); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to update master stock.'); }
    finally { setBusy(false); }
  }

  return <div className="space-y-5">
    <div className="panel flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-kd-blue">{isAdmin ? 'Agency global stock control' : 'Venue logistics control'}</p><h3 className="mt-1 text-lg font-black">Inventory & Stock Opname</h3><p className="mt-1 text-xs text-slate-500">{isAdmin ? 'Initial stock, 5% buffer, and available allocation across campaign.' : `${user.venueId} · opening / closing count & transfer record`}</p></div><button className="btn-secondary !px-3 !py-2" onClick={() => void load()}><RefreshCw size={14} /> Refresh</button></div>
    {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}{notice && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    <div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
      <div className="panel overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="font-bold">Global merchandise allocation</h3><p className="mt-1 text-[11px] text-slate-500">Available quantity is initial stock minus 5% protected buffer.</p></div><Package size={19} className="text-kd-blue" /></div><div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Item</th><th className="px-3 py-3">Initial</th><th className="px-3 py-3">5% buffer</th><th className="px-3 py-3">Available</th>{isAdmin && <th className="px-3 py-3">Edit initial</th>}</tr></thead><tbody className="divide-y divide-slate-100">{items.map(row => <InventoryRow key={row.item} row={row} isAdmin={isAdmin} onSave={saveMaster} busy={busy} />)}</tbody></table></div></div>
      <div className="panel panel-pad"><div className="flex items-center gap-2"><ArrowLeftRight size={18} className="text-kd-blue" /><h3 className="section-title">Shift stock opname</h3></div><p className="section-subtitle">Initial and closing count during stock handover.</p><form onSubmit={submit} className="mt-4 space-y-3">{isAdmin && <div><label className="field-label">Venue</label><select className="field-input" value={opnameVenue} onChange={e=>setOpnameVenue(e.target.value)}>{booths.map(b=><option key={b.venueId} value={b.venueId}>{b.name}</option>)}</select></div>}<div><label className="field-label">Stock entry type</label><select className="field-input" value={entryType} onChange={e=>setEntryType(e.target.value)}><option value="SHIFT_OPNAME">Opening / Closing Stock Opname</option>{user.role==='CREW' && <option value="TRANSFER_REQUEST">Request Transfer · Crew</option>}{['ADMIN','TL'].includes(user.role) && <option value="TRANSFER_APPROVAL">Approve Transfer · TL / Admin</option>}</select></div><div><label className="field-label">Item / product</label><input className="field-input" list="inventory-items" value={item} onChange={e => setItem(e.target.value)} required /><datalist id="inventory-items">{['Kratingdaeng Bottle','Kratingdaeng Can','Torpedo XL Cup','Cold Box','Plastic Bag','Balon','Payung Lipat','Tongkat Tol','Shopping Bag','Jas Hujan','Kaos','Topi','Cover Tas','Seragam'].map(x => <option key={x} value={x} />)}</datalist></div><div className="grid grid-cols-2 gap-3"><div><label className="field-label">Opening qty</label><input className="field-input" type="number" min="0" value={opening} onChange={e => setOpening(e.target.value)} required /></div><div><label className="field-label">Closing qty</label><input className="field-input" type="number" min="0" value={closing} onChange={e => setClosing(e.target.value)} required /></div></div><div><label className="field-label">Storage location / stock point</label><select className="field-input" value={location} onChange={e => setLocation(e.target.value)}><option value="STORAGE_TENT">Storage Tent</option><option value="MAIN_BOOTH">Main Booth</option><option value="MOBILE_TROLLEY">Mobile Trolley</option><option value="SANDWICH_MAN">Sandwich Man</option></select></div>{entryType!=='SHIFT_OPNAME' && <div className="grid grid-cols-2 gap-3"><div><label className="field-label">From</label><select className="field-input" value={fromLocation} onChange={e=>setFromLocation(e.target.value)}><option value="STORAGE_TENT">Storage Tent</option><option value="MAIN_BOOTH">Main Booth</option></select></div><div><label className="field-label">To</label><select className="field-input" value={toLocation} onChange={e=>setToLocation(e.target.value)}><option value="MAIN_BOOTH">Main Booth</option><option value="STORAGE_TENT">Storage Tent</option><option value="MOBILE_TROLLEY">Mobile Trolley</option></select></div></div>}<div><label className="field-label">Shift / handover</label><select className="field-input" value={shift} onChange={e => setShift(e.target.value)}><option value="S1">Shift 1 · 11.00–19.00</option><option value="S2_RA">Shift 2 · RA · 16.00–00.00</option><option value="S2_PORT">Shift 2 · Port · 15.00–23.00</option><option value="NIGHT">Night Crew · 23.00–10.00</option></select></div><div><label className="field-label">Notes / transfer approval reference</label><textarea className="field-input min-h-[78px]" value={note} onChange={e => setNote(e.target.value)} placeholder="Damage, replenishment, transfer source…" /></div><button className="btn-primary w-full" disabled={busy}><Save size={15} /> {busy ? 'Saving…' : 'Save Stock Opname'}</button></form>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[10px] leading-5 text-amber-900"><ShieldAlert size={15} className="mt-0.5 shrink-0" />Crew/TL counts are audit records. Master allocation is changed only by Admin to preserve the global 5% buffer.</div>
      </div>
    </div>
    <section className="panel overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold">Stock movement & opname history</h3><p className="mt-1 text-[11px] text-slate-500">Latest {logs.length} audit records · {opnameVenue || user.venueId}</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-4 py-3">Date / Time</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Item</th><th className="px-3 py-3">Opening</th><th className="px-3 py-3">Closing</th><th className="px-3 py-3">Delta</th><th className="px-3 py-3">Location / Note</th></tr></thead><tbody className="divide-y divide-slate-100">{logs.slice(0,50).map((r,i)=><tr key={String(r.id||i)}><td className="px-4 py-3 text-[10px] text-slate-500">{String(r.timestamp||'—')}</td><td className="px-3 py-3 text-[10px] font-bold">{String(r.entryType||'—').replaceAll('_',' ')}</td><td className="px-3 py-3 text-xs font-semibold">{String(r.item||'—')}</td><td className="px-3 py-3 text-xs">{String(r.openingQty??'—')}</td><td className="px-3 py-3 text-xs">{String(r.closingQty??'—')}</td><td className="px-3 py-3 text-xs font-bold">{String(r.delta??'—')}</td><td className="px-3 py-3 text-[10px] text-slate-500">{String(r.location||r.toLocation||'—')} · {String(r.note||'')}</td></tr>)}</tbody></table>{logs.length===0 && <p className="p-5 text-center text-xs text-slate-400">Belum ada stock opname atau transfer yang tercatat.</p>}</div></section>
  </div>;
}

function InventoryRow({ row, isAdmin, onSave, busy }: { row: InventoryItem; isAdmin: boolean; onSave: (row: InventoryItem, value: string) => void; busy: boolean }) {
  const [value, setValue] = useState(String(row.initialQty));
  return <tr><td className="px-5 py-3"><p className="text-xs font-bold text-slate-800">{row.item}</p><p className="text-[10px] text-slate-400">{row.category}</p></td><td className="px-3 py-3 text-xs font-semibold tabular-nums">{row.initialQty === '' ? <span className="text-amber-600">Not set</span> : formatNumber(row.initialQty)}</td><td className="px-3 py-3 text-xs text-slate-500">{row.bufferQty === '' ? '—' : formatNumber(row.bufferQty)}</td><td className="px-3 py-3 text-xs font-black text-kd-blue">{row.availableQty === '' ? 'Count required' : formatNumber(row.availableQty)}</td>{isAdmin && <td className="px-3 py-3"><div className="flex gap-1"><input aria-label={`Initial stock ${row.item}`} className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-xs" value={value} onChange={e => setValue(e.target.value)} placeholder="Qty" /><button disabled={busy} onClick={() => onSave(row, value)} className="rounded-lg bg-kd-blue px-2 py-1.5 text-[10px] font-bold text-white">Save</button></div></td>}</tr>;
}

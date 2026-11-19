'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ClipboardCheck, FileCheck2, LogIn, LogOut, Send, Users } from 'lucide-react';
import { apiGet, apiPost, getBooths } from '@/lib/api';
import type { Booth, SessionUser } from '@/lib/types';

const SHIFTS = [
  { id: 'S1', label: 'Shift 1', time: '11.00–19.00' },
  { id: 'S2_RA', label: 'Shift 2 · Rest Area', time: '16.00–00.00' },
  { id: 'S2_PORT', label: 'Shift 2 · Pelabuhan', time: '15.00–23.00' },
  { id: 'NIGHT', label: 'Night Crew', time: '23.00–10.00' }
];

export default function FieldOperations({ token, user }: { token: string; user: SessionUser }) {
  const [shift, setShift] = useState(user.shift && user.shift !== 'ALL' ? user.shift : 'S1');
  const [venueId, setVenueId] = useState(user.venueId || '');
  const [booths, setBooths] = useState<Booth[]>([]);
  const [staffName, setStaffName] = useState(user.name);
  const [staffRole, setStaffRole] = useState('TL');
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [closingDriveUrl, setClosingDriveUrl] = useState('');
  const [salesLogs, setSalesLogs] = useState<Array<Record<string, unknown>>>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { getBooths(token).then(list => { setBooths(list); setVenueId(current => current || list.find(b => b.venueId === user.venueId)?.venueId || list[0]?.venueId || ''); }).catch(() => undefined); }, [token, user.venueId]);
  useEffect(() => { if (venueId) apiGet<Array<Record<string, unknown>>>('venueSales', token, { venueId }).then(setSalesLogs).catch(() => undefined); }, [token, venueId]);

  async function attendance(eventType: string, status = 'VERIFIED') {
    setBusy(true); setError(''); setNotice('');
    try { const result = await apiPost<{ message: string }>('saveAttendance', token, { venueId, staffName, staffRole, shift, eventType, status, note, photoUrl }); setNotice(result.message); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save attendance.'); }
    finally { setBusy(false); }
  }
  async function closeDay(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try { const result = await apiPost<{ message: string }>('saveClosingReport', token, { venueId, summary, driveUrl: closingDriveUrl }); setNotice(result.message); setSummary(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to submit closing report.'); }
    finally { setBusy(false); }
  }

  return <div className="space-y-5">
    <div className="panel flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-kd-blue">Team Leader operations</p><h3 className="mt-1 text-lg font-black">Attendance, briefing & daily closing</h3><p className="mt-1 text-xs text-slate-500">{venueId || user.venueId} · {user.name}</p></div><span className="tag bg-blue-50 text-kd-blue"><Users size={12} className="mr-1" /> VENUE SUPERVISOR</span></div>
    {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}{notice && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</div>}
    {user.role === 'ADMIN' && <div className="panel p-4"><label className="field-label">Admin · Select venue to supervise</label><select className="field-input" value={venueId} onChange={e=>setVenueId(e.target.value)}>{booths.map(b=><option key={b.venueId} value={b.venueId}>{b.name}</option>)}</select></div>}
    <div className="grid gap-5 xl:grid-cols-[1fr_.9fr]">
      <div className="panel panel-pad"><div className="flex items-center gap-2"><ClipboardCheck size={19} className="text-kd-blue" /><h3 className="section-title">Shift attendance & briefing approval</h3></div><p className="section-subtitle">Verify staff attendance and briefing evidence for each shift.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><div><label className="field-label">Staff name</label><input className="field-input" value={staffName} onChange={e => setStaffName(e.target.value)} /></div><div><label className="field-label">Staff role</label><select className="field-input" value={staffRole} onChange={e => setStaffRole(e.target.value)}><option>TL</option><option>SPG</option><option>BOOTH CREW</option><option>MOBILE SELLER</option><option>NIGHT CREW</option></select></div></div>
        <div className="mt-3"><label className="field-label">Shift</label><select className="field-input" value={shift} onChange={e => setShift(e.target.value)}>{SHIFTS.map(s => <option key={s.id} value={s.id}>{s.label} · {s.time}</option>)}</select></div>
        <div className="mt-3"><label className="field-label">Briefing / attendance photo URL (optional)</label><input className="field-input" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="Paste Drive URL after upload" /></div>
        <div className="mt-3"><label className="field-label">Notes</label><textarea className="field-input min-h-[82px]" value={note} onChange={e => setNote(e.target.value)} placeholder="Attendance remark, briefing notes, exception…" /></div>
        <div className="mt-5 grid grid-cols-2 gap-2"><button disabled={busy} className="btn-primary" onClick={() => void attendance('CHECK_IN')}><LogIn size={15} /> Check-in</button><button disabled={busy} className="btn-secondary" onClick={() => void attendance('CHECK_OUT')}><LogOut size={15} /> Check-out</button><button disabled={busy} className="btn-secondary col-span-2" onClick={() => void attendance('BRIEFING_APPROVAL')}><FileCheck2 size={15} /> Approve briefing & attendance</button><button disabled={busy} className="btn-secondary col-span-2" onClick={() => void attendance('SHIFT_HANDOVER')}><ClipboardCheck size={15} /> Record shift handover</button></div>
        <p className="mt-4 text-[10px] leading-5 text-slate-400">Shift 1: 11.00–19.00 · Shift 2: 16.00–00.00 (Rest Area) / 15.00–23.00 (Port) · Night Crew: 23.00–10.00. Upload supporting photos in Drive Documentation.</p>
      </div>
      <div className="space-y-5">
        <div className="panel panel-pad"><h3 className="section-title">Interim review checkpoints</h3><p className="section-subtitle">Record and confirm recurring shift recaps.</p><div className="mt-4 space-y-3">{[{t:'14.30–15.00',d:'Shift 1 interim recap'},{t:'19.30–20.00',d:'Shift 2 / evening recap'},{t:'10.00–10.45',d:'Opening stock and handover'},{t:'15.00–15.45',d:'Midday stock & crew transition'}].map(item => <div key={item.t} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><div className="rounded-lg bg-blue-50 px-2 py-2 text-[11px] font-black text-kd-blue">{item.t}</div><p className="text-xs font-semibold text-slate-700">{item.d}</p><span className="ml-auto tag bg-slate-100 text-slate-500">CHECK</span></div>)}</div></div>
        <div className="panel overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold">SPG sales & sampling verification</h3><p className="mt-1 text-[11px] text-slate-500">Latest venue transactions · {salesLogs.length} records</p></div><div className="max-h-[260px] overflow-auto"><table className="w-full min-w-[520px] text-left"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-4 py-2">SPG / Package</th><th className="px-3 py-2">Bottle</th><th className="px-3 py-2">Can</th><th className="px-3 py-2">Sampling</th><th className="px-3 py-2">Revenue</th></tr></thead><tbody className="divide-y divide-slate-100">{salesLogs.slice(0,20).map((r,i)=><tr key={String(r.id||i)}><td className="px-4 py-2"><p className="text-[11px] font-bold">{String(r.spgName||'—')}</p><p className="text-[10px] text-slate-400">{String(r.packageLabel||r.productMode||'')}</p></td><td className="px-3 py-2 text-xs">{Number(r.bottles||0).toLocaleString('id-ID')}</td><td className="px-3 py-2 text-xs">{Number(r.cans||0).toLocaleString('id-ID')}</td><td className="px-3 py-2 text-xs">{Number(r.cups||0).toLocaleString('id-ID')}</td><td className="px-3 py-2 text-xs">{Number(r.revenue||0).toLocaleString('id-ID')}</td></tr>)}</tbody></table>{!salesLogs.length && <p className="p-5 text-center text-xs text-slate-400">No sales / sampling logs yet.</p>}</div></div>
        <form onSubmit={closeDay} className="panel panel-pad"><div className="flex items-center gap-2"><Send size={18} className="text-kd-red" /><h3 className="section-title">Final Daily Closing Report</h3></div><p className="section-subtitle">Consolidate final venue recap to Google Sheets. Attach the report file in Drive Documentation first, then paste its link.</p><textarea className="field-input mt-4 min-h-[120px]" value={summary} onChange={e => setSummary(e.target.value)} placeholder="Daily summary: visitor traffic, sales, sampling, stock balance, team issues, incident & follow-up…" required /><label className="field-label mt-3">Drive report URL (upload PDF first in Documentation)</label><input className="field-input" type="url" value={closingDriveUrl} onChange={e => setClosingDriveUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..." /><button disabled={busy || !summary.trim()} className="btn-primary mt-4 w-full"><Send size={15} /> {busy ? 'Submitting…' : 'Submit Final Daily Closing'}</button></form>
      </div>
    </div>
  </div>;
}

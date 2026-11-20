'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { KeyRound, Plus, Save, ShieldCheck, UserCog, UserX } from 'lucide-react';
import { apiGet, apiPost, getBooths } from '@/lib/api';
import type { Booth, Role } from '@/lib/types';

type ManagedUser = { userId: string; name: string; username: string; role: Role; venueId: string; shift: string; enabled: boolean };
const EMPTY = { name: '', username: '', pin: '', role: 'SPG' as Role, venueId: '', shift: 'S1', enabled: true };

export default function AdminUsers({ token }: { token: string }) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const load = async () => { const [u,b] = await Promise.all([apiGet<ManagedUser[]>('users', token), getBooths(token)]); setUsers(u); setBooths(b); };
  useEffect(() => { void load().catch(e => setError(e.message)); }, [token]);

  function edit(user: ManagedUser) { setEditingId(user.userId); setForm({ name: user.name, username: user.username, pin: '', role: user.role, venueId: user.venueId || '', shift: user.shift || 'S1', enabled: user.enabled }); }
  function reset() { setEditingId(''); setForm(EMPTY); }
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (editingId) {
        await apiPost('updateUser', token, { userId: editingId, name: form.name, role: form.role, venueId: form.venueId, shift: form.shift, enabled: form.enabled, pin: form.pin || undefined });
        setNotice('User access updated.');
      } else {
        await apiPost('createUser', token, form as unknown as Record<string, unknown>);
        setNotice('New user created. Share the username and PIN through a secure channel.');
      }
      reset(); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save user.'); }
    finally { setBusy(false); }
  }
  async function toggle(user: ManagedUser) {
    setBusy(true); setError(''); setNotice('');
    try { await apiPost('updateUser', token, { userId: user.userId, enabled: !user.enabled }); setNotice(`${user.username} ${user.enabled ? 'disabled' : 'enabled'}.`); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to update access.'); }
    finally { setBusy(false); }
  }

  return <div className="space-y-5">
    <div className="panel flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-kd-blue">Agency control tower</p><h3 className="mt-1 text-lg font-black">User & PIN Management</h3><p className="mt-1 text-xs text-slate-500">Create, edit, disable, and assign role-based access by venue and shift.</p></div><span className="tag bg-emerald-50 text-emerald-700"><ShieldCheck size={12} className="mr-1" /> ROLE GUARD ENABLED</span></div>
    {notice && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}{error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <form onSubmit={submit} className="panel panel-pad"><div className="flex items-center gap-2"><UserCog size={19} className="text-kd-blue" /><h3 className="section-title">{editingId ? 'Edit account' : 'Create account'}</h3></div><div className="mt-4 space-y-3"><div><label className="field-label">Full name</label><input className="field-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>{!editingId && <div><label className="field-label">Username</label><input className="field-input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase() }))} pattern="[a-z0-9._-]{3,32}" required /></div>}<div><label className="field-label">Role</label><select className="field-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role, venueId: ['ADMIN','CLIENT'].includes(e.target.value) ? '' : f.venueId }))}><option value="ADMIN">ADMIN · Full access</option><option value="CLIENT">CLIENT · Read only</option><option value="TL">TL · Team Leader</option><option value="SPG">SPG · Sales logger</option><option value="CREW">CREW · Field operations</option></select></div>{!['ADMIN','CLIENT'].includes(form.role) && <div><label className="field-label">Assigned venue</label><select className="field-input" value={form.venueId} onChange={e => setForm(f => ({ ...f, venueId: e.target.value }))} required><option value="">Select venue</option>{booths.map(b => <option key={b.venueId} value={b.venueId}>{b.name}</option>)}</select></div>}<div><label className="field-label">Shift assignment</label><select className="field-input" value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}><option value="ALL">All shifts</option><option value="S1">Shift 1 · 11.00–19.00</option><option value="S2_RA">Shift 2 · Rest Area</option><option value="S2_PORT">Shift 2 · Pelabuhan</option><option value="NIGHT">Night Crew</option><option value="VIEW">Read-only</option></select></div><div><label className="field-label">{editingId ? 'Reset PIN (leave blank to keep)' : 'Initial PIN · 4–12 digits'}</label><div className="relative"><KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field-input pl-9" type="password" inputMode="numeric" maxLength={12} pattern="[0-9]{4,12}" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g,'').slice(0,12) }))} required={!editingId} /></div></div>{editingId && <label className="flex items-center gap-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} /> Account enabled</label>}</div><div className="mt-5 flex gap-2"><button className="btn-primary flex-1" disabled={busy}><Save size={15} /> {busy ? 'Saving…' : editingId ? 'Save changes' : 'Create user'}</button>{editingId && <button type="button" className="btn-secondary" onClick={reset}>Cancel</button>}</div></form>
      <div className="panel overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold">Authorized accounts ({users.length})</h3><p className="mt-1 text-[11px] text-slate-500">PIN hashes are stored in Sheets; raw PINs are never displayed.</p></div><div className="max-h-[720px] overflow-auto"><table className="w-full min-w-[620px] text-left"><thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">User</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">Assignment</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map(u => <tr key={u.userId}><td className="px-5 py-3"><p className="text-xs font-bold text-slate-800">{u.name}</p><p className="text-[10px] text-slate-400">@{u.username}</p></td><td className="px-3 py-3"><span className="tag bg-blue-50 text-kd-blue">{u.role}</span></td><td className="px-3 py-3"><p className="text-[10px] font-semibold text-slate-600">{u.venueId || 'Global'}</p><p className="text-[10px] text-slate-400">{u.shift}</p></td><td className="px-3 py-3"><span className={`tag ${u.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{u.enabled ? 'ENABLED' : 'DISABLED'}</span></td><td className="px-3 py-3"><div className="flex items-center gap-1"><button onClick={() => edit(u)} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-200">Edit</button><button disabled={busy} onClick={() => void toggle(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-kd-red" title={u.enabled ? 'Disable account' : 'Enable account'}><UserX size={14} /></button></div></td></tr>)}</tbody></table></div></div>
    </div>
  </div>;
}

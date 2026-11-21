'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Download, ExternalLink, FileImage, FileText, Filter, FolderOpen, Plus, RefreshCw, UploadCloud } from 'lucide-react';
import { getBooths, getDocs, apiPost } from '@/lib/api';
import { DOC_CATEGORIES } from '@/lib/campaign';
import { formatDateTime } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import type { Booth, DriveDoc } from '@/lib/types';

export default function ClientGallery({ token }: { token: string }) {
  const { user } = useAuth();
  const canUpload = !!user && ['ADMIN', 'TL', 'CREW'].includes(user.role);
  const [docs, setDocs] = useState<DriveDoc[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [venueId, setVenueId] = useState(user?.venueId || '');
  const [category, setCategory] = useState('ALL');
  const [uploadCategory, setUploadCategory] = useState(DOC_CATEGORIES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function refresh() {
    const result = await getDocs(token, user?.role === 'ADMIN' || user?.role === 'CLIENT' ? venueId : '');
    setDocs(result);
  }
  useEffect(() => { void getBooths(token).then(setBooths).catch(e => setError(e.message)); void refresh().catch(e => setError(e.message)); }, [token]);
  useEffect(() => { if (user?.role === 'ADMIN' || user?.role === 'CLIENT') void refresh().catch(e => setError(e.message)); }, [venueId]);

  const filtered = useMemo(() => docs.filter(d => category === 'ALL' || d.category === category), [docs, category]);

  async function upload(e: FormEvent) {
    e.preventDefault(); if (!file) return;
    setBusy(true); setNotice(''); setError('');
    try {
      if (file.size > 3 * 1024 * 1024) throw new Error('File maksimal 3 MB.');
      const targetVenue = user?.role === 'ADMIN' ? venueId : user?.venueId || '';
      if (!targetVenue) throw new Error('Pilih venue untuk dokumentasi.');
      const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || '')); reader.onerror = () => reject(new Error('Unable to read file')); reader.readAsDataURL(file); });
      const result = await apiPost<{ fileName: string; url: string; thumbnailUrl?: string }>('uploadDoc', token, { venueId: targetVenue, category: uploadCategory, fileName: file.name, mimeType: file.type, base64 });
      setNotice(`Uploaded: ${result.fileName}`); setFile(null); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setBusy(false); }
  }

  return <div className="space-y-5">
    <div className="panel flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-kd-blue">Centralized Google Drive</p><h3 className="mt-1 text-lg font-black">Reports & Field Documentation</h3><p className="mt-1 text-xs text-slate-500">Daily closing reports, booth photos, engagement proof, and Indomaret activation documentation.</p></div><button className="btn-secondary !px-3 !py-2" onClick={() => void refresh()}><RefreshCw size={14} /> Refresh gallery</button></div>
    {notice && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}{error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    {canUpload && <form onSubmit={upload} className="panel panel-pad"><div className="flex items-center gap-2"><UploadCloud size={19} className="text-kd-blue" /><h3 className="section-title">Upload visual documentation</h3></div><p className="section-subtitle">Images and PDFs are saved to Mudik_2027 / Venue / Date in Google Drive.</p><div className="mt-4 grid gap-3 md:grid-cols-4">{user?.role === 'ADMIN' && <div><label className="field-label">Venue</label><select className="field-input" value={venueId} onChange={e => setVenueId(e.target.value)}>{booths.map(b => <option key={b.venueId} value={b.venueId}>{b.name}</option>)}</select></div>}<div className={user?.role === 'ADMIN' ? '' : 'md:col-span-1'}><label className="field-label">Category</label><select className="field-input" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>{DOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div><div className="md:col-span-2"><label className="field-label">Camera photo / PDF</label><input className="field-input file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-kd-blue" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" capture="environment" onChange={e => setFile(e.target.files?.[0] || null)} required /></div><div className="flex items-end"><button className="btn-primary w-full" disabled={busy || !file}><Plus size={15} /> {busy ? 'Uploading…' : 'Upload file'}</button></div></div><p className="mt-2 text-[10px] text-slate-400">JPG, PNG, WEBP, PDF · Maximum 3 MB per file.</p></form>}
    <div className="panel panel-pad"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="section-title">Drive gallery</h3><p className="section-subtitle">{filtered.length} document(s) accessible to this account.</p></div><div className="flex flex-wrap items-center gap-2"><Filter size={15} className="text-slate-400" /><select className="field-input !w-auto !py-2 text-xs" value={category} onChange={e => setCategory(e.target.value)}><option value="ALL">All categories</option>{DOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>{(user?.role === 'ADMIN' || user?.role === 'CLIENT') && <select className="field-input !w-auto !py-2 text-xs" value={venueId} onChange={e => setVenueId(e.target.value)}><option value="">All venues</option>{booths.map(b => <option key={b.venueId} value={b.venueId}>{b.name}</option>)}</select>}</div></div>
      {filtered.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(doc => <div key={doc.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex h-36 items-center justify-center bg-slate-100">{doc.mimeType.startsWith('image/') ? <a href={doc.url} target="_blank" rel="noreferrer" className="flex h-full w-full items-center justify-center"><img src={doc.thumbnailUrl || (doc.driveFileId ? `https://drive.google.com/thumbnail?id=${doc.driveFileId}&sz=w1200` : doc.url)} alt={doc.fileName} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" onError={e => { const image = e.currentTarget; if (image.dataset.fallback !== '1' && doc.driveFileId) { image.dataset.fallback = '1'; image.src = `https://drive.google.com/uc?export=view&id=${doc.driveFileId}`; } else { image.style.display = 'none'; const fallback = image.parentElement; if (fallback) fallback.innerHTML = '<span class="text-xs text-slate-500">Preview unavailable — open file in Google Drive</span>'; } }} /></a> : <FileText size={38} className="text-slate-400" />}</div><div className="p-3"><span className="tag bg-blue-50 text-kd-blue">{doc.category}</span><p className="mt-2 truncate text-xs font-bold text-slate-800">{doc.fileName}</p><p className="mt-1 text-[10px] text-slate-400">{doc.date} · {formatDateTime(doc.timestamp)}</p><a href={doc.url} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 text-[11px] font-bold text-kd-blue">{doc.mimeType.startsWith('image/') ? <FileImage size={14} /> : <FolderOpen size={14} />} Open in Google Drive <ExternalLink size={12} className="ml-auto" /></a></div></div>)}</div> : <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center"><FolderOpen size={28} className="text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700">No documentation uploaded yet</p><p className="mt-1 text-xs text-slate-400">Files will appear here after the field team uploads them.</p></div>}
    </div>
  </div>;
}

'use client';

import { useEffect, useState } from 'react';
import { ChartNoAxesCombined, Gift, RefreshCw, ShoppingBag, Wallet } from 'lucide-react';
import { getMySales } from '@/lib/api';
import type { SessionUser } from '@/lib/types';
import { formatIDR, formatNumber } from '@/lib/utils';

type SalesSummary = { name: string; venueId: string; today: { bottles:number;cans:number;revenue:number;sampling:number;transactions:number }; total: { bottles:number;cans:number;revenue:number;sampling:number;transactions:number }; luckyDip:{earned:number;used:number;available:number} };

export default function MySalesSummary({ token, user }: { token: string; user: SessionUser }) {
  const [data, setData] = useState<SalesSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function load() { setLoading(true); setError(''); try { setData(await getMySales<SalesSummary>(token)); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load sales summary.'); } finally { setLoading(false); } }
  useEffect(() => { void load(); const t = window.setInterval(() => void load(), 15000); return () => window.clearInterval(t); }, [token]);
  const stats = data?.today;
  return <div className="space-y-5">
    <div className="panel flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-kd-blue">Personal SPG performance</p><h3 className="mt-1 text-lg font-black">My Sales Summary</h3><p className="mt-1 text-xs text-slate-500">{user.name} · {user.venueId}</p></div><button className="btn-secondary !px-3 !py-2" onClick={() => void load()}><RefreshCw size={14} /> Refresh</button></div>
    {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{label:'Bottle count today',value:formatNumber(stats?.bottles),icon:ShoppingBag},{label:'Can count today',value:formatNumber(stats?.cans),icon:ShoppingBag},{label:'Revenue today',value:formatIDR(stats?.revenue),icon:Wallet},{label:'Sampling cups',value:formatNumber(stats?.sampling),icon:ChartNoAxesCombined}].map(item => { const Icon=item.icon;return <div key={item.label} className="panel p-5"><Icon size={18} className="text-kd-blue" /><p className="mt-3 text-xs font-semibold text-slate-500">{item.label}</p><p className="mt-2 text-2xl font-black">{item.value}</p></div>; })}</div>
    <div className="grid gap-4 lg:grid-cols-[1fr_.7fr]"><div className="panel panel-pad"><h3 className="section-title">Daily achievement</h3><p className="section-subtitle">Expected individual guidance: 88–123 btl/day Rest Area · 100–200 btl/day Port.</p><div className="mt-5 rounded-xl bg-slate-50 p-5"><p className="text-xs text-slate-500">Bottle sales recorded today</p><p className="mt-2 text-4xl font-black text-kd-blue">{formatNumber(stats?.bottles)} <span className="text-sm text-slate-400">btl</span></p><p className="mt-2 text-xs text-slate-500">{formatNumber(stats?.transactions)} sales transactions · {formatNumber(stats?.cans)} cans</p></div><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl border border-slate-100 p-4"><p className="text-[10px] text-slate-500">All-time bottle count</p><p className="mt-1 text-xl font-black">{formatNumber(data?.total.bottles)}</p></div><div className="rounded-xl border border-slate-100 p-4"><p className="text-[10px] text-slate-500">All-time revenue</p><p className="mt-1 text-xl font-black">{formatIDR(data?.total.revenue)}</p></div></div></div>
      <div className="panel panel-pad"><div className="flex items-center gap-2"><Gift className="text-kd-red" size={19}/><h3 className="section-title">Lucky Dip balance</h3></div><p className="section-subtitle">Minimum Rp20,000 and 4 pcs per chance.</p><p className="mt-6 text-5xl font-black text-kd-blue">{data?.luckyDip.available || 0}</p><p className="text-xs font-semibold text-slate-500">unused eligible chances</p><div className="mt-5 space-y-2 text-xs"><div className="flex justify-between"><span className="text-slate-500">Earned today</span><b>{data?.luckyDip.earned || 0}</b></div><div className="flex justify-between"><span className="text-slate-500">Redeemed today</span><b>{data?.luckyDip.used || 0}</b></div></div></div></div>
    {loading && <p className="text-center text-xs text-slate-400">Refreshing…</p>}
  </div>;
}

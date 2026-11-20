'use client';

import type { ComponentType } from 'react';
import { ArrowDownRight, ArrowUpRight, Camera, Droplets, Files, MapPin, PackageCheck, ShoppingBag, Users, Wallet } from 'lucide-react';
import { useLiveDashboard } from '@/lib/hooks';
import { formatIDR, formatNumber, formatDateTime } from '@/lib/utils';
import type { SessionUser } from '@/lib/types';

const StatCard = ({ label, value, suffix, icon: Icon, tone = 'blue', helper }: { label: string; value: string; suffix?: string; icon: ComponentType<{ size?: number }>; tone?: string; helper?: string }) => {
  const toneClass: Record<string, string> = { blue: 'bg-blue-50 text-kd-blue', yellow: 'bg-amber-50 text-amber-700', red: 'bg-red-50 text-kd-red', green: 'bg-emerald-50 text-emerald-700' };
  return <div className="panel p-5"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-3 text-[27px] font-black tracking-tight text-slate-900">{value}{suffix && <span className="ml-1 text-sm font-semibold text-slate-400">{suffix}</span>}</p>{helper && <p className="mt-1 text-[11px] text-slate-400">{helper}</p>}</div><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass[tone]}`}><Icon size={19} /></div></div></div>;
};

export default function OverviewDashboard({ token, user, onNavigate }: { token: string; user: SessionUser; onNavigate: (id: string) => void }) {
  const { data, loading, error } = useLiveDashboard(token, 15000);
  const isClient = user.role === 'CLIENT';
  const progress = Math.min(data?.progress || 0, 100);
  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <section className="panel p-5 md:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-xl"><p className="text-[10px] font-bold uppercase tracking-wider text-kd-blue">Keeping You Going All the Way</p><h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{isClient ? 'National activation overview' : `${user.name.split(' ')[0]} · Activation workspace`}</h2><p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">{isClient ? 'Consolidated view of booth traffic, sampling, selling performance, and field execution across 12 activation points.' : 'Venue operations, field activity, and campaign performance in one workspace.'}</p></div>
          <div className="w-full max-w-sm"><div className="flex items-center justify-between text-xs text-slate-600"><span>Overall bottle target</span><span className="font-bold text-slate-900">{formatNumber(data?.targetBottles || 75285)}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-kd-blue transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-2 flex items-center justify-between"><span className="text-xl font-bold text-kd-blue">{progress.toFixed(1)}%</span><span className="text-[11px] text-slate-500">{formatNumber(data?.totalBottles || 0)} bottles sold</span></div></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Booth Visitors" value={formatNumber(data?.totalVisitors)} icon={Users} tone="blue" helper="Digital clicker + venue logs" />
        <StatCard label="Total Sampling" value={formatNumber(data?.totalSampling)} suffix="cups" icon={Droplets} tone="yellow" helper="Torpedo XL / Kratingdaeng" />
        <StatCard label="Bottle Sales" value={formatNumber(data?.totalBottles)} suffix="btl" icon={ShoppingBag} tone="red" helper={`${formatNumber(data?.totalCans)} cans recorded separately`} />
        <StatCard label="Sales Revenue" value={formatIDR(data?.totalRevenue)} icon={Wallet} tone="green" helper={`${formatNumber(data?.buyerTransactions)} recorded sales transactions`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.45fr_.8fr]">
        <div className="panel panel-pad">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="section-title">Venue performance</h3><p className="section-subtitle">{isClient ? 'All campaign points · real-time field totals' : `Assigned venue · ${user.venueId || 'All venues'}`}</p></div><button className="btn-secondary !px-3 !py-2 text-xs" onClick={() => onNavigate('map')}><MapPin size={15} /> Open live map</button></div>
          <div className="mt-5 space-y-3">
            {(data?.venues || []).map((v) => {
              const pct = v.target ? Math.min(v.bottles / v.target * 100, 100) : 0;
              return <div key={v.venueId} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><p className="text-sm font-bold text-slate-900">{v.name}</p><span className={`tag ${v.type === 'REST_AREA' ? 'bg-blue-50 text-kd-blue' : 'bg-red-50 text-kd-red'}`}>{v.type === 'REST_AREA' ? 'REST AREA' : 'PORT'}</span></div><p className="mt-1 text-xs text-slate-400">{v.region} · {v.trafficStatus || 'Traffic status unknown'}</p></div><p className="text-sm font-black text-slate-900">{formatNumber(v.bottles)} <span className="text-[10px] font-semibold text-slate-400">/ {formatNumber(v.target)} btl target</span></p></div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-kd-blue transition-all" style={{ width: `${pct}%` }} /></div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-500"><span><Users size={12} className="mr-1 inline" />{formatNumber(v.visitors)} visitors</span><span><Droplets size={12} className="mr-1 inline" />{formatNumber(v.sampling)} cups</span><span><Camera size={12} className="mr-1 inline" />{formatNumber(v.photoBooth)} photo booth</span><span>{formatIDR(v.revenue)}</span></div>
              </div>;
            })}
            {!loading && !data?.venues?.length && <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">No active venue is assigned to this account.</div>}
            {loading && <div className="animate-pulse space-y-3"><div className="h-20 rounded-xl bg-slate-100" /><div className="h-20 rounded-xl bg-slate-100" /></div>}
          </div>
        </div>
        <div className="space-y-4">
          <div className="panel panel-pad"><div className="flex items-center justify-between"><div><h3 className="section-title">Engagement snapshot</h3><p className="section-subtitle">Visitor-to-buyer and activation touchpoints</p></div><PackageCheck className="text-kd-blue" size={20} /></div>
            <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-[11px] font-semibold text-slate-500">Unique Mirror</p><p className="mt-2 text-2xl font-black text-slate-900">{formatNumber(data?.uniqueMirror)}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-[11px] font-semibold text-slate-500">Photo Booth</p><p className="mt-2 text-2xl font-black text-slate-900">{formatNumber(data?.photoBooth)}</p></div></div>
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-blue-900">Visitor-to-buyer conversion</p><span className="tag bg-white text-kd-blue">LIVE</span></div><p className="mt-2 text-3xl font-black text-kd-blue">{(data?.conversionRate || 0).toFixed(2)}%</p><p className="mt-1 text-[11px] text-blue-700">Recorded sales transactions / visitor count</p></div>
          </div>
          <div className="panel panel-pad"><h3 className="section-title">Quick access</h3><p className="section-subtitle">Open frequently used modules</p><div className="mt-4 grid grid-cols-2 gap-2"><button className="btn-secondary justify-start !py-3 text-xs" onClick={() => onNavigate('cctv')}><Camera size={15} /> CCTV Wall</button><button className="btn-secondary justify-start !py-3 text-xs" onClick={() => onNavigate('gallery')}><Files size={15} /> Drive Gallery</button><button className="btn-secondary justify-start !py-3 text-xs" onClick={() => onNavigate(user.role === 'TL' ? 'clicker' : 'field')}><ArrowUpRight size={15} /> Field Ops</button><button className="btn-secondary justify-start !py-3 text-xs" onClick={() => onNavigate(user.role === 'ADMIN' ? 'inventory' : 'map')}><ArrowDownRight size={15} /> {user.role === 'ADMIN' ? 'Stock Control' : 'Venue Map'}</button></div></div>
          <p className="px-1 text-[10px] text-slate-400">Last data sync: {formatDateTime(data?.refreshedAt)}</p>
        </div>
      </section>
    </div>
  );
}

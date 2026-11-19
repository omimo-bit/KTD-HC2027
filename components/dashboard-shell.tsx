'use client';

import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { Activity, Camera, ChartNoAxesCombined, ChevronDown, ClipboardList, Files, Gauge, LogOut, MapPinned, Menu, Package, Shield, Users, X, Zap } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { NAV_BY_ROLE } from '@/lib/campaign';
import OverviewDashboard from '@/components/overview-dashboard';
import MudikMap from '@/components/mudik-map';
import CctvWall from '@/components/cctv-wall';
import ClientGallery from '@/components/client-gallery';
import TlClicker from '@/components/tl-clicker';
import SpgSalesForm from '@/components/spg-sales-form';
import FieldOperations from '@/components/field-operations';
import InventoryModule from '@/components/inventory-module';
import AdminUsers from '@/components/admin-users';
import VenueSettings from '@/components/venue-settings';
import MobileSales from '@/components/mobile-sales';
import MySalesSummary from '@/components/my-sales-summary';
import type { Role } from '@/lib/types';

const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  overview: Gauge, map: MapPinned, cctv: Camera, gallery: Files, clicker: Activity, sales: ChartNoAxesCombined,
  field: ClipboardList, inventory: Package, users: Users, venues: Shield, mobile: Zap, 'my-results': ChartNoAxesCombined
};

export default function DashboardShell() {
  const { user, signOut, token } = useAuth();
  const [active, setActive] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = (user?.role || 'CLIENT') as Role;
  const nav = useMemo(() => NAV_BY_ROLE[role] || [], [role]);
  const activeModule = nav.some(item => item.id === active) ? active : (nav[0]?.id || 'overview');
  const current = nav.find(item => item.id === activeModule) || nav[0];

  function select(id: string) { setActive(id); setMobileOpen(false); }

  function renderModule() {
    switch (activeModule) {
      case 'map': return <MudikMap token={token} />;
      case 'cctv': return <CctvWall token={token} />;
      case 'gallery': return <ClientGallery token={token} />;
      case 'clicker': return <TlClicker token={token} user={user!} />;
      case 'sales': return <SpgSalesForm token={token} user={user!} />;
      case 'field': return role === 'CREW' ? <InventoryModule token={token} user={user!} /> : <FieldOperations token={token} user={user!} />;
      case 'inventory': return <InventoryModule token={token} user={user!} />;
      case 'users': return <AdminUsers token={token} />;
      case 'venues': return <VenueSettings token={token} />;
      case 'mobile': return <MobileSales token={token} user={user!} />;
      case 'my-results': return <MySalesSummary token={token} user={user!} />;
      default: return <OverviewDashboard token={token} user={user!} onNavigate={select} />;
    }
  }

  const sidebar = (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kd-yellow text-kd-blue"><Zap size={22} fill="currentColor" /></div>
        <div className="min-w-0"><p className="truncate text-sm font-black tracking-wide text-white">KRATINGDAENG</p><p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-200">Homecoming 2027</p></div>
        <button onClick={() => setMobileOpen(false)} className="ml-auto text-blue-100 lg:hidden" aria-label="Close menu"><X size={19} /></button>
      </div>
      <div className="px-4 pt-5"><p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.2em] text-blue-300/70">Workspace modules</p><nav className="space-y-1">
        {nav.map(item => { const Icon = ICONS[item.id] || Activity; const selected = current?.id === item.id; return <button key={item.id} onClick={() => select(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${selected ? 'bg-white text-kd-blue shadow-sm' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}><Icon size={17} /><span>{item.label}</span>{selected && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-kd-red" />}</button>; })}
      </nav></div>
      <div className="mt-auto p-4"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-300">Campaign target</p><p className="mt-1 text-2xl font-black text-white">75,285 <span className="text-xs font-semibold text-blue-200">btl</span></p><p className="mt-1 text-[11px] text-blue-200">12 activation points · Indonesia</p></div><p className="mt-4 px-2 text-[10px] text-blue-300/70">Keeping You Going All the Way</p></div>
    </>
  );

  return (
    <div className="min-h-screen bg-kd-mist">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col bg-[#061c52] lg:flex">{sidebar}</aside>
      {mobileOpen && <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden" onClick={() => setMobileOpen(false)}><aside className="flex h-full w-[290px] flex-col bg-[#061c52] shadow-2xl" onClick={e => e.stopPropagation()}>{sidebar}</aside></div>}
      <div className="min-h-screen lg:pl-[264px]">
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
          <div className="flex min-w-0 items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu"><Menu size={20} /></button><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{current?.label || 'Activation Workspace'}</p><p className="hidden text-[11px] text-slate-500 sm:block">KRATINGDAENG / MUDIK 2027 / {role}</p></div></div>
          <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> LIVE DATA</div><div className="hidden text-right sm:block"><p className="text-xs font-bold text-slate-800">{user?.name}</p><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{role}{user?.venueId ? ` · ${user.venueId}` : ''}</p></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-kd-blue">{user?.name?.slice(0,1).toUpperCase()}</div><button onClick={signOut} className="rounded-xl p-2 text-slate-500 transition hover:bg-red-50 hover:text-kd-red" title="Sign out"><LogOut size={18} /></button></div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 md:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-kd-blue">{role === 'CLIENT' ? 'Brand management view' : role === 'ADMIN' ? 'Agency control tower' : `${role} field workspace`}</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-[27px]">{current?.label || 'Dashboard'}</h1></div><div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-500"><Activity size={14} className="text-kd-blue" /> Auto refresh · 15 sec</div></div>
          {renderModule()}
        </main>
        <footer className="px-7 pb-6 pt-2 text-center text-[10px] text-slate-400">KRATINGDAENG HOMECOMING ACTIVATION 2027 · Control Tower Build 1.0</footer>
      </div>
    </div>
  );
}

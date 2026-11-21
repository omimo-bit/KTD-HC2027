'use client';

import { useMemo, useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { appAsset } from '@/lib/config';
import dynamic from 'next/dynamic';
import { useAuth } from '@/components/auth-provider';
import { NAV_BY_ROLE } from '@/lib/campaign';
import LocationReporter from '@/components/location-reporter';
import OfflineQueueSync from '@/components/offline-queue-sync';
import type { Role } from '@/lib/types';
const OverviewDashboard = dynamic(() => import('@/components/overview-dashboard'), { loading: () => <ModuleLoading /> });
const MudikMap = dynamic(() => import('@/components/mudik-map'), { loading: () => <ModuleLoading /> });
const CctvWall = dynamic(() => import('@/components/cctv-wall'), { loading: () => <ModuleLoading /> });
const ClientGallery = dynamic(() => import('@/components/client-gallery'), { loading: () => <ModuleLoading /> });
const TlClicker = dynamic(() => import('@/components/tl-clicker'), { loading: () => <ModuleLoading /> });
const SpgSalesForm = dynamic(() => import('@/components/spg-sales-form'), { loading: () => <ModuleLoading /> });
const FieldOperations = dynamic(() => import('@/components/field-operations'), { loading: () => <ModuleLoading /> });
const InventoryModule = dynamic(() => import('@/components/inventory-module'), { loading: () => <ModuleLoading /> });
const AdminUsers = dynamic(() => import('@/components/admin-users'), { loading: () => <ModuleLoading /> });
const VenueSettings = dynamic(() => import('@/components/venue-settings'), { loading: () => <ModuleLoading /> });
const MobileSales = dynamic(() => import('@/components/mobile-sales'), { loading: () => <ModuleLoading /> });
const MySalesSummary = dynamic(() => import('@/components/my-sales-summary'), { loading: () => <ModuleLoading /> });
function ModuleLoading() { return <div className="panel flex min-h-56 items-center justify-center text-sm text-slate-500">Loading module…</div>; }

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

  return (
    <div className="min-h-screen bg-slate-50">
      <LocationReporter token={token} user={user} />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
          <img src={appAsset('/logo-kratingdaeng.png')} alt="Kratingdaeng" width={76} height={46} className="h-10 w-[76px] shrink-0 object-contain" loading="eager" />
          <div><p className="text-sm font-bold tracking-wide text-kd-blue">KRATINGDAENG</p><p className="mt-1 text-[11px] text-slate-500">Homecoming Activation 2027</p></div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Menu</p>
          {nav.map(item => <button key={item.id} onClick={() => select(item.id)} className={`w-full border-l-2 px-3 py-3 text-left text-sm transition ${activeModule === item.id ? 'border-kd-blue bg-blue-50 font-bold text-kd-blue' : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>{item.label}</button>)}
        </nav>
        <div className="border-t border-slate-200 px-6 py-4">
          <p className="text-[10px] text-slate-400">Campaign target</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">75,285 <span className="text-xs font-normal text-slate-500">bottles</span></p>
          <p className="mt-2 text-[10px] text-slate-400">2–17 March 2027 · 12 points</p>
        </div>
      </aside>

      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMobileOpen(v => !v)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Toggle navigation">{mobileOpen ? <X size={19} /> : <Menu size={19} />}</button>
            <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{current?.label || 'Activation Workspace'}</p><p className="hidden text-[10px] text-slate-500 sm:block">KRATINGDAENG / MUDIK 2027 / {role}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <OfflineQueueSync />
            <div className="hidden text-right sm:block"><p className="text-xs font-semibold text-slate-800">{user?.name}</p><p className="text-[10px] uppercase text-slate-400">{role}{user?.venueId ? ` · ${user.venueId}` : ''}</p></div>
            <button onClick={signOut} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-kd-red" title="Sign out" aria-label="Sign out"><LogOut size={17} /></button>
          </div>
        </header>

        {mobileOpen && <div className="fixed inset-0 top-16 z-30 bg-white px-4 py-4 shadow-lg lg:hidden"><nav className="space-y-1">{nav.map(item => <button key={item.id} onClick={() => select(item.id)} className={`block w-full border-l-2 px-3 py-3 text-left text-sm ${activeModule === item.id ? 'border-kd-blue bg-blue-50 font-bold text-kd-blue' : 'border-transparent text-slate-600'}`}>{item.label}</button>)}</nav></div>}

        <main className="mx-auto max-w-[1600px] px-4 pb-24 pt-5 md:px-7 md:pt-7 lg:pb-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-kd-blue">{role === 'CLIENT' ? 'Brand management' : role === 'ADMIN' ? 'Agency operations' : 'Field operations'}</p><h1 className="mt-1 text-xl font-bold text-slate-900 md:text-2xl">{current?.label || 'Dashboard'}</h1></div><p className="text-[11px] text-slate-500">Data refresh setiap 15 detik</p></div>
          {renderModule()}
        </main>
        <footer className="px-6 pb-6 text-center text-[10px] text-slate-400">KRATINGDAENG HOMECOMING ACTIVATION 2027 · Operations Control Tower</footer>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-slate-200 bg-white px-2 py-2 lg:hidden" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
        {nav.map(item => <button key={item.id} onClick={() => select(item.id)} className={`min-w-max rounded-md px-3 py-3 text-[11px] font-semibold ${activeModule === item.id ? 'bg-blue-50 text-kd-blue' : 'text-slate-500'}`}>{item.label}</button>)}
      </nav>
    </div>
  );
}

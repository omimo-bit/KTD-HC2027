'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import DashboardShell from '@/components/dashboard-shell';

export default function DashboardPage() {
  const { ready, user } = useAuth();
  const router = useRouter();
  useEffect(() => { if (ready && !user) router.replace('/'); }, [ready, user, router]);
  if (!ready || !user) return <div className="flex min-h-screen items-center justify-center bg-kd-mist"><div className="flex items-center gap-3 text-sm font-semibold text-slate-500"><LoaderCircle className="animate-spin" /> Preparing workspace…</div></div>;
  return <DashboardShell />;
}

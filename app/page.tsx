'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { CAMPAIGN } from '@/lib/campaign';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, ready } = useAuth();
  const [username, setUsername] = useState('admin');
  const [pin, setPin] = useState('817263');
  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (ready && user) router.replace('/dashboard'); }, [ready, user, router]);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { await signIn(username, pin); router.replace('/dashboard'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Login gagal.'); }
    finally { setBusy(false); }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071a43] px-4 py-10">
      <div className="absolute -left-28 -top-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl md:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-kd-blue p-10 text-white md:flex">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="absolute -right-28 top-28 h-80 w-80 rounded-full border-[42px] border-white/10" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kd-yellow text-kd-blue"><Zap size={26} fill="currentColor" /></div>
              <div><p className="text-xs font-bold uppercase tracking-[.22em] text-blue-100">Activation Control Tower</p><p className="text-lg font-black tracking-tight">KRATINGDAENG</p></div>
            </div>
            <div className="mt-28 max-w-md">
              <p className="text-xs font-bold uppercase tracking-[.24em] text-yellow-300">Mudik 2027</p>
              <h1 className="mt-4 text-5xl font-black leading-[1.03] tracking-tight">Homecoming<br />Activation.</h1>
              <p className="mt-5 max-w-sm text-base leading-7 text-blue-100">One connected view for every booth, every team, every journey across Indonesia.</p>
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold"><Activity size={16} className="text-kd-yellow" /> {CAMPAIGN.tagline}</div>
            </div>
          </div>
          <div className="relative flex items-end justify-between gap-4 border-t border-white/20 pt-6 text-xs text-blue-100">
            <span>3–17 March 2027 · 12 Activation Points</span><span className="font-semibold tracking-widest">KD / 2027</span>
          </div>
        </section>

        <section className="flex min-h-[620px] flex-col justify-center px-7 py-10 sm:px-12">
          <div className="mb-10 md:hidden">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-kd-blue text-kd-yellow"><Zap size={26} fill="currentColor" /></div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-kd-blue">Kratingdaeng / Mudik 2027</p>
          </div>
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-kd-blue"><ShieldCheck size={14} /> Secure role access</div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Welcome back.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Sign in with your assigned username and PIN to open your activation workspace.</p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <div><label className="field-label" htmlFor="username">Username</label><input id="username" className="field-input" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" required /></div>
            <div><label className="field-label" htmlFor="pin">Access PIN</label><div className="relative"><input id="pin" className="field-input pr-12" type={showPin ? 'text' : 'password'} inputMode="numeric" autoComplete="current-password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="4–12 digit PIN" required /><button type="button" onClick={() => setShowPin(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Toggle PIN visibility">{showPin ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            {error && <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}
            <button className="btn-primary w-full py-3" disabled={busy || !ready}>{busy ? 'Authenticating…' : <>Enter Workspace <ArrowRight size={17} /></>}</button>
          </form>
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2 text-amber-900"><LockKeyhole size={16} className="mt-0.5 shrink-0" /><div><p className="text-xs font-bold">Demo access is enabled for initial setup</p><p className="mt-1 text-xs leading-5 text-amber-800">Temporary PINs are listed in README. Change every seeded PIN in User & PIN Access before sharing the URL.</p></div></div>
          </div>
          <p className="mt-8 text-center text-[11px] text-slate-400">© 2027 Kratingdaeng Homecoming Activation · Agency Control Tower</p>
        </section>
      </div>
    </main>
  );
}

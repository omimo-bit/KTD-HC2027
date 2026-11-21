'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { appAsset } from '@/lib/config';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, ready } = useAuth();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (ready && user) router.replace('/dashboard'); }, [ready, user, router]);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try { await signIn(username.trim(), pin); router.replace('/dashboard'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Login gagal.'); }
    finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10">
      <section className="w-full max-w-[360px]">
        <div className="mb-10 flex flex-col items-center text-center">
          <img src={appAsset('/logo-kratingdaeng.png')} alt="Kratingdaeng" width={220} height={97} fetchPriority="high" className="h-auto w-[220px] object-contain" />
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="username">Username</label>
            <input id="username" className="field-input !rounded-md" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username" required />
          </div>
          <div>
            <label className="field-label" htmlFor="pin">PIN</label>
            <div className="relative">
              <input id="pin" className="field-input !rounded-md pr-11" type={showPin ? 'text' : 'password'} inputMode="numeric" autoComplete="current-password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="Masukkan PIN" required />
              <button type="button" onClick={() => setShowPin(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label="Tampilkan atau sembunyikan PIN">{showPin ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
          </div>
          {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}
          <button className="btn-primary w-full !rounded-md !py-3" disabled={busy || !ready}>{busy ? 'Memeriksa akses…' : 'LOGIN'}</button>
        </form>
      </section>
    </main>
  );
}

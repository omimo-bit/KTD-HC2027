
'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Zap,
} from 'lucide-react';

import { useAuth } from '@/components/auth-provider';
import { CAMPAIGN } from '@/lib/campaign';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user, ready } = useAuth();

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ready && user) router.replace('/dashboard');
  }, [ready, user, router]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy || !ready) return;

    setBusy(true);
    setError('');

    try {
      await signIn(username.trim(), pin);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef1f5] px-4 py-6 sm:px-6 sm:py-10">

      {/* MAIN LOGIN CONTAINER */}
      <div className="grid w-full max-w-[1040px] overflow-hidden rounded-[28px] bg-white shadow-[0_22px_55px_rgba(15,35,65,0.18)] md:min-h-[620px] md:grid-cols-[0.92fr_1.08fr]">

        {/* BRAND PANEL */}
        <section className="relative flex min-h-[190px] flex-col justify-between overflow-hidden bg-kd-blue px-6 py-7 text-white sm:px-10 sm:py-9 md:min-h-[620px] md:px-11 md:py-12">

          {/* Background details */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '22px 22px',
            }}
          />

          <div className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full border-[38px] border-white/[0.08]" />
          <div className="pointer-events-none absolute -bottom-36 -left-28 h-80 w-80 rounded-full border-[42px] border-white/[0.07]" />

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kd-yellow text-kd-blue shadow-sm">
              <Zap size={24} fill="currentColor" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">
                Activation Control Tower
              </p>
              <p className="text-base font-black tracking-wide sm:text-lg">
                KRATINGDAENG
              </p>
            </div>
          </div>

          {/* Main message */}
          <div className="relative z-10 my-7 md:my-auto md:py-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-300 sm:text-xs">
              Mudik 2027
            </p>

            <h1 className="mt-3 text-[32px] font-black leading-[1.05] tracking-tight sm:text-4xl md:text-[52px]">
              Welcome
              <br />
              to the
              <br />
              <span className="text-kd-yellow">Homecoming.</span>
            </h1>

            <p className="mt-4 max-w-sm text-xs leading-6 text-blue-100 sm:text-sm sm:leading-7">
              One connected view for every booth, every team, every journey
              across Indonesia.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-semibold text-white sm:text-xs">
              <Activity size={14} className="text-kd-yellow" />
              {CAMPAIGN.tagline}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 hidden items-center justify-between gap-3 border-t border-white/20 pt-6 text-[10px] text-blue-100 md:flex">
            <span>3–17 March 2027 · 12 Activation Points</span>
            <span className="font-bold tracking-[0.2em]">KD / 2027</span>
          </div>

          {/* Mobile footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-4 text-[9px] text-blue-100 md:hidden">
            <span>3–17 March 2027</span>
            <span className="font-bold tracking-widest">KD / 2027</span>
          </div>
        </section>

        {/* LOGIN FORM PANEL */}
        <section className="flex min-h-[470px] flex-col justify-center px-6 py-9 sm:px-12 sm:py-12 md:min-h-[620px] md:px-14 lg:px-16">

          <div className="mx-auto w-full max-w-[390px]">

            {/* Heading */}
            <div className="mb-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-kd-blue">
                <ShieldCheck size={14} />
                Secure role access
              </div>

              <h2 className="text-[30px] font-black tracking-tight text-slate-900 sm:text-3xl">
                Sign in.
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Welcome back. Enter your assigned credentials to access your
                activation workspace.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="space-y-5">

              {/* Username */}
              <div>
                <label
                  className="field-label"
                  htmlFor="username"
                >
                  Username
                </label>

                <input
                  id="username"
                  className="field-input"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>

              {/* PIN */}
              <div>
                <label
                  className="field-label"
                  htmlFor="pin"
                >
                  Access PIN
                </label>

                <div className="relative">
                  <input
                    id="pin"
                    className="field-input pr-12"
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    autoComplete="current-password"
                    value={pin}
                    onChange={(e) =>
                      setPin(e.target.value.replace(/\D/g, '').slice(0, 12))
                    }
                    placeholder="Enter your PIN"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPin((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-kd-blue"
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <p className="mt-2 text-[11px] text-slate-400">
                  Use the PIN assigned by your administrator.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy || !ready}
                className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Enter Workspace
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Access information */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <LockKeyhole
                  size={17}
                  className="mt-0.5 shrink-0 text-kd-blue"
                />

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Authorized access only
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Your account access and workspace permissions are managed
                    by the activation administrator.
                  </p>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <p className="mt-8 text-center text-[10px] leading-5 text-slate-400">
              © 2027 Kratingdaeng Homecoming Activation
              <br />
              Agency Control Tower
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}

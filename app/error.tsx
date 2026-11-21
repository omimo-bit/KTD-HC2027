'use client';

import { useEffect } from 'react';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('KD Homecoming application error:', error); }, [error]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Halaman mengalami kendala</h1>
        <p className="mt-2 text-sm text-slate-600">Data tidak dihapus. Muat ulang halaman atau coba kembali.</p>
        <button className="btn-primary mt-5 w-full" onClick={() => reset()}>Coba lagi</button>
        <button className="btn-secondary mt-2 w-full" onClick={() => window.location.reload()}>Muat ulang aplikasi</button>
      </section>
    </main>
  );
}

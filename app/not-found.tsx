export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-600">Alamat halaman mungkin berubah atau tidak tersedia.</p>
        <a href="./" className="btn-primary mt-5 inline-flex">Kembali ke aplikasi</a>
      </section>
    </main>
  );
}

# QA dan batasan implementasi

Dokumen ini memisahkan pemeriksaan kode yang sudah dijalankan dari integrasi eksternal yang belum bisa diuji tanpa akses ke akun Google dan project Vercel pemilik aplikasi.

## Pemeriksaan yang sudah dijalankan

- Sintaks Google Apps Script (`backend-gas/Code.gs`) diperiksa menggunakan parser JavaScript Node.js: lulus.
- Sintaks seluruh 32 file TypeScript/TSX diperiksa melalui TypeScript transpile: lulus.
- Seluruh import lokal `@/…` diperiksa terhadap file proyek: tidak ada import yang hilang.
- Nama aksi baca dan tulis yang dipanggil frontend dicocokkan dengan handler di Apps Script: seluruh aksi memiliki handler. Aksi baca melalui POST agar token sesi tidak muncul di URL query.
- Struktur JSON `package.json` dan `tsconfig.json`: valid.
- Jumlah target dari 12 venue: 44.100 Rest Area booth + 1.985 Indomaret + 29.200 Pelabuhan = 75.285 botol.

## Pemeriksaan yang belum dapat diselesaikan di lingkungan ini

- `npm install` tidak selesai dalam batas waktu lingkungan, sehingga `next build` dan full semantic TypeScript check belum dapat dijalankan di sini. Vercel akan menjalankan proses dependency install dan build ketika repository di-deploy. Periksa tab **Deployments → Build Logs** setelah import repository.
- Belum ada akses ke Google Spreadsheet, Apps Script deployment, atau Vercel project milik pemilik aplikasi. Karena itu, autentikasi akun Google, URL `/exec`, izin Drive, dan konektivitas API perlu divalidasi setelah deployment.
- CCTV belum dapat dites karena URL stream asli per venue belum dimasukkan.
- GPS perlu diuji pada perangkat dan jaringan lapangan. Browser hanya mengirim lokasi ketika PWA terbuka, perangkat online, dan izin lokasi aktif.

## Batasan operasional yang disengaja

- Ukuran maksimum file dokumentasi adalah 3 MB per file. File dikirim sebagai Base64 melalui proxy Next.js; batas ini menjaga payload tetap di bawah batas request Vercel Functions 4,5 MB.
- Antrean offline hanya untuk input terpilih. Sinkronisasi berjalan saat PWA terbuka dan online; tidak ada jaminan background sync ketika aplikasi ditutup.
- Transfer inventory merupakan jejak request/approval dan belum memindahkan saldo otomatis antar lokasi.
- Google Sheets dan Apps Script bukan database transaksi ber-throughput tinggi. Uji beban dengan akun, volume transaksi, dan jumlah perangkat aktual sebelum hari operasional.
- PIN memakai salt dan SHA-256 sebagai baseline autentikasi internal, bukan pengganti identity provider enterprise. Ganti seluruh PIN demo dan batasi akses spreadsheet/script.
- Koordinat seed venue bersifat perkiraan perencanaan. Ganti dengan koordinat booth aktual.

## Urutan validasi setelah deployment

1. Jalankan `setup()` dari Apps Script yang terikat pada spreadsheet.
2. Deploy Web App sebagai **Execute as: Me** dengan akses yang sesuai, lalu salin URL `/exec`.
3. Simpan URL itu sebagai `GAS_API_URL` pada Vercel dan redeploy.
4. Buka `/api/gas?action=health`; respons yang benar berisi `ok: true`.
5. Login dengan akun demo, ganti PIN, buat akun individual, dan tetapkan venue/shift.
6. Tes seluruh modul dengan transaksi uji, periksa hasil pada 13 tab spreadsheet, lalu hapus data uji sebelum go-live.

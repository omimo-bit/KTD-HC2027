# Deployment
1. Buat Google Spreadsheet privat.
2. Buka Extensions → Apps Script, tempel gas-backend/Code.gs.
3. Isi CONFIG.SPREADSHEET_ID, jalankan setupDatabase(), dan beri otorisasi.
4. Tambahkan akun ke Users_Access serta venue ke Master_Booths.
5. Deploy Apps Script sebagai Web App dan salin URL.
6. Upload isi folder frontend ke repository GitHub baru.
7. Import repository di Vercel dan set NEXT_PUBLIC_GAS_API_URL.
8. Deploy, lalu uji login dan izin GPS.

Logo berada di frontend/public/logo-kratingdaeng.png.

## Catatan sebelum produksi
Paket ini adalah fondasi awal yang bisa dikembangkan, bukan sistem produksi yang telah diaudit. Password SHA-256 perlu diganti dengan salted password hashing. Perlu tambah idempotency dan persistent queue untuk clicker, proteksi CSRF/abuse, validasi data transaksi, upload Drive, CCTV, serta endpoint sales/inventory/manpower/report. Apps Script dan Sheets harus diuji untuk concurrency dan kuota. GPS browser hanya dapat diandalkan saat aplikasi terbuka dan izin lokasi aktif; background tracking tidak dijamin PWA biasa.

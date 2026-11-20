# Panduan pemasangan — Kratingdaeng Homecoming Activation 2027

Panduan ini menggunakan GitHub dan Vercel. Semua pengaturan bisa dilakukan melalui browser; Node.js dan VS Code tidak diperlukan pada komputer pengguna untuk deployment ke Vercel.

## 1. Siapkan Google Sheets dan Apps Script

1. Buat Google Spreadsheet bernama `Kratingdaeng Homecoming Activation 2027`.
2. Dari spreadsheet tersebut buka **Extensions → Apps Script**.
3. Ganti isi `Code.gs` dengan seluruh isi file `backend-gas/Code.gs` dari ZIP project.
4. Simpan, pilih fungsi `setup`, lalu klik **Run** dan berikan izin Google Sheets serta Google Drive.
5. Kembali ke spreadsheet. Pastikan 13 tab terbuat, termasuk `Location_Log` dan `Request_Log`.
6. Di Apps Script pilih **Deploy → New deployment → Web app**.
7. Pilih **Execute as: Me**. Atur **Who has access** ke akses yang sesuai untuk pemakai aplikasi (untuk penggunaan publik biasanya `Anyone`; kebijakan Workspace dapat membatasi pilihan ini).
8. Klik Deploy dan salin URL Web App yang berakhir `/exec`.

Jika script dibuat sebagai project standalone, isi Script Property `SPREADSHEET_ID` dengan ID spreadsheet. Jika Apps Script dibuka melalui Extensions dari spreadsheet, ID otomatis tersimpan.

## 2. Unggah project ke GitHub

1. Unduh ZIP project, lalu ekstrak menggunakan fitur bawaan Windows **Extract All**.
2. Buat repository baru di GitHub.
3. Buka repository, pilih **Add file → Upload files**.
4. Unggah seluruh isi folder project (pastikan `package.json`, `app/`, `components/`, `lib/`, `backend-gas/`, dan `public/` berada pada root repository, bukan berada satu tingkat folder lebih dalam).
5. Klik **Commit changes**.

Jangan unggah `.env.local`, token, PIN pribadi, atau URL kamera privat ke GitHub.

## 3. Hubungkan GitHub ke Vercel

1. Masuk ke Vercel, pilih **Add New → Project**, lalu import repository GitHub yang baru dibuat.
2. Framework akan terdeteksi sebagai **Next.js**. Root Directory gunakan root repository (`./`).
3. Di **Project Settings → Environment Variables**, tambahkan:
   - Key: `GAS_API_URL`
   - Value: URL Apps Script yang berakhir `/exec`
   - Environment: Production, Preview, dan Development (sesuai kebutuhan).
4. Klik Deploy. Setelah pengaturan environment variable berubah, lakukan Redeploy.
5. Buka `https://domain-aplikasi/api/gas?action=health`. Hasil yang benar adalah JSON berisi `ok: true`, nama aplikasi, dan waktu server. Ini memastikan route Vercel dan Google Apps Script sudah saling terhubung. Jangan gunakan halaman login Google sebagai URL API.

## 4. Jika muncul error API

- `GAS_API_URL belum diatur`: environment variable belum disimpan atau belum redeploy.
- `Google Apps Script tidak mengembalikan JSON`: URL deployment salah/tidak aktif, akses web app meminta login, atau deployment belum memakai versi kode terbaru.
- `Username atau PIN tidak valid`: endpoint sudah terhubung; periksa akun pada tab `Users_Access`.
- Jika `/api/gas` menghasilkan 404 HTML, pastikan file berada tepat di `app/api/gas/route.ts` dan Vercel root directory menunjuk ke folder yang memiliki `package.json` serta `app/`.

Untuk setiap perubahan `Code.gs`, buka **Deploy → Manage deployments → Edit**, pilih **New version**, lalu Deploy. URL `/exec` umumnya tetap sama pada deployment yang diedit.

## 5. Login dan keamanan awal

Akun sementara:

| Role | Username | PIN |
|---|---|---:|
| ADMIN | `admin` | `817263` |
| CLIENT | `client` | `817264` |
| TL | `tl-demo` | `817265` |
| SPG | `spg-demo` | `817266` |
| CREW | `crew-demo` | `817267` |

Segera login sebagai Admin, buka **User & PIN Access**, lalu buat akun unik dan ganti semua PIN. Jangan menggunakan akun demo bersama untuk seluruh personel. Sesi berlaku 6 jam.

PIN memakai salt unik dan SHA-256 hash. Ini baseline autentikasi PIN untuk aplikasi internal; jangan menganggapnya setara layanan identity enterprise. Batasi penerima link dan gunakan PIN individual.

## 6. Konfigurasi operasional sebelum go-live

- Ganti koordinat planning pin dengan GPS booth aktual melalui **Venue & CCTV Setup**.
- Masukkan URL CCTV, jenis stream, dan uji embed dari perangkat/jaringan yang akan digunakan.
- Lengkapi nama dan akun TL/SPG/Crew pada **User & PIN Access**, termasuk venue dan shift.
- Isi saldo seragam/perlengkapan Crew yang masih kosong di master inventory.
- Periksa store code Indomaret pada tiap Rest Area.
- Validasi target dan harga paket di `lib/campaign.ts` serta `backend-gas/Code.gs` terhadap persetujuan final campaign.
- Atur sharing folder Drive `Mudik_2027` kepada akun client yang berhak.
- Uji semua alur input, termasuk saat internet dimatikan dan dinyalakan kembali.
- Pastikan perangkat lapangan mengizinkan lokasi untuk situs Vercel. Tracking hanya berjalan selama PWA terbuka.

## 7. Modul dan API

GET: `health`, `dashboard`, `booths`, `docs`, `users`, `inventory`, `attendance`, `mySales`, `venueSales`, `liveLocations`, `mobileActivity`, `inventoryLogs`, `dailyClosings`.

POST: `login`, `logout`, `visitorClick`, `locationPing`, `recordSale`, `recordSampling`, `redeemPrize`, `saveAttendance`, `saveInventory`, `logMobileSale`, `uploadDoc`, `saveClosingReport`, `createUser`, `updateUser`, `updateBooth`, `updateInventoryMaster`.

Read actions juga dikirim melalui POST dengan body JSON agar token sesi tidak muncul di URL query. Selected field POST actions use an IndexedDB outbox and persistent request IDs for retry. Sinkronisasi antrean berjalan saat PWA terbuka dan online; bukan background sync ketika aplikasi ditutup. GPS heartbeats, prize redemption, file uploads, and admin setup changes are not queued offline.

## 8. Batasan operasional yang perlu diuji

- Dashboard refresh via polling 15 detik.
- Google Sheets dan Apps Script mempunyai kuota serta batas throughput. Lakukan uji beban sesuai estimasi volume puncak.
- Lokasi GPS merupakan posisi perangkat, bukan bukti bahwa staf benar-benar berada di titik aktivitas; gunakan sebagai pemantauan operasional dan validasi dengan attendance/foto.
- Service worker menyediakan installability dan fallback offline page. Dashboard/API tidak sepenuhnya tersedia offline; hanya jenis input yang disebutkan di README yang masuk antrean lokal.
- Transfer stock masih merupakan catatan audit request/approval, belum pemindahan saldo otomatis antar lokasi.

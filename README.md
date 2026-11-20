# KRATINGDAENG — HOMECOMING ACTIVATION 2027

**Activation Operations Control Tower** · Keeping You Going All the Way

PWA berbasis Next.js + Google Apps Script + Google Sheets + Google Drive. Frontend di-host melalui Vercel; Google Apps Script menjadi satu-satunya backend dan database operasional menggunakan Sheets. Tidak memerlukan Firebase, Google Cloud Console, service account, atau API Google Maps berbayar.

## Fitur aplikasi

- Login berbasis PIN dan akses per role: ADMIN, CLIENT, TL, SPG, CREW.
- Executive dashboard: visitor, sales bottle/can, sampling, revenue, conversion proxy, target 75.285 bottle, dan performa per venue.
- Peta 12 activation points berbasis Leaflet + OpenStreetMap.
- Team Live Tracking: ADMIN/CLIENT melihat semua venue; TL melihat tim pada venue penugasannya. TL, SPG, dan CREW mengirim GPS berkala ketika PWA terbuka dan izin lokasi aktif.
- CCTV wall untuk HLS `.m3u8`, YouTube unlisted, dan IP camera/embed.
- Visitor clicker untuk visitor, Unique Mirror, dan Photo Booth.
- SPG Sales & Sampling: Rest Area, Pelabuhan, Indomaret store-code, sampling cups, IG Story, dan Lucky Dip.
- Mobile Trolley / Sandwich Man activity log dan riwayat aktivitas.
- Attendance, briefing, shift handover, daily closing, serta riwayat attendance dan closing.
- Merchandise inventory, 5% protected buffer, stock opname, transfer audit, dan riwayat pergerakan stok.
- Drive documentation gallery dan upload JPG/PNG/WEBP/PDF.
- User & PIN management; pengaturan target, koordinat, jadwal, traffic status, dan CCTV venue.
- PWA installable, offline fallback screen, serta antrean lokal untuk transaksi terpilih yang gagal dikirim karena jaringan. Antrean dikirim ulang saat PWA dibuka dan perangkat online, dengan request ID agar retry tidak menggandakan record.

## Campaign setup yang disertakan

Terdapat 12 seeded venues: 7 Rest Areas dan 5 Pelabuhan. Grand target botol 75.285, berdasarkan konfigurasi campaign yang tersedia di project:

- Rest Area booth: 44.100 bottle
- Indomaret sell-out: 1.985 bottle
- Pelabuhan selling: 29.200 bottle

Koordinat venue seed adalah pin perencanaan dan wajib diganti dengan titik booth yang telah diverifikasi. CCTV URL, akun staf aktual, serta saldo awal produk, cup, seragam, dan perlengkapan Crew yang belum diberikan masih perlu diisi oleh Admin.

## Role access

| Modul | ADMIN | CLIENT | TL | SPG | CREW |
|---|:---:|:---:|:---:|:---:|:---:|
| Executive dashboard | Penuh | Baca | Venue sendiri | Ringkasan sendiri | Venue sendiri |
| Peta venue | Penuh | Baca | — | — | — |
| Team Live Tracking | Semua | Semua | Venue sendiri | Kirim GPS | Kirim GPS |
| CCTV / Drive Gallery | Penuh | Baca | Venue sendiri | — | Upload dokumentasi |
| Visitor clicker | Penuh | — | Venue sendiri | — | — |
| Sales & sampling | Penuh | — | — | Venue sendiri | — |
| Mobile activity | Penuh | — | — | — | Venue sendiri |
| Attendance & closing | Penuh | — | Venue sendiri | — | — |
| Stock opname | Global + audit | — | Venue sendiri | — | Venue sendiri |
| User / venue setup | Penuh | — | — | — | — |

Hak akses juga diperiksa di Apps Script, bukan hanya disembunyikan dari menu frontend.

## Struktur spreadsheet

`setup()` membuat tab berikut dan tidak menghapus record operasional yang sudah ada:

- `Users_Access` — akun, PIN salt/hash, role, venue, shift.
- `Master_Booths` — 12 venue, target, jadwal, koordinat, traffic, CCTV.
- `Visitors_Log` — pencatatan visitor dan counter engagement.
- `Location_Log` — histori koordinat GPS staf.
- `Sales_Sampling` — transaksi, botol/kaleng, revenue, sampling, IG Stories.
- `Inventory_Opname` — opening/closing stock, adjustment, transfer audit, Lucky Dip deduction.
- `Drive_Docs` — indeks file dokumentasi Google Drive.
- `Master_Inventory` — initial stock, 5% buffer, available, reserved.
- `Attendance_Log` — check-in/out, briefing, shift handover.
- `Activity_Log` — Mobile Trolley dan Sandwich Man.
- `Daily_Closing` — closing harian per venue.
- `LuckyDip_Log` — ledger earned/used.
- `Request_Log` — jejak request ID untuk retry/idempotensi transaksi.

## Akun demo awal

| Role | Username | PIN sementara |
|---|---|---:|
| ADMIN | `admin` | `817263` |
| CLIENT | `client` | `817264` |
| TL | `tl-demo` | `817265` |
| SPG | `spg-demo` | `817266` |
| CREW | `crew-demo` | `817267` |

TL/SPG/CREW demo ditugaskan ke `RA-KM57A`. Ganti PIN dan buat akun individual sebelum link dibagikan kepada tim. PIN disimpan sebagai salted hash; PIN asli tidak disimpan pada spreadsheet.

## Penjelasan perilaku dan batasan penting

1. GPS dikirim setiap sekitar 60 detik ketika aplikasi terbuka, koneksi tersedia, dan izin lokasi diberikan. Browser/PWA biasa tidak menjamin pelacakan saat aplikasi ditutup atau OS membatasi background activity. Tingkat akurasi mengikuti perangkat dan kondisi GPS.
2. Status tracking: LIVE sampai 3 menit, RECENT sampai 15 menit, STALE di atas 15 menit. Lokasi yang lebih lama dari 3 jam tidak ditampilkan.
3. PWA menyimpan transaksi terpilih (visitor click, sales, sampling, attendance, stock opname, mobile activity, closing) pada IndexedDB jika request gagal karena jaringan. Upload file, redeem prize, perubahan admin, dan GPS heartbeat tidak masuk antrean offline. Jika sesi kedaluwarsa, login kembali untuk memperbarui token antrean. Sinkronisasi tidak berjalan saat aplikasi benar-benar ditutup.
4. `Request_Log` menyimpan hasil request untuk retry dengan ID yang sama. Ini mencegah duplikasi pada retry normal, tetapi tetap lakukan uji jaringan dan beban sebelum hari pelaksanaan.
5. Dashboard refresh melalui polling setiap 15 detik; bukan WebSocket atau streaming sub-detik. Endpoint integrasi dapat dicek lewat `/api/gas?action=health` dan harus menampilkan `ok: true`.
6. Lucky Dip diimplementasikan sebagai satu kesempatan per transaksi untuk setiap ambang lengkap Rp20.000 dan empat pcs; jumlah kesempatan dihitung memakai nilai yang lebih rendah dari kedua syarat. Konfirmasi interpretasi mekanisme ini kepada campaign owner.
7. Harga paket mengikuti konfigurasi pada `lib/campaign.ts` dan Apps Script. Indomaret menambah jumlah botol, tetapi tidak menambah revenue karena harga sell-out tidak disediakan.
8. Transfer stock yang dicatat oleh Crew/TL merupakan audit request/approval; aplikasi belum menjalankan pengurangan saldo antar-lokasi otomatis. Master inventory hanya diubah Admin.
9. Untuk upload dokumentasi, folder Google Drive mengikuti `Mudik_2027 / [Venue] / [Date]`. Atur permission Drive untuk akun client yang berhak melihat file.
10. CCTV hanya dapat tampil jika URL stream valid, dapat diakses browser, dan provider mengizinkan embed. Tidak ada CCTV URL yang di-seed.

## Isi folder

- `app/` — Next.js pages, API proxy route, manifest PWA.
- `components/` — dashboard dan seluruh modul.
- `lib/` — API client, data campaign, types, IndexedDB queue.
- `backend-gas/Code.gs` — backend Apps Script.
- `public/` — logo, ikon PWA, service worker, offline fallback.
- `docs/DEPLOYMENT.md` — instruksi instalasi dan deployment.
- `docs/QA_AND_LIMITATIONS.md` — hasil pemeriksaan kode dan batasan yang perlu divalidasi sebelum go-live.

Baca `docs/DEPLOYMENT.md` sebelum deployment. Paket ini merupakan implementasi aplikasi dan backend, tetapi aktivasi real tetap memerlukan spreadsheet, deployment GAS, Vercel, akun staf, koordinat final, CCTV URL, dan validasi operasional dari pemilik campaign.

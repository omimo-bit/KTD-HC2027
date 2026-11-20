# Database setup

Backend membuat seluruh tab spreadsheet melalui fungsi `setup()` pada `backend-gas/Code.gs`. Jangan mengganti header secara manual setelah setup. Data operasional bersifat append-only untuk audit; pengaturan user, venue, dan master inventory menggunakan update row.

Tab dibuat: `Users_Access`, `Master_Booths`, `Visitors_Log`, `Location_Log`, `Sales_Sampling`, `Inventory_Opname`, `Drive_Docs`, `Master_Inventory`, `Attendance_Log`, `Activity_Log`, `Daily_Closing`, `LuckyDip_Log`, `Request_Log`.

Kolom lengkap berada di bagian `APP.SHEETS` pada `Code.gs`. Fungsi `setup()` dapat dijalankan kembali untuk memastikan sheet dan header tersedia, tanpa menghapus record.

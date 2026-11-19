# KRATINGDAENG — HOMECOMING ACTIVATION 2027

**Keeping You Going All the Way** · Event & Booth Activation Control Tower

A role-based activation operations application built with **Next.js App Router, Tailwind CSS, Lucide, Leaflet/OpenStreetMap, HLS.js, Google Apps Script, Google Sheets, and Google Drive**.

This project intentionally does **not** require Google Cloud Console, a Google Cloud project, service accounts, paid Google Maps, Firebase, or a paid database. Google Apps Script is the only backend; Sheets stores operational records and Drive stores reports / field photos. Vercel hosts the Next.js UI and a small same-origin API proxy to Apps Script.

---

## 1. Architecture

```text
Browser (Next.js + Tailwind + Lucide)
            │
            │ same-origin /api/gas
            ▼
Vercel Route Handler (proxy only; no database)
            │
            │ NEXT_PUBLIC_GAS_API_URL
            ▼
Google Apps Script Web App (doGet / doPost)
       ┌────┴────────┐
       ▼             ▼
Google Sheets    Google Drive
(operational     (Mudik_2027 /
 records)         Venue / Date)
```

The Vercel route handler forwards requests to the single Apps Script Web App URL. This avoids browser-side cross-origin issues with Apps Script redirects while retaining the requested single GAS REST backend. It does not store application data on Vercel.

### Data tabs created by `setup()`

Core tabs:

- `Users_Access` — username, salted PIN hash, role, venue / shift assignment, enabled flag.
- `Master_Booths` — all 12 venues, targets, schedule, coordinates, traffic badge, and CCTV configuration.
- `Visitors_Log` — append-only visitor / Unique Mirror / Photo Booth counter events.
- `Sales_Sampling` — selling packages, bottle / can count, revenue, sampling cups, IG Stories, Indomaret sell-out.
- `Inventory_Opname` — shift stock counts and Lucky Dip stock deduction audit.
- `Drive_Docs` — Drive file index and category metadata.

Supporting tabs:

- `Master_Inventory` — initial stock, calculated 5% buffer, available stock, and reserved quantity.
- `Attendance_Log` — check-in, check-out, briefing approval, and shift handover.
- `Activity_Log` — Mobile Trolley / Sandwich Man activity logs.
- `Daily_Closing` — final venue closing summary.
- `LuckyDip_Log` — earned / used chance ledger; the server checks eligibility before a prize is redeemed.

---

## 2. Campaign data seeded

The `setup()` function creates these 12 venues once. It does not wipe existing operational records when re-run.

| # | Venue | Type | Dates | HK | Manpower | Booth / Selling target | IDM target | Sampling target |
|---:|---|---|---|---:|---:|---:|---:|---:|
| 1 | KM 57A Karawang | Rest Area | 3–9 Mar 2027 | 7 | 22 | 7,350 | 272 | — |
| 2 | KM 102A Subang | Rest Area | 3–8 Mar 2027 | 6 | 22 | 7,350 | 268 | — |
| 3 | KM 166A Cipali | Rest Area | 3–8 Mar 2027 | 6 | 22 | 6,300 | 365 | — |
| 4 | KM 207A Cirebon | Rest Area | 3–8 Mar 2027 | 6 | 22 | 7,350 | 366 | — |
| 5 | KM 379A Batang | Rest Area | 3–8 Mar 2027 | 6 | 22 | 5,250 | 233 | — |
| 6 | KM 429A Ungaran | Rest Area | 3–8 Mar 2027 | 6 | 22 | 5,250 | 176 | — |
| 7 | KM 754A Sidoarjo | Rest Area | 3–8 Mar 2027 | 6 | 22 | 5,250 | 305 | — |
| 8 | Pelabuhan Gilimanuk | Port | 2–7 Mar 2027 | 6 | 19 | 6,200 | — | 600 cups |
| 9 | Pelabuhan Semayang | Port | 3–7 Mar 2027 | 5 | 19 | 6,000 | — | 500 cups |
| 10 | Pelabuhan Makassar | Port | 3–7 Mar 2027 | 5 | 19 | 8,000 | — | 500 cups |
| 11 | Pelabuhan Ciwandan | Port | 4–8 Mar 2027 | 5 | 19 | 4,000 | — | 500 cups |
| 12 | Pelabuhan Bakauheni | Port | 13–17 Mar 2027 | 5 | 19 | 5,000 | — | 500 cups |

**Grand bottle target = 75,285** = 44,100 Rest Area booth bottles + 1,985 Indomaret sell-out bottles + 29,200 Port selling bottles.

Indomaret store codes are seeded against their Rest Area:

- KM 57A: `T6YA`, `FPOG`
- KM 102A: `T8H5`
- KM 166A: `T9B9`
- KM 207A: `TH30`
- KM 379A: `TUT7`
- KM 429A: `TRES`
- KM 754A: `FQT2`

**Coordinate note:** The map coordinates in `Code.gs` are approximate planning pins, not verified booth GPS coordinates. Replace them in **Admin → Venue & CCTV Setup** after the final booth location is confirmed. The map uses public OpenStreetMap tiles and does not require an API key. The public tile service is best-effort and subject to its usage policy; it is not a guaranteed high-availability tile CDN.

### Seeded merchandise inventory

| Item | Initial stock | 5% protected buffer* | Available allocation* |
|---|---:|---:|---:|
| Balon | 2,760 | 138 | 2,622 |
| Payung Lipat | 1,318 | 66 | 1,252 |
| Tongkat Tol | 1,614 | 81 | 1,533 |
| Shopping Bag | 11,863 | 594 | 11,269 |
| Jas Hujan | 1,975 | 99 | 1,876 |
| Kaos | 992 | 50 | 942 |
| Topi | 986 | 50 | 936 |
| Plastic Bag | 19,770 | 989 | 18,781 |
| Cover Tas | 1,022 | 52 | 970 |
| Seragam / Topi Crew / Jas Hujan Crew | Not specified | — | Count required |

\*Buffer uses `ceil(initialQty × 5%)`; available allocation is initial stock less the protected buffer and reserved stock. Crew gear quantities were not provided in the brief, so those rows remain unconfigured rather than inventing a number.

---

## 3. Local setup

### Requirements

- Node.js 20 or newer
- npm
- A Google account that can create / run Apps Script and Google Sheets
- A GitHub account
- A Vercel account (check the current plan limits against expected event traffic)

### A. Create the Google Sheet + Apps Script backend

1. Create a new Google Spreadsheet, for example `Kratingdaeng Homecoming Activation 2027`.
2. Open **Extensions → Apps Script** from that spreadsheet. This creates a spreadsheet-bound Apps Script project.
3. Replace the contents of `Code.gs` with `backend-gas/Code.gs` from this repository.
4. Save the Apps Script project.
5. In the function selector, select **`setup`** and click **Run**.
6. Review and grant the requested Google Sheets and Google Drive permissions. This is normal Apps Script authorization; it is not a Google Cloud Console setup.
7. Return to the spreadsheet. The tabs listed above should have been created and seeded. A Drive folder named `Mudik_2027` is also created on first setup.
8. In Apps Script, choose **Deploy → New deployment → Web app**.
9. Set **Execute as: Me**.
10. Set **Who has access: Anyone** (or the broadest access option available in your Workspace). The API itself checks the signed session token and role for all protected operations.
11. Deploy and copy the Web App URL ending in `/exec`.

For future Apps Script code changes, open **Deploy → Manage deployments → Edit**, select a new version, and redeploy. Keep the same deployment URL when updating the existing deployment.

If `setup()` cannot find a spreadsheet, confirm that Apps Script was opened from the spreadsheet using Extensions → Apps Script. For a standalone script, set Script Property `SPREADSHEET_ID` to the spreadsheet ID before running setup.

### B. Configure and run Next.js locally

1. Download / clone this repository.
2. Create `.env.local` in the project root:

```env
NEXT_PUBLIC_GAS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

3. Install packages and run the development server:

```bash
npm install
npm run dev
```

4. Open `http://localhost:3000`.

The browser calls the same-origin `/api/gas` route. That route forwards to `NEXT_PUBLIC_GAS_API_URL` server-side, so the Apps Script URL is not called directly from each browser screen.

### C. Push to GitHub

```bash
git init
git add .
git commit -m "Build Kratingdaeng Homecoming Activation 2027"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/kratingdaeng-homecoming-2027.git
git push -u origin main
```

Do not commit `.env.local`, PINs, or any private camera URLs. `.gitignore` excludes local environment files.

### D. Deploy to Vercel

1. In Vercel, select **Add New → Project** and import the GitHub repository.
2. Framework preset should be detected as **Next.js**.
3. Add the environment variable under **Project Settings → Environment Variables**:
   - Name: `NEXT_PUBLIC_GAS_API_URL`
   - Value: the Apps Script Web App URL ending in `/exec`
   - Environments: Production, Preview, and Development as needed.
4. Deploy. Redeploy after changing the environment variable.
5. Test the deployed URL with the demo Admin login, then immediately rotate all temporary PINs.

---

## 4. Temporary demo accounts — change these before launch

`setup()` seeds one account per role, if that username does not already exist. The TL, SPG, and Crew demo users are assigned to `RA-KM57A` only.

| Role | Username | Temporary PIN | Access |
|---|---|---:|---|
| ADMIN | `admin` | `817263` | All modules / all 12 venues |
| CLIENT | `client` | `817264` | Executive read-only view |
| TL | `tl-demo` | `817265` | Assigned venue, clicker, attendance, closing, stock review |
| SPG | `spg-demo` | `817266` | Assigned venue, sales, sampling, Lucky Dip |
| CREW | `crew-demo` | `817267` | Assigned venue, stock opname, mobile activity, uploads |

After login as Admin, open **User & PIN Access** to reset PINs, create individual users, assign each user to a venue and shift, or disable an account. Avoid sharing one SPG login among multiple people because the audit log records the authenticated user ID.

The API stores a unique salt and SHA-256 PIN hash rather than the raw PIN. It signs expiring 6-hour session tokens with a secret generated in Apps Script Script Properties. The Apps Script login endpoint also applies a temporary lock after repeated failed attempts. This is a baseline PIN gate; use unique PINs, restrict who has the Web App URL, and rotate credentials at handover.

---

## 5. Role access matrix

| Module | ADMIN | CLIENT | TL | SPG | CREW |
|---|:---:|:---:|:---:|:---:|:---:|
| Executive KPI dashboard | Full | Read-only | Assigned venue | Own sales workspace | Assigned venue |
| 12-point map | Full | Read-only | Assigned venue | — | — |
| CCTV wall | Full | Read-only | Assigned venue | — | — |
| Drive gallery | Full + upload | Read-only | Assigned venue + upload | — | Assigned venue + upload |
| Digital visitor clicker | Full | — | Assigned venue | — | — |
| Sales / sampling entry | Full | — | — | Assigned venue | — |
| Lucky Dip + stock deduction | Full | — | — | Assigned venue | — |
| Attendance / briefing / closing | Full | — | Assigned venue | — | — |
| Stock opname | Full | — | Assigned venue | — | Assigned venue |
| Mobile / Sandwich Man activity | Full | — | — | — | Assigned venue |
| User & PIN management | Full | — | — | — | — |
| Venue / target / CCTV config | Full | — | — | — | — |

The Apps Script backend enforces the role and assigned-venue checks; hiding a tab in the UI is not the only access-control layer.

---

## 6. Operational behavior and important assumptions

### Live dashboard

- Dashboard data refreshes every 15 seconds using polling. It is near-real-time, not a WebSocket push stream.
- Visitor counts are append-only deltas. The TL clicker supports `+1` and `-1` for the active metric.
- Unique Mirror and Photo Booth engagement are separate metrics; they do not inflate the main visitor total.
- Visitor-to-buyer conversion is calculated as recorded sales transactions divided by booth visitors. It is a transaction proxy, not a deduplicated count of unique buyers.
- Bottle and can quantities are reported separately. Bottle progress is compared with the 75,285 bottle target.

### SPG selling modes

Rest Area packages:

- Single Bottle — Rp7,000
- Single Can — Rp10,000
- Package 1 — 3 bottles + 1 free bottle, Rp18,000
- Package 2 — 3 bottles + 1 free can, Rp20,000

Pelabuhan packages:

- Paket 1 — 3 bottles, Rp15,000
- Paket 2 — 2 bottles + 2 cans, Rp25,000
- Paket 3 — 4 bottles + 2 cans, Rp40,000

Indomaret mode:

- Pack 3 = 3 bottles; Single = 1 bottle. The brief does not provide an Indomaret unit price, so these records add bottle sell-out quantities but **do not invent revenue**.
- Only store codes configured for the user's Rest Area are accepted by the API.

Lucky Dip interpretation used in this build: **one chance per transaction bundle for each completed Rp20,000 threshold and each group of 4 product pieces**. The server uses the lower of those two counts (`min(floor(revenue / 20,000), floor(pieces / 4))`). Prize redemption requires an unused earned chance and decrements the matching global inventory item. Confirm this exact interpretation with the campaign owner if the intended mechanic differs.

### CCTV

- HLS `.m3u8` uses HLS.js where supported; Safari native HLS is also attempted.
- YouTube URLs are converted to an embed URL when the normal watch URL is supplied. For unlisted streams, confirm embed permission is enabled.
- IP camera streams are embedded as supplied. Some IP cameras block iframe embedding, require authentication, or are only reachable on a private LAN; those feeds need a browser-accessible embed endpoint.
- No CCTV URLs were included in the brief, so camera tiles show **No camera configured** until Admin enters stream URLs.

### Drive gallery and sharing

- Uploads accept JPG, PNG, WEBP, or PDF up to 5 MB each.
- The script stores files under `Mudik_2027 / [Venue] / [Date]` and records the Drive URL in `Drive_Docs`.
- Files inherit the Drive folder's permissions. To let Brand Management view documents, share the `Mudik_2027` folder (or a more limited parent folder) with the intended client Google accounts / Google Group as **Viewer**. Do not make operational photos public unless the client approves that sharing model.

### Traffic status

Traffic badges (`LOW`, `NORMAL`, `BUSY`, `HEAVY`, `INCIDENT`, `UNKNOWN`) are manually configured by Admin in this release. There is no paid traffic API or external traffic data provider connected.

---

## 7. API surface

All protected requests require the signed `token` returned by `login`.

GET actions:

- `health` — public backend health check.
- `dashboard`, `booths`, `docs`, `inventory`, `attendance`, `users`, `mySales` — role-checked read models.

POST actions:

- `login`, `logout`
- `visitorClick`, `recordSale`, `recordSampling`, `redeemPrize`
- `saveAttendance`, `saveInventory`, `logMobileSale`, `uploadDoc`, `saveClosingReport`
- `createUser`, `updateUser`, `updateBooth`, `updateInventoryMaster`

The request body is JSON. Google Apps Script is called server-side from the Next.js route handler with a simple text/plain body to avoid CORS preflight. The GAS Web App returns JSON.

---

## 8. Production launch checklist

- [ ] Run Apps Script `setup()` successfully and verify all 11 tabs are present.
- [ ] Deploy the Apps Script Web App as **Execute as Me** and configure its access setting appropriately.
- [ ] Add `NEXT_PUBLIC_GAS_API_URL` to local and Vercel environments.
- [ ] Rotate all five demo PINs and create named accounts for every staff member.
- [ ] Assign every TL, SPG, and Crew account to the correct venue and shift.
- [ ] Confirm exact venue GPS coordinates with the field team.
- [ ] Configure and test each venue's HLS / YouTube / IP camera URL.
- [ ] Confirm the global merchandise quantities, buffer policy, and manpower gear quantities.
- [ ] Share the `Mudik_2027` Drive folder with authorized client viewers.
- [ ] Confirm package pricing, Lucky Dip eligibility interpretation, and daily SPG target allocation with the campaign owner.
- [ ] Test visitor clicker, undo, sales, Indomaret code validation, sampling, prize deduction, stock opname, attendance, and closing report.
- [ ] Verify backups / export schedule for the Google Spreadsheet and Drive folder.

### Known constraints

This is a deployable application scaffold with working data flows and server-side role checks, but final production operation still depends on campaign-owned values that were not in the brief: actual CCTV URLs, verified point coordinates, real named users, Crew gear quantities, and the final Drive sharing audience. Apps Script and Google Sheets also have execution quotas and write-throughput limits; for a very high concurrency event, test peak click/sales volume before the event and consider batching field submissions. Do not describe the polling dashboard as sub-second live streaming.

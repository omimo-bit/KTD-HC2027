# QA Checklist and Known Limitations

**Project:** KRATINGDAENG — HOMECOMING ACTIVATION 2027  
**Reviewed:** 20 November 2026

## Checks completed in this workspace

- `next.config.mjs`, `public/sw.js`, and Google Apps Script `Code.gs` pass Node.js syntax checks.
- TypeScript/TSX syntax parsing passed for all 35 source files.
- Local `@/` import targets were checked; no missing local import targets were found.
- `package.json`, GitHub Actions workflow, static export configuration, CSS entry point, manifest, service worker, and PWA icon files are present.
- The Vercel API proxy and old `AppDashboard` import are absent.
- The manifest uses a valid single icon purpose (`any` or `maskable`).
- Initial setup no longer ships fixed demo PINs. Old built-in sample accounts are disabled/rotated when detected; a temporary admin PIN is written to the Apps Script execution log.
- Frontend read actions and backend action handlers were cross-checked.

## Checks not completed here

- `npm install` timed out in this workspace. Therefore `npm run lint`, a complete Next.js production build, and the generated `out/` export have **not** been run here.
- The project has not been connected to the user's real Google Spreadsheet, Drive, or Apps Script deployment.
- Android, iPhone/iPad, Chrome, Edge, and Safari runtime testing has not been performed on physical devices.
- Every module and every role must pass the acceptance tests below before a live campaign is started.

The GitHub Actions workflow runs `npm run lint` and `npm run build` before publishing. If either fails, the deploy job is blocked; this is a build gate, not a guarantee against every runtime/device/backend issue.

## Static hosting and backend

- Next.js is configured with `output: 'export'`; GitHub Pages only hosts the generated static frontend.
- The Next.js API route has been removed because GitHub Pages cannot execute server-side API handlers.
- Base path is generated from the GitHub repository name by the workflow. Public assets, manifest scope, and service-worker scope use that base path.
- Google Apps Script remains the data backend for Sheets and Drive. Deploy it separately and set `GAS_WEB_APP_URL` in `lib/config.ts`.
- Read actions and request-status checks use JSONP. Mutations use POST plus an idempotency/request ID. Authentication challenge/proof also uses JSONP; the raw PIN is not sent, but the session token is sent as a parameter on subsequent read/status requests.
- Google warns that JSONP can be embedded by other sites and should be restricted to non-sensitive, read-only data. GitHub warns Pages is not intended for sensitive transactions such as sending passwords. This hosting setup is therefore suitable only for demo/QA with non-sensitive data until IT/security approves a production architecture.

## Device acceptance test (before operational launch)

- Desktop: Chrome and Edge; verify login, sidebar, every module, map, CCTV, gallery, and a test transaction.
- Android: Chrome; install from HTTPS, launch from the home-screen icon, verify safe-area layout, touch targets, GPS permission, camera/file picker, offline queue, and replay when connectivity returns.
- iPhone: Safari; use Share → Add to Home Screen, enable Open as Web App when shown, launch from icon, verify bottom navigation, camera/file picker, GPS while app is open, and update behavior.
- Test all roles: ADMIN, CLIENT, TL, SPG, CREW. Verify each role sees only allowed venues and actions.
- Test all transaction modules with test data before entering real campaign data.

## Known PWA limitations

- GPS updates occur while the app is open, geolocation permission is granted, connectivity is available, and the operating system keeps the page active. Background tracking while the app is closed/suspended is not guaranteed.
- Offline queue replay runs while the app is running; reliable background sync after closing the app is not guaranteed, especially on iOS.
- CCTV playback depends on stream type, URL accessibility, codec, and the camera/provider's access policy.
- Uploads are limited to 3 MB per file; a cross-origin `no-cors` POST cannot expose its response body, so the app checks the Drive gallery afterwards.
- A PWA is installed from the browser's Add to Home Screen / Install app flow; it is not a native App Store or Play Store binary.

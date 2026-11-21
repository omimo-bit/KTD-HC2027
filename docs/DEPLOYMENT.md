# Deployment & Installation — GitHub Pages PWA

## One-time setup

1. Copy all `backend-gas/Code.gs` into a Google Apps Script project bound to the operational Google Spreadsheet.
2. Run `setup()` once and approve the requested Spreadsheet/Drive permissions.
3. Deploy as a Web App, Execute as **Me**, and select an access policy that allows the intended users. For a public-facing GitHub Pages front end with PIN authentication, the Apps Script Web App normally needs public endpoint access; app-level authorization is enforced by the script.
4. Copy the active URL ending in `/exec`.
5. Paste the URL into `GAS_WEB_APP_URL` in `lib/config.ts`.
6. Push the complete project to GitHub branch `main`.
7. In GitHub repository Settings → Pages → Build and deployment → Source, select **GitHub Actions**.
8. Open Actions and wait for `Deploy PWA to GitHub Pages` to finish. A green build and deploy means the static site was published.

The workflow determines the repository base path automatically, so a repository named `kd-homecoming-2027` is published under `https://OWNER.github.io/kd-homecoming-2027/`. A `OWNER.github.io` repository is published at the domain root.

## Install on mobile

### Android

Open the HTTPS GitHub Pages URL in Chrome → browser menu → Install app / Add to Home screen.

### iPhone or iPad

Open the HTTPS GitHub Pages URL in Safari → Share → Add to Home Screen. Use Safari rather than an in-app browser.

## Runtime requirements

- Camera, GPS, and service-worker features require HTTPS. GitHub Pages provides HTTPS when the site is configured correctly.
- GPS updates require the installed app/browser to be open, location permission to be granted, and an available connection. A PWA cannot guarantee tracking while closed or suspended by iOS/Android.
- Offline transactions are held in IndexedDB and replayed when the app is reopened with a working connection. Keep the browser's site data intact until sync is complete.
- Apps Script remains a separately deployed backend service and uses the Google Spreadsheet/Drive owner's permissions.
- The app uses JSONP for API operations because GitHub Pages has no server-side proxy and Apps Script ContentService does not offer arbitrary CORS response headers. Login sends a challenge-based HMAC proof instead of the PIN itself. Session tokens are short-lived (6 hours) and are included in JSONP request URLs; do not load untrusted third-party scripts or analytics on this origin.
- File uploads use a simple `text/plain` POST in no-cors mode because the response is opaque. The app checks the Drive gallery afterward. If confirmation is delayed, refresh the gallery before retrying to avoid duplicates.

## Updating the project

Push changes to `main`; GitHub Actions rebuilds and redeploys the static PWA. Apps Script backend changes require updating the Apps Script project and deploying a new version of the existing Web App deployment.

# BTH App

Static GitHub Pages app for Built to Hoop.

## Workstream A Status

- Local scaffold path: `C:\Users\built\Documents\Codex\2026-05-20\files-mentioned-by-the-user-bth\bth-app`
- Source base: `C:\Users\built\BTH-website-fix\bth-operator-v2.html`
- Source SHA256: `0AED70D5E3BB0FFDA2273F9F481A1A9970136AF0F8441E7EB95D084B0A75395F`
- Pages custom domain: `app.built-to-hoop.com`

## Current V1 Build

- Free mode: 5-day reset, locked library previews, upgrade CTA.
- Member mode: Gumroad license key unlock, localStorage persistence, in-app onboarding, library renderer.
- Gumroad product ID used for license verification: `n7oKRu8e3hy8pVr1mP4WBw==`
- Owner mode: hashed owner passphrase gate, then the preserved operator tools from `bth-operator-v2.html`.
- Library model: programs -> phases -> weeks -> days -> exercises, with `videoUrl` fields ready for later.
- Content gaps: see `CONTENT-GAPS.md`.
- Ty setup paths: see `TY-CLICK-PATHS.md`.

## Ty Setup Steps

1. Create a new GitHub repo under `builttohoop` named `bth-app`.
2. Keep it public unless you already have private GitHub Pages enabled.
3. Do not initialize with a README, license, or `.gitignore`.
4. Push this local scaffold:

```powershell
cd "C:\Users\built\Documents\Codex\2026-05-20\files-mentioned-by-the-user-bth\bth-app"
git remote add origin https://github.com/builttohoop/bth-app.git
git branch -M main
git push -u origin main
```

5. In GitHub: Settings -> Pages -> Source: Deploy from branch -> `main` / `/root`.
6. In DNS: add a CNAME record:
   - Name/Host: `app`
   - Target: `builttohoop.github.io`
7. In GitHub Pages custom domain, enter `app.built-to-hoop.com`.
8. After DNS verifies, enable Enforce HTTPS.

## Known V1 Constraints

- Static host only: no backend, no accounts DB.
- Gumroad license verification is client-side and bypassable by a technical user.
- Progress/state uses localStorage and is per-device.
- Owner mode is Ty-private UI only; owner data stays on Ty's device.

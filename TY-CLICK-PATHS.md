# Ty Click Paths - BTH App V1

## GitHub Repo + Pages

1. GitHub -> builttohoop org/account -> New repository.
2. Repository name: `bth-app`.
3. Visibility: Public, unless private GitHub Pages is available.
4. Do not initialize with README, license, or `.gitignore`.
5. Push this local repo:

```powershell
cd "C:\Users\built\Documents\Codex\2026-05-20\files-mentioned-by-the-user-bth\bth-app"
git remote add origin https://github.com/builttohoop/bth-app.git
git branch -M main
git push -u origin main
```

6. GitHub repo -> Settings -> Pages -> Source: Deploy from branch -> Branch `main` -> Folder `/root`.
7. DNS registrar -> add CNAME:
   - Host/Name: `app`
   - Target/Value: `builttohoop.github.io`
8. GitHub Pages -> Custom domain: `app.builttohoop.com`.
9. After DNS verifies, enable Enforce HTTPS.

## Gumroad License Keys + Redirect

1. Gumroad -> Products -> BTH Rise Monthly / `thxqs`.
2. Product settings -> License keys.
3. Enable unique license key per sale.
4. Save.
5. Post-purchase redirect or receipt instructions:
   - URL: `https://app.builttohoop.com`
   - Instruction: "Open the BTH app and paste the license key from this receipt to unlock the member library."
6. Save and run one test purchase/license check before launch.

## Zapier: Buyer Exits Free Reset

1. Zapier -> Create Zap.
2. Trigger: Gumroad -> Sale.
3. Filter: product/permalink is `thxqs`.
4. Action: MailerLite -> Remove Subscriber from Group.
5. Subscriber email: Gumroad buyer email.
6. Group: `Free Reset Subscribers` (`183664274621597077`).
7. Turn Zap on.

Do not use the dead/empty group `188987533912180080`.

## Owner Mode

Owner mode is a client-side convenience gate for Ty's private operator UI.

- Temporary owner passphrase is documented only in the local Codex -> Claude handoff, not in repo source.
- Only the SHA-256 hash is in `assets/bth-app-v1.js`.
- Owner data is still localStorage-only on Ty's device.

# Kuku Smart Development to Shipping Guide

This document explains how to take Kuku Smart from local development to a final shippable product. It is written for developers, testers, and release owners working on this React/Vite offline-first PWA.

## 1. Product Scope

Kuku Smart is an offline-first poultry farm management app for Kenyan smallholder farmers. It records batches, egg production, feed, inventory, health events, mortality, maintenance, workers, market activity, and SMS alert settings.

Current app characteristics:

- Frontend: React 18, TypeScript, Vite.
- Styling: Tailwind CSS and the design system in `DESIGN.md`.
- Local storage: IndexedDB through Dexie.
- PWA: `vite-plugin-pwa` with production service worker generation.
- Security baseline: local tenant-code plus username/password login gate, PBKDF2 password hashing, production-only service worker registration, zero known npm audit vulnerabilities at time of writing.
- Module access: new tenants receive Core only; paid modules require a payment reference before activation.
- Admin access: admins use the Admin tab on the login screen and land in an Admin Console for tenant/module oversight.

## 2. Repository Structure

```text
kuku_smart/
  public/
    icons/                 PWA icons
  src/
    App.tsx                Main application UI, routes, forms, local login gate
    db.ts                  Dexie schema, seed data, sync queue helpers
    main.tsx               React bootstrap and production service worker registration
    styles.css             Tailwind entry and global styles
  DESIGN.md                Brand, typography, colors, component guidance
  DEVELOPMENT_TO_SHIPPING.md
  index.html               App HTML shell
  offline.html             Offline fallback page
  package.json             Scripts and dependencies
  vite.config.ts           Vite and PWA configuration
```

## 3. Environment Setup

Use Node.js 22 or a current supported Node.js version compatible with Vite 8.

Check versions:

```powershell
node --version
npm.cmd --version
```

Install dependencies:

```powershell
npm.cmd install
```

On Windows PowerShell, use `npm.cmd` if `npm` is blocked by execution policy.

## 4. Local Development

Start the development server:

```powershell
npm.cmd run dev
```

The app runs at:

```text
http://127.0.0.1:5173/
```

Development notes:

- The dev server is bound to `127.0.0.1` to avoid exposing it on the local network.
- The PWA service worker is disabled in development to prevent stale development caches.
- On first load, create a local tenant account with tenant code, username, and password. The password hash is stored in browser `localStorage`; farm records are stored in IndexedDB.

## 5. Feature Development Workflow

1. Confirm the feature goal and affected modules.
2. Check existing UI patterns in `src/App.tsx` and design rules in `DESIGN.md`.
3. Keep changes scoped to the feature area.
4. Add or update local data types in `src/db.ts` only when the data model changes.
5. Use `createRecord` for new local records so entries are also added to the sync queue.
6. Avoid direct DOM injection. Do not use `dangerouslySetInnerHTML`, `eval`, or dynamic script execution.
7. Test on mobile and desktop widths because the app is mobile-first but also supports desktop navigation.

## 6. Data Model and Offline Behavior

The app stores data locally in IndexedDB using Dexie. Main tables include:

- `batches`
- `egg_records`
- `health_records`
- `feed_records`
- `sales`
- `inventory_items`
- `tasks`
- `workers`
- `suppliers`
- `buyers`
- `vets`
- `vaccination_records`
- `mortality_records`
- `equipment_maintenance`
- `sms_alert_settings`
- `tenant_profiles`
- `module_activations`
- `sync_queue`

When adding records:

- Write to the target Dexie table.
- Queue a sync item in `sync_queue`.
- Include timestamps with `createdAt` and `updatedAt`.

Future backend sync must treat all client data as untrusted. Validate table names, record ownership, tenant access, field types, and permissions on the server.

## 7. Security Requirements

Before a feature can ship, it must satisfy these requirements:

- No known high, critical, or unresolved moderate dependency vulnerabilities.
- No hardcoded secrets, tokens, passwords, or private API keys in source.
- No direct HTML injection from user input.
- No network calls to non-HTTPS production endpoints.
- No IndexedDB reads before the local login gate authenticates the user.
- No service worker registration during local development.
- Build tooling remains in `devDependencies`, not production `dependencies`.

Current local security controls:

- PBKDF2 password hashing with per-account salt.
- Local tenant-code plus username/password account setup and login screen.
- Separate local admin account setup and login screen.
- User Account panel for editing email, account icon, password, and logout.
- Core-only default access for new tenants.
- Payment-reference activation for paid modules.
- Farm Settings shortcut in the top bar.
- Logout button in the User Account card with confirmation.
- IndexedDB loading delayed until login succeeds.
- Vite/PWA dev service worker disabled.

Known limitation:

- Local records are not fully encrypted at rest. A user with deep browser profile access or devtools access may still inspect IndexedDB. Full at-rest encryption should be added before handling highly sensitive real farm or financial data at scale.

## 8. Quality Gates

Run these before every release candidate.

Dependency audit:

```powershell
npm.cmd audit --json
```

Production build:

```powershell
npm.cmd run build
```

Unit tests, when test files exist:

```powershell
npm.cmd test
```

End-to-end tests, when Playwright specs exist:

```powershell
npm.cmd run test:e2e
```

Manual smoke test:

1. Open the app on `http://127.0.0.1:5173/`.
2. Create a local tenant account using tenant code, username, and password.
3. Confirm the dashboard loads.
4. Confirm paid modules are hidden before activation.
5. Open Farm Settings and activate a requested module with a payment reference.
6. Confirm the activated module appears in navigation.
7. Add a sample record in the activated module.
8. Confirm queued sync count changes.
9. Log out from the User Account card and confirm the prompt.
10. Log in with tenant code, username, and password.
11. Confirm records still load.
12. Open Farm Settings and update account email/icon.
13. Change the account password and confirm the old password no longer works.
14. Toggle airplane/offline mode and confirm the offline banner changes.
15. Reload the app and confirm the login screen appears.
16. Use the Admin tab to create/log into an admin account.
17. Confirm the Admin Console shows tenant profile and module payment status.

## 9. Production Build

Create the production bundle:

```powershell
npm.cmd run build
```

Build output is generated in:

```text
dist/
```

Expected build artifacts:

- `dist/index.html`
- `dist/manifest.webmanifest`
- `dist/assets/*`
- `dist/sw.js`
- `dist/workbox-*.js`

Preview the production build locally:

```powershell
npm.cmd run preview
```

Open:

```text
http://127.0.0.1:4173/
```

## 10. Release Candidate Checklist

Complete this checklist before declaring a release candidate shippable.

- Product owner has approved the included workflows.
- Design matches `DESIGN.md`.
- Mobile layout checked at common phone widths.
- Desktop layout checked with sidebar navigation.
- Forms save expected records.
- Local tenant account setup and login work.
- Local admin account setup and login work.
- Admin Console shows tenant/module payment status.
- User Account email/icon/password/logout updates work.
- New tenants only have Core until paid modules are activated.
- Paid module activation requires a payment reference.
- Logout button works.
- Offline mode works after production build.
- PWA manifest loads.
- Production service worker registers only in production build.
- `npm.cmd audit --json` returns zero vulnerabilities or documented accepted risk.
- `npm.cmd run build` passes.
- No debug-only logs or temporary test code remain.
- No secrets exist in source, build files, or docs.
- Browser storage reset path is documented for support.

## 11. Shipping Options

### Static Web Host

Use this option for Netlify, Vercel static output, Azure Static Web Apps, S3/CloudFront, Firebase Hosting, or similar.

1. Run `npm.cmd run build`.
2. Upload the contents of `dist/`.
3. Configure the host to serve `index.html` for app routes.
4. Serve over HTTPS.
5. Ensure `manifest.webmanifest`, `sw.js`, and icon assets are served with correct content types.

### Internal Pilot

Use this for a controlled farmer or staff trial.

1. Build production assets.
2. Deploy to an HTTPS staging URL.
3. Ask testers to install the PWA from the browser.
4. Provide a test data reset process.
5. Collect feedback on data entry speed, offline use, and field readability.
6. Track bugs by module: Records, Health, Feed, Market, Workers, Settings.

### App Store Wrapper

If packaging as an Android app through a WebView/TWA wrapper:

1. Keep the PWA hosted over HTTPS.
2. Confirm offline behavior inside the wrapper.
3. Confirm local login works after app restart.
4. Confirm IndexedDB persistence survives OS backgrounding.
5. Add native app signing, versioning, privacy policy, and store listing assets.

## 12. Post-Release Monitoring

After shipping:

- Watch dependency advisories weekly.
- Run `npm.cmd audit` before every patch release.
- Track PWA cache issues after every deployment.
- Log user-reported sync conflicts once backend sync is introduced.
- Monitor failed login or data loss reports.
- Keep a migration plan for Dexie schema upgrades.

## 13. Support and Recovery

For local login issues:

- There is currently no password recovery flow.
- Resetting browser site data clears the login account and local records.
- Before real production use, add an export/backup flow and a recovery policy.

For stale PWA content:

1. Close all app tabs.
2. Reopen the app.
3. If the problem remains, clear site data for the domain.
4. Reinstall the PWA if it was installed to the home screen.

For local data reset during testing:

1. Open browser devtools.
2. Go to Application storage.
3. Clear IndexedDB and localStorage for the app origin.
4. Reload the app.

## 14. Definition of Shippable

Kuku Smart is shippable when:

- The production build passes.
- Dependency audit is clean or risks are formally accepted.
- Core workflows work offline and after reload.
- The app is served over HTTPS.
- PWA install and offline fallback work.
- Local login gate works.
- User-facing data is accurate, readable, and recoverable.
- Known limitations are documented for the release owner.

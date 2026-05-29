# Kuku Smart Development Guideline

This guideline describes how to develop, extend, and maintain the Kuku Smart app based on the features currently deployed.

## 1. Project Overview

Kuku Smart is an offline-first poultry farm management PWA designed for Kenyan smallholder farmers.

Key deployed features:

- Offline-first data storage and sync queue using IndexedDB via Dexie.
- Local tenant authentication with tenant code, username, and password.
- Separate admin login and Superadmin Module for business/package/subscription management.
- Core-only startup with paid modules activated by payment reference.
- Farm Settings for profile, password, and module activation.
- PBKDF2 password hashing for local credentials.
- Production service worker registration and PWA assets.

## Software Development Lifecycle (SDLC)

This section describes the lifecycle for planning, building, testing, and releasing Kuku Smart.

### Plan

- Define the business need for each feature in the context of smallholder poultry farming.
- Identify the minimum viable scope for tenant-facing workflows, admin workflows, and offline capability.
- Confirm whether a feature changes local data schemas, login/auth flows, or paid module activation.

### Requirements

- Capture functional requirements clearly, including login/setup flows, farm record types, offline persistence, and Superadmin controls.
- Capture nonfunctional requirements such as offline-first reliability, security for local credentials, responsiveness, and PWA behavior.
- Keep requirements executable and testable.

### Design

- Review existing UI patterns in `src/App.tsx` and `DESIGN.md`.
- Use the current form styles, navigation patterns, and modal behaviors.
- Define the data model changes in `src/db.ts` before implementing UI changes.
- Confirm that the feature works within the existing tenant/admin separation and module activation flow.

### Develop

- Build incrementally and keep changes scoped to the feature area.
- Write code in a way that preserves offline-first behavior and local storage safety.
- Avoid hardcoded credentials, secrets, or temporary data in source.
- Use the current auth model for login and admin access.

### Test

- Test locally with the development server on `http://127.0.0.1:5173/`.
- Verify the tenant login flow, admin login flow, and Superadmin Module where applicable.
- Validate offline persistence by refreshing and reconnecting.
- Run builds and check that the app compiles cleanly.

### Deploy

- Confirm that `npm.cmd run build` succeeds.
- Verify production PWA artifacts in `dist/`.
- Ensure service worker registration is enabled only for production.

### Maintain

- Keep documentation current in `README.md`, `DEVELOPMENT_GUIDELINE.md`, and `DEVELOPMENT_TO_SHIPPING.md`.
- Update the SDLC section when workflow or release processes change.

## 2. Development Environment

### Requirements

- Node.js 22+ (or compatible current LTS)
- npm
- Windows PowerShell or bash as the local shell

### Install dependencies

```powershell
npm.cmd install
```

### Run locally

```powershell
npm.cmd run dev
```

Then open:

```text
http://127.0.0.1:5173/
```

## 3. Repo Structure

Important files:

- `src/App.tsx` — main app UI, login flow, screens, and module routing.
- `src/db.ts` — Dexie schema, tables, local storage helpers, and sync queue logic.
- `src/main.tsx` — React app bootstrap and PWA/service worker registration.
- `src/styles.css` — Tailwind entry, custom styles, and global CSS.
- `DESIGN.md` — design system, color, typography, and component guidance.
- `README.md` — quick start and user-facing login/setup guidance.
- `DEVELOPMENT_TO_SHIPPING.md` — shipping checklist and release guidance.

## 4. Feature Development Principles

### Keep user flows simple and local-first

- Preserve the current offline-first experience.
- Read and write tenant/farm data only after successful login.
- Keep new features consistent with the existing tenant/admin separation.

### Follow the existing auth model

- Tenant login uses `tenantCode`, `username`, and `password`.
- Superadmin login uses `adminId` and `password`.
- The first admin account is created through the Admin tab on first use.
- Do not add hardcoded admin credentials in source.

### Preserve paid module behavior

- Core is the default state for new tenants.
- Paid modules must only be enabled after a valid payment reference is entered in Farm Settings.
- Keep module activation gated inside the existing module activation flow.

## 5. Data and Storage Practices

### IndexedDB / Dexie

- Store app records in IndexedDB through `src/db.ts`.
- Use `sync_queue` entries for offline changes that need eventual sync.
- Maintain `createdAt` and `updatedAt` timestamps on records.
- Avoid migration-breaking changes without a clear upgrade path.

### Data model updates

- Add new tables or fields only when required.
- Keep schema changes backwards-compatible when possible.
- Ensure new data types are validated before saving.
- Do not access IndexedDB before login checks complete.

## 6. UI and UX Guidelines

### Login and setup

- Keep the first-run experience clear: create tenant login first, then admin login through Admin tab.
- Admin tab should remain separated from tenant login.
- Use the existing sample tenant code `NYERI-KUKU-001` as a model for local setup.

### Farm Settings

- Farm Settings should remain the central place for:
  - account email and icon updates
  - password change
  - module activation
- Keep the User Account card accessible and easy to use.

### Superadmin Module

- Preserve the Superadmin Module functions:
  - create businesses
  - create SaaS packages
  - allocate subscriptions
  - record offline payment references
  - deactivate/reactivate businesses
- Keep admin controls secure behind admin authentication only.

## 7. Security Guidelines

### Credential handling

- Use PBKDF2 hashing with per-account salt for passwords.
- Store only hashed passwords and salts in browser local storage.
- Never store plain-text passwords in source or storage.

### Source safety

- Do not introduce secrets, API keys, or passwords into git-tracked files.
- Avoid direct HTML insertion from user input.
- Do not enable production service worker registration in dev mode.

### Vulnerability checks

- Run dependency audits regularly.
- Fix any critical or high vulnerabilities before shipping.

## 8. Testing and Validation

### Build verification

- Run the production build before release:

```powershell
npm.cmd run build
```

### Functional checks

- Verify tenant account creation and login.
- Verify admin account creation and admin login.
- Verify paid module activation via payment reference.
- Verify offline persistence and reload behavior.
- Verify password change flows for both tenant and admin.

### Manual smoke tests

- Create a local tenant account using tenant code, username, and password.
- Confirm core dashboard loads and farm records are accessible.
- Activate a paid module and confirm it appears in navigation.
- Log out and log back in to confirm restored access.
- Open Admin tab and use the Superadmin Module features.

## 9. Shipping Notes

### Production build artifacts

- `dist/index.html`
- `dist/manifest.webmanifest`
- `dist/assets/*`
- `dist/sw.js`
- `dist/workbox-*.js`

### Release readiness

- Confirm the app is still offline-first and login gates work.
- Confirm there are no stale service worker registration issues.
- Confirm local tenant and admin records persist across reloads.

## 10. Future improvements

Suggested next-step improvements:

- Add a password recovery / reset flow.
- Add server-backed sync for shared supervision or multi-device support.
- Add audit logging for Superadmin actions.
- Add stronger at-rest encryption for IndexedDB data.
- Add automated tests to cover tenant/admin login and module activation.

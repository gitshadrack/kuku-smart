# Kuku Smart MVP

## Summary

Kuku Smart is an offline-first poultry farm manager for Kenyan smallholder farmers. The MVP focuses on local farm records, tenant login, paid module activation, and a superadmin console for managing businesses, packages, and subscriptions.

## MVP Scope

- Local tenant setup and login with password recovery.
- Admin login with a superadmin module.
- Offline-first farm data stored in IndexedDB through Dexie.
- Core dashboard, activity records, farm settings, reports, and module-aware navigation.
- Farm records for batches, eggs, inventory, maintenance, feed, health, vaccinations, mortality, suppliers, vets, workers, SMS alerts, and sales.
- Paid module activation using payment references.
- PWA build with offline support.

## Folder Structure

```text
src/
  admin/       Superadmin console and local SaaS package/subscription storage
  app/         App-level hooks and route definitions
  auth/        Tenant/admin login, password hashing, recovery, and account helpers
  components/  Shared layout, UI, and form components
  screens/     Feature screens and screen router
  db.ts        Dexie database schema, seed data, and local sync queue helpers
```

## Review Notes

The app has been refactored into a clearer folder structure so other coders can review each feature area more easily. `App.tsx` now handles application wiring, while screens, auth, admin tools, and shared components live in focused files.

## Verification

```powershell
npm.cmd run build
npm.cmd run test
```

For local testing:

```powershell
npm.cmd run dev
```

Open `http://127.0.0.1:5173/`.

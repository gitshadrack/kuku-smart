# Kuku Smart

Offline-first poultry farm records for Kenyan smallholder farmers.

## Quick Start

```powershell
npm.cmd install
npm.cmd run dev
```

Open:

```text
http://127.0.0.1:5173/
```

On first launch, create the local tenant login. The sample tenant code is:

```text
NYERI-KUKU-001
```

After login, use the top-bar settings icon to open **Farm Settings**. The **User Account** card lets the tenant edit email, choose an account icon, change password, or log out.

New tenants start with Core only. Paid modules are activated from **Farm Settings** by entering the payment reference for the requested module.

Admins use the **Admin** tab on the login screen. The first admin creates an admin account with an Admin ID, email, and password; returning admins log in with that Admin ID and password.

If a password is forgotten, use the **Forgot password?** link on the login screen. Admin recovery requires the registered admin email, and tenant recovery requires the registered tenant email.

The admin account opens a **Superadmin Module** where admins can create businesses, create SaaS-style packages, allocate subscriptions, record offline payment references, and deactivate/reactivate businesses.

## Build

```powershell
npm.cmd run build
```

Production files are generated in `dist/`.

## Verification

```powershell
npm.cmd audit --json
npm.cmd run build
```

## Documentation

- [Development to Shipping Guide](DEVELOPMENT_TO_SHIPPING.md)
- [Design System](DESIGN.md)

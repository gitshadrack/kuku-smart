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

After login, open **Farm Settings** to edit the user account email, account icon, or password.

New tenants start with Core only. Paid modules are activated from **Farm Settings** by entering the payment reference for the requested module.

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

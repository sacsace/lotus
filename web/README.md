# Lotus Korean Hotel - Web App

Next.js 15 (App Router) + Prisma (SQLite) + Korean-first UI.
This project supports booking, inquiry, admin rate management, and optional MVS integration.

## Multi-tenant by Company URL

- Public site exists only under `/{tenantSlug}`. Example: `/lotus-gangnam`, `/lotus-busan`
- Each tenant maps to an MVS company via `mvsCompanyId`
- If `mvsCompanyId` is empty, that tenant runs in **local-only mode** (no MVS call)
- Root `/` auto-redirects to default tenant (`DEFAULT_TENANT_SLUG`), fallback to first tenant
- Public APIs are under `/api/tenants/{tenantSlug}/...`
- Admin selects tenant scope from `/admin/pick-tenant`
- Per-tenant MVS toggle/settings page: `/admin/tenant-settings`

## Run

```bash
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

- Open `http://localhost:3000` and choose a hotel
- Example booking URL: `http://localhost:3000/lotus-gangnam/book`
- Admin URL: `http://localhost:3000/admin/login`

## Environment

See `.env.example`.
If `MVS_BASE_URL` + `MVS_API_KEY` are set, MVS endpoints are used for tenants that have `mvsCompanyId`.

## Main Routes

| Route | Description |
|------|------|
| `/{tenantSlug}/book` | Guest booking + mock payment |
| `/{tenantSlug}/my-reservation` | Lookup by booking code + email |
| `/{tenantSlug}/contact` | Inquiry |
| `/admin/rates` | Rate/inventory for selected tenant |

## Database

SQLite file: `prisma/dev.db` (ignored by git).

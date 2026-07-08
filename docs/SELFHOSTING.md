# Self-Hosting ProductHub

ProductHub is a self-hosted Next.js application. You own your code and your data.

## Supported Platforms

| Platform | Database | Notes |
|---|---|---|
| Vercel | Neon, Supabase, Railway | Recommended |
| Netlify | Neon, Supabase, Railway | Works with serverless functions |
| Railway | Railway Postgres | Native full-stack hosting |
| Render | Render Postgres | Native full-stack hosting |
| Self-Hosted | Any Postgres | Docker, VPS, AWS, RDS, etc. |

## Prerequisites

- Node.js 20+
- A Postgres database
- A deployment platform account

## Quick Start

1. Set required environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `APP_URL`
   - `BRAND_NAME`
   - `INDUSTRY_TEMPLATE`
2. Run migrations:

```bash
npm run db:migrate
```

3. Seed the database, or create the first admin at `/setup`:

```bash
npm run db:seed
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---:|---|---|
| `DATABASE_URL` | Yes | - | Postgres connection string |
| `DATABASE_PROVIDER` | No | `postgres` | Documentation/logging hint only |
| `AUTH_SECRET` | Yes | - | JWT signing secret |
| `APP_URL` | Yes | - | Deployment URL |
| `BRAND_NAME` | No | `ProductHub` | Company or workspace name |
| `BRAND_TAGLINE` | No | `Product Documentation Workspace` | Login tagline |
| `DEFAULT_CURRENCY` | No | `USD` | Default currency code |
| `INDUSTRY_TEMPLATE` | No | `generic` | Active industry preset |
| `ENABLE_MFA` | No | `true` | Enable TOTP MFA |
| `ENABLE_AFFILIATE_ROLE` | No | `false` | Enable affiliate role behavior |
| `ENABLE_EXPIRY` | No | `true` | Show product expiry fields |
| `ENABLE_SALES_TRACKING` | No | `true` | Show sales tracking fields |
| `BLOB_READ_WRITE_TOKEN` | No | - | Enables hosted file uploads/backups |
| `ADMIN_BOOTSTRAP_EMAIL` | No | - | Seed admin email |
| `ADMIN_BOOTSTRAP_PASSWORD` | No | - | Seed admin password |

## Database Setup

Any Drizzle-compatible Postgres works.

```bash
npm run db:generate
npm run db:migrate
```

## Post-Deployment

Visit `/setup` to create the first admin account if you did not seed one. Then use Settings to update branding, access, profile security, and backups.

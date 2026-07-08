# ProductHub

ProductHub is a self-hosted product documentation workspace for teams that need a controlled catalogue of offers, pricing, assets, access rules, and launch status.

It is built with Next.js App Router, TypeScript, Tailwind, Drizzle ORM, Postgres, bcrypt password auth, jose JWT sessions, and optional TOTP MFA.

## Quick Start

```bash
npm install
npm run setup
npm run dev
```

The setup script writes `.env.local`, runs migrations, and can seed sample data. If you do not seed a bootstrap admin, visit `/setup` after deploying to create the first administrator.

## Configuration

ProductHub is configured through environment variables:

- `BRAND_NAME`
- `BRAND_TAGLINE`
- `DEFAULT_CURRENCY`
- `INDUSTRY_TEMPLATE`
- `ENABLE_MFA`
- `ENABLE_AFFILIATE_ROLE`
- `ENABLE_EXPIRY`
- `ENABLE_SALES_TRACKING`
- `DATABASE_URL`
- `AUTH_SECRET`
- `APP_URL`

Industry presets live in `src/lib/config/industries`. The database stores stable role keys and product columns, while UI labels come from the active preset.

## Documentation

- [Self-hosting](docs/SELFHOSTING.md)
- [Industry presets](docs/INDUSTRIES.md)
- [Deployment](docs/DEPLOYMENT.md)

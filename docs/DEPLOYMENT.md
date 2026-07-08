# Deployment

## Vercel

1. Create a new project from this repository.
2. Add a Postgres `DATABASE_URL`.
3. Add `AUTH_SECRET`, `APP_URL`, `BRAND_NAME`, and `INDUSTRY_TEMPLATE`.
4. Deploy.
5. Run `npm run db:migrate`.
6. Visit `/setup` to create the first admin.

## Netlify

1. Set the build command to `npm run build`.
2. Set environment variables in the Netlify dashboard.
3. Use a serverless-compatible Postgres connection string.
4. Run migrations from a local machine or CI before first use.

## Railway

1. Provision Railway Postgres.
2. Set `DATABASE_URL` from the Railway Postgres service.
3. Set `DATABASE_PROVIDER=railway`.
4. Run migrations and deploy.

## Self-Hosted

Use any Node.js 20+ host with a standard Postgres database.

```bash
npm install
npm run build
npm run db:migrate
npm run start
```

Put a reverse proxy such as Nginx, Caddy, or your platform load balancer in front of the Node process.

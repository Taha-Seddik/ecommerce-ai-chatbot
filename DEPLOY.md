# Deploying Norden to a VPS (Hostinger / any Ubuntu box)

Next.js **standalone** output + **PM2** + **Nginx**. SQLite is a file on disk — no database server to run.

## Prerequisites (one time, on the VPS)

```bash
# Node 20+ and PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2
```

## First deploy

```bash
# 1) Get the code (replace with your repo URL)
cd /var/www && git clone <YOUR_REPO_URL> norden && cd norden

# 2) Environment — copy the example and set production values
cp .env.example .env
#   Edit .env:
#     NODE_ENV=production
#     NEXT_PUBLIC_BASE_URL=https://YOUR_DOMAIN
#     JWT_SECRET=<the strong secret below>           # REQUIRED in prod (app refuses to boot otherwise)
#     STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET       # optional — omit for Cash-on-Delivery only
#
#   A freshly generated secret you can use:
#     JWT_SECRET=XbsaiLVTxkWzvssLajDgOPBE4QcnNLQOSTNR4NgSzjzVUuANSF1oELPTJRzXboqI

# 3) Install, migrate, seed (seed only on first deploy), build, start
npm ci
npx drizzle-kit migrate
npm run db:seed                 # optional demo catalog; skip for a real store
npm run build
cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/public
pm2 start ecosystem.config.cjs && pm2 save && pm2 startup   # PM2 boots the app on reboot
```

The app now listens on `127.0.0.1:3000`.

## Nginx + TLS

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/norden
sudo sed -i 's/YOUR_DOMAIN/your.domain.com/' /etc/nginx/sites-available/norden
sudo ln -s /etc/nginx/sites-available/norden /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your.domain.com        # Let's Encrypt HTTPS
```

## Stripe webhook (only if Stripe is enabled)

In the Stripe dashboard → Developers → Webhooks → add endpoint
`https://YOUR_DOMAIN/api/stripe/webhook`, subscribe to `checkout.session.completed`,
`checkout.session.expired`, `checkout.session.async_payment_failed`, then copy the signing secret
(`whsec_…`) into `.env` as `STRIPE_WEBHOOK_SECRET` and restart (`pm2 reload norden`).

## Updates

```bash
bash deploy/deploy.sh            # pull → install → build → migrate → reload PM2
```

## Persistence

`data/app.db` (the database) and `public/uploads/` (admin images) live in the repo root and are
**not** part of the build artifact — `deploy.sh` symlinks uploads into the standalone bundle so both
survive redeploys. Back up `data/app.db` to keep orders/users.

## Alternative: Docker

A `Dockerfile` is included. Mount `data/` and `public/uploads/` as volumes and pass the same env vars.

## Vercel variant

Point `DATABASE_URL` at a **Turso** URL (+ `DATABASE_AUTH_TOKEN`) and set `STORAGE_DRIVER=s3`
(Vercel's filesystem is ephemeral). No schema or query changes required.

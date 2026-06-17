#!/usr/bin/env bash
# Norden — build + deploy/update on the VPS. Run from the repo root:  bash deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Pulling latest";        git pull --ff-only
echo "→ Installing deps";       npm ci
echo "→ Building (standalone)"; npm run build
echo "→ Running migrations";    npx drizzle-kit migrate

echo "→ Assembling standalone bundle"
cp -r .next/static .next/standalone/.next/
rm -rf .next/standalone/public
cp -r public .next/standalone/public
# Persist user uploads OUTSIDE the build: serve the repo-root folder via a symlink so they
# survive redeploys (the upload route writes to <cwd>/public/uploads).
mkdir -p public/uploads
rm -rf .next/standalone/public/uploads
ln -s "$(pwd)/public/uploads" .next/standalone/public/uploads

echo "→ Reloading PM2"
pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
pm2 save
echo "✓ Deployed"

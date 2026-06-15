// PM2 process config for the Hostinger VPS.
// Build first: `npm run build`, then copy static + public next to the standalone server
// (see README → Deployment), run migrations, and `pm2 start ecosystem.config.cjs`.
module.exports = {
  apps: [
    {
      name: 'norden',
      script: '.next/standalone/server.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
};

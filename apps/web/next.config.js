cd /var/www/vps-panel

echo "🔧 Fixing next.config.js..."
cp next.config.js next.config.js.backup

cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http', 
        hostname: 'localhost',
      },
    ],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
}

module.exports = nextConfig
EOF

echo "🔄 Restarting application..."
pm2 stop vps-panel
rm -rf .next
npm run build
pm2 start vps-panel

echo "✅ Done! Check your panel: https://id.ahemmm.my.id"
pm2 logs vps-panel --lines 10

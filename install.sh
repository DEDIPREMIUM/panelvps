#!/bin/bash

# ===============================================
# VPS Management Panel Auto Installer (Fixed)
# Repository: DEDIPREMIUM/panelvps
# ===============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Banner
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   VPS MANAGEMENT PANEL                       ║"
echo "║                   Auto Installer v2.0                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Run as root: sudo bash install.sh${NC}"
   exit 1
fi

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get user input
echo -e "${CYAN}📋 Configuration Setup:${NC}"
read -p "🌐 Domain (ex: panel.domain.com): " DOMAIN
read -p "📧 Admin Email: " ADMIN_EMAIL
read -s -p "🔒 Admin Password: " ADMIN_PASSWORD
echo ""
read -p "🗄️ Database Name (default: vps_panel): " DB_NAME
DB_NAME=${DB_NAME:-vps_panel}
read -p "👤 DB Username (default: vps_admin): " DB_USER
DB_USER=${DB_USER:-vps_admin}
read -s -p "🔐 DB Password: " DB_PASSWORD
echo ""

if [[ -z "$DOMAIN" || -z "$ADMIN_EMAIL" || -z "$ADMIN_PASSWORD" || -z "$DB_PASSWORD" ]]; then
    echo -e "${RED}❌ All fields required!${NC}"
    exit 1
fi

print_status "🚀 Starting installation..."

# Update system
print_status "📦 Updating system..."
apt update && apt upgrade -y

# Install essentials
print_status "🛠️ Installing essentials..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18.x
print_status "📦 Installing Node.js..."
if ! command_exists node; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Install PostgreSQL
print_status "🗄️ Installing PostgreSQL..."
if ! command_exists psql; then
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

# Install Nginx
print_status "🌐 Installing Nginx..."
if ! command_exists nginx; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi

# Install PM2
print_status "⚙️ Installing PM2..."
npm install -g pm2

# Install Certbot
print_status "🔐 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Create app directory
APP_DIR="/var/www/vps-panel"
print_status "📁 Creating app directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository
print_status "📥 Cloning repository..."
if [ -d ".git" ]; then
    git pull origin main
else
    git clone https://github.com/DEDIPREMIUM/panelvps.git .
fi

# Create Next.js project structure
print_status "🏗️ Setting up project structure..."

# Create package.json
cat > package.json << 'EOF'
{
  "name": "vps-management-panel",
  "version": "1.0.0",
  "description": "VPS Management Panel",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^13.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-auth": "^4.22.0",
    "pg": "^8.11.0",
    "bcrypt": "^5.1.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.0",
    "eslint": "^8.43.0",
    "eslint-config-next": "^13.4.0"
  }
}
EOF

# Create Next.js config
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
EOF

# Create Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create PostCSS config
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create globals.css
mkdir -p src/app
cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
}
EOF

# Install dependencies
print_status "📦 Installing dependencies..."
npm install

# Set up database
print_status "🗄️ Setting up database..."
sudo -u postgres createuser $DB_USER 2>/dev/null || true
sudo -u postgres createdb $DB_NAME 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

# Create tables
sudo -u postgres psql -d $DB_NAME << EOF
-- Create server_stats table
CREATE TABLE IF NOT EXISTS server_stats (
    id SERIAL PRIMARY KEY,
    cpu_usage DOUBLE PRECISION NOT NULL,
    ram_used INTEGER NOT NULL,
    ram_total INTEGER NOT NULL,
    disk_used INTEGER NOT NULL,
    disk_total INTEGER NOT NULL,
    uptime VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ssh_users table
CREATE TABLE IF NOT EXISTS ssh_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    expired_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create xray_users table
CREATE TABLE IF NOT EXISTS xray_users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    expired_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    upload_bytes BIGINT DEFAULT 0,
    download_bytes BIGINT DEFAULT 0
);

-- Create auth tables
CREATE TABLE IF NOT EXISTS auth_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    image TEXT
);

CREATE TABLE IF NOT EXISTS auth_accounts (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    id_token TEXT,
    scope TEXT,
    session_state TEXT,
    token_type TEXT,
    password TEXT
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    "sessionToken" VARCHAR(255) NOT NULL
);

-- Insert admin user
INSERT INTO auth_users (name, email) VALUES ('Admin', '$ADMIN_EMAIL') ON CONFLICT (email) DO NOTHING;
EOF

# Create .env file
print_status "⚙️ Creating environment..."
cat > .env << EOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
DEFAULT_ADMIN_EMAIL="$ADMIN_EMAIL"
DEFAULT_ADMIN_PASSWORD="$ADMIN_PASSWORD"
NODE_ENV=production
PORT=3000
EOF

# Copy source files if exist
if [ -d "createxyz-project/apps/web/src" ]; then
    print_status "📋 Copying source files..."
    cp -r createxyz-project/apps/web/src/* src/
fi

# Build application
print_status "🔨 Building application..."
npm run build

# Configure Nginx
print_status "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/vps-panel << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/vps-panel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Install SSL
print_status "🔐 Installing SSL..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL --redirect

# Start with PM2
print_status "🚀 Starting application..."
pm2 start npm --name "vps-panel" -- start
pm2 startup
pm2 save

# Configure firewall
print_status "🛡️ Configuring firewall..."
ufw allow 22 2>/dev/null || true
ufw allow 80 2>/dev/null || true
ufw allow 443 2>/dev/null || true
ufw --force enable 2>/dev/null || true

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ INSTALLATION COMPLETE!                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}🌐 Panel URL: ${GREEN}https://$DOMAIN${NC}"
echo -e "${CYAN}📧 Admin: ${GREEN}$ADMIN_EMAIL${NC}"
echo -e "${CYAN}📁 Directory: ${GREEN}$APP_DIR${NC}"
echo ""
echo -e "${BLUE}🎉 Your VPS Panel is ready!${NC}"

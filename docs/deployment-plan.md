# Production Deployment Plani — Seyfibaba Pazaryeri

**Tarih:** 2026-03-27
**Domain:** seyfibaba.com
**Stack:** Laravel 10 (API) + Next.js 15 (SSR) + MySQL + Redis
**Hedef:** VPS uzerinde Nginx + PM2 ile production deployment

---

## 1. VPS GEREKSINIMLERI

| Kaynak | Minimum | Onerilen |
|--------|---------|----------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disk | 40 GB SSD | 80 GB NVMe |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Bandwidth | 2 TB/ay | 5 TB/ay |

**Yazilim:** PHP 8.2+, Node.js 20 LTS, MySQL 8.0, Redis 7, Nginx, PM2, Certbot, Composer, Bun

---

## 2. DIZIN YAPISI (VPS)

```
/var/www/seyfibaba/
├── backend/              # Laravel 10
│   ├── .env              # Production env
│   ├── storage/          # Logs, cache, uploads
│   └── public/           # Web root (Nginx points here)
├── frontend/             # Next.js 15
│   ├── .env.production   # Production env
│   └── .next/            # Build output
├── shared/
│   └── uploads/          # Symlink: backend/public/uploads → shared/uploads
└── backups/              # DB + uploads yedekleri
```

---

## 3. ENVIRONMENT VARIABLES

### 3.1 Backend `.env` (Production)

```env
# === APP ===
APP_NAME=Seyfibaba
APP_ENV=production
APP_KEY=base64:YENI_KEY_URET  # php artisan key:generate
APP_DEBUG=false
APP_URL=https://api.seyfibaba.com
APP_VERSION=1

# === DATABASE ===
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=seyfibaba_prod
DB_USERNAME=seyfibaba_user
DB_PASSWORD=GUCLU_SIFRE_URET_32_KARAKTER

# === CACHE & SESSION ===
CACHE_DRIVER=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
QUEUE_CONNECTION=redis
BROADCAST_DRIVER=pusher

# === REDIS ===
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=REDIS_SIFRE_URET
REDIS_PORT=6379

# === JWT ===
JWT_SECRET=YENI_JWT_SECRET_URET  # php artisan jwt:secret
JWT_TTL=60
JWT_REFRESH_TTL=20160
JWT_BLACKLIST_ENABLED=true

# === MAIL (SMTP) ===
MAIL_MAILER=smtp
MAIL_HOST=smtp.yandex.com.tr
MAIL_PORT=465
MAIL_USERNAME=info@seyfibaba.com
MAIL_PASSWORD=MAIL_SIFRE
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=info@seyfibaba.com
MAIL_FROM_NAME=Seyfibaba

# === IYZICO ===
IYZICO_API_KEY=CANLI_API_KEY
IYZICO_SECRET_KEY=CANLI_SECRET_KEY
IYZICO_BASE_URL=https://api.iyzipay.com

# === SMS (Iletimerkezi) ===
ILETIMERKEZI_API_KEY=CANLI_KEY
ILETIMERKEZI_API_HASH=CANLI_HASH
ILETIMERKEZI_SENDER=SEYFIBABA

# === PUSHER (Mesajlasma) ===
PUSHER_APP_ID=APP_ID
PUSHER_APP_KEY=APP_KEY
PUSHER_APP_SECRET=APP_SECRET
PUSHER_APP_CLUSTER=eu

# === STORAGE ===
FILESYSTEM_DRIVER=local

# === FRONTEND ===
NEXT_PUBLIC_BASE_URL=https://api.seyfibaba.com
```

### 3.2 Frontend `.env.production`

```env
NEXT_PUBLIC_BASE_URL=https://api.seyfibaba.com/
NEXT_APPLICATION_URL=https://seyfibaba.com
NEXT_PWA_STATUS=1
NODE_ENV=production
PORT=3000
```

---

## 4. NGINX KONFIGURASYONU

### 4.1 Backend (Laravel API)

```nginx
# /etc/nginx/sites-available/api.seyfibaba.com
server {
    listen 80;
    server_name api.seyfibaba.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.seyfibaba.com;

    ssl_certificate /etc/letsencrypt/live/api.seyfibaba.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seyfibaba.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    root /var/www/seyfibaba/backend/public;
    index index.php;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com" always;

    # Block sensitive files
    location ~ /\.env { deny all; return 404; }
    location ~ /\.git { deny all; return 404; }
    location ~ /\.htaccess { deny all; return 404; }

    # Upload size limit
    client_max_body_size 20M;

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Static assets cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff2|woff|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Block directory listing
    autoindex off;

    # Rate limiting zone (tanimla: /etc/nginx/nginx.conf icinde)
    # limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
    # location /api/ { limit_req zone=api burst=50 nodelay; }

    access_log /var/log/nginx/api.seyfibaba.access.log;
    error_log /var/log/nginx/api.seyfibaba.error.log;
}
```

### 4.2 Frontend (Next.js SSR)

```nginx
# /etc/nginx/sites-available/seyfibaba.com
server {
    listen 80;
    server_name seyfibaba.com www.seyfibaba.com;
    return 301 https://seyfibaba.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.seyfibaba.com;
    ssl_certificate /etc/letsencrypt/live/seyfibaba.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seyfibaba.com/privkey.pem;
    return 301 https://seyfibaba.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seyfibaba.com;

    ssl_certificate /etc/letsencrypt/live/seyfibaba.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seyfibaba.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Next.js reverse proxy
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Next.js static assets (long cache)
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Public static files
    location /static {
        alias /var/www/seyfibaba/frontend/public/static;
        expires 30d;
    }

    access_log /var/log/nginx/seyfibaba.access.log;
    error_log /var/log/nginx/seyfibaba.error.log;
}
```

---

## 5. PM2 ECOSYSTEM KONFIGURASYONU

```javascript
// /var/www/seyfibaba/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "seyfibaba-frontend",
      cwd: "/var/www/seyfibaba/frontend",
      script: "node_modules/.bin/next",
      args: "start",
      instances: 2,             // 2 instance (cluster mode)
      exec_mode: "cluster",
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Log rotation
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/log/pm2/seyfibaba-frontend-error.log",
      out_file: "/var/log/pm2/seyfibaba-frontend-out.log",
      merge_logs: true,
      // Auto restart
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
    {
      name: "seyfibaba-queue",
      cwd: "/var/www/seyfibaba/backend",
      script: "artisan",
      args: "queue:work redis --sleep=3 --tries=3 --max-time=3600",
      interpreter: "php",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "256M",
      env: {
        APP_ENV: "production",
      },
      error_file: "/var/log/pm2/seyfibaba-queue-error.log",
      out_file: "/var/log/pm2/seyfibaba-queue-out.log",
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
```

---

## 6. DEPLOYMENT ADIMLARI

### 6.1 VPS Ilk Kurulum (Tek Seferlik)

```bash
# 1. Sistem guncelleme
sudo apt update && sudo apt upgrade -y

# 2. Gerekli paketler
sudo apt install -y nginx mysql-server redis-server \
  php8.2-fpm php8.2-mysql php8.2-mbstring php8.2-xml \
  php8.2-curl php8.2-zip php8.2-gd php8.2-redis \
  php8.2-intl php8.2-bcmath certbot python3-certbot-nginx \
  git unzip supervisor

# 3. Node.js 20 LTS + Bun
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
curl -fsSL https://bun.sh/install | bash

# 4. Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# 5. PM2
sudo npm install -g pm2

# 6. MySQL guvenlik
sudo mysql_secure_installation

# 7. MySQL kullanici + database
sudo mysql -e "CREATE DATABASE seyfibaba_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'seyfibaba_user'@'localhost' IDENTIFIED BY 'GUCLU_SIFRE';"
sudo mysql -e "GRANT ALL PRIVILEGES ON seyfibaba_prod.* TO 'seyfibaba_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 8. Redis sifre
sudo sed -i 's/# requirepass foobared/requirepass REDIS_SIFRE/' /etc/redis/redis.conf
sudo systemctl restart redis

# 9. Firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 10. Dizin olustur
sudo mkdir -p /var/www/seyfibaba /var/log/pm2
sudo chown -R $USER:www-data /var/www/seyfibaba
```

### 6.2 Kod Deploy (Her Release)

```bash
#!/bin/bash
# deploy.sh — /var/www/seyfibaba/deploy.sh
set -e

DEPLOY_DIR="/var/www/seyfibaba"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== Seyfibaba Deploy — $TIMESTAMP ==="

# 1. Git pull
cd $DEPLOY_DIR
git pull origin main

# 2. Backend
echo "--- Backend ---"
cd $DEPLOY_DIR/backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan storage:link

# 3. Frontend
echo "--- Frontend ---"
cd $DEPLOY_DIR/frontend
bun install --frozen-lockfile
bun run build

# 4. PM2 reload (zero-downtime)
pm2 reload ecosystem.config.js

# 5. PHP-FPM reload
sudo systemctl reload php8.2-fpm

# 6. Cache temizle
cd $DEPLOY_DIR/backend
php artisan cache:clear
php artisan config:cache

echo "=== Deploy tamamlandi — $TIMESTAMP ==="
```

### 6.3 SSL Sertifikasi

```bash
# Ilk kurulum
sudo certbot --nginx -d seyfibaba.com -d www.seyfibaba.com
sudo certbot --nginx -d api.seyfibaba.com

# Otomatik yenileme (cron)
sudo certbot renew --dry-run
# Certbot zaten /etc/cron.d/certbot ile otomatik yeniler
```

---

## 7. YEDEKLEME STRATEJISI

### 7.1 MySQL Yedekleme

```bash
# /var/www/seyfibaba/scripts/backup-db.sh
#!/bin/bash
BACKUP_DIR="/var/www/seyfibaba/backups/db"
DATE=$(date +%Y%m%d_%H%M)
mkdir -p $BACKUP_DIR

mysqldump -u seyfibaba_user -p'SIFRE' seyfibaba_prod \
  --single-transaction --routines --triggers \
  | gzip > "$BACKUP_DIR/seyfibaba_$DATE.sql.gz"

# Son 30 gunu tut
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### 7.2 Uploads Yedekleme

```bash
# /var/www/seyfibaba/scripts/backup-uploads.sh
#!/bin/bash
BACKUP_DIR="/var/www/seyfibaba/backups/uploads"
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

tar czf "$BACKUP_DIR/uploads_$DATE.tar.gz" \
  -C /var/www/seyfibaba/backend/public uploads/

# Son 7 gunu tut
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 7.3 Cron Jobs

```cron
# crontab -e
# DB yedekleme — her gun 03:00
0 3 * * * /var/www/seyfibaba/scripts/backup-db.sh >> /var/log/seyfibaba-backup.log 2>&1

# Upload yedekleme — her pazar 04:00
0 4 * * 0 /var/www/seyfibaba/scripts/backup-uploads.sh >> /var/log/seyfibaba-backup.log 2>&1

# Laravel scheduler
* * * * * cd /var/www/seyfibaba/backend && php artisan schedule:run >> /dev/null 2>&1

# Log rotation
0 0 * * * find /var/www/seyfibaba/backend/storage/logs -name "*.log" -mtime +14 -delete
```

---

## 8. IZLEME & MONITORING

### 8.1 PM2 Monitoring

```bash
# Durum kontrolu
pm2 status
pm2 monit

# Startup hook (reboot sonrasi otomatik baslat)
pm2 startup
pm2 save
```

### 8.2 Nginx Log Rotation

```
# /etc/logrotate.d/seyfibaba
/var/log/nginx/seyfibaba.*.log
/var/log/nginx/api.seyfibaba.*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 $(cat /var/run/nginx.pid)
    endscript
}
```

### 8.3 Basit Uptime Check

```bash
# /var/www/seyfibaba/scripts/healthcheck.sh
#!/bin/bash
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" https://seyfibaba.com)
BACKEND=$(curl -s -o /dev/null -w "%{http_code}" https://api.seyfibaba.com/api/website-setup)

if [ "$FRONTEND" != "200" ] || [ "$BACKEND" != "200" ]; then
    echo "ALERT: seyfibaba down! Frontend=$FRONTEND Backend=$BACKEND" | \
    mail -s "Seyfibaba DOWN" admin@seyfibaba.com
fi
```

---

## 9. DNS AYARLARI

| Kayit | Tip | Deger |
|-------|-----|-------|
| seyfibaba.com | A | VPS_IP_ADRESI |
| www.seyfibaba.com | CNAME | seyfibaba.com |
| api.seyfibaba.com | A | VPS_IP_ADRESI |

---

## 10. PRE-LAUNCH CHECKLIST

### Backend
- [ ] `.env` tum production degerleri ayarlandi
- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] Yeni `APP_KEY` uretildi
- [ ] Yeni `JWT_SECRET` uretildi (TTL=60dk)
- [ ] MySQL production user/password ayarlandi
- [ ] Redis password ayarlandi
- [ ] Iyzico CANLI API key/secret ayarlandi
- [ ] Iletimerkezi API key/hash ayarlandi
- [ ] SMTP mail ayarlari yapildi
- [ ] Pusher ayarlari yapildi (opsiyonel)
- [ ] `php artisan migrate --force` calistirildi
- [ ] `php artisan storage:link` calistirildi
- [ ] `composer install --no-dev` yapildi
- [ ] Config/route/view cache olusturuldu

### Frontend
- [ ] `.env.production` ayarlandi
- [ ] `NEXT_PUBLIC_BASE_URL` production API'ye isaret ediyor
- [ ] `bun run build` basarili
- [ ] PWA aktif (`NEXT_PWA_STATUS=1`)

### Altyapi
- [ ] Nginx konfigurasyonu test edildi (`nginx -t`)
- [ ] SSL sertifikalari kuruldu (seyfibaba.com + api.seyfibaba.com)
- [ ] PM2 ecosystem basladi
- [ ] Firewall kurallari aktif (sadece 80/443/22)
- [ ] DNS A kayitlari VPS IP'ye isaret ediyor
- [ ] Yedekleme cron'lari aktif
- [ ] Log rotation ayarlandi

### Guvenlik
- [ ] `.env` web'den erisilemez (Nginx deny)
- [ ] `.git` dizini erisilemez
- [ ] Directory listing kapali
- [ ] HSTS header aktif
- [ ] CORS sadece seyfibaba.com domain'lerine acik
- [ ] Rate limiting calisiyior
- [ ] File upload MIME dogrulama eklendi (pentest-plan.md #F1)

### Test
- [ ] Ana sayfa yukleniyior
- [ ] Urun listesi/detay calisiyior
- [ ] Kayit + OTP akisi calisiyor
- [ ] Giris + JWT token calisiyor
- [ ] Iyzico test odemesi basarili
- [ ] Admin panel erisilebilir
- [ ] Satici paneli erisilebilir
- [ ] Sitemap.xml erisilebilir
- [ ] robots.txt erisilebilir

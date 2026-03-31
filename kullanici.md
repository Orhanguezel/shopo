# Seyfibaba - Kullanici Bilgileri

## Canli Ortam (seyfibaba.com)

### Admin Panel

| Alan  | Deger                             |
| ----- | --------------------------------- |
| URL   | https://admin.seyfibaba.com/admin |
| Email | admin@gmail.com                   |
| Sifre | 1234                              |
| Durum | Aktif                             |

### Satici (Seller) Hesaplari

| Magaza         | Email                     | Telefon          | Durum |
| -------------- | ------------------------- | ---------------- | ----- |
| hc yazilim     | devhcsoftware1@gmail.com  | +90 543 501 1995 | Aktif |
| metinogulcank1 | metinogulcank06@gmail.com | +905550648180    | Aktif |

> Satici paneli: https://admin.seyfibaba.com/seller

### Musteri Hesaplari

| Isim                | Email                          | Telefon       | Durum                |
| ------------------- | ------------------------------ | ------------- | -------------------- |
| hüseyin coşkun    | devhcsoftware@gmail.com        | +905435011995 | Aktif, dogrulanmis   |
| Metin Oğulcan Koca | metinogulcank06@gmail.com      | +905550648180 | Aktif, dogrulanmis   |
| Oguzhan Sarioglugil | oguzhansarioglugil@hotmail.com | +905344475450 | Aktif, dogrulanmamis |

> Frontend: https://seyfibaba.com

### Veritabani (Production)

| Alan | Deger             |
| ---- | ----------------- |
| Host | 127.0.0.1         |
| Port | 3306              |
| DB   | shopo_db          |
| User | shopo_user        |
| Pass | e73234727c224e5a3 |

---

## Lokal Ortam (localhost)

### Admin Panel

| Alan  | Deger                       |
| ----- | --------------------------- |
| URL   | http://localhost:8000/admin |
| Email | admin@gmail.com             |
| Sifre | 1234                        |

### Veritabani (Lokal)

| Alan | Deger     |
| ---- | --------- |
| Host | 127.0.0.1 |
| Port | 3306      |
| DB   | shopo_db  |
| User | root      |
| Pass | 14604925  |

### Portlar

| Servis             | Port                 |
| ------------------ | -------------------- |
| Frontend (Next.js) | localhost:3000       |
| Backend (Laravel)  | localhost:8000       |
| Admin Panel        | localhost:8000/admin |
| MySQL              | localhost:3306       |

---

## VPS Sunucu Bilgileri

| Alan       | Deger                         |
| ---------- | ----------------------------- |
| SSH        | ssh vps-seyfibaba             |
| IP         | 45.133.39.13                  |
| Repo       | /var/www/shopo                |
| Backend    | /var/www/shopo/backend        |
| Frontend   | /var/www/shopo/frontend       |
| Web Server | LiteSpeed (CyberPanel)        |
| PHP        | lsphp83 (8.3)                 |
| Domain     | seyfibaba.com (frontend)      |
| API        | admin.seyfibaba.com (backend) |
| PM2        | shopo-frontend (port 3001)    |

### LiteSpeed VHost Bilgileri

| VHost               | User      | PHP     | Yol                                                             |
| ------------------- | --------- | ------- | --------------------------------------------------------------- |
| seyfibaba.com       | seyfi4295 | lsphp81 | /home/seyfibaba.com/public_html -> /var/www/shopo/frontend      |
| admin.seyfibaba.com | admin7046 | lsphp83 | /home/admin.seyfibaba.com/public_html -> /var/www/shopo/backend |

---

## Iyzico (Odeme Altyapisi)

| Alan             | Deger                              |
| ---------------- | ---------------------------------- |
| API Key          |                                    |
| Secret Key       |                                    |
| Sub Merchant Key |                                    |
| Mod              | Production (QuickEcommerce hesabi) |
| Admin Ayar       | /admin/payment-method              |

### Test Kart Bilgileri (Iyzico Sandbox)

| Alan    | Deger            |
| ------- | ---------------- |
| Kart No | 5528790000000008 |
| SKT     | 12/2030          |
| CVC     | 123              |

---

## Deploy Komutu

```bash
cd /var/www/shopo && git pull
cd backend && composer install --no-dev --optimize-autoloader
cd ../frontend && npm install --legacy-peer-deps && npm run build
pm2 restart shopo-frontend
```

## Notlar

- Varsayilan sifreler (1234) demo tema sifreleridir, canli ortamda degistirilmeli
- `.env` dosyalari commit edilmez
- Iyzico key'leri su an QuickEcommerce hesabindan alinmistir, canli icin Seyfibaba hesabi acilmali
- Yedekler: `/home/seyfibaba.com/public_html_old`, `/home/admin.seyfibaba.com/public_html_old`

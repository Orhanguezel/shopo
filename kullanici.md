# Seyfibaba - Kullanici Bilgileri

## Admin Panel

| Alan | Deger |
|------|-------|
| URL | http://localhost:8000/admin |
| Email | admin@gmail.com |
| Sifre | 1234 |
| Durum | Aktif |

## Satici (Seller)

| Alan | Deger |
|------|-------|
| URL | http://localhost:8000/seller |
| Email | seller@gmail.com |
| Sifre | 1234 |
| Magaza Adi | Test Shop |
| Durum | Aktif |

## Test Musterisi

| Alan | Deger |
|------|-------|
| Email | test@seyfibaba.com |
| Telefon | +905551234567 |
| Sifre | admin123 |
| Durum | Aktif, email dogrulanmis |

## Veritabani (Lokal)

| Alan | Deger |
|------|-------|
| Host | 127.0.0.1 |
| Port | 3306 |
| DB | shopo_db |
| User | root |
| Pass | 14604925 |

## VPS (Production)

| Alan | Deger |
|------|-------|
| SSH | ssh vps-seyfibaba |
| IP | 45.133.39.13 |
| Backend | /var/www/shopo-backend |
| DB | shopo_db |
| DB User | shopo_user |
| DB Pass | e73234727c224e5a3 |
| Domain | seyfibaba.com |
| API | admin.seyfibaba.com |

## Portlar

| Servis | Port |
|--------|------|
| Frontend (Next.js) | localhost:3000 |
| Backend (Laravel) | localhost:8000 |
| Admin Panel | localhost:8000/admin |
| MySQL | localhost:3306 |

## Iyzico (Odeme Altyapisi)

| Alan | Deger |
|------|-------|
| API Key | EiVUsVWshdypacqslile9I3OhcFCAJcG |
| Secret Key | yD0kJDTf3jGdqHAHm41m6cni2T9aAEKq |
| Sub Merchant Key | K3bKwMeayD/5NUlr92VoltewMI4= |
| Mod | Production (QuickEcommerce hesabi) |
| Admin Ayar | /admin/payment-method |

## Test Kart Bilgileri (Iyzico Sandbox)

| Alan | Deger |
|------|-------|
| Kart No | 5528790000000008 |
| SKT | 12/2030 |
| CVC | 123 |

## Notlar

- Varsayilan sifreler (1234) demo tema sifreleridir
- Canli ortamda farkli sifreler kullanilmaktadir
- `.env` dosyalari commit edilmez
- Iyzico key'leri su an QuickEcommerce hesabindan alinmistir, canli icin Seyfibaba hesabi acilmali

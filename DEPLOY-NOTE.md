# Canli Ortam Uygulama Notu

## Uygulanacak Adimlar

1. Migration calistir:

```bash
php artisan migrate
```

2. GEO ve icerik cleanup seed'ini calistir:

```bash
php artisan db:seed --class=Database\\Seeders\\GeoAuditCleanupSeeder
```

3. Cache temizle:

```bash
php artisan optimize:clear
```

## Onemli Notlar

- Dogrudan `php artisan db:seed` calistirmak zorunlu degil.
- Kontrollu ilerlemek icin ozellikle sadece `GeoAuditCleanupSeeder` calistirilmali.
- Bu seeder canli ortamda su islemleri uygular:
  - sahte iletisim bilgilerini duzeltir
  - `test-urunu-5-tl` urununu pasife alir
  - blog kategori slug hatalarini duzeltir
  - sahte ve demo blog iceriklerini gercek Turkce rehber icerikle degistirir
  - `about_us`, footer ve contact iceriklerini gunceller
  - bos kategori aciklamalarini doldurur

## Ek Bilgi

- `DatabaseSeeder` icinde `SiteContentSeeder`, `DemoDataCleanupSeeder`, `GeoAuditCleanupSeeder` kayitli.
- Ancak canlidaki mevcut icerikleri gereksiz etkilememek icin hedefli seed tercih edilmeli.

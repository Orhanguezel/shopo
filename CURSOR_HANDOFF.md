# Cursor Handoff Notu — Shopo (Seyfibaba Pazaryeri)

> Son güncelleme: 2026-04-02
> Sunucu: root@45.133.39.13 | /var/www/shopo/backend
> SSH key: ~/.ssh/id_ed25519

---

## Bu Oturumda Yapılan Değişiklikler (Deploy Edildi ✅)

### 1. Iyzico 500 Hatası (`IyzicoController.php`)
- **Sorun:** `whereIn()` ile DB'den sepet sorgusu yapıyordu — ama Redux sepeti DB'ye yazılmıyor
- **Çözüm:** DB sorgusu kaldırıldı, `PaymentController` gibi `$request->input('cart_products')` kullanılıyor
- **Dosya:** `backend/app/Http/Controllers/User/IyzicoController.php`

### 2. Checkout Adres/Kargo Sorunu (`CheckoutPage/index.jsx`)
- **Sorun:** Yeni adres eklendikten sonra `selectedRule` null kalıyordu
- **Çözüm:** `addressesData` useEffect'e kargo kuralı auto-select mantığı eklendi
- **Dosya:** `frontend/src/components/CheckoutPage/index.jsx`

### 3. Clockpicker 404 → JS Çökmesi
- **Sorun:** `dist/bootstrap-clockpicker.js` dosyası yoktu, JS çökünce select2/summernote init olmuyordu
- **Çözüm:** `src/` klasöründen `dist/` klasörüne kopyalandı + `if ($.fn.clockpicker)` guard eklendi
- **Dosyalar:**
  - `backend/public/backend/clockpicker/dist/bootstrap-clockpicker.js` (oluşturuldu)
  - `backend/public/backend/clockpicker/dist/bootstrap-clockpicker.css` (oluşturuldu)
  - `backend/resources/views/seller/footer.blade.php` (guard eklendi)
  - `backend/resources/views/user/layout.blade.php` (guard eklendi)

### 4. Ürün Formlarında Miktar (qty) Alanı Eksikti
- **Dosyalar:**
  - `backend/resources/views/seller/edit_product.blade.php`
  - `backend/resources/views/admin/edit_product.blade.php`

### 5. Galeri Upload Hatası (`Product::find()->first()` bug)
- **Sorun:** `find()` model döndürür, `->first()` yanlış kayıt getirir
- **Çözüm:** `.first()` kaldırıldı
- **Dosyalar:**
  - `backend/app/Http/Controllers/WEB/Seller/SellerProductGalleryController.php`
  - `backend/app/Http/Controllers/WEB/Admin/ProductGalleryController.php`

### 6. Thumbnail Upload 405 Hatası
- **Sorun:** AJAX form data'da `_method: PUT` vardı ama route `Route::post` tanımlıydı
- **Çözüm:** `_method` kaldırıldı, route düzgün çalışıyor
- **Dosyalar:**
  - `backend/resources/views/seller/edit_product.blade.php`
  - `backend/routes/web.php` (yeni route: `seller.product.update-thumbnail`)
  - `backend/app/Http/Controllers/WEB/Seller/SellerProductController.php` (yeni `updateThumbnail()` metodu)

### 7. Yeni Ürün Oluşturulamıyor — Kategori/Resim Eksik Hatası
- **Sorun 1:** Validasyon redirect sonrası `old('category')` yoktu, select sıfırlanıyordu
- **Sorun 2:** Hata mesajları görünmüyordu, kullanıcı hangi alanın eksik olduğunu bilemiyordu
- **Çözüm:**
  - `old('category')` her option'a eklendi
  - Form üstüne `@if ($errors->any())` bloğu eklendi
  - Clockpicker guard deploy edildi (JS çökmesi önlendi)
- **Dosya:** `backend/resources/views/seller/create_product.blade.php`

---

## ⚠️ Dikkat: Thumbnail Dosya Input Sınırı

Validasyon hatası sonrası file input **tarayıcı güvenliği nedeniyle sıfırlanır** — bu kaçınılmaz.
Kullanıcı thumbnail'ı tekrar seçmek zorunda. Bunu önlemek için create formuna da AJAX upload
yapılabilir (edit formundaki gibi), ama henüz yapılmadı.

---

## 🔄 Yapılacaklar (Tamamlanmadı)

### Öncelikli
- [ ] **Create product formuna AJAX thumbnail upload** — edit formundaki gibi, böylece validasyon
  hatası sonrası thumbnail kaybolmaz. Seller route'u zaten var: `seller.product.update-thumbnail`
  Ama bu ürün henüz DB'de yok, önce `store()` çalıştırılmalı — ya da create'de önce draft
  kaydedip sonra thumbnail yüklemek gerekir. Alternif: thumbnail'ı session/temp'e al.

### İncelenmesi Gereken
- [ ] **Iyzico ödeme akışı uçtan uca test** — tüm fix'lerden sonra gerçek sipariş oluşturuluyor mu?
- [ ] **Admin panel create product** aynı sorunlar var mı? (`admin/create_product.blade.php`)
  Seller için düzeltmeler yapıldı ama admin formu kontrol edilmedi.

---

## Deploy Komutu

```bash
# Dosya rsync
rsync -avz -e "ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes" \
  backend/resources/views/ \
  root@45.133.39.13:/var/www/shopo/backend/resources/views/

# View cache temizle
ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes root@45.133.39.13 \
  "cd /var/www/shopo/backend && php artisan view:clear"

# PHP controller rsync
rsync -avz -e "ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes" \
  backend/app/ \
  root@45.133.39.13:/var/www/shopo/backend/app/

# Frontend (ASLA local build yapma — .env farkı var!)
rsync -avz -e "ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes" \
  --exclude='.next' --exclude='node_modules' --exclude='.env*' \
  frontend/ root@45.133.39.13:/var/www/shopo/frontend/
# Sonra sunucuda: cd /var/www/shopo/frontend && bun run build && pm2 restart shopo-frontend
```

---

## Kritik Kural: Frontend Build

**ASLA local `bun run build` yapıp `.next` klasörünü rsync etme!**
Local `.env` → `localhost:8000`, production `.env` → `https://admin.seyfibaba.com/`
CSP hataları oluşur. Daima kaynak dosyaları rsync et, build sunucuda yapılır.

---

## Proje Yapısı

```
shopo/
├── backend/          # Laravel 10, PHP 8.x
│   ├── app/Http/Controllers/
│   │   ├── User/IyzicoController.php        ← Iyzico ödeme
│   │   ├── WEB/Seller/SellerProductController.php   ← Seller ürün
│   │   └── WEB/Admin/ProductGalleryController.php   ← Admin galeri
│   ├── resources/views/
│   │   ├── seller/
│   │   │   ├── create_product.blade.php     ← Son düzenlenen
│   │   │   ├── edit_product.blade.php
│   │   │   └── footer.blade.php
│   │   └── admin/edit_product.blade.php
│   └── routes/web.php
└── frontend/         # Next.js 15, Redux Toolkit
    └── src/components/
        └── CheckoutPage/index.jsx           ← Kargo/adres fix
```

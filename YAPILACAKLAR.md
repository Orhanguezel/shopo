# Seyfibaba Pazaryeri - Gelistirme & Iyilestirme Plani

## Baglam
Shopo (CodeCanyon) temasina dayali Laravel 10 + Next.js 15 e-ticaret pazaryeri. Temel altyapi mevcut ancak production-ready degil. Asagidaki checklist musterinin talepleri + kesfedilen eksikleri kapsar.

---

## CHECKLIST

### 1. IYZICO ODEME ENTEGRASYONU
- [ ] `iyzipay-php` paketini composer ile kur
- [ ] `IyzicoPayment` modeli ve migration olustur
- [ ] `IyzicoController` yaz (API + callback)
- [ ] Backend routes ekle (`/user/checkout/iyzico`, callback routes)
- [ ] Frontend `PaymentMethods` componentine Iyzico secenegi ekle
- [ ] Admin panelden Iyzico API key/secret ayari
- [ ] 3D Secure destegiyle test et
- **Dosyalar:** `backend/app/Http/Controllers/User/IyzicoController.php`, `backend/app/Models/IyzicoPayment.php`, `frontend/src/components/CheckoutPage/PaymentMethods.jsx`

### 2. SMS SERVISI & OTP KAYIT
- [ ] SMS provider sec (Twilio zaten entegre, veya Netgsm/Iletimerkezi Turkiye icin)
- [ ] OTP modeli ve migration olustur (`otp_verifications` tablosu)
- [ ] Kayit sirasinda telefon dogrulama akisi ekle (backend)
- [ ] Frontend signup formuna OTP adimi ekle
- [ ] OTP suresi (5dk), yeniden gonderme limiti
- [ ] Sifre sifirlama icin SMS OTP secenegi
- **Dosyalar:** `backend/app/Http/Controllers/Auth/OtpController.php`, `frontend/src/components/Auth/Signup/SignupWidget.jsx`

### 3. SEO IYILESTIRMELERI
- [ ] `robots.txt` olustur (`frontend/public/robots.txt`)
- [ ] Dinamik `sitemap.xml` olustur (`frontend/src/app/sitemap.ts`)
- [ ] JSON-LD structured data ekle (Product, Organization, BreadcrumbList)
- [ ] Open Graph + Twitter Card meta taglari tum sayfalara
- [ ] Canonical URL'ler ekle
- [ ] Urun detay sayfasina Product schema
- [ ] Admin paneldeki `SeoSetting` modelini implement et (meta title/desc yonetimi)
- [ ] `next/image` kullanilmayan yerlerde optimize et (performans + Core Web Vitals)
- **Dosyalar:** `frontend/src/app/layout.js`, `frontend/src/app/sitemap.ts`, `frontend/public/robots.txt`, `backend/app/Models/SeoSetting.php`

### 4. EKSIK SAYFALARIN TAMAMLANMASI
- [ ] **Blog detay sayfasi:** `/blogs/[slug]` - suan bos
- [ ] **Blog kategori sayfasi:** `/category-by-blogs/[slug]` - eksik
- [ ] **Urun detay sayfasi hatalari:** null kontrolleri, variant secimi sorunlari
- [ ] **Filtre sorunlari:** fiyat, marka, kategori filtreleri test et ve duzelt
- [ ] **Satici dukkan sayfasi:** `/seller/[slug]` - tam satici profil sayfasi
- [ ] **Siparis takip sayfasi:** `/tracking-order` - calisma durumunu dogrula
- [ ] **Iade/Iade talep sayfasi:** Mevcut degil - olustur
- [ ] **Payment fail sayfasi:** `/payment-faild` - daha detayli hata mesajlari
- **Dosyalar:** `frontend/src/app/(website)/blogs/`, `frontend/src/components/SingleProductPage/`, `frontend/src/components/ProductsFilter/`

### 5. YONETIM PANELI (ADMIN) SORUNLARI
- [ ] Admin panele erisim test et (localhost:8000/admin)
- [ ] Dashboard istatistikleri dogrula
- [ ] Urun ekleme/duzenleme/silme test et
- [ ] Kategori yonetimi test et
- [ ] Siparis yonetimi test et
- [ ] Satici onay sureci test et
- [ ] Odeme yontemleri ayarlari test et
- [ ] Email template yonetimi test et
- [ ] Dil/ceviri yonetimi test et
- [ ] Settings sayfasi tum ayarlar test et

### 6. PAZARYERI EKSIKLERI
- [ ] **Komisyon sistemi:** Admin icin satis komisyon orani ayari (Settings'e ekle)
- [ ] **Komisyon hesaplama:** `OrderProduct` olusturulurken platform payini hesapla
- [ ] **Iade/Iade sureci:** Return request modeli, controller, admin onay akisi
- [ ] **Satici KYC/Dogrulama:** Belge yukleme ve admin onay sistemi
- [ ] **Stok uyarilari:** Dusuk stok bildirimi (admin + satici)
- [ ] **Toplu urun yukleme:** CSV import ozeligi saticlar icin
- **Dosyalar:** `backend/app/Models/ReturnRequest.php`, `backend/database/migrations/`, `backend/config/marketplace.php`

### 7. GUVENLIK DUZELTMELERI
- [ ] **KRITIK - CORS:** Wildcard `*` yerine spesifik domainler (`seyfibaba.com`)
- [ ] **KRITIK - Admin route middleware:** Tum admin route grubuna `auth:admin-api` ekle
- [ ] **KRITIK - Clear database endpoint:** Kaldir veya cok katli yetkilendirme ekle
- [ ] **YUKSEK - XSS middleware:** `<style>`, `<iframe>` taglarini yasakla
- [ ] **YUKSEK - Rate limiting:** Login, OTP, sifre sifirlama endpointleri
- [ ] **YUKSEK - .env guvenlik:** Production'da APP_DEBUG=false, secrets gizli
- [ ] **ORTA - API rate limiting:** Tum public API'lere throttle middleware
- [ ] **ORTA - SQL injection audit:** `orderByRaw()`, `DB::raw()` kullanimlari kontrol
- [ ] **ORTA - CSRF payment callbacks:** Dogrulama mekanizmasi ekle
- **Dosyalar:** `backend/app/Http/Middleware/Cors.php`, `backend/app/Http/Middleware/XSSProtection.php`, `backend/routes/api.php`

### 8. PERFORMANS & OPTIMIZASYON
- [ ] `next/image` componentini tum gorsel alanlarda kullan
- [ ] Lazy loading ekle (urun listesi, yorumlar)
- [ ] API response cache stratejisi (Redis veya file cache)
- [ ] Database index'leri kontrol et (products, orders tablolari)
- [ ] Frontend bundle analizi ve gereksiz paket temizligi
- [ ] PWA aktif et ve test et (NEXT_PWA_STATUS=1)
- [ ] Gorsel boyutlarini optimize et (WebP donusumu)
- **Dosyalar:** `frontend/next.config.mjs`, `frontend/src/components/`, `backend/config/cache.php`

### 9. HATA GIDERME (BILINEN)
- [ ] Null image hatalari - tum componentlerde optional chaining
- [ ] Demo verilerin kalintisi - DB'de kalan eski referanslar temizle
- [ ] `whishlist` typo'su Redux'ta - `wishlist` olarak duzelt
- [ ] Blog sayfasi bos - icerik veya devre disi birak
- [ ] Satici mesajlasma Pusher entegrasyonu dogrula
- [ ] Google Maps API key ayari (adres secimi icin)
- [ ] Firebase entegrasyonu - kullanilip kullanilmadigini belirle

### 10. SIZMA TESTI HAZIRLIGI
- [ ] OWASP Top 10 kontrol listesi hazirla
- [ ] SQL Injection testleri
- [ ] XSS testleri (stored, reflected, DOM-based)
- [ ] CSRF testleri
- [ ] Authentication bypass testleri
- [ ] Authorization (IDOR) testleri - baska kullanicinin siparisi/profili erisimi
- [ ] File upload guvenlik testleri
- [ ] Rate limiting testleri (brute force)
- [ ] API endpoint enumeration
- [ ] Sensitive data exposure (.env, debug info)

---

## ONCELIK SIRASI

| Oncelik | Alan | Neden |
|---------|------|-------|
| 1 | Guvenlik Duzeltmeleri (#7) | Production'a cikmadan once zorunlu |
| 2 | Iyzico Entegrasyonu (#1) | Turkiye pazari icin kritik odeme yontemi |
| 3 | SMS/OTP (#2) | Kullanici kayit guvenligi |
| 4 | Eksik Sayfalar & Hatalar (#4, #9) | Kullanici deneyimi |
| 5 | Admin Panel (#5) | Yonetim fonksiyonelligini dogrulama |
| 6 | Pazaryeri Eksikleri (#6) | Komisyon, iade vs. |
| 7 | SEO (#3) | Arama motoru gorunurlugu |
| 8 | Performans (#8) | Hiz ve kullanici deneyimi |
| 9 | Sizma Testi (#10) | Son asama, her sey hazir olduktan sonra |

---

## DOGRULAMA

Her adimdan sonra:
1. Backend: `php artisan test` + manual API testi (curl/Postman)
2. Frontend: `bun run build` basarili olmali, `bun run dev` ile gorsel kontrol
3. Admin panel: tarayicida tam fonksiyonellik testi
4. Guvenlik: OWASP ZAP veya Burp Suite ile tarama

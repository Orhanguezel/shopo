# Seyfibaba Pazaryeri - Gelistirme & Iyilestirme Plani

## Baglam
Shopo (CodeCanyon) temasina dayali Laravel 10 + Next.js 15 e-ticaret pazaryeri. Temel altyapi mevcut ancak production-ready degil. Asagidaki checklist musterinin talepleri + kesfedilen eksikleri kapsar.

---

## CHECKLIST

### 0. STRIPE / PAYPAL / RAZORPAY TEMIZLIGI (Iyzico oncesi)
- [x] Backend: composer.json'dan 3 paketi kaldir (stripe, paypal, razorpay)
- [x] Backend: 3 model, 9 controller method, 15+ route temizle (Codex tarafından tamamlandı)
- [x] Backend: drop table migration yaz (paypal_payments, stripe_payments, razorpay_payments) (Codex tarafından tamamlandı)
- [x] Frontend: PaymentMethods.jsx'ten Stripe/PayPal/Razorpay UI kaldir
    - [x] Stripe ödeme formu ve loading animasyonları kaldırıldı
    - [x] Razorpay, Flutterwave, Mollie, MyFatoorah, Instamojo, Paystack, bKash, Sslcommerz butonları kaldırıldı
- [x] Frontend: Redux apiSlice + apiRoutes temizle
    - [x] `apiRoutes.js` içerisinden kullanılmayan ödeme rotaları silindi
    - [x] `apiSlice.js` içerisinden kullanılmayan API mutation'ları (Stripe, Razorpay vb.) silindi
    - [x] `useCheckoutState.js` içerisinden Stripe state ve gereksiz payment status'ları temizlendi
    - [x] `usePlaceOrder.js` içerisinden tüm harici ödeme mantığı ve mutation çağrıları kaldırıldı
- [x] Frontend: 3 logo icon component sil
    - [x] Toplam 9 adet kullanılmayan ödeme logosu (Stripe, Paypal, Razorpay, bKash, Flutterwave, Fatoorah, Instamojo, Paystack, Sslcommerce) silindi
- [x] Frontend: `checkoutUtils.js` içerisinden Stripe'a özel fonksiyonlar (formatExpirationDate, getInitialStripeData) temizlendi
- [x] Dogrulama: `composer install` + `bun run build` hatasiz (Dogrulandi)
- **Detayli plan:** `docs/payment-cleanup-plan.md`

> **Musteri Notu:** Stripe/PayPal/Razorpay Turkiye'de kullanilmiyor, kaldirilacak. Sadece Iyzico + Kapida Odeme + Banka Havale kalacak.

### 1. IYZICO ODEME ENTEGRASYONU (Tamamlandi)
- [x] `iyzipay-php` paketini composer.json'a ekle
- [x] `IyzicoPayment` modeli olustur (`app/Models/IyzicoPayment.php`)
- [x] Migration olustur (`2026_03_26_000001_create_iyzico_payments_table.php`)
- [x] `IyzicoService` service class olustur (`app/Services/IyzicoService.php`)
- [x] `IyzicoController` yaz — createCheckoutSession + callback (`app/Http/Controllers/User/IyzicoController.php`)
- [x] Backend routes ekle (`/checkout/pay-with-iyzico`, `/user/iyzico/callback`)
- [x] Admin `PaymentMethodController`'a `updateIyzico()` + route ekle
- [x] `CheckoutController` response'una `iyzico` bilgisi ekle
- [x] Iyzico logo kopyala (`public/uploads/website-images/iyzico.svg`)
- [x] `composer install` ile iyzipay-php paketini yukle
- [x] `php artisan migrate` ile tabloyu olustur
- [x] Frontend `PaymentMethods` componentine Iyzico secenegi ekle
- [x] `usePlaceOrder.js` ve `apiSlice.js` entegrasyonu tamamlandi
- [x] Admin panelde Iyzico ayar formu kontrol edildi
- [x] 3D Secure destegiyle test et (Iyzico Sandbox ile frontend yonlendirmesi dogrulandi)
- **Dosyalar:** `backend/app/Http/Controllers/User/IyzicoController.php`, `backend/app/Models/IyzicoPayment.php`, `backend/app/Services/IyzicoService.php`, `frontend/src/components/CheckoutPage/PaymentMethods.jsx`

> **Musteri Notu:** Iyzico odeme sistemi pazaryerine gore olacak. Hem backend hem admin hem de kullanici tarafli kisimlar saglanacak. iyzipay gibi yurtdisi kisimlari simdilik olmasin. Faydali gordugunuz kisimlari ekleyebilirsiniz.

### 2. SMS SERVISI & OTP KAYIT (Tamamlandi)
- [x] SMS provider: Iletimerkezi (karar verildi — `docs/sms-otp-plan.md`)
- [x] Migration: `otp_verifications` tablosu (calistirildi)
- [x] Model: `OtpVerification.php` (isExpired, hasAttemptsRemaining, markVerified, scopeActive)
- [x] Interface: `SmsServiceInterface.php` + `IletimMerkeziService.php` (JSON API)
- [x] Controller: `OtpController.php` — send, verify, resend (cooldown + cache token)
- [x] Routes + rate limiting (`throttle:auth-otp` middleware)
- [x] Config: `config/sms.php` + `.env` degiskenleri tanimlandi
- [x] ServiceProvider: `SmsServiceInterface` → `IletimMerkeziService` binding
- [x] RegisterController: Twilio/BiztechSms kodu temizlendi, OTP token dogrulama eklendi
- [x] Frontend: `OtpVerifyStep.jsx` component (onceden implement edilmis)
- [x] Frontend: `SignupWidget.jsx`'e OTP adimi entegre (onceden implement edilmis)
- [x] Frontend: `apiRoutes.js` + `apiSlice.js` OTP endpoint'leri (onceden implement edilmis)
- [x] Sifre sifirlama icin SMS OTP secenegi — TAMAMLANDI (2026-03-27, LoginController + ForgotPass frontend)
- [ ] **Uretim icin:** `.env`'e `ILETIMERKEZI_API_KEY` ve `ILETIMERKEZI_API_HASH` eklenmeli
- **Plan:** `docs/sms-otp-plan.md`
- **Dosyalar:** `backend/app/Http/Controllers/Auth/OtpController.php`, `backend/app/Services/IletimMerkeziService.php`, `backend/config/sms.php`, `frontend/src/components/Auth/Signup/SignupWidget.jsx`

> **Musteri Notu:** SMS sadece kayit olunca OTP dogrulama icin olacak, siparis icin gerekmiyor. Provider olarak Iletimerkezi veya Netgsm onerilecek.

### 3. SEO IYILESTIRMELERI (TAMAMLANDI — GOREV 5)
- [x] **KRITIK:** `RootLayout` icine global metadata (OG, Twitter, Keywords) ekle
- [x] `robots.txt` olustur (`frontend/public/robots.txt`) → dinamik `robots.js`'e tasindi
- [x] Dinamik `sitemap.xml` olustur (`frontend/src/app/sitemap.js`)
- [x] JSON-LD structured data ekle (Product, Organization, WebSite, FAQ, BreadcrumbList, ItemList)
- [x] Canonical URL'ler ekle (21 sayfa: products, sellers, search, about, contact, faq, blogs, flash-sale, cart, checkout, login, signup, forgot-password, tracking-order, become-seller, terms-condition, seller-terms-condition, privacy-policy, products-compare, single-product, home)
- [x] Head Hierarchy optimizasyonu (H1 -> H2 donusumleri yapildi, 1 H1 kurali uygulandi)
- [x] `<html>` lang attribute'unu `tr` olarak guncelle
- [x] Cart, checkout, login, signup, forgot-password, tracking-order sayfalarinin metadata'sini Turkce yap
- [x] `products-compaire` typo'sunu `products-compare` olarak duzelt (CSS class)
- [x] **SEO Audit Bulgulari (GOREV 5):** `docs/seo-plan.md` — TAMAMLANDI
  - [x] `(website)/layout.js` "use client" kaldir (KRITIK — SSR icin)
  - [x] `[slug]/page.js` server component yap + generateMetadata ekle
  - [x] Font migration: `next/font/local` (Inter fontu 9 agirlik ile yuklendi)
  - [x] JSON-LD: aggregateRating, BreadcrumbList, WebSite, FAQ, ItemList (JsonLd.jsx tamamlandi)
  - [x] Sitemap: urun + satici URL'leri eklendi (generateSitemaps + backend API)
  - [x] Robots: dinamik `robots.js`'e tasildi, eksik Disallow'lar eklendi
  - [x] OG images, Twitter images, viewport export (root layout guncellendi)
  - [x] 10/10 raw `<img>` → `next/image` donusumu tamamlandi (BlogCard + BlogDetails eklendi)
  - [x] `next.config.mjs` — `formats: ['image/avif', 'image/webp']` + HTTP security headers eklendi
  - [x] Root metadata'ya `apple-touch-icon` eklendi
  - [x] Seller profil sayfalarina `LocalBusiness` schema eklendi (JsonLd.jsx + seller/[slug]/page.js)
  - [x] `llms.txt` dosyasi olusturuldu (AI crawler rehberligi — `public/llms.txt`)
- **Dosyalar:** `frontend/src/app/layout.js`, `frontend/src/app/sitemap.js`, `frontend/src/app/robots.js`, `frontend/src/components/Helpers/JsonLd.jsx`, `backend/app/Http/Controllers/HomeController.php` (sitemap endpoints), `frontend/next.config.mjs`, `frontend/public/llms.txt`
- **Plan:** `docs/seo-plan.md`

> **Musteri Notu (SEO uzmani tavsiyeleri):**
> - Breadcrumb yapisi schema'ya islenmeli
> - Urun bilgileri dogru islenmeli, indirim varsa dogru islenmeli
> - Header kismina firma bilgileri sabit islenmeli, footer'a sayfa/urun gibi alanlarin schema yapilari islenmeli
> - Urun detay sayfasinda muhakkak rating olsun, ilk baslarda fake yorum ve rating kullanilabilir (iyi sinyaldir)
> - Yorum, puanlama, urun hakkinda bilgi eksiksiz islenmeli
> - React ile yapildigi icin arama motoru botlarina dogru sekilde sinyal gonderilmeli (normalden daha hassas isleyis)
> - Test icin arama motoru bot simulatorleri kullanilmali:
>   - https://totheweb.com/learning_center/tools-search-engine-simulator/
>   - https://webmasterblog.com.tr/arama-motoru-bot-simulatoru/
>   - Tek siteden degil birkac siteden kontrol edilmeli

### 4. EKSIK SAYFALARIN TAMAMLANMASI (Tamamlandi — GOREV 2)
- [x] **Blog detay sayfasi:** `/blogs/[slug]` (Implemente edildi)
- [x] **Blog kategori sayfasi:** `/category-by-blogs/[slug]` (Implemente edildi)
- [x] **Urun detay sayfasi hatalari:** null kontrolleri, variant secimi sorunlari (ProductView.jsx, SallerInfo.jsx, index.jsx — optional chaining eklendi)
- [x] **Filtre sorunlari:** fiyat, marka, kategori filtreleri test et ve duzelt (Backend searchProduct destegi eklendi)
- [x] **Satici dukkan sayfasi:** `/seller/[slug]` - tam satici profil sayfasi (Implemente edildi)
- [x] **Siparis takip sayfasi:** `/tracking-order` - calisma durumunu dogrula (Dogrulandi ve iyilestirildi)
- [x] **Iade/Iade talep sayfasi:** Olusturuldu (Backend + Admin + User UI tamamlandi)
- [x] **Payment fail sayfasi:** `/payment-failed` - daha detayli hata mesajlari ve premium tasarim (Typo fix: faild -> failed)
- **Dosyalar:** `frontend/src/app/(website)/blogs/`, `frontend/src/components/SingleProductPage/`, `frontend/src/components/ProductsFilter/`

> **Musteri Notu:** Bu kisimlari siz daha iyi bilirsiniz, gorunce direkt yapabilirsiniz.

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

### 6. PAZARYERI EKSIKLERI ← CODEX GOREV 3 + 4
- [x] **Komisyon sistemi:** (GOREV 3) Tamamlandi (DB semasi, Ledger, CommissionService, Admin/Vendor UI)
- [x] **Iade talep sistemi:** (GOREV 4) Tamamlandi (Durum makinesi, 3 aktor API, Admin Blade, User Frontend)
- [x] **Satici KYC/Dogrulama:** Belge yukleme ve admin onay sistemi — TAMAMLANDI (2026-03-27)
  - Migration: `seller_kyc_documents` tablosu + vendors'a `kyc_status`, `iban`, `tax_number` kolonlari
  - Seller: belge yukleme (PDF/JPG/PNG, max 5MB), listeleme, silme, durum sorgulama
  - Admin: bekleyen KYC listesi, belge onay/red, toplu onay
  - KycStatusNotification: Satici'ya KYC onay/red bildirimi (database)
  - Form request validation, `checkseller` middleware, `updateOrCreate` pattern
- [x] **Stok uyarilari:** Dusuk stok bildirimi (admin + satici) — TAMAMLANDI (2026-03-27)
  - ProductObserver: qty degisiminde threshold kontrolu, seller + admin'e database notification
  - Admin: stok uyari ayarlari (threshold, enable/disable) + dusuk stoklu urunler listesi
  - Seller: kendi dusuk stoklu urunleri + bildirim merkezi (list, read, read-all)
- [x] **Toplu urun yukleme:** CSV import ozeligi saticlar icin — TAMAMLANDI (2026-03-27)
  - Migration: `bulk_imports` tablosu (progress tracking, error log, status)
  - BulkProductImportService: CSV parse, validate, resolve categories/brands, create/update products
  - Seller: CSV yukleme, import gecmisi, import detay, CSV sablon indirme
  - Admin: toplu yukleme, import listesi
  - Form request validation (csv/xlsx, max 10MB)
  - Hata satir bazli JSON log ile takip edilir
- **Planlar:** `docs/commission-plan.md`, `docs/return-request-plan.md`
- **Dosyalar:** `backend/app/Models/ReturnRequest.php`, `backend/app/Models/CommissionLedger.php`, `backend/database/migrations/`

### 7. GUVENLIK DUZELTMELERI
- [x] KRITIK - CORS: Wildcard `*` yerine spesifik domainler (`seyfibaba.com`)
- [x] KRITIK - Admin route middleware: Tum admin route grubuna `auth:admin-api` ekle
- [x] KRITIK - Clear database endpoint: Kaldir veya cok katli yetkilendirme ekle
- [x] YUKSEK - XSS middleware: `<style>`, `<iframe>` taglarini yasakla
- [x] YUKSEK - Rate limiting: Login, OTP, sifre sifirlama endpointleri
- [x] YUKSEK - .env guvenlik: Production'da APP_DEBUG=false, secrets gizli
- [x] ORTA - API rate limiting: Tum public API'lere throttle middleware
- [x] ORTA - SQL injection audit: `orderByRaw()`, `DB::raw()` kullanimlari kontrol
- [x] **ORTA - CSRF payment callbacks:** Iyzico callback auth disina alindi ve dogrulama eklendi
- [x] **ORTA - Iyzico callback rate limiting:** `throttle:10,1` middleware eklendi
- [x] **ORTA - Replay korumasi:** Zaten odenmis siparis tekrar islenmez (payment_status kontrolu)
- [x] **ORTA - CSRF except temizlik:** Razorpay except'leri kaldirildi (route'lar zaten silinmis)
- [x] **KRITIK - /run_migration korumasiz:** `auth:admin` middleware eklendi (2026-03-27)
- [x] **YUKSEK - Session SameSite:** `null` → `lax` (CSRF korumasi) (2026-03-27)
- [x] **YUKSEK - JWT TTL:** 365 gun → 7 gun (token hijack riski azaltildi) (2026-03-27)
- [x] **ORTA - Security headers:** HSTS (1 yil) + Permissions-Policy eklendi (2026-03-27)
- [x] **ORTA - Private storage:** KYC belgeleri icin `storage/app/private/kyc/` olusturuldu (2026-03-27)
- **Dosyalar:** `backend/app/Http/Middleware/Cors.php`, `backend/app/Http/Middleware/XSSProtection.php`, `backend/app/Http/Middleware/SecurityHeaders.php`, `backend/app/Http/Middleware/VerifyCsrfToken.php`, `backend/routes/api.php`, `backend/routes/web.php`

### 8. PERFORMANS & OPTIMIZASYON (Tamamlandi)
- [x] **KRITIK:** `ProductCard` icindeki `Image` anti-pattern'ini duzelt (state-src switching kaldirildi)
- [x] `next/image` componentini tum gorsel alanlarda (Banner, Ads, Category) standartlara uygun kullan (backgroundImage -> next/image)
- [x] LCP optimizasyonu: Banner ve Slider ilk gorsellerine `priority` flag eklendi
- [x] Lazy loading standartlastirildi
- [x] Gorsel boyutlari ve `sizes` attribute'lari optimize edildi
- **Dosyalar:** `frontend/src/components/Helpers/Cards/ProductCard/ColumnV1.jsx`, `frontend/src/components/Home/Banner.jsx`, `frontend/src/components/Slider/HomeSlider.jsx`

### 9. HATA GIDERME (BILINEN)
- [x] Null image hatalari - Image componentleri guncellendi (Optional chaining eklendi)
- [x] Demo verilerin kalintisi - Hardcoded test verileri temizlendi (IyzicoController, PaymentController, CheckoutWithoutTokenController, MyFatoorahController) + clearDatabase production korumasi eklendi
- [x] `whishlist` typo'su Redux'ta - `wishlist` olarak duzeltildi (Dosyalar ve klasorler guncellendi)
- [x] Blog sayfasi bos - API ve frontend sayfalari olusturuldu
- [x] Satici mesajlasma Pusher entegrasyonu — BroadcastServiceProvider fix, channel auth guvenligi, messages tablosu migration, PusherConfig aktif, BROADCAST_DRIVER=pusher, Message model fillable eklendi
- [x] Google Maps — Zaten tam implemente (MapComponent, MapShow, AddressForm, lat/lng migration). Sadece admin panelden API key girilmeli (Maps JS + Places + Directions API)
- [x] Firebase entegrasyonu — kullanilmiyor, paket kaldirildi, `firebase_info` destructuring temizlendi

### 9.1 CODEX DURUM DEGERLENDIRMESI ACIK NOKTALARI (2026-03-26)
> Kaynak: `docs/codex-durum-degerlendirmesi.md`

**Iyzico:**
- [x] Guest checkout icin Iyzico akisi — `createGuestCheckoutSession` methodu + guest route + frontend guest API mutation eklendi. Ayrica frontend `apiRoutes.js`'deki yanlis Iyzico URL duzeltildi (`user/iyzico/checkout-session` → `user/checkout/pay-with-iyzico`)
- [x] Iyzico refund (iade odeme iadesi) entegrasyonu — TAMAMLANDI (2026-03-27)
  - `IyzicoService::refund()` methodu eklendi (Iyzipay Refund API, kismi iade destegi)
  - `IyzicoController::callback()` artik `paymentTransactionId`'leri `orders.iyzico_payment_data` JSON'a kaydediyor
  - `Admin\ReturnRequestController::refund()` Iyzico odemelerini otomatik iade ediyor, diger odeme yontemlerinde manuel akis devam ediyor
  - Migration: `orders.iyzico_payment_data` (JSON) + `return_requests.refund_transaction_id/refund_status/refund_error`
  - Hata durumunda admin'e detayli mesaj, log kaydı, ve DB rollback
- [x] Iyzico sub-merchant yonetimi (marketplace model) — TAMAMLANDI (2026-03-27)
  - `IyzicoService`: createSubMerchant, updateSubMerchant, retrieveSubMerchant methods
  - Migration: vendors'a `iyzico_sub_merchant_key`, `iyzico_sub_merchant_type`, `tax_office`, `legal_company_title`
  - KYC onay → otomatik sub-merchant olusturma (SellerKycController.syncVendorStatus)
  - Admin manuel sub-merchant olusturma endpoint: `POST /admin/kyc/seller/{id}/create-sub-merchant`
  - Marketplace odeme: komisyon oranina gore `sub_merchant_price` hesaplama (linePrice - komisyon)
  - Vendor DB'den sub-merchant key oncelikli cozumleme (fallback: admin JSON map → global key)

**SMS/OTP:**
- [x] Backend OTP akisi uc uca dogrulandi (send/verify/register/resend/cooldown)
- [ ] Gercek Iletimerkezi credentials ile canli SMS testi (production onkosul)

**Null Safety:** ✅ TAMAMLANDI (2026-03-27)
- [x] 3 HIGH severity: ProductCard `.find()?.name`, AddressList optional chaining (country/state/city), ProductQuickView gellery null guard
- [x] 10 MEDIUM severity: SallerInfo tum `seller` erisimlerine optional chaining, AllProductPage `response.products?.data` ve filter array null guard'lari
- [x] Frontend build dogrulandi

**Eksik Sayfalar:** ✅ TAMAMLANDI (2026-03-27)
- [x] Return request frontend dashboard — `/profile#returns` tab eklendi
  - `ReturnRequestsTab.jsx`: Durum filtreleme (8 durum), istatistik kartlari (toplam/beklemede/iade/red), siparis tablosu
  - Redux RTK Query: `useReturnRequestsApiQuery` + `apiRoutes.returnRequests`
  - Profile sidebar'a "Iade Taleplerim" linki eklendi (IcoSupport icon)

**Pazaryeri:**
- [ ] Komisyon frontend/admin ekranlarinin API ile tam hizalanmasi — **NOT:** Admin blade views ve API tamamen calisiyor. Seller API endpoints (`/api/seller/earnings`) mevcut ama Next.js'te satici dashboard yok. Bu V2 kapsaminda (Next.js satici paneli).
- [x] Return request admin/seller frontend ekranlarinin modernizasyonu — TAMAMLANDI (2026-03-27)
  - Admin ve seller Blade liste ekranlari status filtreleri, istatistik kartlari ve iyilestirilmis tablo alanlari ile guncellendi
  - Admin ve seller detail ekranlari ozet kartlari, kanit gorselleri, not alanlari ve aksiyon akisi ile modernize edildi

**Legacy Gateway Temizligi:** ✅ TAMAMLANDI (2026-03-27)
- [x] FlutterWave, Mollie, Paystack, Instamojo, SSLCommerz, MyFatoorah, bKash — tamamen kaldirildi. Sadece Iyzico + Havale + Kapida Odeme kaldi.
  - 6 model, 3 controller, 3 library, 1 config, 4 blade view silindi
  - PaymentController ~1600→~700 satir, CheckoutWithoutTokenController ~1600→~720 satir
  - Admin panel (WEB + API) controller temizlendi, blade sadece Iyzico/Bank/COD
  - Routes (web.php + api.php) ~30 legacy route kaldirildi
  - `composer remove mollie/laravel-mollie`
  - Drop migration: 6 legacy tablo (paystack_and_mollies, flutterwaves, instamojo_payments, myfatoorah_payments, sslcommerz_payments, baksh_payments)

### 10. SIZMA TESTI HAZIRLIGI
- [x] OWASP Top 10 kontrol listesi hazirla → `docs/pentest-plan.md`
- [x] SQL Injection testleri → `tests/security/pentest-scripts.sh` (A03 bolumu)
- [x] XSS testleri (stored, reflected, DOM-based) → Antigravity A7 talimatlarinda
- [x] CSRF testleri → Antigravity A7 talimatlarinda
- [x] Authentication bypass testleri → pentest-scripts.sh (A07 bolumu)
- [x] Authorization (IDOR) testleri → pentest-scripts.sh (A01 bolumu, 431 endpoint kataloglandı)
- [x] File upload guvenlik testleri → pentest-scripts.sh (F1, F2, F6 bolumu)
- [x] Rate limiting testleri (brute force) → pentest-scripts.sh (A07-1, A07-2, A08-1b)
- [x] API endpoint enumeration → 431 endpoint kataloglandi (public/user/seller/admin/deliveryman)
- [x] Sensitive data exposure (.env, debug info) → pentest-scripts.sh (A05 bolumu)
- **Plan:** `docs/pentest-plan.md` (70+ test senaryosu, 4 faz prosedur, arac listesi)
- **Production Deployment:** `docs/deployment-plan.md` (Nginx, PM2, SSL, yedekleme, checklist)

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

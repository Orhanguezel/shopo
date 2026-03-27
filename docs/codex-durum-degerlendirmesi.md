# Codex Durum Degerlendirmesi

**Tarih:** 2026-03-26  
**Kapsam:** `docs/gorev-dagilimi.md` icindeki Codex sorumluluklari  
**Hazirlayan:** Codex

---

## Ozet

Repo, Codex gorevleri acisindan incelendiginde en kritik aktif alanlar su an sunlar:

1. **Faz 1.5 - Kullanilmayan odeme yontemlerinin temizlenmesi**
2. **Faz 2 - Iyzico entegrasyonu**

Guvenlik hardening icin ilk uygulama turu tamamlandi. Iyzico ve sonraki fazlara gecmeden once payment cleanup tamamlanmali.

Genel durum:

- **Tamamlanan gorevler:** Faz 1 guvenlik icin ilk uygulama paketi
- **Kismi durumda olan gorevler:** Payment cleanup, Iyzico, null safety audit, temel SEO metadata
- **Baslanmamis / plana uyumsuz gorevler:** seller/return-request gibi eksik sayfalarin kalanlari, seller KYC, stok uyari notification, SEO structured data/robots standardizasyonu

---

## 1. Faz 1 - Guvenlik

### 1.1 CORS Duzeltmesi

**Durum:** Tamamlandi

Yapilanlar:

- Global custom CORS middleware kernel'den cikarildi.
- Wildcard origin davranisi kaldirildi.
- Whitelist bazli davranis `config/cors.php` ile uyumlu hale getirildi.

Referanslar:

- [backend/app/Http/Kernel.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Kernel.php)
- [backend/app/Http/Middleware/Cors.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Middleware/Cors.php#L19)
- [backend/config/cors.php](/home/orhan/Documents/Projeler/shopo/backend/config/cors.php#L18)

### 1.2 Admin Route Middleware

**Durum:** Tamamlandi

Yapilanlar:

- API admin route grubu merkezi olarak `auth:admin-api` ile sarildi.
- Web admin route grubu merkezi olarak `auth:admin` ile sarildi.
- Login ve sifre sifirlama route'lari grup disinda birakildi.

Referanslar:

- [backend/routes/api.php](/home/orhan/Documents/Projeler/shopo/backend/routes/api.php#L377)
- [backend/routes/web.php](/home/orhan/Documents/Projeler/shopo/backend/routes/web.php#L421)
- [backend/app/Http/Controllers/Admin/SettingController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Admin/SettingController.php)

### 1.3 Clear Database Endpoint

**Durum:** Tamamlandi

Yapilanlar:

- `clear-database` route'lari API ve web tarafindan kaldirildi.
- Admin sidebar icindeki erisim linki de kaldirildi.

Referanslar:

- [backend/routes/api.php](/home/orhan/Documents/Projeler/shopo/backend/routes/api.php#L377)
- [backend/routes/web.php](/home/orhan/Documents/Projeler/shopo/backend/routes/web.php#L421)
- [backend/resources/views/admin/sidebar.blade.php](/home/orhan/Documents/Projeler/shopo/backend/resources/views/admin/sidebar.blade.php)

### 1.4 XSS Middleware

**Durum:** Tamamlandi

Yapilanlar:

- Allowed tag listesi daraltildi.
- `script`, inline event handler, `style`, `javascript:` ve `data:` tabanli attribute riskleri filtrelendi.

Referans:

- [backend/app/Http/Middleware/XSSProtection.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Middleware/XSSProtection.php#L8)

### 1.5 Rate Limiting

**Durum:** Tamamlandi

Yapilanlar:

- `auth-login`, `auth-register`, `auth-otp`, `password-reset`, `public-form` limiter'lari eklendi.
- Login, register, resend OTP, forget password ve public form endpointlerine throttle baglandi.

Referanslar:

- [backend/app/Providers/RouteServiceProvider.php](/home/orhan/Documents/Projeler/shopo/backend/app/Providers/RouteServiceProvider.php#L37)
- [backend/routes/api.php](/home/orhan/Documents/Projeler/shopo/backend/routes/api.php#L111)
- [backend/routes/api.php](/home/orhan/Documents/Projeler/shopo/backend/routes/api.php#L187)
- [backend/routes/web.php](/home/orhan/Documents/Projeler/shopo/backend/routes/web.php#L134)

### 1.6 SQL Injection Audit

**Durum:** Tamamlandi

Yapilanlar:

- Tespit edilen `orderByRaw()` kullanimı kaldirildi ve Eloquent siralamaya cevrildi.

Referans:

- [backend/app/Http/Controllers/HomeController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/HomeController.php#L255)

### Faz 1 Notu

Bu faz icin PHP syntax dogrulamasi temiz gecti. `php artisan route:list` denemesi ise lokal ortamda `shopo_db` veritabani olmadigi icin bootstrap asamasinda durdu; bu nedenle runtime route dogrulamasi ortam bagimli olarak beklemede.

---

## 2. Faz 1.5 - Odeme Temizligi

**Durum:** Devam ediyor

Plan geregi Stripe, PayPal ve Razorpay kaldirilacakti. Bu temizlik icin ikinci uygulama paketi tamamlandi; ancak frontend checkout ve Iyzico gecis adimlari hala acik.

### Backend bagimliliklar

Temizlendi:

- `paypal/paypal-checkout-sdk`
- `razorpay/razorpay`
- `stripe/stripe-php`

Referans:

- [backend/composer.json](/home/orhan/Documents/Projeler/shopo/backend/composer.json#L20)

### Backend route/controller kalintilari

Temizlenenler:

- Stripe checkout endpointleri kaldirildi.
- PayPal web/react endpointleri kaldirildi.
- Razorpay order/verify endpointleri kaldirildi.
- Admin payment update endpointleri kaldirildi.
- Checkout payload'larindan Stripe/PayPal/Razorpay payment info alanlari cikarildi.
- Admin payment ekranindan Stripe/PayPal/Razorpay sekmeleri kaldirildi.
- Eski `PaypalController`, `GuestPaypalController`, `PaymentMethodController` ve ilgili model dosyalari silindi.
- Drop migration eklendi.

Referanslar:

- [backend/routes/api.php](/home/orhan/Documents/Projeler/shopo/backend/routes/api.php#L245)
- [backend/routes/web.php](/home/orhan/Documents/Projeler/shopo/backend/routes/web.php#L141)
- [backend/app/Http/Controllers/User/CheckoutController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/User/CheckoutController.php)
- [backend/app/Http/Controllers/User/CheckoutWithoutTokenController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/User/CheckoutWithoutTokenController.php)
- [backend/app/Http/Controllers/User/PaymentController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/User/PaymentController.php)
- [backend/app/Http/Controllers/Admin/PaymentMethodController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Admin/PaymentMethodController.php)
- [backend/app/Http/Controllers/WEB/Admin/PaymentMethodController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/WEB/Admin/PaymentMethodController.php)
- [backend/resources/views/admin/payment_method.blade.php](/home/orhan/Documents/Projeler/shopo/backend/resources/views/admin/payment_method.blade.php)
- [backend/database/migrations/2026_03_26_120000_drop_unused_payment_gateway_tables.php](/home/orhan/Documents/Projeler/shopo/backend/database/migrations/2026_03_26_120000_drop_unused_payment_gateway_tables.php)

### Backend model/controller kalintilari

Kalan not:

- Orphan durumda kalan sync-conflict / temp dosyalari repo kokunde duruyor; bunlar uygulama akisinin parcasi degil ama manuel temizlik gerektiriyor.

### Frontend checkout kalintilari

Durum:

- React checkout tarafinda Stripe/PayPal/Razorpay akislari kaldirildi.
- Server-rendered eski payment blade'i de Stripe/PayPal/Razorpay sekmelerinden temizlendi.
- Checkout hala birden fazla aktif gateway tasiyor: FlutterWave, Mollie, Paystack, Instamojo, SSLCommerz, MyFatoorah, bKash, Bank, COD.

Referanslar:

- [frontend/src/components/CheckoutPage/components/PaymentMethods.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/CheckoutPage/components/PaymentMethods.jsx)
- [frontend/src/components/CheckoutPage/hooks/usePlaceOrder.js](/home/orhan/Documents/Projeler/shopo/frontend/src/components/CheckoutPage/hooks/usePlaceOrder.js)
- [frontend/src/appConfig/apiRoutes.js](/home/orhan/Documents/Projeler/shopo/frontend/src/appConfig/apiRoutes.js)
- [backend/resources/views/payment.blade.php](/home/orhan/Documents/Projeler/shopo/backend/resources/views/payment.blade.php)

Karar:

- Stripe/PayPal/Razorpay temizligi backend tarafinda uygulanmis durumda.
- Faz 1.5'in kalan isi, diger legacy gateway'lerin Iyzico stratejisine gore sadeleştirilmesi ve frontend son durumunun netlestirilmesi.

---

## 3. Faz 2 - Iyzico

**Durum:** Kismi uygulandi

Bulgu:

- Backend tarafinda model, migration, service ve controller zinciri olusturuldu.
- API checkout endpoint'i ve callback route'u aktif.
- React checkout tarafina Iyzico payment secenegi ve redirect akisi eklendi.
- Web admin payment ekranina Iyzico ayar sekmesi eklendi.

- Referanslar:

- [backend/app/Http/Controllers/User/IyzicoController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/User/IyzicoController.php)
- [backend/app/Services/IyzicoService.php](/home/orhan/Documents/Projeler/shopo/backend/app/Services/IyzicoService.php)
- [backend/app/Models/IyzicoPayment.php](/home/orhan/Documents/Projeler/shopo/backend/app/Models/IyzicoPayment.php)
- [backend/database/migrations/2026_03_26_000001_create_iyzico_payments_table.php](/home/orhan/Documents/Projeler/shopo/backend/database/migrations/2026_03_26_000001_create_iyzico_payments_table.php)
- [backend/routes/api.php](/home/orhan/Documents/Projeler/shopo/backend/routes/api.php)
- [backend/routes/web.php](/home/orhan/Documents/Projeler/shopo/backend/routes/web.php)
- [backend/resources/views/admin/payment_method.blade.php](/home/orhan/Documents/Projeler/shopo/backend/resources/views/admin/payment_method.blade.php)
- [frontend/src/components/CheckoutPage/components/PaymentMethods.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/CheckoutPage/components/PaymentMethods.jsx)
- [frontend/src/components/CheckoutPage/hooks/usePlaceOrder.js](/home/orhan/Documents/Projeler/shopo/frontend/src/components/CheckoutPage/hooks/usePlaceOrder.js)
- [frontend/src/redux/features/order/paymentGetways/apiSlice.js](/home/orhan/Documents/Projeler/shopo/frontend/src/redux/features/order/paymentGetways/apiSlice.js)

Acik noktalar:

- Gercek sandbox/live API anahtarlari ile uc uca test henuz yapilmadi.
- Refund ve sub-merchant yonetimi gibi ileri marketplace adimlari henuz yok.
- Guest checkout icin Iyzico akisi acilmadi; su an sadece authenticated kullanici icin aktif.

---

## 4. Faz 3 - SMS / OTP

**Durum:** Kismi uygulandi

Yapilanlar:

- `otp_verifications` migration eklendi.
- `OtpVerification` model'i eklendi.
- `SmsServiceInterface` ve `IletimMerkeziService` eklendi.
- `OtpController` ile `send`, `verify`, `resend` endpoint'leri eklendi.
- Yeni OTP rate limiter'lari tanimlandi.
- `config/sms.php` ile provider ve OTP ayarlari konfigurasyona alindi.
- Signup akisina `OtpVerifyStep` komponenti eklendi ve `SignupWidget` icine OTP adimi baglandi.
- `store-register` endpoint'i, telefon zorunluysa `otp_verified_token` kontrol edecek sekilde guncellendi.
- Kayit sonrasi eski register-SMS gonderimi kaldirildi; boylece tek SMS dogrulama kaynagi yeni OTP akisidir.

Referanslar:

- [backend/database/migrations/2026_03_26_180000_create_otp_verifications_table.php](/home/orhan/Documents/Projeler/shopo/backend/database/migrations/2026_03_26_180000_create_otp_verifications_table.php)
- [backend/app/Models/OtpVerification.php](/home/orhan/Documents/Projeler/shopo/backend/app/Models/OtpVerification.php)
- [backend/app/Http/Controllers/Auth/OtpController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Auth/OtpController.php)
- [backend/app/Services/SmsServiceInterface.php](/home/orhan/Documents/Projeler/shopo/backend/app/Services/SmsServiceInterface.php)
- [backend/app/Services/IletimMerkeziService.php](/home/orhan/Documents/Projeler/shopo/backend/app/Services/IletimMerkeziService.php)
- [backend/config/sms.php](/home/orhan/Documents/Projeler/shopo/backend/config/sms.php)
- [backend/app/Http/Controllers/Auth/RegisterController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Auth/RegisterController.php)
- [backend/routes/api.php](/home/orhan/Documents/Projeler/shopo/backend/routes/api.php)
- [frontend/src/components/Auth/Signup/OtpVerifyStep.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Auth/Signup/OtpVerifyStep.jsx)
- [frontend/src/components/Auth/Signup/SignupWidget.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Auth/Signup/SignupWidget.jsx)
- [frontend/src/redux/features/auth/apiSlice.js](/home/orhan/Documents/Projeler/shopo/frontend/src/redux/features/auth/apiSlice.js)
- [frontend/src/appConfig/apiRoutes.js](/home/orhan/Documents/Projeler/shopo/frontend/src/appConfig/apiRoutes.js)

Acik noktalar:

- Gercek Iletimerkezi credentials ile uc uca SMS gonderim testi yapilmadi.
- `shopo_db` veritabani olusturuldu ve `otp_verifications` migration'i uygulandi.
- Frontend component dosyalari mevcut ESLint config nedeniyle dogrudan lint kapsaminda degil; JSX gozden gecirildi ancak tam build dogrulamasi yapilmadi.
- OTP feature testleri eklendi, ancak bu ortamda `pdo_sqlite` kurulu olmadigi icin testler skip olarak calisiyor.

Test referansi:

- [backend/tests/Feature/Auth/OtpControllerTest.php](/home/orhan/Documents/Projeler/shopo/backend/tests/Feature/Auth/OtpControllerTest.php)

Runtime dogrulama:

- `php artisan route:list --path=auth/otp` artik temiz calisiyor.
- Local HTTP smoke test ile `POST /api/auth/otp/send` akisi kayit olusturdu.
- Local HTTP smoke test ile `POST /api/auth/otp/verify` akisi token uretti.
- Local HTTP smoke test ile `POST /api/store-register` akisi OTP token ile basarili kayit dondu.
- Yanlis OTP denemesi `attempts_left` azaltarak 422 dondu.
- `POST /api/auth/otp/resend` cooldown suresi icinde 429 dondu.
- Bu dogrulama sirasinda global bootstrap'i bozan namespace ve tablo-varsayimi problemleri de sertlestirildi.

Ek referanslar:

- [backend/app/Providers/PusherConfig.php](/home/orhan/Documents/Projeler/shopo/backend/app/Providers/PusherConfig.php)
- [backend/app/Http/Middleware/Timezone.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Middleware/Timezone.php)
- [backend/app/Http/Controllers/User/BkashPaymentController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/User/BkashPaymentController.php)
- [backend/app/Http/Controllers/User/BkashPaymentControllerGuest.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/User/BkashPaymentControllerGuest.php)
- [backend/app/Http/Controllers/WEB/Admin/Auth/AdminForgotPasswordController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/WEB/Admin/Auth/AdminForgotPasswordController.php)

---

## 5. Faz 4 - Bug Fix ve Eksik Sayfalar

### 5.1 Bug Fix'ler

#### Null image / null safety

**Durum:** Kismi

- Urun kartlarinda ve urun detay ana gorsel / galeri alaninda fallback image eklendi.
- Auth ekranlari, bos wishlist/cart ekranlari ve ana banner/about gorselleri icin de fallback eklendi.
- `next/image` icin bos veya null src geldigi durumda placeholder ile devam ediliyor.
- Ancak tum listeleme, banner ve diger statik alanlarin tam audit'i henuz bitmedi.

Referanslar:

- [frontend/src/components/Helpers/Cards/ProductCard/ColumnV1.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Helpers/Cards/ProductCard/ColumnV1.jsx)
- [frontend/src/components/Helpers/Cards/ProductCard/RowV1.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Helpers/Cards/ProductCard/RowV1.jsx)
- [frontend/src/components/Helpers/Cards/ProductCard/RowV2.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Helpers/Cards/ProductCard/RowV2.jsx)
- [frontend/src/components/SingleProductPage/ProductView.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/SingleProductPage/ProductView.jsx)
- [frontend/src/components/EmptyWishlistError/index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/EmptyWishlistError/index.jsx)
- [frontend/src/components/EmptyCardError/index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/EmptyCardError/index.jsx)
- [frontend/src/components/Auth/Login/index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Auth/Login/index.jsx)
- [frontend/src/components/Auth/Login/LoginLayout.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Auth/Login/LoginLayout.jsx)
- [frontend/src/components/Auth/Signup/index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Auth/Signup/index.jsx)
- [frontend/src/components/Auth/ForgotPass/index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Auth/ForgotPass/index.jsx)
- [frontend/src/components/Home/Banner.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Home/Banner.jsx)
- [frontend/src/components/About/index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/About/index.jsx)

#### `whishlist` -> `wishlist`

**Durum:** Tamamlandi

Yapilanlar:

- Redux feature klasoru `wishlist` olarak duzeltildi.
- Slice dosyasi `wishlistSlice.js` olarak tasindi.
- Tum aktif import zinciri yeni yola guncellendi.

Referanslar:

- [frontend/src/redux/store.js](/home/orhan/Documents/Projeler/shopo/frontend/src/redux/store.js#L4)
- [frontend/src/redux/features/wishlist/wishlistSlice.js](/home/orhan/Documents/Projeler/shopo/frontend/src/redux/features/wishlist/wishlistSlice.js)
- [frontend/src/redux/features/product/apiSlice.js](/home/orhan/Documents/Projeler/shopo/frontend/src/redux/features/product/apiSlice.js)
- [frontend/src/components/Partials/Layout.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Partials/Layout.jsx)

#### Product detail / variant / filter sorunlari

**Durum:** Kismi

- Urun detay sayfasinda null-safe render korumalari eklendi.
- Varyant secimi tek kaynak state ile yeniden duzenlendi; fiyat hesaplama secili varyantlar uzerinden turetiliyor.
- Ana urun gorseli, galeri, brand, description, stock, share ve report akislarinda bos `product/details` durumlarina karsi koruma eklendi.
- `SingleProductPage` icinde reviews, seller info, specifications ve video tablari da guvenli `safeDetails` zincirine cekildi.
- Products, search ve seller-products girislerinde SSR ilk yukleme artik kategori / marka / varyant / fiyat query'lerini kaybetmiyor.
- `AllProductPage` URL koruma listesi `sub_category`, `child_category`, `highlight` ve `search` parametrelerini de tasiyacak sekilde genisletildi.
- Backend `HomeController::product()` ve `sellerDetail()` coklu brand/category, variant item ve min/max price filtrelerini ilk payload asamasinda uygulayacak sekilde guncellendi.
- Canonical seller shop route'u `/seller/[slug]` olarak eklendi; eski `seller-products` ve `sellers/[slug]` girisleri bu URL'ye yonlendiriliyor.

Referanslar:

- [frontend/src/components/SingleProductPage/ProductView.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/SingleProductPage/ProductView.jsx)
- [frontend/src/components/SingleProductPage/index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/SingleProductPage/index.jsx)

### 5.2 Eksik Sayfalar

**Durum:** Kismi

Tamamlananlar:

- `/blogs/[slug]` eklendi.
- `/category-by-blogs/[slug]` eklendi.
- `/seller/[slug]` eklendi.
- `seller-products` ve `sellers/[slug]` girisleri canonical seller route'una yonlendirildi.
- `tracking-order` akisinda backend status code'lari duzeltildi; bulunamayan siparis artik `404`, bos id `422` donuyor.
- Tracking form'u gereksiz tarih alanindan arindirildi ve basarili yonlendirme `/order/{order_id}` olarak netlestirildi.
- `payment-failed` sayfasi artik `order_id`, `reason` ve `code` query parametrelerini okuyup daha detayli hata mesaji gosterebiliyor.
- Iyzico callback basarisiz odeme donuslerinde kullaniciya guvenli hata nedeni tasiyacak sekilde zenginlestirildi.
- `products-compaire` typo'su URL/metadata/breadcrumb yuzeyinde kapatildi; canonical route `/products-compare` olarak netlesti.
- `return-request` backend API omurgasi planlanan state machine'e yaklastirildi; user/seller/admin ayri aksiyon endpoint'leri eklendi.
- Kullanici siparis detayinda sadece iade edilebilir kalemler icin return aksiyonu aciliyor ve modal planlanan reason alanlariyla submit ediyor.
- Backend'e bu sayfalari besleyen public blog endpoint'leri eklendi.
- `returnable-items` endpoint'i route parametresinde hem `orders.id` hem `orders.order_id` degerlerini kabul edecek sekilde duzeltildi.
- Return request akisi lokal ortamda uçtan uca dogrulandi: user create -> seller approve -> admin approve -> admin refund -> commission ledger negatif kayit.
- Seller web paneline return request liste/detay ekranlari eklendi.
- Admin web return request detay ekrani yeni state machine'e gore aksiyon bazli hale getirildi.

Hala eksik olanlar:

- Return request icin frontend App Router / dashboard tarafinda daha kapsamli filtreleme ve istatistik ekranlari

Mevcut ama typo ile bulunan sayfa:

- `/payment-faild`

Referans:

- [frontend/src/app](/home/orhan/Documents/Projeler/shopo/frontend/src/app)
- [frontend/src/app/(website)/blogs/[slug]/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(website)/blogs/[slug]/page.js)
- [frontend/src/app/(website)/category-by-blogs/[slug]/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(website)/category-by-blogs/[slug]/page.js)
- [frontend/src/app/(website)/seller/[slug]/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(website)/seller/[slug]/page.js)
- [frontend/src/components/Sellers/SellerProfile.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Sellers/SellerProfile.jsx)
- [frontend/src/components/TrackingOrder/index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/TrackingOrder/index.jsx)
- [frontend/src/components/PaymentFailed.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/PaymentFailed.jsx)
- [frontend/src/app/(website)/products-compare/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(website)/products-compare/page.js)
- [frontend/src/components/ProductsCompare/index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/ProductsCompare/index.jsx)
- [frontend/src/components/OrderCom/index.js](/home/orhan/Documents/Projeler/shopo/frontend/src/components/OrderCom/index.js)
- [frontend/src/components/OrderCom/ReturnModal.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/OrderCom/ReturnModal.jsx)
- [frontend/src/components/Blog/BlogDetails.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Blog/BlogDetails.jsx)
- [frontend/src/components/Blog/BlogCategoryPage.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Blog/BlogCategoryPage.jsx)
- [backend/routes/api.php](/home/orhan/Documents/Projeler/shopo/backend/routes/api.php)
- [backend/app/Http/Controllers/BlogController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/BlogController.php)
- [backend/app/Http/Controllers/HomeController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/HomeController.php)
- [backend/app/Http/Controllers/User/IyzicoController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/User/IyzicoController.php)
- [backend/app/Http/Controllers/User/ReturnRequestController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/User/ReturnRequestController.php)
- [backend/app/Http/Controllers/Seller/ReturnRequestController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Seller/ReturnRequestController.php)
- [backend/app/Http/Controllers/Admin/ReturnRequestController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Admin/ReturnRequestController.php)
- [backend/app/Http/Controllers/WEB/Seller/ReturnRequestController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/WEB/Seller/ReturnRequestController.php)
- [backend/app/Http/Controllers/WEB/Admin/ReturnRequestController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/WEB/Admin/ReturnRequestController.php)
- [backend/app/Models/ReturnRequest.php](/home/orhan/Documents/Projeler/shopo/backend/app/Models/ReturnRequest.php)
- [backend/resources/views/seller/return_request.blade.php](/home/orhan/Documents/Projeler/shopo/backend/resources/views/seller/return_request.blade.php)
- [backend/resources/views/seller/show_return_request.blade.php](/home/orhan/Documents/Projeler/shopo/backend/resources/views/seller/show_return_request.blade.php)
- [backend/resources/views/admin/show_return_request.blade.php](/home/orhan/Documents/Projeler/shopo/backend/resources/views/admin/show_return_request.blade.php)

Not:

- Seller detay API artik canonical seller route'u ile eslesiyor.

Referans:

- [backend/app/Http/Controllers/HomeController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/HomeController.php)

---

## 6. Faz 5 - Admin Panel

**Durum:** Beklemede

Bu faz dogasi geregi Antigravity raporuna bagli. Su an repo icinde Codex tarafindan kapatilmis spesifik admin fix paketi gorunmuyor.

Karar:

- Antigravity test raporu gelmeden bu faz aktif calisma backlog'u olmamali.

---

## 7. Faz 6 - Pazaryeri Eksikleri

**Durum:** Kismi

Tamamlanan / ilerleyenler:

- `return-request` backend API omurgasi planlanan state machine'e yaklastirildi; user/seller/admin icin ayri aksiyon endpoint'leri eklendi.
- `return-request` kullanici siparis detayina baglandi; sadece iade edilebilir kalemler icin aksiyon aciliyor.
- Komisyon sistemi icin temel veri modeli ve servis kati mevcut: `settings.default_commission_rate`, `vendors.commission_rate`, `order_products` snapshot alanlari ve `commission_ledger`.
- Seller API withdraw artik brüt siparis toplami yerine `CommissionService@getSellerBalance()` ile settled net bakiye kullaniyor.
- Admin API tarafina komisyon settings/vendors/report/ledger endpoint'leri eklendi.
- Seller API tarafina `earnings` ve `earnings/orders` endpoint'leri eklendi.
- Admin API order tamamlama akisi artik komisyon ledger kayitlarini `settled` durumuna geciriyor.
- Web admin komisyon ekranlari yeni akisla hizalandi; vendor override reset, effective rate gorunumu ve seller/status filtreli rapor eklendi.
- Web admin komisyon raporunda seller breakdown tablosu ve pending/settled net kartlari eklendi.
- Lokal `shopo_db` artik repo icindeki `backend/database/seyfibaba_db.sql` dump'i ile ayağa kaldirildi; ilgili `iyzico`, `commission`, `return-request` ve `otp` migration seti uygulanmis durumda.
- Commission backfill migration'i mevcut siparis verisi icin `commission_ledger` satirlarini olusturdu.

Hala eksik olanlar:

- Komisyon sistemi icin frontend/admin panel ekranlarinin API ile tam hizalanmasi
- Return request icin admin/seller frontend ekranlarinin modernizasyonu
- Satici KYC
- Stok uyari notification

Referanslar:

- [backend/app/Services/CommissionService.php](/home/orhan/Documents/Projeler/shopo/backend/app/Services/CommissionService.php)
- [backend/app/Models/CommissionLedger.php](/home/orhan/Documents/Projeler/shopo/backend/app/Models/CommissionLedger.php)
- [backend/app/Http/Controllers/Admin/CommissionController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Admin/CommissionController.php)
- [backend/app/Http/Controllers/WEB/Admin/CommissionController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/WEB/Admin/CommissionController.php)
- [backend/app/Http/Controllers/Seller/EarningsController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Seller/EarningsController.php)
- [backend/app/Http/Controllers/Seller/WithdrawController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Seller/WithdrawController.php)
- [backend/app/Http/Controllers/Admin/OrderController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Admin/OrderController.php)
- [backend/app/Http/Controllers/User/ReturnRequestController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/User/ReturnRequestController.php)
- [backend/app/Http/Controllers/Seller/ReturnRequestController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Seller/ReturnRequestController.php)
- [backend/app/Http/Controllers/Admin/ReturnRequestController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Admin/ReturnRequestController.php)
- [backend/routes/api.php](/home/orhan/Documents/Projeler/shopo/backend/routes/api.php)
- [backend/routes/web.php](/home/orhan/Documents/Projeler/shopo/backend/routes/web.php)
- [backend/resources/views/admin/commission_settings.blade.php](/home/orhan/Documents/Projeler/shopo/backend/resources/views/admin/commission_settings.blade.php)
- [backend/resources/views/admin/commission_report.blade.php](/home/orhan/Documents/Projeler/shopo/backend/resources/views/admin/commission_report.blade.php)
- [backend/database/seyfibaba_db.sql](/home/orhan/Documents/Projeler/shopo/backend/database/seyfibaba_db.sql)
- [backend/database/migrations/2026_03_27_110000_backfill_commission_snapshots_and_ledger.php](/home/orhan/Documents/Projeler/shopo/backend/database/migrations/2026_03_27_110000_backfill_commission_snapshots_and_ledger.php)
- [docs/commission-plan.md](/home/orhan/Documents/Projeler/shopo/docs/commission-plan.md)

Karar:

- Faz 6 aktif hale gelmis durumda; sonraki mantikli adim komisyon endpoint'lerini frontend/admin UI'a baglamak ve eski siparis verisi icin backfill stratejisi uygulamak.

---

## 9. Faza 2 - Codex X1 Demo Veri Temizligi

**Durum:** Tamamlandi

Tamamlananlar:

- Acikca test/demo izi tasiyan vendor kayitlari icin cleanup seeder eklendi.
- E2E dogrulama sirasinda olusan test iade kaydi ve ona ait refund ledger kaydi temizlendi.
- `api test shop name` / `check` gibi sahte vendor satirlari temizlendi.

Referanslar:

- [backend/database/seeders/DemoDataCleanupSeeder.php](/home/orhan/Documents/Projeler/shopo/backend/database/seeders/DemoDataCleanupSeeder.php)

Not:

- Cleanup bilerek dar kapsamli tutuldu; yalnizca acikca demo/test olarak isaretlenebilen veriler hedeflendi.

---

## 10. Faza 2 - Codex X2 Pusher Mesajlasma Fix

**Durum:** Tamamlandi

Tamamlananlar:

- Broadcast altyapisi gercekte aktif olarak dogrulandi; `broadcasting.default` `pusher` ve DB tabanli credential konfigi yuklenmis durumda.
- `api/broadcasting/auth` endpoint'i JWT ile test edildi; dogru private channel icin `200`, baska kullanicinin kanali icin `403` dondu.
- Seller API message controller session guard yerine `auth:api` kullanacak sekilde duzeltildi.
- Seller API message write akisi `send_by`, `customer_read_msg`, `seller_read_msg` ve `product_id` alanlariyla mevcut `messages` tablosu semasina hizalandi.
- Web user / web seller message akislarindaki eski `send_customer` ve `send_seller` kolon kullanimi kaldirildi; ayni mesaj semasina cekildi.
- Pusher servisinden yayin hatasi gelirse mesaj kaydi basarili kalacak sekilde broadcast dispatch `try/catch` ile sertlestirildi; boylece realtime hatasi artik `500` ile mesaj gonderimini dusurmuyor.

Referanslar:

- [backend/app/Http/Controllers/Seller/SellerMessageContoller.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/Seller/SellerMessageContoller.php)
- [backend/app/Http/Controllers/User/MessageController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/User/MessageController.php)
- [backend/app/Http/Controllers/WEB/Seller/SellerMessageContoller.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/WEB/Seller/SellerMessageContoller.php)
- [backend/app/Providers/BroadcastServiceProvider.php](/home/orhan/Documents/Projeler/shopo/backend/app/Providers/BroadcastServiceProvider.php)
- [backend/routes/channels.php](/home/orhan/Documents/Projeler/shopo/backend/routes/channels.php)
- [backend/app/Providers/PusherConfig.php](/home/orhan/Documents/Projeler/shopo/backend/app/Providers/PusherConfig.php)
- [backend/app/Models/Message.php](/home/orhan/Documents/Projeler/shopo/backend/app/Models/Message.php)
- [frontend/src/components/MessageWidget/index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/MessageWidget/index.jsx)
- [backend/resources/js/bootstrap.js](/home/orhan/Documents/Projeler/shopo/backend/resources/js/bootstrap.js)
- [backend/resources/js/contexts/Chat.js](/home/orhan/Documents/Projeler/shopo/backend/resources/js/contexts/Chat.js)

Runtime dogrulama:

- `POST /api/broadcasting/auth` kullanici JWT'si ile `private-seller-to-user-message.7` icin `200` dondu.
- Ayni kullanici icin `private-seller-to-user-message.12` istegi `403` dondu.
- `GET /api/seller/send-message` seller JWT ile `200` dondu ve mesaj kaydi dogru sema ile olustu.
- Pusher upstream tarafindan `404` donse bile endpoint artik basarili response uretiyor; hata loglanip akis devam ediyor.
- X2 dogrulama icin olusturulan test mesajlari tekrar temizlendi.

Acik not:

- Realtime teslimat artik uygulama tarafinda kirilmiyor; ancak canli ortamda gercek event yayini icin admin paneldeki Pusher credential'larinin gecerli ve aktif olmasi gerekiyor.

---

## 11. Faza 2 - Codex X3 Maps Fix

**Durum:** Tamamlandi

Tamamlananlar:

- Harita secim komponenti script yuklemesini `map_status=1` ve gecerli `map_key` varligina baglayacak sekilde sertlestirildi.
- Google Maps key eksik ya da script load hataliysa checkout / address / seller basvuru ekranlari artik kirilmiyor; manuel adres girisi ile devam edilebiliyor.
- Places autocomplete ve place detail secimi tek ve stabil legacy Google Places akisina indirildi; modern/deneysel API dallari kaldirildi.
- Secilen veya mevcut koordinatlar komponent icine tekrar yuklendiginde marker ve center durumu dogru sekilde senkronize ediliyor.
- Delivery tracking haritasi gecersiz koordinat veya eksik key durumunda hata vermek yerine guvenli fallback kutusu gosteriyor.

Referanslar:

- [frontend/src/components/MapComponent/Index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/MapComponent/Index.jsx)
- [frontend/src/components/MapComponent/MapShow.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/MapComponent/MapShow.jsx)
- [frontend/src/components/CheckoutPage/components/CheckoutAddressForm.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/CheckoutPage/components/CheckoutAddressForm.jsx)
- [frontend/src/components/CheckoutPage/components/GuestCheckoutAddressForm.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/CheckoutPage/components/GuestCheckoutAddressForm.jsx)
- [frontend/src/components/Auth/Profile/tabs/AddressesTab.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Auth/Profile/tabs/AddressesTab.jsx)
- [frontend/src/components/BecomeSaller/index.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/BecomeSaller/index.jsx)
- [frontend/src/components/OrderCom/TrackDeliveryMan.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/OrderCom/TrackDeliveryMan.jsx)

Not:

- Hedefli `eslint` denemesi bu repodaki mevcut config nedeniyle dosyalari ignore etti; bu nedenle X3 icin dogrulama kod incelemesi ve runtime-safe fallback mantigi uzerinden yapildi.

---

## 12. Faza 2 - Codex X4 SEO Kalan Img Fix

**Durum:** Tamamlandi

Tamamlananlar:

- Frontend uygulama kaynaklarinda kalan raw `<img>` kullanimi temizlendi.
- Blog kart ve blog detay hero gorseli `next/image` ile degistirildi.
- Her iki yuzeyde de fallback image, anlamli `alt` ve responsive `sizes` tanimi korundu.

Referanslar:

- [frontend/src/components/Blog/BlogCard.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Blog/BlogCard.jsx)
- [frontend/src/components/Blog/BlogDetails.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/components/Blog/BlogDetails.jsx)

Dogrulama:

- `frontend/src/components` ve `frontend/src/app` altinda kalan raw `<img>` aramasi temiz dondu.

Not:

- `AGENTS.md` icindeki eski dosya isimleri repo ile tam ortusmuyor; fiili kalan raw `<img>` yuzeyleri blog komponentlerindeydi ve onlar temizlendi.

---

## 13. Faza 2 - Codex X5 SEO Canonical URL Standardizasyonu

**Durum:** Tamamlandi

Tamamlananlar:

- `frontend/src/app` altindaki metadata'siz kalan `page.js` yuzeylerine canonical URL eklendi.
- Indexlenmemesi gereken ozel sayfalar icin canonical ile birlikte `robots: noindex, nofollow` standardi uygulandi.
- Social callback sayfalari server metadata + client callback component modeline tasindi; boylece canonical export ile App Router kurallari uyumlu hale geldi.
- Legacy alias / redirect sayfalari da hedef canonical adrese isaret edecek sekilde metadata aldi.

Referanslar:

- [frontend/src/app/(callback)/callback/facebook/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(callback)/callback/facebook/page.js)
- [frontend/src/app/(callback)/callback/facebook/FacebookCallbackClient.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(callback)/callback/facebook/FacebookCallbackClient.jsx)
- [frontend/src/app/(callback)/callback/google/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(callback)/callback/google/page.js)
- [frontend/src/app/(callback)/callback/google/GoogleCallbackClient.jsx](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(callback)/callback/google/GoogleCallbackClient.jsx)
- [frontend/src/app/(website)/order/[id]/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(website)/order/[id]/page.js)
- [frontend/src/app/(website)/payment-failed/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(website)/payment-failed/page.js)
- [frontend/src/app/(website)/profile/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(website)/profile/page.js)
- [frontend/src/app/(website)/seller-products/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(website)/seller-products/page.js)
- [frontend/src/app/(website)/sellers/[slug]/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(website)/sellers/[slug]/page.js)

Dogrulama:

- `frontend/src/app` altindaki tum `page.js` dosyalarinda canonical / alternates taramasi artik temiz donuyor.

---

## 14. Faza 2 - Codex X6 Pentest Scriptleri

**Durum:** Tamamlandi

Tamamlananlar:

- `docs/pentest-plan.md` baz alinarak tekrar calistirilabilir pentest script seti eklendi.
- Yuzey / misconfiguration taramasi icin `run_surface_checks.sh` yazildi.
- Yetki / role boundary kontrolleri icin `run_authz_checks.sh` yazildi.
- Bagimlilik taramasi icin `run_dependency_audits.sh` yazildi.
- Tumunu zincirlemek icin `run_all.sh` ve kullanim dokumani eklendi.

Referanslar:

- [scripts/pentest/README.md](/home/orhan/Documents/Projeler/shopo/scripts/pentest/README.md)
- [scripts/pentest/run_surface_checks.sh](/home/orhan/Documents/Projeler/shopo/scripts/pentest/run_surface_checks.sh)
- [scripts/pentest/run_authz_checks.sh](/home/orhan/Documents/Projeler/shopo/scripts/pentest/run_authz_checks.sh)
- [scripts/pentest/run_dependency_audits.sh](/home/orhan/Documents/Projeler/shopo/scripts/pentest/run_dependency_audits.sh)
- [scripts/pentest/run_all.sh](/home/orhan/Documents/Projeler/shopo/scripts/pentest/run_all.sh)
- [docs/pentest-plan.md](/home/orhan/Documents/Projeler/shopo/docs/pentest-plan.md)

Lokal dogrulama:

- `run_surface_checks.sh` calistirildi.
  Sonuc: `.env`, `.git`, debug endpoint ve directory listing kontrolleri temiz.
  Ilk turda acik bulgu: `x-frame-options`, `x-content-type-options`, `referrer-policy` header'lari eksikti.
  Sonraki hardening turunda global backend security header middleware'i eklendi.
  Sonuc: surface script'i `15 passed, 0 failed` seviyesine geldi.
- `run_authz_checks.sh` gercek user / seller / admin token'lari ile calistirildi.
  Ilk turda bulunan bulgular:
  `user` token ile `/api/seller/earnings` `200` donuyordu.
  `/api/deliveryman/dashboard` user ve seller token ile `401/403` yerine `500` donuyordu.
  `seller` token ile `/api/user/order-show/{id}` `200` donuyordu.
  Sonraki hardening turunda:
  `CheckSeller` middleware'i aktif seller dogrulamasina cevrildi.
  `DeliveryManApi` middleware'i null yerine `401` doner hale getirildi.
  `UserProfileController@orderShow` ownership kontrolu ile daraltildi.
  Sonuc: authz script'i `8 passed, 0 failed, 3 skipped` seviyesine geldi.
- `run_dependency_audits.sh` calistirildi.
  Sonuc: bilinen advisory bulunmadi.
  Not: `fruitcake/laravel-cors` abandoned package olarak raporlandi.

Karar:

- X6 scriptleri hazir ve calisiyor.
- Pentest scriptlerinin ortaya cikardigi authz aciklari kapatildi.
- HTTP security header eksikleri de kapatildi.

---

## 8. Faz 7 - SEO

**Durum:** Kismi

### Var olanlar

- Bazi App Router sayfalarinda `generateMetadata()` kullaniliyor.
- Backend tarafinda `SeoSetting` modeli ve admin SEO setup ekranlari mevcut.

Referanslar:

- [frontend/src/app/(website)/single-product/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(website)/single-product/page.js#L11)
- [backend/app/Models/SeoSetting.php](/home/orhan/Documents/Projeler/shopo/backend/app/Models/SeoSetting.php)
- [backend/app/Http/Controllers/WEB/Admin/ContentController.php](/home/orhan/Documents/Projeler/shopo/backend/app/Http/Controllers/WEB/Admin/ContentController.php)

### Eksik olanlar

- `robots.txt` yok
- Merkezi SEO kapsaminda eksikler var, ancak App Router tarafinda `sitemap.js` mevcut ve blog URL'leri ile genisletildi
- Product / Organization / BreadcrumbList JSON-LD kapsami butun siteye yayilmis degil
- Canonical standardizasyonu yok
- OG yapisi merkezi olarak gorunmuyor

Referanslar:

- [frontend/src/app/layout.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/layout.js#L13)
- [frontend/src/app/(website)/single-product/page.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/(website)/single-product/page.js#L11)
- [frontend/src/app/sitemap.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/sitemap.js)

Karar:

- SEO altyapisi sadece metadata seviyesinde, planlanan kapsamta degil.

---

## 9. Faz 8 - Performans

**Durum:** Kismi

### Var olanlar

- Projede `next/image` yaygin kullaniliyor.
- `@ducanh2912/next-pwa` bagimliligi mevcut.
- Root layout icinde manifest baglantisi conditionally ekleniyor.

Referanslar:

- [frontend/package.json](/home/orhan/Documents/Projeler/shopo/frontend/package.json)
- [frontend/src/app/layout.js](/home/orhan/Documents/Projeler/shopo/frontend/src/app/layout.js#L18)

### Eksik olanlar

- Bundle analizi sonucu yok
- `next/image` migration tamamlandi denemez
- Cache stratejisi uygulama kaniti yok
- DB index optimizasyon migration'lari belirgin degil
- PWA tamamlanmis durumda dogrulanmis degil

Karar:

- Performans fazi aktif backlog icin hazir degil; once guvenlik ve payment cleanup bitmeli.

---

## Oncelikli Codex Backlog Onerisi

### Blokerler

1. `security/hardening`
2. `refactor/remove-unused-payment-gateways`

### Sonraki fazlar

3. `feat/iyzico-payment`
4. `feat/sms-otp`

### Daha sonra

5. `fix/wishlist-typo`
6. `fix/null-safety`
7. `fix/product-detail`
8. `fix/product-filter`
9. `feat/blog-pages`
10. `feat/seller-shop`
11. `feat/seo-implementation`

---

## Net Sonuc

Codex gorevleri acisindan repo su an **erken uygulama / yarim gecis** durumunda:

- Bazi modernizasyonlar yapilmis
- Bazi eski e-ticaret altyapisi aynen korunmus
- Guvenlik ve odeme alaninda planlanan temizlik uygulanmamis
- Yeni odak alanlar (Iyzico, yeni OTP, SEO schema, marketplace eksikleri) henuz baslamamis

Bu nedenle Codex tarafinda bir sonraki mantikli uygulama adimi:

**Ilk olarak `security/hardening` branch'inde Faz 1 maddelerini kapatmak, ardindan `refactor/remove-unused-payment-gateways` ile checkout/payment yuzeyini sadeleştirmektir.**

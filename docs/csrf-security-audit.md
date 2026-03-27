# Odeme Callback Guvenlik Auditi

**Hazirlayan:** Claude Code (Mimar)
**Tarih:** 2026-03-26
**Oncelik:** Faza 1 (Guvenlik)
**Kapsam:** Tum odeme gateway callback'leri — CSRF, replay, signature dogrulama

---

## 1. Ozet

Shopo backend'inde 7 odeme gateway'inin callback/response handler'lari incelendi. Iyzico haricinde hicbir gateway'de yeterli guvenlik dogrulamasi yok.

| Gateway | Dogrulama Yontemi | Replay Koruma | Risk Seviyesi |
|---------|-------------------|---------------|---------------|
| **Iyzico** | Token-based (retrieveCheckoutForm) | Token tek kullanimlik | **DUSUK** ✓ |
| **SSL Commerz** | MD5 hash signature | Yok | **ORTA** |
| **Flutterwave** | Session-based transaction_id | Yok | **YUKSEK** |
| **Mollie** | Session-based, provider sorgusu yok | Yok | **KRITIK** |
| **Instamojo** | GET parameter guven, sorgu yok | Yok | **KRITIK** |
| **Paystack** | Session-based reference | Yok | **YUKSEK** |
| **bKash** | Session-based paymentID | Yok | **YUKSEK** |
| **MyFatoorah** | GET parameter, sorgu yok | Yok | **KRITIK** |

---

## 2. Detayli Analiz

### 2.1 Iyzico — DUSUK RISK ✓

**Dosya:** `app/Http/Controllers/User/IyzicoController.php`

**Nasil calisiyor:**
1. Callback URL'e `order_id` ve `token` parametreleri gelir
2. `IyzicoService::retrieveCheckoutForm($token)` ile Iyzico API'sine dogrulama istegi yapilir
3. Sadece `status === 'success'` VE `paymentStatus === 'SUCCESS'` ise odeme onaylanir
4. Token tek kullanimlik — tekrar kullanildiginda Iyzico API hata doner

**Guclu yanlar:**
- Provider-side dogrulama (token ile API sorgusu)
- Tek kullanimlik token (replay koruması)
- Hata durumunda order guncellenmez

**Eksikler:**
- Rate limiting yok (callback endpoint'e brute force)
- IP whitelist yok (Iyzico IP adresleri filtrelenmemiyor)

### 2.2 SSL Commerz — ORTA RISK

**Dosya:** `app/Http/Controllers/User/PaymentController.php` — `sslcommerz_success()`

**Nasil calisiyor:**
1. POST ile `val_id`, `tran_id`, `amount`, `store_amount` gelir
2. MD5 hash dogrulamasi: `md5($store_passwd . $val_id . $store_amount)` kontrolu var
3. Hash uyusursa odeme onaylanir

**Guclu yanlar:**
- Signature dogrulama (MD5 hash)
- Store password bilgisi olmadan sahte callback olusturulamaz

**Eksikler:**
- MD5 zayif hash algoritmasi
- Replay koruması yok (ayni valid callback tekrar gonderilebilir)
- `sslcommerz_failed()` endpoint'inde dogrulama yok

### 2.3 Mollie — KRITIK RISK

**Dosya:** `app/Http/Controllers/User/PaymentController.php` — `payWithMollie()`

**Nasil calisiyor:**
1. Mollie odeme sonrasi redirect gelir
2. Session'dan `order_id` ve `mollie_payment_id` okunur
3. **Mollie API'sine dogrulama sorgusu YAPILMIYOR**
4. Session verisi uzerinden direkt odeme onaylanir

**Sorunlar:**
- Session fixation ile sahte odeme onaylanabilir
- Provider-side dogrulama yok
- Replay koruması yok

### 2.4 Instamojo — KRITIK RISK

**Dosya:** `app/Http/Controllers/User/PaymentController.php` — `instamojoResponse()`

**Nasil calisiyor:**
1. GET parametreleri ile `payment_id`, `payment_status`, `payment_request_id` gelir
2. **Instamojo API'sine dogrulama sorgusu YAPILMIYOR**
3. `payment_status` GET parametresi direkt guveniliyor
4. Session'dan order bilgisi okunur

**Sorunlar:**
- GET parametreleri manipule edilebilir
- Provider-side dogrulama yok
- Herhangi biri `?payment_status=Credit` ile sahte basarili odeme olusturabilir

### 2.5 Paystack — YUKSEK RISK

**Dosya:** `app/Http/Controllers/User/PaymentController.php` — `payWithPayStack()`

**Nasil calisiyor:**
1. Session'dan `reference` okunur
2. Paystack redirect sonrasi callback gelir
3. Session-based dogrulama

**Sorunlar:**
- Provider-side dogrulama yok (Paystack verify API cagirilmiyor)
- Session fixation riski
- Replay koruması yok

### 2.6 bKash — YUKSEK RISK

**Dosya:** `app/Http/Controllers/User/BkashPaymentController.php`

**Nasil calisiyor:**
1. `BkashPaymentSuccess()` callback'i `paymentID` parametresi alir
2. bKash API'sine `executePayment` istegi yapilir (bu bir dogrulama adimi)
3. Ancak response sonrasi yeterli kontrol yok

**Kismi dogrulama:** Execute call mevcut ama response validation zayif.

### 2.7 MyFatoorah — KRITIK RISK

**Dosya:** `app/Http/Controllers/User/PaymentController.php` — `myfatoorah_webview_callback()`

**Nasil calisiyor:**
1. GET parametreleri ile `paymentId` gelir
2. **MyFatoorah API'sine dogrulama sorgusu YAPILMIYOR**
3. Session'dan order bilgisi okunur

**Sorunlar:**
- Provider-side dogrulama yok
- GET parameter manipulasyonu ile sahte odeme

---

## 3. Ortak Guvenlik Eksikleri

### 3.1 Replay Koruması Yok

Hicbir gateway'de (Iyzico dahil) explicit replay koruması yok:
- Ayni callback birden fazla kez gonderilebilir
- `transection_id` unique constraint'i yok
- Islemis callback kaydi tutulmuyor

**Cozum:** `orders.transection_id` uzerine unique index + callback islendiginde kontrol.

### 3.2 Rate Limiting Yok

Callback endpoint'lerine rate limiting uygulanmiyor:
- Brute force token/reference denemesi mumkun
- DDoS riski

**Cozum:** Laravel throttle middleware: `throttle:10,1` (dakikada 10 istek).

### 3.3 CSRF Middleware

**`VerifyCsrfToken.php` Except Listesi (dogrulanmis):**

```php
// Simdiki except listesi:
'/user/checkout/sslcommerz-success'
'/user/checkout/sslcommerz-failed'
'/user/checkout/sslcommerz-cancel'
'/user/checkout/sslcommerz-pay'
'/user/checkout/guest/sslcommerz-success'
'/user/checkout/guest/sslcommerz-failed'
'/user/checkout/guest/sslcommerz-cancel'
'/user/checkout/guest/sslcommerz-pay'
'/user/checkout/guest/razorpay-order'
'/user/checkout/razorpay-order'
```

**Except listesinde OLMAYAN ama olmasi gereken:**
- Mollie, Instamojo, bKash, MyFatoorah callback route'lari exclude edilmemis
- Bu route'lar `web.php`'de tanimli oldugundan POST callback'ler CSRF hatasi alabilir
- Iyzico callback'i `api.php`'de oldugu icin zaten CSRF'den muaf

### 3.4 MyFatoorah — Replay Koruması YOK

MyFatoorah callback handler'larinda `is_draft` kontrolu bile yapilmiyor. Ayni callback tekrar gonderildiginde siparis birden fazla kez islenir. Bu en kritik guvenlik acigi.

### 3.4 Guest Checkout Callback'leri

`CheckoutWithoutTokenController.php` icindeki callback handler'lari ayni guvenlik sorunlarini tasir. Her duzeltme her iki controller'a da uygulanmali.

---

## 4. Oncelikli Aksiyonlar

### Acil (Guvenlik riski — uretim oncesi zorunlu)

1. **Mollie callback'ine provider-side dogrulama ekle** — Mollie API'den odeme durumunu sorgula
2. **Instamojo callback'ine provider-side dogrulama ekle** — Instamojo API'den odeme durumunu sorgula
3. **MyFatoorah callback'ine provider-side dogrulama ekle** — MyFatoorah API'den odeme durumunu sorgula
4. **Paystack callback'ine Paystack verify API cagirisi ekle**

### Yuksek

5. **Replay koruması ekle** — `orders.transection_id` unique check + "zaten islenmis" kontrolu
6. **Rate limiting** — tum callback route'larina `throttle:10,1` middleware
7. **CSRF exception kontrolu** — `VerifyCsrfToken.php` except listesini incele

### Orta

8. **bKash response validation'i gucledir** — execute response'tan `transactionStatus` kontrolu
9. **Iyzico IP whitelist** — Iyzico IP adreslerini filtrele (opsiyonel, token dogrulamasi yeterli)

---

## 5. Turkiye Odakli Etki Degerlendirmesi

Shopo Turkiye pazaryeri olarak sadece su gateway'leri kullanacak:
- **Iyzico** — Ana odeme yontemi (DUSUK RISK ✓)
- **Kapida Odeme** — Callback yok, risk yok

Diger gateway'ler (Mollie, Instamojo, Paystack, bKash, MyFatoorah, Flutterwave, SSL Commerz) **Turkiye'de kullanilmayacak** ve `docs/payment-cleanup-plan.md`'ye gore kaldirilacak.

**Sonuc:** Backend temizligi (Faza 0) tamamlandiginda guvenlik riski tasiyanlarin cogu zaten silinmis olacak. Iyzico'nun token-based dogrulamasi yeterli guvenlik sagliyor. Ek olarak replay koruması ve rate limiting eklenmelidir.

---

## 6. Codex Uygulama Adimlari

1. `VerifyCsrfToken.php` except listesini kontrol et ve belgele
2. Iyzico callback'ine `throttle:10,1` middleware ekle
3. `orders.transection_id` uzerine replay kontrol mantigi ekle
4. Backend temizligi sonrasi (Faza 0): kaldirilan gateway'lerin callback route'larini dogrula
5. Guest checkout callback'lerinde ayni kontrolleri uygula

**Branch:** Faza 0 temizliginin parcasi — ayri branch gerektirmez

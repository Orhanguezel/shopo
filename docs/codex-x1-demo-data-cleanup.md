# CODEX GOREV X1: Demo Veri Temizligi

**Branch:** `chore/demo-data-cleanup`
**Oncelik:** ORTA
**Bagimlilık:** Yok — hemen baslanabilir

---

## Sorun

Controller'larda hardcoded test/demo verileri var. Production'a cikmadan once temizlenmeli.

## Yapilacaklar

### 1. Test Telefon Numaralari Temizle

**Dosya:** `backend/app/Http/Controllers/User/IyzicoController.php` (satir 116-118)
```php
// ONCE:
$buyer->setGsmNumber($user->phone ?? '+905000000000');
$buyer->setIdentityNumber('11111111111');

// SONRA:
$buyer->setGsmNumber($user->phone ?: '+900000000000');
$buyer->setIdentityNumber($user->identity_number ?? '00000000000');
```
> Not: Iyzico zorunlu alan oldugu icin fallback gerekli, ama dummy deger kullan.

**Dosya:** `backend/app/Http/Controllers/User/PaymentController.php` (satir 643-653)
```php
// Kaldir veya guncelle:
// 'phone' => '918160651749' → Auth::user()->phone ?? ''
// 'webhook' => 'http://www.example.com/webhook/' → config('app.url') . '/api/webhooks/instamojo'
// 'email' => 'test@test.com' → Auth::user()->email
```

**Dosya:** `backend/app/Http/Controllers/User/CheckoutWithoutTokenController.php` (satir 646-656)
```php
// Ayni duzeltmeler (PaymentController ile ayni pattern)
```

**Dosya:** `backend/app/Http/Controllers/MyFatoorahController.php` (satir 53-60)
```php
// ONCE:
'CustomerName' => 'FName LName'
'InvoiceValue' => '10'
'CustomerEmail' => 'test@test.com'
'CustomerMobile' => '12345678'

// SONRA:
'CustomerName' => Auth::user()->name ?? 'Customer'
'InvoiceValue' => $order->total_amount
'CustomerEmail' => Auth::user()->email
'CustomerMobile' => Auth::user()->phone ?? ''
```

### 2. clearDatabase Endpoint Guvenlik

**Dosyalar:**
- `backend/app/Http/Controllers/Admin/SettingController.php` (satir 85-137)
- `backend/app/Http/Controllers/WEB/Admin/SettingController.php` (satir 95-149)

**Karar:** Bu method 40+ tabloyu truncate ediyor. Production'da bulunmamali.

**Yap:**
```php
public function clearDatabase()
{
    if (app()->environment('production')) {
        abort(403, 'Database clear is disabled in production.');
    }
    // ... mevcut kod
}
```

### 3. CORS Localhost Girisleri

**Dosya:** `backend/config/cors.php`

Production deploy oncesi localhost girisleri kaldirilmali. Simdilik birakabiliriz ama production `.env`'de `CORS_ALLOWED_ORIGINS` kullanilmali.

**Not:** Bu gorev deploy sirasinda yapilacak — simdilik dokunma.

### 4. Mail Config Default

**Dosya:** `backend/config/mail.php` (satir 95-96)

Bu Laravel default, `.env` ile override ediliyor. Dokunmaya gerek yok — deploy planinda `.env` ayarlari var.

---

## Test

```bash
# Syntax kontrolu
cd backend && php -l app/Http/Controllers/User/IyzicoController.php
php -l app/Http/Controllers/User/PaymentController.php
php -l app/Http/Controllers/User/CheckoutWithoutTokenController.php
php -l app/Http/Controllers/MyFatoorahController.php

# Route kontrolu
php artisan route:list --name=clear-database
```

## Notlar
- `shopo_db` → `seyfibaba_prod` degisikligi `.env`'de yapilacak, kodda degil
- Odeme gateway test mode flag'lari admin panelden degistiriliyor, kodda hardcoded degil

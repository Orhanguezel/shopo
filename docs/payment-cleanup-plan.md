# Payment Gateway Temizlik Plani

**Tarih:** 2026-03-26
**Karar:** Stripe, PayPal, Razorpay kaldirilacak
**Neden:** Turkiye pazarinda kullanilmiyor, Iyzico entegre edilecek
**Kalacak yontemler:** Iyzico (yeni), Kapida Odeme (COD), Banka Havale

---

## Adim 1: Backend Bagimliliklar (composer.json)

**Dosya:** `backend/composer.json`

Kaldirilacak satirlar:
```
"paypal/paypal-checkout-sdk": "^1.0"
"razorpay/razorpay": "^2.8"
"stripe/stripe-php": "^7.110"
```

Sonra: `composer update` calistir.

---

## Adim 2: Backend Model'ler — SIL

- `backend/app/Models/PaypalPayment.php`
- `backend/app/Models/StripePayment.php`
- `backend/app/Models/RazorpayPayment.php`

---

## Adim 3: Migration'lar — drop table migration yaz

Yeni migration olustur: `create_drop_unused_payment_tables.php`

```php
public function up()
{
    Schema::dropIfExists('paypal_payments');
    Schema::dropIfExists('stripe_payments');
    Schema::dropIfExists('razorpay_payments');
}
```

Eski migration dosyalari yerinde kalabilir (gecmis referans icin).

---

## Adim 4: Backend Controller'lar

### Silinecek dosyalar:
- `backend/app/Http/Controllers/User/PaypalController.php`
- `backend/app/Http/Controllers/User/GuestPaypalController.php`

### Temizlenecek dosyalar (Stripe/Razorpay method'lari kaldir):

**`backend/app/Http/Controllers/User/PaymentController.php`**
- `payWithStripe()` → SIL
- `razorpayOrder()` → SIL
- `razorpayWebView()` → SIL
- `razorpayVerify()` → SIL
- `use Razorpay\Api\Api` → SIL
- `use Stripe` → SIL

**`backend/app/Http/Controllers/User/CheckoutController.php`**
- Stripe/Razorpay referanslarini temizle

**`backend/app/Http/Controllers/User/CheckoutWithoutTokenController.php`**
- `payWithStripe()` → SIL
- `razorpayOrder()` → SIL
- `razorpayWebView()` → SIL
- `razorpayVerify()` → SIL

**`backend/app/Http/Controllers/User/PaymentMethodController.php`**
- `updatePaypal()` → SIL
- `updateStripe()` → SIL
- `updateRazorpay()` → SIL

**`backend/app/Http/Controllers/Admin/PaymentMethodController.php`**
- `updatePaypal()` → SIL
- `updateStripe()` → SIL
- `updateRazorpay()` → SIL

**`backend/app/Http/Controllers/WEB/Admin/PaymentMethodController.php`**
- `updatePaypal()` → SIL
- `updateStripe()` → SIL
- `updateRazorpay()` → SIL

---

## Adim 5: Backend Route'lar

**`backend/routes/web.php`** — Kaldirilacak route'lar:
- `/paypal-react-web-view`
- `/paypal-payment-success-from-react`
- `/paypal-payment-cancled-from-react`
- `/razorpay-order`
- `/razorpay-web-view`
- `/razorpay/pay/verify`
- `/update-paypal`
- `/update-stripe`
- `/update-razorpay`

**`backend/routes/api.php`** — Kaldirilacak route'lar:
- `/pay-with-stripe`
- `/update-paypal`
- `/update-stripe`
- `/update-razorpay`
- Razorpay ile ilgili tum endpoint'ler

---

## Adim 6: Blade Template'ler — SIL

- `backend/resources/views/paypal_btn_for_react.blade.php`
- `backend/resources/views/paypal_btn.blade.php`
- `backend/resources/views/razorpay_webview.blade.php`

**`backend/resources/views/payment.blade.php`** — Stripe/PayPal/Razorpay referanslarini temizle

---

## Adim 7: Frontend Component'ler

**`frontend/src/components/CheckoutPage/components/PaymentMethods.jsx`** (Tamamlandı)
- Stripe form (card number, expiry, CVV) → SIL (Tamamlandı)
- RazorPay butonu → SIL (Tamamlandı)
- PayPal butonu → SIL (Tamamlandı)
- Sadece COD + Banka Havale kalacak (Iyzico sonra eklenecek) (Tamamlandı)

**`frontend/src/components/CheckoutPage/hooks/usePlaceOrder.js`** (Tamamlandı)
- Stripe/Razorpay payment logic → SIL (Tamamlandı)

**`frontend/src/components/CheckoutPage/hooks/useCheckoutState.js`** (Tamamlandı)
- Stripe data state → SIL (Tamamlandı)

**`frontend/src/components/CheckoutPage/utils/checkoutUtils.js`** (Tamamlandı)
- Stripe card validation → SIL (Tamamlandı)

### Silinecek icon dosyalari: (Silindi)
- `frontend/src/components/Helpers/icons/StripeLogo.jsx` (Silindi)
- `frontend/src/components/Helpers/icons/PaypalLogo.jsx` (Silindi)
- `frontend/src/components/Helpers/icons/RezorPay.jsx` (Silindi)
- Ve diğer 6 ödeme logosu (Silindi)

---

## Adim 8: Frontend Redux/Config (Tamamlandı)

**`frontend/src/redux/features/order/paymentGetways/apiSlice.js`** (Tamamlandı)
- `stripePayApi` → SIL (Tamamlandı)
- `stripePayGuestApi` → SIL (Tamamlandı)
- `razorpayOrderApi` → SIL (Tamamlandı)
- `razorpayOrderGuestApi` → SIL (Tamamlandı)

**`frontend/src/appConfig/apiRoutes.js`** (Tamamlandı)
- `STRIPE_PAY` → SIL (Tamamlandı)
- `STRIPE_PAY_GUEST` → SIL (Tamamlandı)
- `RAZORPAY_ORDER` → SIL (Tamamlandı)
- `RAZORPAY_ORDER_GUEST` → SIL (Tamamlandı)
- `stripePay`, `stripePayGuest`, `razorpayOrder`, `razorpayOrderGuest` → SIL (Tamamlandı)

---

## Adim 9: Vendor Dizini

`composer update` sonrasi otomatik temizlenir:
- `backend/vendor/paypal/`
- `backend/vendor/razorpay/`
- `backend/vendor/stripe/`

---

## Dogrulama

1. `composer install` hatasiz tamamlanmali
2. `php artisan route:list` → Stripe/PayPal/Razorpay route'lari olmamali
3. `bun run build` → Frontend hatasiz build edilmeli
4. Checkout sayfasi → Sadece COD + Banka Havale gorunmeli
5. Admin panel → Odeme ayarlarinda Stripe/PayPal/Razorpay olmamali

---

## Branch
`refactor/remove-unused-payment-gateways`

## Sonraki Adim
Bu temizlik tamamlandiktan sonra `feat/iyzico-payment` branch'inde Iyzico entegrasyonu baslar.

# Iyzico Entegrasyon Plani — Tamamlama Rehberi

**Hazirlayan:** Claude Code (Mimar)
**Tarih:** 2026-03-26
**Oncelik:** Faza 2
**Durum:** Backend %70, Frontend %0, Admin %0

---

## 1. Tamamlanan Isler (Claude Code)

| Dosya | Durum |
|-------|-------|
| `app/Models/IyzicoPayment.php` | Olusturuldu |
| `app/Services/IyzicoService.php` | Olusturuldu (QuickEcommerce'ten adapt) |
| `app/Http/Controllers/User/IyzicoController.php` | Olusturuldu |
| `database/migrations/2026_03_26_000001_create_iyzico_payments_table.php` | Olusturuldu |
| `routes/api.php` — Iyzico route'lari | Eklendi |
| `Admin/PaymentMethodController.php` — `updateIyzico()` | Eklendi |
| `CheckoutController.php` — iyzico response | Eklendi |
| `composer.json` — `iyzipay/iyzipay-php: ^2.0` | Eklendi |
| `public/uploads/website-images/iyzico.svg` | Kopyalandi |

---

## 2. Kalan Isler

### 2.1 Backend — Paket Yukleme ve Migration

```bash
cd backend
composer install          # iyzipay-php paketini yukle
php artisan migrate       # iyzico_payments tablosunu olustur
```

### 2.2 Frontend — PaymentMethods.jsx Entegrasyonu

Dosya: `frontend/src/components/CheckoutPage/components/PaymentMethods.jsx`

Eklenecek:
```jsx
// Iyzico secenegi — Checkout response'tan iyzico.status kontrol et
{checkoutData?.iyzico?.status === 1 && (
  <div
    className={`payment-method-item ${selectedPayment === 'iyzico' ? 'active' : ''}`}
    onClick={() => setSelectedPayment('iyzico')}
  >
    <img src={`${BASE_URL}/uploads/website-images/iyzico.svg`} alt="Iyzico" />
    <span>Kredi/Banka Karti (Iyzico)</span>
  </div>
)}
```

usePlaceOrder.js icinde:
```javascript
// Iyzico secildiginde
if (paymentMethod === 'iyzico') {
  const response = await iyzicoSessionApi({
    shipping_address_id,
    billing_address_id,
    shipping_method_id,
  });
  if (response.data?.success) {
    window.location.href = response.data.data.checkout_url;
    return;
  }
}
```

apiRoutes.js icinde:
```javascript
IYZICO_SESSION: '/checkout/pay-with-iyzico',
```

apiSlice.js icinde:
```javascript
iyzicoSessionApi: builder.mutation({
  query: (data) => ({
    url: apiRoutes.IYZICO_SESSION,
    method: 'POST',
    body: data,
  }),
}),
```

### 2.3 Admin Panel — Iyzico Ayar Formu

Admin panel frontend'inde (Shopo admin Blade template veya Next.js admin):

Iyzico ayar alanlari:
- **API Key** (text input)
- **Secret Key** (password input)
- **Test Modu** (toggle — sandbox/production)
- **Pazaryeri Modu** (toggle — sub-merchant destegi)
- **Varsayilan Sub-Merchant Key** (text, marketplace mode acikken gorunur)
- **Magaza Sub-Merchant Keys** (JSON textarea, marketplace mode acikken gorunur)
- **Durum** (toggle — aktif/pasif)

API endpoint: `PUT /api/admin/update-iyzico`

### 2.4 Guest Checkout Destegi (Opsiyonel — Faza 2 sonrasi)

Mevcut `CheckoutWithoutTokenController.php`'ye Iyzico entegrasyonu eklenebilir.
Simdilik sadece authenticated kullanici destegi yeterli.

---

## 3. Odeme Akisi

```
Kullanici Checkout Sayfasi
    |
    v
"Kredi Karti (Iyzico)" secenegini sec
    |
    v
"Siparisi Tamamla" butonuna tikla
    |
    v
Frontend → POST /api/user/checkout/pay-with-iyzico
    |       (shipping_address_id, billing_address_id, shipping_method_id)
    v
Backend: IyzicoController::createCheckoutSession()
    |   1. calculateCartTotal → toplam hesapla
    |   2. orderStore → draft order olustur (is_draft=1, payment_status=0)
    |   3. IyzicoService::createCheckoutForm → Iyzico API'ye istek
    |   4. checkout_url dondur
    v
Frontend: window.location.href = checkout_url
    |
    v
Iyzico Odeme Sayfasi (3D Secure dahil)
    |
    v
Basarili/Basarisiz → Iyzico redirect → /api/user/iyzico/callback?order_id=X&token=Y
    |
    v
Backend: IyzicoController::callback()
    |   1. retrieveCheckoutForm → odeme durumunu sorgula
    |   2. Basarili → order.payment_status=1, is_draft=0, mail gonder
    |   3. Basarisiz → order.payment_status=0
    v
Redirect → /order-success?order_id=X  veya  /payment-faild?order_id=X
```

---

## 4. Test Stratejisi (Sandbox)

### Sandbox Bilgileri
- Base URL: `https://sandbox-api.iyzipay.com`
- Test kartlari: Iyzico sandbox dokumantasyonundan
- Admin panelde `is_test_mode = 1` ayarla

### Test Senaryolari
1. Basarili odeme → order paid, redirect success
2. Basarisiz odeme (yetersiz bakiye) → order unpaid, redirect fail
3. 3D Secure redirect ve donus
4. Timeout / callback gelmeme durumu
5. Ayni order icin tekrar odeme denemesi (zaten paid kontrol)
6. Marketplace mode: sub-merchant key olmadan odeme → hata

---

## 5. Codex Uygulama Adimlari

1. `composer install` (iyzipay-php yukle)
2. `php artisan migrate` (iyzico_payments tablosu)
3. Frontend: `apiRoutes.js` + `apiSlice.js` + `PaymentMethods.jsx` + `usePlaceOrder.js`
4. Admin: Iyzico ayar formu (Blade veya React)
5. Sandbox testi

**Branch:** `feat/iyzico-payment`

---

## 6. Pazaryeri Modu Detay

Shopo bir pazaryeri — her urunun bir `vendor_id`'si var (satici).
Iyzico marketplace modunda:
- Her satici bir **sub-merchant** olarak tanimlanir
- Odeme yapildiginda Iyzico, satis tutarini satici alt hesabina yonlendirir
- Platform komisyon orani ayri hesaplanir (Faza 6'da)

IyzicoController::buildBasketItems() bu mantigi zaten icerir:
- `store_sub_merchant_keys` JSON'dan vendor_id bazli key cekilir
- Yoksa `sub_merchant_key` (varsayilan) kullanilir

Admin panelde her satici icin sub-merchant key tanimlanabilir.

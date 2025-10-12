Süper net anlattın—kodları tek tek inceledim. Sorunu özetleyeyim ve “çalışır hale getirmek” için adım adım düzeltmeleri, ufak kod yamalarıyla birlikte bırakayım. (İstersen backend denetimini de yaparım; şimdi FE/RTK akışındaki mantık hatalarını giderecek şekilde ilerliyorum.)

# Tanı: Nerede takılıyor?

1. **Sipariş → ödeme ayrımı flu**
   Şu an `CheakoutPage` siparişi oluşturuyor (`createOrder`) ve sonra `/payment` sayfasına gidip **oradan** ödeme intent’ini başlatıyor. Bu akış doğru; ama:

   * `createOrder` payload’ında tutar doğrulaması yapılmıyor (ör. `cart._numbers.total` yok).
   * `paymentMethod` FE’de “credit_card/paypal”, backend’de farklı yerlerde “card/wallet” bekleniyor. Çevrim bazı yerlerde doğru, bazı yerlerde eksik.

2. **Online/Offline mantık ayrımı eksikleri**
   `mapUiPaymentToApi` ile “credit_card | paypal | cash_on_delivery” ayrımı yapıyorsun; güzel. Fakat siparişi oluştururken **offline ödeme** (kapıda/banka) seçilmişse direkt success’e gitmen doğru; online ise **provider’ı ve return/cancel URL’lerini** güvenle `/payment` sayfasına taşıyorsun. Burada sorun: **orderId’nin** taşınması tamam, ama ödeme başlatılırken **idempotency** ve **provider/method** tutarlılığı her iki yolda aynı değil (Stripe/PayPal için).

3. **RTK servislerinde çift/karma endpointler**

   * `publicCart.api.js` dosyası projede **iki kez** var (aynı içerik). Bu, build’lerde nondeterministic davranışa neden olabilir.
   * Hem `orders` hem `payments` için **legacy** ve **new intents/** uçları birlikte var. Fallback iyi ama “ne zaman hangisi?” net olmalı.

4. **Session/tenant/i18n başlıkları**
   BaseQuery güzel (X-Tenant, Accept-Language, XSRF, credentials). Ancak **payment init** çağrılarına **Idempotency-Key** yalnız `order` tarafında konmuş; payments’ta da (özellikle `initCheckoutIntent`) öneririm.

5. **Ödeme sayfası ilk yükleme koşulu**
   `/payment` sayfası Stripe (card) için `useEffect` ile **hemen intent başlatıyor**. Doğru. Fakat:

   * `triedStripe` guard’ı var; provider değişince sıfırlıyorsun (iyi).
   * Stripe publishable key boş ise (env yoksa) net bir hata veriliyor; ama UI’da “geri dön” akışı yapılıyor mu? (Buton var, tamam.)

> Not: Bu akışı “FE’yi bozmadan tam entegrasyon” için tasarlamıştık; dokümana göre beklenenler bunlar. (Bkz. Checkout/Ödeme fazları ve durum makinesi notları.  )

---

# Hızlı Çözüm Paketi (minimum değişiklikle)

Aşağıdaki küçük yamalarla bug’ları kapatıp akışı stabil hale getirirsin.

## 1) `publicCart.api.js` yinelenmesini kaldır

Projede **tek** kopya kalsın. (Aksi halde IDE/intellisense ile farklı import path’lerinden iki servis yüklenebiliyor.)

## 2) `CheakoutPage` – sipariş oluştururken tutarı sabitle/validasyon ekle

Sipariş payload’ına cart toplamını (server yine hesaplayacak ama FE de taşısın) ekleyip backend ile kıyas için alan koy.

```diff
// CheakoutPage.jsx  (onPlace içinde)
  const orderItems = (cart?.items || []).map((it) => ({
    product: getProductId(it),
    productType: getProductType(it),
    quantity: Number(it.quantity || 1),
  }));

+ const cartNumbers = cart?._numbers || {};
+ const expectedAmount = Number(cartNumbers.total || 0);   // cents veya number

  const orderPayload = {
    serviceType,
    paymentMethod: apiPaymentMethod,  // "credit_card" | "paypal" | "cash_on_delivery"
    currency: pickCurrency(cart),
+   expectedAmount,                   // backend tarafında opsiyonel doğrulama
    items: orderItems,
    shippingAddress: { ... },
  };
```

> Backend’te `expectedAmount` varsa “tutar uyuşmazlığı” kontrolü yap; mismatch ise 409 döndür (fraud/yarım veriler). (Faz 2/3 planında yer veriyorduk. )

## 3) `CheakoutPage` – online ödeme yönlendirme paramlarını kesinleştir

Provider/method tutarlılığı:

```diff
// onPlace sonunda
- const provider = envProvider;
- const method = apiPaymentMethod; // "credit_card" | "paypal"
+ const provider = envProvider;    // ".env": 'stripe' | 'paypal' | 'iyzico' | 'paytr' | 'craftgate'
+ const method   = apiPaymentMethod; // FE canonical: 'credit_card' | 'paypal' | 'cash_on_delivery'

  const qs = new URLSearchParams({ orderId, provider, method }).toString();
  goSoft(navigate, `/payment?${qs}`);
  setTimeout(() => goHard(buildUrl(`/payment?${qs}`)), 0);
```

## 4) `/payment` – init çağrılarına idempotency anahtarı ekle

Aynı sayfayı tekrar yüklersen kaza ile “çift intent” oluşturma riskini azaltır.

```diff
// PaymentPage.jsx
  const [initCheckoutIntent] = useInitCheckoutIntentMutation();
  const [initLegacyIntent]   = useInitIntentByAmountMutation();

+ const idem = `pay-${orderId}-${method}-${provider}-${Date.now()}`;

  ...
  const r = await initCheckoutIntent({
-   data: { provider: "stripe", orderId, method: "card", returnUrl, cancelUrl, metadata: { source: "web", orderId } },
+   data: { provider: "stripe", orderId, method: "card", returnUrl, cancelUrl, metadata: { source: "web", orderId } },
+   idempotencyKey: idem,
  }).unwrap();
```

PayPal için de aynı (legacy fallback’te de ekleyebilirsin):

```diff
  const r2 = await initLegacyIntent({
    data: { provider: "paypal", orderId, method: "wallet", returnUrl, cancelUrl, metadata: { source: "web", orderId } },
- }).unwrap();
+   idempotencyKey: idem,
+ }).unwrap();
```

## 5) `/payment` – Stripe secret türleri için sırayı koru ve mesajları netleştir

Mantığın doğru; sadece kullanıcıya yol gösterici mesajı güçlendirelim.

```diff
{method === "credit_card" && provider === "stripe" && !checkoutSecret && !stripePISecret && (
-  <p className="text-sm text-qgray mb-4">
-    {loading ? "Ödeme hazırlanıyor…" : "Kart formu yüklenemedi."}
-  </p>
+  <div className="text-sm text-qgray mb-4">
+    {loading ? "Ödeme hazırlanıyor…" : "Kart formu yüklenemedi. Lütfen tekrar deneyin veya farklı bir sağlayıcı seçin."}
+  </div>
)}
```

## 6) `mapUiPaymentToApi` – bank transfer’ı “offline”a sabitle

Mevcut alias setin doğru; sipariş yaratırken offline branch’e düşmesini garanti ediyor.

(Değişiklik gerekmiyor; not düşüyorum: “bank/bank_transfer/eft/havale” → `cash_on_delivery`’e map’leniyor → offline.)

## 7) `publicPayments.api` – (opsiyonel) tek bir “initPaymentForOrder” helper export et

FE’yi sadeleştirmek için:

```js
// publicPayments.api.js (opsiyonel helper)
export const initPaymentForOrder = async ({ baseQuery, provider, orderId, method, returnUrl, cancelUrl, idempotencyKey }) => {
  // 1) yeni intents
  const r = await baseQuery({
    url: R.public.payments.$.custom("intents/checkout"),
    method: "POST",
    body: { provider, orderId, method, returnUrl, cancelUrl, metadata: { source: "web", orderId } },
    headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
  });
  if (!r.error) return r.data?.data ?? r.data;

  // 2) legacy fallback
  const r2 = await baseQuery({
    url: R.public.payments.$.custom("checkout"),
    method: "POST",
    body: { provider, orderId, method, returnUrl, cancelUrl, metadata: { source: "web", orderId } },
    headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
  });
  if (!r2.error) return r2.data?.data ?? r2.data;

  throw (r2.error || r.error);
};
```

Böylece `PaymentPage` içinde ikili try/catch yerine tek helper kullanırsın.

## 8) `CheakoutPage` – kupon uygulama sonra cart refetch akışını sabitle

Zaten yapmışsın; ufak iyileştirme:

```diff
const onApplyCoupon = async (code) => {
  try {
-   await applyPricing({ couponCode: code }).unwrap();
-   await refetchCart();
+   await applyPricing({ couponCode: String(code || "").trim() }).unwrap();
+   refetchCart(); // await şart değil
  } catch (e) {
    console.error("Coupon apply failed:", e);
    alert(e?.data?.message || "Coupon could not be applied.");
  }
};
```

## 9) `getProductType`/`normalizeProductType` uyumu

Sepete eklerken ve sipariş item’larında aynı “productType” değerlerini gönderdiğine emin ol. Şu an:

* Sepet mutasyonları `normalizeProductType` ile **("product" | "ensotekprod" | "sparepart" | "menuitem")** gönderiyor,
* Sipariş oluştururken `getProductType` sadece lower-case string dönüyor.

> **Öneri:** Sipariş item’larında da **aynı normalizer’ı** kullan:

```diff
// CheakoutPage.jsx
-import { ... } from "@/api-manage/api-call-functions/public/publicCart.api";
+import { normalizeProductType } from "@/api-manage/api-call-functions/public/publicCart.api"; // export et

...
  const orderItems = (cart?.items || []).map((it) => ({
    product: getProductId(it),
-   productType: getProductType(it),
+   productType: normalizeProductType(getProductType(it)),
    quantity: Number(it.quantity || 1),
  }));
```

(Bu fonksiyonu `export` etmen gerekir. Ya da aynı map’i buraya küçük kopya olarak yaz.)

## 10) `/payment` – PayPal başlat dizilimi

Şu an sadece hosted URL varsa yönlendiriyorsun. Legacy fallback var; tamam. Burada da (4)’teki `idempotencyKey` ekle.

---

# Test Planı (5 dakikalık duman testi)

1. **Offline ödeme** (kapıda):

   * Sepete ürün ekle → Checkout → “Kapıda/Banka” seç → “Place Order”.
   * **Beklenti:** `/order-success?orderId=...` yönlendirmesi; Order status “created”/“awaiting_payment” veya “pending_offline” (backend kuralına göre).

2. **Stripe Card**:

   * Aynı akış, “Kredi Kartı” seç → `/payment?orderId=...&provider=stripe&method=credit_card`.
   * **Beklenti:** a) Hosted Checkout’a yönlenir **ya da** b) Embedded Checkout (cs_) **ya da** Payment Element (pi_/seti_).
   * Ödeme onayı sonrası `returnUrl` → `/order-success?orderId=...`.

3. **PayPal**:

   * “PayPal” seç → `/payment?...&provider=paypal&method=paypal`.
   * **Beklenti:** PayPal hosted URL’e redirect.

4. **Idempotency**:

   * Payment sayfasını refresh et.
   * **Beklenti:** Yeni intent yaratmadan aynı akış.

5. **Tutar kontrolü (ops.)**:

   * Checkout’ta FE `expectedAmount` gönderdiğinde backend ile eşleşmeyen bir tutar simüle et (kupon değişikliği, stok fiyat farkı).
   * **Beklenti:** 409 veya benzeri “amount_mismatch”.

---

# Backend tarafı ile hizalama (kısa not)

* Order create → status: `awaiting_payment` (online), `pending_offline` (kapıda/banka).
* Payments `intents/checkout` body: `{ provider, orderId, method, returnUrl, cancelUrl, metadata }`.
* Webhook: başarılı ödeme → `order.status = 'paid'`; StockLedger ve timeline kaydı (Faz 4 dokümanındaki gibi). 

---

İstersen **Order controller** ve **Payments controller** dosyalarını da gönder; yukarıdaki FE düzeltmeleriyle birebir hizalayıp, idempotency + amount mismatch guard’larını ekleyeyim. Şu haliyle FE tarafında bu 10’lu yama paketi akışı çalışır, “kullanıcı sepetindeki ürünleri seçtiği ödeme yöntemiyle tamamlar” hedefini gerçekleştirir.

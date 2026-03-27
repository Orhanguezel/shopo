# AGENTS.md — Shopo (Seyfibaba Pazaryeri) Codex Talimatlari

## Proje
Shopo — Laravel 10 + Next.js 15 e-ticaret pazaryeri (seyfibaba.com)

## Stack
- **Backend:** Laravel 10, PHP 8.x, MySQL, Eloquent ORM
- **Frontend:** Next.js 15 (Pages/App Router), React, Redux Toolkit, Tailwind CSS
- **Test:** PHPUnit (backend), Jest/Vitest (frontend)

## Dizin Yapisi
```
shopo/
├── backend/                # Laravel 10
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Admin/      # Admin panel controller'lari
│   │   │   ├── User/       # Kullanici (checkout, profil, siparis)
│   │   │   ├── Seller/     # Satici paneli
│   │   │   └── Auth/       # Login, register, OTP
│   │   ├── Models/         # Eloquent modelleri
│   │   └── Middleware/     # CORS, XSS, Auth
│   ├── database/migrations/
│   ├── routes/api.php      # Tum API route'lari
│   └── config/
├── frontend/               # Next.js 15
│   ├── src/
│   │   ├── app/            # App Router sayfalari
│   │   ├── components/     # UI component'leri
│   │   ├── store/          # Redux store & slice'lar
│   │   └── services/       # API cagrilari (axios)
│   └── public/
└── YAPILACAKLAR.md         # Master checklist
```

## Kodlama Kurallari
- Laravel convention'lari: Resource controller, Form Request, Policy
- Frontend: Component bazli yapi, her component kendi dizininde
- Redux slice'lar: `frontend/src/store/` altinda
- API servisleri: `frontend/src/services/` altinda axios instance ile
- Turkce degisken/yorum KULLANMA, Ingilizce kod yaz
- `whishlist` → `wishlist` typo'sunu gordugunde duzelt

## Gorev Atama Tablosu (2026-03-26)

Asagidaki gorevler oncelik sirasina gore atanmistir. Her gorev icin plan dokumani hazirdir — **ise baslamadan once ilgili plan dokumanini oku**.

### ~~GOREV 1: SMS/OTP Kayit Sistemi~~ TAMAMLANDI
- **Branch:** `feat/sms-otp`
- **Durum:** Backend + frontend tamamlandi. `.env` API key bekliyor.
- **Kapsam:**
  1. Migration: `otp_verifications` tablosu (plan bolum 2)
  2. Model: `OtpVerification.php`
  3. Interface: `SmsServiceInterface.php` + `IletimMerkeziService.php` (plan bolum 4)
  4. Controller: `OtpController.php` — send, verify, resend (plan bolum 3)
  5. Routes + rate limiting (plan bolum 3 — rate limit kurallari)
  6. Config: `config/sms.php` + `.env` degiskenleri (plan bolum 7)
  7. Frontend: `OtpVerifyStep.jsx` component (plan bolum 5)
  8. Frontend: `SignupWidget.jsx`'e OTP adimi entegre et
- **Test:** Basarili OTP, suresi dolmus OTP, yanlis kod, rate limit
- **YAPILACAKLAR.md:** Bolum #2

### GOREV 2: Eksik Sayfalar & Hata Duzeltmeleri
- **Branch:** `fix/missing-pages`
- **Kapsam:**
  1. Urun detay sayfasi null kontrolleri + variant secimi fix
  2. Fiyat/marka/kategori filtre sorunlari
  3. Satici dukkan sayfasi (`/seller/[slug]`) — tam profil
  4. Siparis takip sayfasi dogrulama
  5. Payment fail sayfasi — detayli hata mesajlari
  6. `products-compaire` → `products-compare` typo fix (URL + metadata)
- **YAPILACAKLAR.md:** Bolum #4

### ~~GOREV 3: Komisyon Sistemi~~ TAMAMLANDI
- **Branch:** `feat/commission-system`
- **Durum:** Backend + Admin panel + Vendor panel tamamlandi.
- **Tamamlanan:**
  1. Migration'lar: settings, vendors, order_products, commission_ledger (4 migration + notes kolonu)
  2. Model: `CommissionLedger.php`, `OrderProduct.php` (fillable + iliski), `Vendor.php` (getEffectiveCommissionRate), `Setting.php` (default_commission_rate)
  3. Service: `CommissionService.php` — recordCommission, settleCommissions, getSellerBalance, recordReturn
  4. Controller: PaymentController (orderStore icinde komisyon kaydı), WithdrawController (bakiye hesabi), OrderController (settle), Admin CommissionController
  5. Admin panel: Komisyon ayarlari + rapor sayfasi (Blade views + sidebar link)
  6. Vendor panel: SellerDashboardController seller_net_amount kullaniyor (geriye uyumlu)
- **YAPILACAKLAR.md:** Bolum #6

### ~~GOREV 4: Iade Talep Sistemi~~ TAMAMLANDI
- **Branch:** `feat/return-requests`
- **Durum:** Backend + Admin panel + User frontend tamamlandi.
- **YAPILACAKLAR.md:** Bolum #6

### ~~GOREV 5: SEO Implementasyonu~~ TAMAMLANDI
- **Branch:** `feat/seo-optimization`
- **Durum:** Buyuk kismi tamamlandi. Kalan: `(website)/layout.js` "use client" kaldirma (yuksek risk, ayri PR).
- **Tamamlanan:**
  1. Font migration: `next/font/local` ile Inter fontu (9 agirlik, swap)
  2. JSON-LD: aggregateRating, BreadcrumbList, WebSite+SearchAction, FAQ, ItemList (JsonLd.jsx)
  3. Sitemap: `generateSitemaps()` ile urun + satici URL'leri (backend API + frontend)
  4. Robots: `public/robots.txt` → `src/app/robots.js` (dinamik, 17 Disallow)
  5. Meta: OG images, Twitter images, viewport export, locale tr_TR
  6. Gorseller: Header logo x2, BestSellers, BrandSection → `next/image` (priority)
  7. Backend: `GET /api/products/sitemap`, `/products/count`, `/sellers/sitemap`
- **Kalan (dusuk oncelik):**
  - `(website)/layout.js` "use client" kaldir (breaking change riski)
  - `[slug]/page.js` server component + generateMetadata
  - Kalan 4 `<img>` → `next/image` (AllProductPage, Sellers, Selectbox, ErrorTemp)
  - 21 sayfaya canonical URL

### ~~GOREV 6: Guvenlik Ek Duzeltmeler~~ TAMAMLANDI
- **Durum:** 3/3 tamamlandi.
- **Tamamlanan:**
  1. Iyzico callback `throttle:10,1` rate limiting eklendi
  2. Replay korumasi: `payment_status == 1` kontrolu (zaten odenmis siparis tekrar islenmez)
  3. `VerifyCsrfToken.php` except listesi temizlendi (Razorpay kaldirildi)

## Oncelik Sirasi (Codex icin)
1. ~~Guvenlik duzeltmeleri (CORS, middleware, rate limiting)~~ TAMAMLANDI
2. ~~Iyzico pazaryeri odeme entegrasyonu~~ TAMAMLANDI
3. ~~SMS OTP kayit sistemi~~ TAMAMLANDI
4. ~~Eksik sayfa ve hata duzeltmeleri~~ → **GOREV 2** TAMAMLANDI
5. ~~Pazaryeri eksikleri (komisyon, iade)~~ → **GOREV 3 + 4** TAMAMLANDI
6. ~~SEO implementasyonu~~ → **GOREV 5** TAMAMLANDI
7. ~~Guvenlik ek duzeltmeler~~ → **GOREV 6** TAMAMLANDI
8. Sizma testi → Son asama

---

## FAZA 2 — KALAN GOREVLER (2026-03-26)

Tum temel gorevler (1-6) tamamlandi. Asagidaki isler production'a cikis oncesi son adimlardir.

### CLAUDE CODE (Mimar & Stratejist)

| # | Gorev | YAPILACAKLAR Ref | Oncelik |
|---|-------|------------------|---------|
| C1 | **Sizma testi stratejisi** — OWASP Top 10 kontrol listesi hazirla, test plani yaz (`docs/pentest-plan.md`) | #10 | YUKSEK |
| C2 | **Production deployment plani** — `.env` production config, Nginx config, PM2 ecosystem, domain DNS ayarlari | Genel | YUKSEK |
| C3 | ~~**V2 mimari plan**~~ TAMAMLANDI → `docs/v2-architecture-plan.md` (KYC DB+API, stok uyari Observer, CSV import Maatwebsite) | #6 | DUSUK |
| C4 | ~~**SEO kalan mimari**~~ TAMAMLANDI → `docs/seo-layout-strategy.md` (DefaultLayoutClient ayirma stratejisi, risk/fayda analizi) | #3 | ORTA |
| C5 | ~~**Firebase karar**~~ TAMAMLANDI — Kullanilmiyor, `firebase` paketi kaldirildi, `firebase_info` temizlendi | #9 | DUSUK |

### CODEX (Kod Implementasyonu)

| # | Gorev | YAPILACAKLAR Ref | Oncelik |
|---|-------|------------------|---------|
| X1 | **Demo veri temizligi** — DB'deki eski referanslari temizle (migration veya seeder) | #9 | ORTA |
| X2 | **Pusher entegrasyon fix** — Satici mesajlasma Pusher baglantisini dogrula ve duzelt | #9 | ORTA |
| X3 | ~~**Google Maps entegrasyonu**~~ TAMAMLANDI — Zaten tam implemente (MapComponent, MapShow, AddressForm, lat/lng). Admin panelden API key girilmeli | #9 | DUSUK |
| X4 | ~~**SEO kalan img fix**~~ TAMAMLANDI — Son 2 raw `<img>` (BlogCard, BlogDetails) → `next/image` ile degistirildi. Diger 4 zaten fix'lenmis | #3 | DUSUK |
| X5 | ~~**SEO canonical URL'ler**~~ TAMAMLANDI — 21/21 sayfa zaten canonical URL'ye sahip (generateMetadata ile) | #3 | DUSUK |
| X6 | ~~**Sizma testi kodlama**~~ TAMAMLANDI → `tests/security/pentest-scripts.sh` — A01/A03/A04/A05/A07/A08/A10/CORS/File Upload otomasyonu | #10 | YUKSEK |

### ANTIGRAVITY (UI/UX Dogrulama & Test)

| # | Gorev | YAPILACAKLAR Ref | Oncelik |
|---|-------|------------------|---------|
| A1 | **Admin panel tam testi** — 10 madde: erisim, dashboard, urun CRUD, kategori, siparis, satici onay, odeme ayarlari, email template, dil yonetimi, settings | #5 | YUKSEK |
| A2 | **Lighthouse audit** — Tum ana sayfalarda (home, product, seller, blog, cart, checkout) Lighthouse + Core Web Vitals olcumu | #3 | YUKSEK |
| A3 | **Bot simulator testi** — SEO uzmaninin onerdigi araclarla (totheweb, webmasterblog) bot gorunumu test et | #3 | ORTA |
| A4 | **Iyzico odeme akisi testi** — Sandbox'ta tam checkout: urun sec → sepet → adres → Iyzico → 3D Secure → basarili/basarisiz | #1 | YUKSEK |
| A5 | **OTP kayit akisi testi** — Yeni kullanici: form doldur → OTP gonder → dogrula → kayit tamamla | #2 | YUKSEK |
| A6 | **Iade talep akisi testi** — Kullanici iade talebi → Satici onay/red → Admin mudahale | #6 | ORTA |
| A7 | **Sizma testi UI** — XSS (stored/reflected/DOM), CSRF, IDOR testleri tarayicidan | #10 | YUKSEK (C1'den sonra) |
| A8 | **Responsive test** — Mobil/tablet/desktop tum ana sayfalarda gorsel kontrol | Genel | ORTA |

### IS AKISI

```
Faza 2 Siralama:
─────────────────────────────────────────────────────
 PARALEL BLOK 1 (hemen basla):
   Claude Code → C1 (pentest plan) + C2 (deployment plan)
   Codex       → X1 (demo veri) + X2 (Pusher fix)
   Antigravity → A1 (admin panel) + A2 (Lighthouse) + A4 (Iyzico test) + A5 (OTP test)

 PARALEL BLOK 2 (Blok 1 tamamlaninca):
   Claude Code → C3 (V2 mimari) + C4 (SEO layout) + C5 (Firebase karar)
   Codex       → X3 (Maps) + X4 (img fix) + X5 (canonical) + X6 (pentest scripts)
   Antigravity → A3 (bot sim) + A6 (iade test) + A7 (pentest UI) + A8 (responsive)
─────────────────────────────────────────────────────
```

## Branch Stratejisi
```
main
├── security/cors-fix             ← TAMAMLANDI
├── security/admin-middleware      ← TAMAMLANDI
├── security/rate-limiting         ← TAMAMLANDI
├── feat/iyzico-payment            ← TAMAMLANDI
├── refactor/remove-unused-payment ← TAMAMLANDI
├── feat/sms-otp                   ← TAMAMLANDI
├── fix/missing-pages              ← TAMAMLANDI (GOREV 2)
├── feat/commission-system         ← TAMAMLANDI (GOREV 3)
├── feat/return-requests           ← TAMAMLANDI (GOREV 4)
├── feat/seo-optimization          ← TAMAMLANDI (GOREV 5)
├── security/callback-hardening    ← TAMAMLANDI (GOREV 6)
│
│  FAZA 2:
├── chore/demo-data-cleanup        ← Codex X1
├── fix/pusher-messaging           ← Codex X2
├── feat/google-maps               ← Codex X3
├── fix/seo-remaining              ← Codex X4 + X5
└── security/pentest               ← Codex X6
```

## Cakisma Onleme
- `CLAUDE.md`, `AGENTS.md`, `YAPILACAKLAR.md` degistirme — Claude Code'un isi
- `project.portfolio.json` — sadece Claude Code
- **Kod yazarken plan dosyasini (`docs/*.md`) MUTLAKA once oku** — plan okumadan kod yazma
- PR actiktan sonra Antigravity dogrular
- Ayni anda sadece 1 gorev uzerinde calis — gorev tamamlaninca sonrakine gec

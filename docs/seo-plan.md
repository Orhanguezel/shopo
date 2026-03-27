# SEO Teknik Strateji — Mimari Plan

**Hazirlayan:** Claude Code (Mimar)
**Tarih:** 2026-03-26
**Oncelik:** Faza 7
**Proje:** Shopo (Seyfibaba Pazaryeri) — Next.js 15 App Router Frontend
**Domain:** seyfibaba.com

---

## 1. Mevcut Durum

### 1.1 Var Olan Yapilar

| Ozellik | Durum | Dosya |
|---------|-------|-------|
| `generateMetadata` (root layout) | Mevcut | `src/app/layout.js` (satir 13-38) |
| `metadataBase` | Dogru tanimli | `appConfig.APPLICATION_URL` uzerinden |
| `title.template` | Mevcut | `%s \| Shopo` formati |
| `openGraph` (temel) | Mevcut ama eksik | `type`, `siteName`, `title`, `description` var; `images` yok |
| `twitter` card | Mevcut ama eksik | `summary_large_image` var; `images` yok |
| `html lang="tr"` | Dogru | Root layout satir 42 |
| `sitemap.js` | Mevcut ama eksik | `src/app/sitemap.js` — statik sayfalar ve kategoriler var |
| `robots.txt` | Mevcut ama eksik | `public/robots.txt` — bazi auth route'lar eksik |
| Product JSON-LD | Mevcut ama eksik | `JsonLd.jsx` — `aggregateRating` yok |
| Organization JSON-LD | Mevcut ama placeholder | `JsonLd.jsx` — telefon ve sosyal URL'ler sahte |
| Canonical URL | Sadece 2 sayfada | `/` ve `/single-product` |
| `next/image` | 35 dosyada mevcut | Ancak 8 yerde ham `<img>` var |
| `next/font` | Kullanilmiyor | 9 agirlik `@font-face` ile `globals.css`'de |

### 1.2 Kritik Sorunlar (Audit Bulgulari)

1. **`(website)/layout.js` satirinda `"use client"` deklarasyonu** — Tum website route group'u client component olarak calisiyor. Bot'lar icerik yerine bos hydration shell aliyor.
2. **`[slug]/page.js` (CMS sayfalari) `"use client"` ve `generateMetadata` yok** — Admin panelinden olusturulan tum ozel sayfalar arama motorlarina gorunmuyor.
3. **Urun sayfalari `sitemap.js`'de yok** — Google bireysel urunleri sitemap uzerinden kesfedemiyor.
4. **`aggregateRating` Product schema'da yok** — Google arama sonuclarinda yildiz puani gosterilemiyor.
5. **23 sayfanin 21'inde canonical URL tanimli degil** — Filtreleme parametreleri ile tekrar icerik (duplicate content) riski.
6. **`font-display` tanimli degil, `next/font` kullanilmiyor** — FOIT, LCP ve CLS skoru olumsuz etkileniyor.
7. **`openGraph.images` ve `twitter.images` hicbir yerde tanimli degil** — Sosyal medya paylasimlari onsizlemesiz (preview image yok).
8. **8 yerde ham `<img>` etiketi** — WebP/AVIF donusumu, lazy loading ve CLS onleme atlaniyor.

---

## 2. JSON-LD Semalari

### 2.1 Product Schema (Guncelleme)

**Dosya:** `src/components/Helpers/JsonLd.jsx` — `generateProductSchema` fonksiyonu

Mevcut alanlar korunacak. Eklenmesi gereken alanlar:

```json
{
  "@type": "Product",
  "name": "...",
  "image": "...",
  "description": "...",
  "sku": "...",
  "brand": { "@type": "Brand", "name": "..." },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.5,
    "reviewCount": 23,
    "bestRating": 5,
    "worstRating": 1
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "..." },
      "reviewRating": { "@type": "Rating", "ratingValue": 5 },
      "reviewBody": "..."
    }
  ],
  "offers": {
    "@type": "Offer",
    "url": "dinamik-url-appConfig'den",
    "priceCurrency": "TRY",
    "price": "...",
    "priceValidUntil": "dinamik-tarih",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "satici-adi"
    }
  }
}
```

**Dikkat edilecekler:**
- `priceValidUntil` suan `"2026-12-31"` olarak hardcoded. Dinamik olmali (urun bitis tarihi veya +1 yil).
- `offers.url` suan `https://seyfibaba.com` hardcoded. `appConfig.APPLICATION_URL` kullanilmali.
- `aggregateRating` verileri urun API'sinden cekilecek (`reviews` array'inden hesaplanacak).
- Yorum yoksa `aggregateRating` alani JSON-LD'ye eklenmemeli (Google bos rating'i reddeder).

### 2.2 Organization Schema (Guncelleme)

**Dosya:** `src/components/Helpers/JsonLd.jsx` — `generateOrganizationSchema` fonksiyonu

Mevcut placeholder degerlerin gercek verilerle degistirilmesi gerekiyor:

```json
{
  "@type": "Organization",
  "name": "Seyfibaba",
  "url": "https://seyfibaba.com",
  "logo": "https://admin.seyfibaba.com/uploads/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+90-XXX-XXX-XXXX",
    "contactType": "customer service",
    "areaServed": "TR",
    "availableLanguage": "Turkish"
  },
  "sameAs": [
    "https://facebook.com/seyfibaba",
    "https://instagram.com/seyfibaba",
    "https://twitter.com/seyfibaba"
  ]
}
```

**Aksiyon:** Placeholder telefon ve sosyal medya URL'leri musteri tarafindan onaylanmali. Sahte degerler Google'in schema guvenilirlik skorunu dusurur.

### 2.3 BreadcrumbList Schema (Yeni)

**Eklenecek sayfa:** Tum sayfalarda visual breadcrumb bulunan her yere JSON-LD karsiligi eklenecek.

**Oncelikli sayfalar:**
- `/single-product` — Anasayfa > Kategori > Urun Adi
- `/products` — Anasayfa > Urunler (> Kategori filtresi)
- `/sellers` — Anasayfa > Saticilar
- `/seller-products` — Anasayfa > Saticilar > Satici Adi
- `/about`, `/contact`, `/faq` — Anasayfa > Sayfa Adi

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Anasayfa",
      "item": "https://seyfibaba.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Elektronik",
      "item": "https://seyfibaba.com/products?category=elektronik"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Urun Adi"
    }
  ]
}
```

**Uygulama yontemi:** `JsonLd.jsx` icinde `generateBreadcrumbSchema(items)` fonksiyonu olusturulacak. Her sayfanin `page.js` dosyasindan breadcrumb dizisi gecilecek.

### 2.4 FAQ Schema (Yeni)

**Eklenecek sayfa:** `/faq`

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Soru metni",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cevap metni"
      }
    }
  ]
}
```

**Aksiyon:** FAQ verileri backend API'sinden geliyorsa, `generateMetadata` veya server component icinde cekilip schema'ya donusturulecek.

### 2.5 WebSite Schema (Yeni — Anasayfa)

Anasayfaya `WebSite` schema'si eklenerek Google Sitelinks Searchbox ozelliginin aktif edilmesi:

```json
{
  "@type": "WebSite",
  "name": "Seyfibaba",
  "url": "https://seyfibaba.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://seyfibaba.com/search?search={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### 2.6 ItemList Schema (Yeni — Listeleme Sayfalari)

**Eklenecek sayfalar:** `/products`, `/search`, `/flash-sale`

```json
{
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://seyfibaba.com/single-product?slug=urun-slug"
    }
  ]
}
```

---

## 3. Sitemap Stratejisi

### 3.1 Mevcut Durum

Dosya: `src/app/sitemap.js`

- Statik sayfalar: `/`, `/products`, `/about`, `/contact`, `/faq`, `/terms-condition`, `/privacy-policy`
- Kategori sayfalari: `/products?category={slug}` formatinda
- **Eksik:** Bireysel urun sayfalari, satici sayfalari, flash-sale

### 3.2 Hedef Yapi

Sitemap'in genisletilmis versiyonu:

```
sitemap.xml (index)
├── /sitemap/static — Statik sayfalar (10-15 URL)
├── /sitemap/products — Tum urunler (dinamik, sayfalanmis)
├── /sitemap/categories — Tum kategoriler
├── /sitemap/sellers — Tum satici profilleri
└── /sitemap/flash-sale — Aktif flash-sale urunleri
```

### 3.3 Uygulama Plani

**Secenek A (Tek dosya — Mevcut yapiyi genislet):**
- `sitemap.js` icine urun ve satici URL'leri eklenir.
- Backend'den tum aktif urun slug'larini ceken API endpoint gerekir.
- 1000'den az urun icin uygun.

**Secenek B (Sitemap Index — Olceklenebilir):**
- `src/app/sitemap.js` dosyasi `generateSitemaps()` fonksiyonu ile birden fazla sitemap dosyasi uretir.
- Next.js 15 App Router bu yontemi native destekler.
- 1000+ urun icin zorunlu.

**Onerilen:** Secenek B. Pazaryeri modeli oldugu icin urun sayisi hizla artacaktir.

```javascript
// src/app/sitemap.js — Ornek yapi
export async function generateSitemaps() {
  const productCount = await getProductCount();
  const pages = Math.ceil(productCount / 1000);
  return Array.from({ length: pages }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }) {
  const start = id * 1000;
  const products = await getProducts({ offset: start, limit: 1000 });
  return products.map((product) => ({
    url: `https://seyfibaba.com/single-product?slug=${product.slug}`,
    lastModified: product.updated_at,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));
}
```

### 3.4 Backend API Gereksinimleri

Sitemap icin backend'de su endpoint'ler gereklidir:

| Endpoint | Donus | Kullanim |
|----------|-------|----------|
| `GET /api/products/sitemap` | `[{slug, updated_at}]` | Urun sitemap |
| `GET /api/products/count` | `{count: N}` | Sitemap sayfalama |
| `GET /api/sellers/sitemap` | `[{slug, updated_at}]` | Satici sitemap |

Bu endpoint'ler sadece slug ve tarih donmeli, agir veri tasimamali.

---

## 4. Robots.txt

### 4.1 Mevcut Durum

Dosya: `public/robots.txt`

Mevcut Disallow listesi: `/cart`, `/checkout`, `/payment-faild`

### 4.2 Hedef Icerik

```
User-agent: *
Allow: /

# Auth-gated ve kisisel sayfalar
Disallow: /cart
Disallow: /checkout
Disallow: /payment-faild
Disallow: /profile
Disallow: /tracking-order
Disallow: /wishlist
Disallow: /become-seller
Disallow: /products-compaire
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /verify-you

# Filtreleme duplicate'larini engelle
Disallow: /search?*
Disallow: /products?brand=*
Disallow: /products?highlight=*

# API route'lari
Disallow: /api/

# Sitemap referansi
Sitemap: https://seyfibaba.com/sitemap.xml
```

### 4.3 Alternatif: App Router `robots.js`

`public/robots.txt` yerine `src/app/robots.js` kullanilabilir. Avantaji: dinamik olarak `appConfig.APPLICATION_URL` okunabilir, hardcoded domain gerektirmez.

```javascript
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: [...] },
    sitemap: `${appConfig.APPLICATION_URL}/sitemap.xml`,
  };
}
```

**Oneri:** `robots.js` yaklasimina gecilmeli. `public/robots.txt` kaldirilmali.

---

## 5. Meta Tag Optimizasyonu

### 5.1 Open Graph

**Root layout guncellemesi** (`src/app/layout.js`):

```javascript
openGraph: {
  type: "website",
  siteName: "Seyfibaba",
  title: seo_title,
  description: seo_description,
  url: appConfig.APPLICATION_URL,
  locale: "tr_TR",
  images: [
    {
      url: `${appConfig.BASE_URL}/uploads/og-default.jpg`,
      width: 1200,
      height: 630,
      alt: "Seyfibaba Pazaryeri",
    },
  ],
},
```

**Urun sayfasi guncellemesi** (`single-product/page.js`):

```javascript
openGraph: {
  type: "product",
  title: product.seo_title || product.name,
  description: product.seo_description,
  url: `${appConfig.APPLICATION_URL}/single-product?slug=${slug}`,
  images: [
    {
      url: `${appConfig.BASE_URL}/${product.thumb_image}`,
      width: 800,
      height: 800,
      alt: product.name,
    },
  ],
},
```

### 5.2 Twitter Cards

Her sayfada `twitter` metadata'si `openGraph` ile paralel tutulmali:

```javascript
twitter: {
  card: "summary_large_image",
  title: seo_title,
  description: seo_description,
  images: [`${appConfig.BASE_URL}/uploads/og-default.jpg`],
},
```

### 5.3 Canonical URL Stratejisi

Tum 23 sayfaya canonical URL eklenmeli. Kural:

- Statik sayfalar: `/about`, `/contact`, `/faq` vb. → `alternates: { canonical: "/about" }`
- Filtreleme sayfalari: `/products` → canonical her zaman `/products` (query parametreleri haric)
- Urun sayfalari: `/single-product?slug=X` → canonical tam URL
- CMS sayfalari (`[slug]`): `alternates: { canonical: "/${slug}" }`

**Oncelik sirasi:** Ilk olarak `/products`, `/search`, `/sellers`, `/seller-products` sayfalarinda canonical tanimlanmali (duplicate content riski en yuksek).

### 5.4 Viewport Export

Root layout'a `viewport` export eklenmeli:

```javascript
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};
```

---

## 6. Core Web Vitals

### 6.1 LCP (Largest Contentful Paint) Iyilestirmeleri

| Sorun | Etki | Cozum |
|-------|------|-------|
| Font FOIT | Yuksek | `next/font/local` ile font yukleme, `font-display: swap` |
| Ham `<img>` site logosu | Orta | `next/image` ile `priority` prop (above-the-fold) |
| CSS render-blocking | Orta | `@font-face` kurallarini `next/font` ile degistir |

**Font Migration Plani:**

```javascript
// src/app/layout.js
import localFont from 'next/font/local';

const inter = localFont({
  src: [
    { path: '../assets/fonts/Inter-Regular.woff2', weight: '400' },
    { path: '../assets/fonts/Inter-Medium.woff2', weight: '500' },
    { path: '../assets/fonts/Inter-SemiBold.woff2', weight: '600' },
    { path: '../assets/fonts/Inter-Bold.woff2', weight: '700' },
  ],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  variable: '--font-inter',
});
```

`globals.css` icindeki 9 `@font-face` deklarasyonu kaldirilacak.

### 6.2 FID / INP (Interaction to Next Paint) Iyilestirmeleri

| Sorun | Etki | Cozum |
|-------|------|-------|
| `(website)/layout.js` `"use client"` | Kritik | Server component'e donustur |
| Tum website tek client subtree | Yuksek | Layout'u server component yap, interactive parcalari ayir |
| AOS (animate on scroll) library | Orta | Lazy init, sadece gorunur alanlarda calistir |

**`(website)/layout.js` Refactor Plani:**

1. `"use client"` deklarasyonunu kaldir
2. Layout icindeki interaktif parcalari (header dropdown, mobile menu, cart icon) ayri client component'lere tasi
3. Header, Footer, CategoryBar gibi componentleri server component olarak yeniden yaz
4. Sadece state/event gerektiren alt componentler `"use client"` olarak kalsin

### 6.3 CLS (Cumulative Layout Shift) Iyilestirmeleri

| Sorun | Etki | Cozum |
|-------|------|-------|
| Font yukleme kaymasi | Yuksek | `next/font` ile `size-adjust` otomatik fallback |
| Ham `<img>` boyut belirtilmemis | Orta | `next/image` ile `width`/`height` zorunlu |
| Logo boyutlari | Orta | Header logo icin sabit `width`/`height` tanimla |

---

## 7. Gorsel Optimizasyonu

### 7.1 next/image Migrasyon Listesi

Asagidaki 8 dosyada ham `<img>` etiketleri `next/image` (`Image`) component'ine donusturulecek:

| # | Dosya | Satir | Icerik | Oncelik |
|---|-------|-------|--------|---------|
| 1 | `components/Partials/Headers/Header/index.jsx` | 70 | Site logo | Kritik |
| 2 | `components/Partials/Headers/Header/Middlebar.jsx` | 94 | Site logo (varyant) | Kritik |
| 3 | `components/Home/BestSellers.jsx` | 22 | Satici logo | Yuksek |
| 4 | `components/Home/BrandSection.jsx` | 30 | Marka logo | Yuksek |
| 5 | `components/AllProductPage/index.jsx` | 915 | Satici logo (listeleme) | Yuksek |
| 6 | `components/Sellers/index.jsx` | 188 | Satici logo | Yuksek |
| 7 | `components/Helpers/Selectbox/index.jsx` | 63 | Ulke bayrak resmi | Dusuk |
| 8 | `components/ApplicationErrorTemp/index.jsx` | 14 | Hata illustrasyon | Dusuk |

### 7.2 Image Optimization Kurallari

- **Above-the-fold gorseller:** `priority={true}` prop ekle (logo, hero banner)
- **Below-the-fold gorseller:** `loading="lazy"` (varsayilan davranis)
- **Format:** `next/image` otomatik WebP/AVIF servisi yapar; ek ayar gerekmez
- **Boyutlar:** Her `Image` componentine `width` ve `height` prop zorunlu (CLS onleme)
- **Alt text:** Bos `alt=""` yerine aciklayici text (ozellikle urun gorselleri ve logolar)

### 7.3 next.config.mjs Image Domain

Mevcut `remotePatterns` sadece `admin.seyfibaba.com` iceriyor. Eger CDN veya baska domain'lerden gorsel geliyorsa eklenmeli:

```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'admin.seyfibaba.com' },
    // Gerekirse ek domain'ler:
    // { protocol: 'https', hostname: 'cdn.seyfibaba.com' },
  ],
  formats: ['image/avif', 'image/webp'],
},
```

---

## 8. Codex Uygulama Adimlari

Asagidaki gorevler Codex'e atanacaktir. Siralama oncelik ve bagimlilik sirasina goredir.

### Adim 1 — Kritik SSR Duzeltmeleri (Blocker)

- [ ] `src/app/(website)/layout.js` — `"use client"` kaldir, server component'e cevir
- [ ] Header, Footer, CategoryBar componentlerini server/client olarak ayir
- [ ] `src/app/(website)/[slug]/page.js` — `"use client"` kaldir, `generateMetadata` ekle

### Adim 2 — Font Migration

- [ ] `src/app/layout.js` — `next/font/local` ile Inter fontunu yukle
- [ ] `src/app/globals.css` — 9 adet `@font-face` deklarasyonunu kaldir
- [ ] Font variable'i `<body>` class'ina ekle

### Adim 3 — JSON-LD Semalari

- [ ] `JsonLd.jsx` — `generateProductSchema` icine `aggregateRating` ve `review` ekle
- [ ] `JsonLd.jsx` — `priceValidUntil` dinamik yap
- [ ] `JsonLd.jsx` — `offers.url` icin `appConfig.APPLICATION_URL` kullan
- [ ] `JsonLd.jsx` — `generateBreadcrumbSchema(items)` fonksiyonu olustur
- [ ] `JsonLd.jsx` — `generateFAQSchema(items)` fonksiyonu olustur
- [ ] `JsonLd.jsx` — `generateWebSiteSchema()` fonksiyonu olustur
- [ ] `JsonLd.jsx` — `generateItemListSchema(products)` fonksiyonu olustur
- [ ] Ilgili sayfalara BreadcrumbList JSON-LD ekle (single-product, products, sellers, about, contact, faq)
- [ ] `/faq/page.js` — FAQ schema entegrasyonu
- [ ] `/page.js` (anasayfa) — WebSite schema entegrasyonu
- [ ] `/products/page.js` ve `/search/page.js` — ItemList schema entegrasyonu
- [ ] Organization schema'daki placeholder verileri gercek verilerle degistir (musteri onayindan sonra)

### Adim 4 — Sitemap Genisletme

- [x] `src/app/sitemap.js` — `generateSitemaps()` fonksiyonu ile sitemap index yapi
- [x] Urun URL'lerini sitemap'e ekle (backend API endpoint gerekli)
- [x] Satici URL'lerini sitemap'e ekle
- [x] Flash-sale URL'lerini sitemap'e ekle
- [x] Backend: `GET /api/products/sitemap` endpoint olustur (slug + updated_at)
- [x] Backend: `GET /api/sellers/sitemap` endpoint olustur

### Adim 5 — Robots.txt

- [x] `public/robots.txt` kaldir
- [x] `src/app/robots.js` olustur (dinamik, appConfig'den URL oku)
- [x] Auth-gated route'lari Disallow listesine ekle
- [x] `/search`, `/api/` yollarini Disallow'a ekle

### Adim 6 — Meta Tag ve Canonical

- [x] Root layout `openGraph.images` ekle (varsayilan OG resmi)
- [x] Root layout `twitter.images` ekle
- [x] Root layout `viewport` export ekle
- [x] `single-product/page.js` — `openGraph.images` urun gorseli ile doldur
- [x] `single-product/page.js` — `twitter.images` urun gorseli ile doldur
- [x] 21 sayfaya canonical URL ekle (oncelik: products, search, sellers, seller-products)
- [x] Cart, checkout, login, signup sayfalarinin metadata'sini Turkce yap
- [x] `products-compaire` typo'sunu `products-compare` olarak duzelt (URL + metadata)

### Adim 7 — Gorsel Optimizasyonu

- [x] 8 dosyadaki ham `<img>` etiketlerini `next/image` ile degistir (liste: Bolum 7.1)
- [x] Header logo'larina `priority={true}` ekle
- [x] Tum `Image` componentlerinde `alt` text'lerini kontrol et ve duzelt
- [x] `next.config.mjs` — `formats: ['image/avif', 'image/webp']` ekle

### Adim 8 — Ek Iyilestirmeler (Dusuk Oncelik)

- [x] Root metadata'ya `apple-touch-icon` ekle
- [x] `next.config.mjs` — HTTP security headers ekle (`X-Content-Type-Options`, `Referrer-Policy` vb.)
- [x] Seller profil sayfalarina `Person`/`Organization` schema ekle
- [x] `llms.txt` dosyasi olustur (AI crawler rehberligi)

---

## Dogrulama Kriterleri (Antigravity)

Her adim tamamlandiktan sonra Antigravity ile dogrulama yapilacak:

1. **Google Rich Results Test** — Product, BreadcrumbList, FAQ, Organization, WebSite schemalarinin gecerliligi
2. **Lighthouse SEO skoru** — Hedef: 95+
3. **Lighthouse Performance skoru** — LCP < 2.5s, CLS < 0.1, INP < 200ms
4. **Facebook Sharing Debugger** — OG image onizlemesi gorunuyor mu
5. **Twitter Card Validator** — Kart onizlemesi gorunuyor mu
6. **Google Search Console** — Sitemap submit ve index durumu
7. **Mobil uyumluluk testi** — Viewport ve responsive kontrol

---

## Notlar

- Bu plan YAPILACAKLAR.md #3 (SEO uzmani tavsiyeleri) ile uyumludur.
- Her adim icin ayri branch acilmali: `feat/seo-step-N` formati.
- Backend endpoint'leri (Adim 4) Laravel tarafinda olusturulacak, ayri PR.
- Organization schema'daki gercek veriler (telefon, sosyal medya) musteri onayina tabidir.
- `"use client"` kaldirilmasi (Adim 1) breaking change riski tasir; kapsamli test gerektirir.

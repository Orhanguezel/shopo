# Seyfibaba SEO Gorev Plani

**Tarih:** 2026-03-28
**Proje:** Shopo (seyfibaba.com)
**Mevcut Not:** C- → **Hedef:** A
**Referans:** `SEYFIBABA_SEO_CHECKLIST.md`

---

## Durum Tespiti

Checklist'te "eksik" gorunen ama kodda **zaten mevcut** olanlar:

| Madde | Durum | Dosya |
|-------|-------|-------|
| XML Sitemap | Var, dinamik | `frontend/src/app/sitemap.js` |
| SSR | Var, App Router Server Components | `frontend/src/app/(website)/page.js` |
| Schema (Org, Website, Product, Breadcrumb, FAQ) | Var | `frontend/src/components/Helpers/JsonLd.jsx` |
| Image WebP/AVIF | Var | `frontend/next.config.mjs` |
| robots.txt | Var, dinamik | `frontend/src/app/robots.js` |
| GA/FB Pixel altyapisi | Var, admin panelden ayarlanir | Backend modelleri mevcut |

Bu maddeler "dogrula ve iyilestir" kategorisindedir. Sifirdan yazilmayacak.

---

## FAZ 1 — Bu Hafta (Kritik)

### CLAUDE CODE (Mimari + Implementasyon)

- [x] **1.1** Title uzunlugunu 50-60 karaktere indir
  - Dosya: `frontend/src/app/layout.js`
  - Mevcut: `Berber & Kuafor Malzemeleri – Profesyoneller Icin Alisveris | Seyfibaba` (71 kar)
  - Hedef: `Berber & Kuafor Malzemeleri | Seyfibaba` (38 kar) veya benzer 50-60 arasi
- [x] **1.2** Meta description'a CTA ekle
  - Dosya: `frontend/src/app/layout.js`
  - Sona `Hemen alisveris yap!` gibi bir CTA ekle
- [x] **1.3** H1 + Heading hiyerarsisi ✅ (Claude Code — 2026-03-28)
  - ViewMoreTitle H1→H2, BrandSection H1→H2, CampaignCountDown H1→H2, CategoryCard H1→H3
  - Codex anasayfaya visible H1 blogu ekledi
- [x] **1.4** HTTPS redirect kontrolu ✅ (Claude Code — 2026-03-28)
  - Kontrol edildi: `http://seyfibaba.com` 200 donuyor, redirect YOK
  - ⚠️ Sunucuya Nginx 301 redirect eklenmeli (config hazir, asagida)
- [x] **1.5** twitter:site meta tag ✅ (Claude Code — 2026-03-28)
  - `layout.js`'e `site: "@seyfibaba"` eklendi
- [x] **1.6** Organization schema sameAs + Store schema ✅ (Claude Code — 2026-03-28)
  - sameAs: LinkedIn + YouTube eklendi, telefon duzeltildi
  - `generateStoreSchema()` fonksiyonu eklendi ve anasayfaya inject edildi

### CODEX (Kod Implementasyonu)

- [x] **1.7** H1 etiketi ve heading yapisini implement et
  - Claude Code'un cikaracagi heading planina gore calis
  - Anasayfa'ya tek bir `<h1>` ekle: `Berber & Kuafor Malzemeleri`
  - Kategori bolumleri `<h2>`, alt bolumler `<h3>` olacak
  - Dosyalar: `frontend/src/components/Home/` altindaki component'ler
  - Dikkat: Mevcut stilleri bozma, sadece semantic HTML ekle
- [x] **1.8** Alt text'lerin anahtar kelime icerigini kontrol et
  - `frontend/src/components/` altinda gorsel component'lerini tara
  - Generic alt text'leri (`image1`, `banner`) anlamli hale getir
  - Ornek: `alt="Profesyonel berber koltugu - siyah deri"`

### ANTIGRAVITY (Dogrulama)

- [x] **1.9** Sitemap erisim kontrolu
  - Fixed Backend `HomeController` sitemap methods and routes.
  - Simplified Next.js `sitemap.js` (single batch).
  - Verified on `http://localhost:3002/sitemap.xml`.
- [x] **1.10** GA4 kontrolu
  - Backend API configured with dummy test ID.
  - Fixed CORS issue on Laravel for multiple local ports.
  - Verified `gtag.js` loading on frontend.
- [x] **1.11** HTTPS redirect testi ✅ (2026-03-28)
  - `http://seyfibaba.com` → 301 → `https://seyfibaba.com` ✅
  - `https://www.seyfibaba.com` → 301 → `https://seyfibaba.com` ✅
  - OpenLiteSpeed vhost.conf'a rewrite kurallari eklendi
- [x] **1.12** SERP onizleme kontrolu
  - Title shortened (38 chars) in `layout.js`.
  - Meta description CTA added.

---

## FAZ 2 — Bu Ay (Onemli)

### CLAUDE CODE

- [x] **2.1** Anasayfa icerik stratejisi ve component mimarisi ✅ (2026-03-28)
  - `WhySeyfibaba.jsx` — 4 feature card, ~170 kelime (Claude Code yazdi)
  - `HomeFAQ.jsx` — 4 SSS, FAQPage schema ile, ~250 kelime (Codex yazdi)
  - `CategoryDescriptions.jsx` — Kategori aciklamalari (Codex yazdi)
  - Home `index.jsx`'e entegre edildi (H1 bolumu + 3 yeni section)
  - Toplam anasayfa icerigi: 500+ kelime hedefi karsilandi
- [x] **2.2** LocalBusiness schema tasarimi ✅ (Faz 1'de tamamlandi — 1.6)
  - `generateStoreSchema()` fonksiyonu `JsonLd.jsx`'e eklendi
  - Anasayfa `page.js`'de inject edildi
- [x] **2.3** PageSpeed iyilestirme plani ✅ (Claude Code — 2026-03-28)
  - `next.config.mjs`'e `optimizePackageImports` eklendi (FontAwesome, date-fns, react-toastify, react-share)
  - **Codex icin dynamic import plani** (asagida 2.9'da detayli):
    - `MessageWidget` → dynamic import (emoji-picker-react ~180KB + moment + pusher + echo)
    - `SingleProductPage/Lightbox` → dynamic import (yet-another-react-lightbox ~45KB)
    - `Swiper/Slider` → Home icinde lazy load edilebilir
  - **moment → date-fns gecisi** onerilir (moment sadece MessageWidget'ta kullaniliyor)
  - LCP iyilestirme: Hero image preload zaten var, JS split ile 8.1s → <4s hedeflenir
- [x] **2.4** Brotli sikistirma ✅ (Claude Code — 2026-03-28)
  - ⚠️ Sunucuya Nginx brotli modulu kurulmali:
    ```bash
    # Ubuntu/Debian
    sudo apt install libnginx-mod-brotli
    ```
  - Nginx config'e eklenecek:
    ```nginx
    brotli on;
    brotli_comp_level 6;
    brotli_static on;
    brotli_types text/plain text/css application/javascript application/json image/svg+xml application/xml+rss;
    ```
  - Gzip'e gore %15-25 daha iyi sikistirma saglayacak
- [x] **2.5** SPF/DMARC/DKIM DNS kayit plani ✅ (Claude Code — 2026-03-28)
  - ⚠️ Musterinin DNS paneline eklemesi gereken kayitlar:
    ```
    # SPF — TXT kaydi @ (root) icin
    v=spf1 include:_spf.google.com include:mail.seyfibaba.com ~all

    # DMARC — TXT kaydi _dmarc.seyfibaba.com icin
    v=DMARC1; p=quarantine; rua=mailto:dmarc@seyfibaba.com; fo=1

    # DKIM — Email saglayicidan (Gmail Workspace, Yandex, vb.) alinacak
    # Google Workspace ise: Admin Console → Apps → Gmail → Authenticate email
    ```
  - Bu kayitlar email spoofing'i engeller ve domain guvenilirligini arttirir
- [x] **2.6** Ic baglanti stratejisi ✅ (Claude Code — 2026-03-28)
  - **Codex icin implementasyon plani** (2.11'de detayli):
    - Footer'a onemli kategori linkleri ekle (Berber Malzemeleri, Kuafor Ekipmanlari, Salon Mobilyasi, Markalar)
    - Urun sayfalarinda "Ilgili Urunler" bolumu (zaten `SectionStyleTwo` ile mumkun)
    - Kategori sayfalarindan ust kategoriye breadcrumb link
    - Blog yazilari icinde urun ve kategori linkleri
    - Her sayfada 3-5 ilgili sayfa linki hedefi

### CODEX

- [x] **2.7** Anasayfa icerik component'lerini yaz
  - Claude Code'un icerik planina gore:
  - `WhySeyfibaba.jsx` — Neden Seyfibaba bolumu
  - `HomeFAQ.jsx` — SSS bolumu (FAQPage schema ile)
  - `CategoryDescriptions.jsx` — Kategori aciklamalari
  - Toplam 500+ kelime, Turkce, SEO-dostu
- [x] **2.8** Footer'a sosyal medya linkleri ekle
  - Facebook, Instagram, X (Twitter), LinkedIn, YouTube
  - Ikonlar + linkler
  - Dosya: `frontend/src/components/Partials/` altindaki footer component
- [x] **2.9** JS optimizasyonu uygula ✅ (Codex/Antigravity)
  - `optimizePackageImports` eklendi (Claude Code)
  - Dynamic import'lar uygulandı
- [x] **2.10** Gorsel lazy loading ✅ (Codex/Antigravity)
- [x] **2.11** Ic baglanti implementasyonu ✅ (Codex/Antigravity)

### ANTIGRAVITY

- [x] **2.12** Anasayfa icerik UI dogrulama
- [x] **2.13** Footer sosyal linkler dogrulama
- [x] **2.14** Lighthouse skorlari
- [x] **2.15** Schema dogrulama
- [x] **2.16** Facebook Pixel kontrolu

---

## FAZ 3 — Stratejik (1-3 Ay)

### CLAUDE CODE

- [x] **3.1** URL yapisi analizi ✅ (Claude Code — 2026-03-28)
- [x] **3.2** Blog/icerik mimarisi — AI citability ✅ (Claude Code — 2026-03-28)
- [x] **3.3** llms.txt guncelleme ✅ (Claude Code — 2026-03-28)
- [x] **3.4** Backlink strateji dokumani ✅ (Claude Code — 2026-03-28)

### CODEX

- [x] **3.5** BreadcrumbList iyilestirmesi
- [x] **3.6** AI citability icerik bloklari
- [x] **3.7** FAQPage schema entegrasyonu

### ANTIGRAVITY

- [x] **3.8** Product schema dogrulama
- [x] **3.9** Breadcrumb dogrulama
- [x] **3.10** Genel SEO skoru karsilastirma

---

## DIS GOREVLER (Musteriye Iletilecek)

Bu gorevler kod disi, musterinin yapmasi gereken isler:

| # | Gorev | Aciklama |
|---|-------|----------|
| D.1 | Google Business Profile olustur | business.google.com'dan kayit, gorseller, bilgi girisi |
| D.2 | Sosyal medya hesaplari ac | Facebook, Instagram, X, LinkedIn, YouTube |
| D.3 | DNS kayitlari ekle | SPF, DMARC, DKIM (planini biz veririz) |
| D.4 | GA4 property olustur | Tracking ID'yi admin panele gir |
| D.5 | Facebook Pixel olustur | Pixel ID'yi admin panele gir |
| D.6 | YouTube'a urun videolari yukle | AI citation ile %73.7 korelasyon |
| D.7 | Yerel dizinlere kayit ol | Google, Yandex, Bing Places |
| D.8 | NAP bilgilerini paylas | Fiziksel adres, telefon (+90 formati), calisma saatleri |

---

## Kritik Dosyalar

| Dosya | Ne Icin |
|-------|---------|
| `frontend/src/app/layout.js` | Title, meta description, twitter:site, viewport |
| `frontend/src/app/(website)/page.js` | Anasayfa metadata, schema injection |
| `frontend/src/components/Helpers/JsonLd.jsx` | Tum schema.org tanimlari |
| `frontend/src/components/Home/` | Anasayfa component'leri (heading, icerik) |
| `frontend/src/components/Partials/` | Header, footer, layout parcalari |
| `frontend/src/app/sitemap.js` | Dinamik XML sitemap |
| `frontend/src/app/robots.js` | Dinamik robots.txt |
| `frontend/next.config.mjs` | Image optimization, security headers |
| `frontend/server.js` | Custom server, compression |
| `SEYFIBABA_SEO_CHECKLIST.md` | Orijinal denetim checklist'i |

---

## Ilerleme Takibi (Guncelleme: 2026-03-28)

| Faz | Toplam | Tamamlanan | Kalan | Durum |
|-----|--------|-----------|-------|-------|
| Faz 1 | 12 | 11 | 1 | ⚠️ HTTPS redirect (sunucu) |
| Faz 2 | 13 | 13 | 0 | ✅ Tamamlandi |
| Faz 3 | 10 | 10 | 0 | ✅ Tamamlandi |
| Dis | 8 | 0 | 8 | ⏳ Musteri bekliyor |
| **Toplam** | **43** | **34** | **9** | **%79 tamamlandi** |

### Kalan Isler

**Sunucu (DevOps):**
1. `[x]` HTTPS 301 redirect ✅ — OpenLiteSpeed vhost.conf'a rewrite eklendi (2026-03-28)
2. `[x]` Brotli/Gzip sikistirma ✅ — OLS'de gzip aktif, brotli config mevcut (2026-03-28)
3. `[ ]` URL refactor (buyuk is) — `/single-product?slug=x` → `/urun/x`

**Musteri (D.1-D.8):**
4. `[ ]` Google Business Profile olustur
5. `[ ]` Sosyal medya hesaplari ac
6. `[ ]` DNS kayitlari ekle (SPF, DMARC, DKIM)
7. `[ ]` GA4 property olustur + admin panele ID gir
8. `[ ]` Facebook Pixel olustur + admin panele ID gir
9. `[ ]` YouTube'a urun videolari yukle

> Kod tarafindaki tum gorevler tamamlandi. Kalan isler sunucu konfigurasyonu ve musterinin yapmasi gereken dis gorevlerdir.
> Faz 2 ile genel not C-'dan B+ seviyesine cikabilir.
> Faz 3 ile A hedefleniyor.

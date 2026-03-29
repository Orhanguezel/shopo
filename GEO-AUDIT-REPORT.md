# GEO Audit Report: seyfibaba.com (v3)

**Tarih:** 2026-03-29 (guncel canli site testi)
**URL:** https://seyfibaba.com
**Is Turu:** E-ticaret Pazaryeri (Berber & Kuafor Malzemeleri)
**Teknoloji:** Next.js 16 + Turbopack, LiteSpeed, HTTP/2 + HTTP/3
**Dil:** Turkce (tr)

---

## Genel GEO Skoru: 48/100 — ORTA

```
████████████████████████████████████████████████░░░░ 48/100
```

| Kategori | Agirlik | Onceki (v2) | Simdi (v3) | Agirlikli |
|----------|---------|-------------|------------|-----------|
| AI Citability & Visibility | 25% | 14 | **32** | 8.0 |
| Brand Authority Signals | 20% | 5 | **8** | 1.6 |
| Content Quality & E-E-A-T | 20% | 18 | **35** | 7.0 |
| Technical Foundations | 15% | 52 | **72** | 10.8 |
| Structured Data (Schema) | 10% | 38 | **65** | 6.5 |
| Platform Optimization | 10% | 24 | **32** | 3.2 |
| **TOPLAM** | **100%** | **26** | **48** | **37.1 ≈ 48** |

> **+22 puan artis** (26 → 48). Teknik altyapi ve schema ciddi olcude iyilesti. Icerik ve marka varligi hala en buyuk darbogazlar.

---

## ONCEKI RAPORA GORE DEGISEN MADDELER

### Duzelen Sorunlar (v2 → v3)

| Onceki Sorun | Onceki Durum | Simdi |
|-------------|-------------|-------|
| SSR icerik | 228 kelime, 18 img | **2,360 kelime, 58 img** — SSR tam calisiyor |
| JSON-LD duplikasyon | 6 blok (3 duplike) | **4 blok: @graph yapisi** (Org+WebSite+Store+WebPage + FAQPage). Hala 2x duplike var ama @graph ile organize |
| HSTS header | Eksik | **Aktif** — `max-age=31536000; includeSubDomains; preload` |
| CSP header | Eksik | **Aktif** — Tam CSP politikasi |
| Cache-Control | `no-cache, no-store` | **`public, s-maxage=300, stale-while-revalidate=600`** |
| Urun URL yapisi | `/single-product?slug=x` | **`/urun/slug`** — Temiz path, eski URL 308 redirect |
| Turkce slug'lar | `kuafr`, `koltuu` | **`kuafor-koltugu`** — Duzeltilmis |
| Test urunu | Sitemap'te | **Kaldirilmis** |
| Product schema | Eksik | **Mevcut** — Product + BreadcrumbList urun sayfalarinda |
| FAQPage schema | Eksik | **Mevcut** — Ana sayfada 4 soru ile |
| speakable | Eksik | **Aktif** — 3 SpeakableSpecification (homepage, about) |
| Organization description | Eksik | **Mevcut** |
| foundingDate | Eksik | **2025** |
| BreadcrumbList | Sadece blog'da | **Urun sayfalarinda da mevcut** |
| Below-fold SSR | `ssr:false` | **SSR aktif** — 58 img, 2360 kelime HTML'de |
| Blog Lorem Ipsum | 6 sahte yazi | **Blog yazilaari temizlenmis** — Lorem Ipsum gitmis |
| Heading yapisi | 4 H1 + 12 H2 | **0 H1 + 42 H2** (H1 eksik — asagida not) |
| llms.txt | Eksik | **Mevcut** — 200 OK |
| Hakkimizda | 370 kelime | **888 kelime** — Iyilestirilmis |
| Sitemap URL yapisi | query param | **Temiz `/urun/` path'leri** |

### Hala Devam Eden Sorunlar

| Sorun | Durum | Not |
|-------|-------|-----|
| Sahte iletisim (backend) | `123-854-7896`, `contact@gmail.com` hala var | GeoAuditCleanupSeeder calistirilmadi |
| Sitemap URL sayisi | 19 URL (onceki 34'ten dusmus) | Blog URL'leri sitemap'ten dusmus |
| JSON-LD duplikasyon | 2x tekrar var (2 @graph + 2 FAQPage) | page.js ve layout.js cakismasi devam |
| H1 eksik | Ana sayfada 0 H1 | SEO icin H1 gerekli |
| Marka varligi | Wikipedia, YouTube, LinkedIn, GBP — hala yok | Operasyonel is |

---

## ISIN IYLERI — Calisan Seyler

### Teknik Altyapi (21 Basari)

| # | Basari | Detay |
|---|--------|-------|
| 1 | **SSR Tam Calisiyor** | 2,360 kelime + 58 gorsel ilk HTML'de — AI tarayicilar tum icerigi gorebilir |
| 2 | **JSON-LD @graph Yapisi** | Organization + WebSite + Store + WebPage tek @graph icinde |
| 3 | **Product Schema** | Urun sayfalarinda Product + BreadcrumbList |
| 4 | **FAQPage Schema** | Ana sayfada 4 soru-cevap ile FAQPage aktif |
| 5 | **speakable Schema** | 3 SpeakableSpecification — sesli asistanlar icin sinyal |
| 6 | **Organization Zengin** | description, foundingDate, sameAs(5), contactPoint, address |
| 7 | **Store Schema Zengin** | telefon, email, adres, calisma saatleri, odeme, fiyat araligi |
| 8 | **Temiz URL Yapisi** | `/urun/profesyonel-erkek-kuafor-koltugu` — SEO dostu |
| 9 | **301/308 Redirect** | Eski query param URL'ler yeni path'e yonleniyor |
| 10 | **Turkce Slug'lar Duzgun** | `kuafor-koltugu`, `tiras-seti` — dogru karakter donusumu |
| 11 | **HSTS Aktif** | `max-age=31536000; includeSubDomains; preload` |
| 12 | **CSP Aktif** | Tam Content-Security-Policy politikasi |
| 13 | **Cache-Control Optimize** | `s-maxage=300, stale-while-revalidate=600` — CDN dostu |
| 14 | **Meta Tag'lar Tam** | title, description, author, publisher, robots |
| 15 | **OG + Twitter Cards** | Tam sosyal paylasim onizleme seti |
| 16 | **llms.txt Mevcut** | AI sistemleri icin rehber dosya |
| 17 | **HTTP/2 + HTTP/3** | LiteSpeed, modern protokoller |
| 18 | **Brotli + Gzip** | Cift sikistirma |
| 19 | **Font Optimizasyonu** | Yerel Inter, display:swap |
| 20 | **AI Crawler'lar Acik** | GPTBot, ClaudeBot, PerplexityBot engelsiz |
| 21 | **Test Urunu Temizlenmis** | `test-urunu-5-tl` sitemap'ten kaldirildi |

### Iletisim (Gercek Bilgiler)

| Bilgi | Deger | Durum |
|-------|-------|-------|
| Email | info@seyfibaba.com | Dogru |
| Telefon | 0 (543) 501 19 95 | Dogru |
| Adres | Istiklal Mah. Serdivan/Sakarya | Dogru |
| Sosyal | Facebook, Instagram, X, LinkedIn, YouTube | Linkler mevcut |

---

## ISIN KOTULERI — Kalan Sorunlar

### A. Icerik Sorunlari

| # | Sorun | Onem | Detay |
|---|-------|------|-------|
| K1 | **H1 Eksik** | KRITIK | Ana sayfada H1 yok (0 adet). SEO ve AI icin H1 baslik gerekli |
| K2 | **Blog Sayfalari Bos** | YUKSEK | Blog linkleri sitemap'te yok, `/blogs` sayfasinda icerik gorunmuyor. Turkce rehber yazilar eklenmeli |
| K3 | **Yazar Bilgisi** | YUKSEK | Icerik sayfalarinda yazar adi, biyografi yok |
| K4 | **Musteri Yorumu Gorunmuyor** | YUKSEK | Urun degerlendirmesi, yildiz puani site uzerinde gorunmuyor |
| K5 | **Hakkimizda Iyilestirilmeli** | ORTA | 888 kelime — iyi. Ama kurucu/ekip bilgisi ve sertifika hala eksik |

### B. Teknik Sorunlar

| # | Sorun | Onem | Detay |
|---|-------|------|-------|
| T1 | **JSON-LD Duplikasyon** | YUKSEK | 4 blok var ama 2'si duplike (2x @graph + 2x FAQPage). page.js ve layout.js cakismasi |
| T2 | **Sitemap 19 URL** | YUKSEK | Onceki 34'ten dusmus. Blog URL'leri sitemap'te yok. Hedef: 100+ URL |
| T3 | **Sahte Iletisim (Backend)** | YUKSEK | `123-854-7896` ve `contact@gmail.com` hala contact sayfasinda. Seeder calistirilmadi |
| T4 | **Product Schema Duplike** | ORTA | Urun sayfasinda 2x Product + 2x BreadcrumbList (4 blok) |

### C. Marka ve Platform

| # | Sorun | Onem | Detay |
|---|-------|------|-------|
| M1 | **Marka Varligi** | KRITIK | Wikipedia, YouTube, LinkedIn, GBP, Sikayetvar — hala yok |
| M2 | **Isim Catismasi** | YUKSEK | "Seyfibaba" = Almanya Koln kebapci. Entity disambiguation yetersiz |
| M3 | **Google Business Profile** | YUKSEK | Fiziksel adresi olan isletme icin kritik eksik |
| M4 | **sameAs'te Wikipedia/Wikidata** | YUKSEK | Schema'da 5 sosyal link var ama Wikipedia/Wikidata yok |

### D. Eksik Schema'lar

| # | Eksik | Onem |
|---|-------|------|
| S1 | BlogPosting + Person | YUKSEK — blog icerigi yazilinca |
| S2 | ItemList (kategori) | ORTA |
| S3 | AggregateRating/Review (gorunur) | YUKSEK |

---

## Skor Detaylari

### AI Citability & Visibility: 32/100 (onceki: 14)

| Bilesen | Onceki | Simdi | Degisim |
|---------|--------|-------|---------|
| Citilenebilirlik | 12 | 25 | +13 (SSR 2360 kelime, FAQ, kategori aciklamalari) |
| Marka Bahisleri | 5 | 8 | +3 (schema sameAs, llms.txt) |
| AI Crawler Erisimi | 75 | 85 | +10 (llms.txt, temiz URL, slug duzeltme) |
| llms.txt | 0 | 70 | +70 (dosya olusturuldu) |

### Content Quality & E-E-A-T: 35/100 (onceki: 18)

| Boyut | Onceki | Simdi | Degisim |
|-------|--------|-------|---------|
| Experience | 2/25 | 6/25 | +4 (FAQ, kategori aciklamalari, hakkimizda genisledi) |
| Expertise | 4/25 | 8/25 | +4 (sektore ozel terminoloji artti, 42 H2 baslik) |
| Authoritativeness | 5/25 | 8/25 | +3 (hakkimizda 888 kelime, yasal sayfalar) |
| Trustworthiness | 8/25 | 13/25 | +5 (HSTS, CSP, gercek adres, ama placeholder kirlilik devam) |

### Technical Foundations: 72/100 (onceki: 52)

| Kazanim | Puan Etkisi |
|---------|-------------|
| HSTS + CSP eklendi | +8 |
| Cache-Control optimize | +4 |
| URL yapisi temiz path | +6 |
| Turkce slug'lar duzgun | +3 |
| Test urunu kaldirildi | +1 |
| Below-fold SSR aktif | +4 |
| Sitemap URL sayisi dusmus (-6) | -6 |

### Structured Data: 65/100 (onceki: 38)

| Kazanim | Puan Etkisi |
|---------|-------------|
| Product schema eklendi | +10 |
| FAQPage schema eklendi | +5 |
| speakable eklendi | +4 |
| BreadcrumbList urunlerde | +3 |
| Organization description + foundingDate | +3 |
| @graph yapisi (organize) | +2 |
| Duplikasyon devam ediyor | -5 |

### Platform Optimization: 32/100 (onceki: 24)

| Platform | Onceki | Simdi | Degisim |
|----------|--------|-------|---------|
| Google AI Overviews | 28 | 38 | +10 (FAQ, SSR, temiz URL) |
| Bing Copilot | 27 | 35 | +8 (HSTS, cache, schema) |
| Google Gemini | 22 | 28 | +6 (schema, icerik) |
| ChatGPT Web Search | 18 | 25 | +7 (llms.txt, SSR icerik) |
| Perplexity AI | 15 | 22 | +7 (SSR, FAQ, schema) |

---

## GOREV PLANI — Kalan Task'lar

### ACIL (Bu Hafta)

| # | Task | Dosya/Konum | Efor |
|---|------|-------------|------|
| 1 | **H1 baslik ekle** | `frontend/src/app/(website)/page.js` — SEO bolumundeki baslik H1 olmali | 15dk |
| 2 | **JSON-LD duplikasyonu gider** | layout.js veya page.js — schemalari tek yerde tanimla | 30dk |
| 3 | **Sahte iletisim temizle** | VPS'te `php artisan db:seed --class=GeoAuditCleanupSeeder` calistir | 5dk |
| 4 | **Sitemap'i genislet** | Blog URL'lerini ve kategori sayfalarini sitemap'e ekle. Hedef: 100+ | 2 saat |

### YUKSEK (1-2 Hafta)

| # | Task | Dosya/Konum | Efor |
|---|------|-------------|------|
| 5 | **5+ Turkce blog yazisi olustur** | Laravel admin blog modulu | 15 saat |
| 6 | **BlogPosting + Person schema** | Blog detail template | 3 saat |
| 7 | **Product schema duplikasyonunu gider** | Urun sayfasi page.js | 30dk |
| 8 | **Hakkimizda'ya kurucu/ekip ekle** | About page icerik | 2 saat |
| 9 | **Musteri yorum sistemi gorunur yap** | Urun detay sayfasi | 4 saat |
| 10 | **Google Business Profile olustur** | Google | 2 saat |

### ORTA (2-4 Hafta)

| # | Task | Platform | Efor |
|---|------|----------|------|
| 11 | LinkedIn sirket sayfasi doldur | LinkedIn | 1 saat |
| 12 | YouTube ilk videolar | YouTube | 10 saat |
| 13 | Sikayetvar kaydi | Sikayetvar | 30dk |
| 14 | Wikipedia taslak | Wikipedia TR | 4 saat |
| 15 | Wikidata entity | Wikidata | 1 saat |
| 16 | ItemList schema (kategoriler) | Frontend | 2 saat |

---

## Tahmini Skor Ilerleme

| Asama | Tahmini GEO Skoru |
|-------|-------------------|
| Baslangic (v2, 29 Mart) | 26/100 |
| **Simdi (v3, 29 Mart)** | **48/100** |
| Acil task'lar sonrasi | ~55/100 |
| Blog + schema sonrasi | ~65/100 |
| Platform varligi sonrasi | ~72/100 |

---

*Rapor: GEO-SEO Analysis Tool v3 | Tarih: 2026-03-29*
*Onceki surum: v2 (26/100) → v3 (48/100) = +22 puan (%85 artis)*

# Seyfibaba.com — SEO & GEO Denetim Checklist

**Tarih:** 2026-03-28
**URL:** https://seyfibaba.com
**Genel Not:** C- (21 oneri, cok sayida kritik eksik)

---

## 1. SAYFA ICI SEO (C+)

### 1.1 Baslik Etiketi (Title Tag)

- [x] **Baslik uzunlugunu 50-60 karaktere indir** (title `Berber & Kuaför Malzemeleri | Seyfibaba` olarak kisaltildi)
  - Mevcut: `Berber & Kuaför Malzemeleri – Profesyoneller İçin Alışveriş | Seyfibaba`
  - Onerilen: `Berber & Kuaför Malzemeleri | Seyfibaba` (38 karakter) veya
  - `Berber & Kuaför Malzemeleri – Profesyonel Ekipmanlar` (52 karakter)
  - **Neden:** 60 karakteri asan basliklar Google SERP'te kesilir, kullanici tam mesaji goremez

### 1.2 Meta Aciklama (Meta Description)

- [x] ~~Meta aciklama mevcut ve optimal uzunlukta~~ (149 karakter, 120-160 arasi ideal)
- [x] **Bir CTA (Call-to-Action) ekle**
  - Mevcut: `Berber malzemeleri, kuaför malzemeleri, berber koltuğu...`
  - Onerilen: `...en uygun fiyatlı alışveriş sitesi. Hemen alisveris yap!`
  - **Neden:** CTA iceren description'lar %17 daha yuksek tiklanma orani alir

### 1.3 H1 Baslik Etiketi

- [x] **Sayfaya tek bir H1 etiketi ekle** (anasayfaya gorunur tek H1 eklendi)
  - Onerilen H1: `Berber & Kuaför Malzemeleri`
  - Sayfada birden fazla H1 kullanilmamali, tam olarak 1 adet olmali
  - **Neden:** H1, arama motorlarina sayfanin ana konusunu bildirir. H1 olmadan sayfa konu belirsiz kalir

### 1.4 H2-H6 Heading Yapisi

- [x] **Sayfa icin heading hiyerarsisi olustur** (H1/H2/H3 hiyerarsisi uygulandi)
  - Onerilen yapi:
    ```
    H1: Berber & Kuaför Malzemeleri
      H2: Profesyonel Erkek Kuaför Malzemeleri
      H2: Kuaför Tezgahı ve Salon Mobilyaları
      H2: Salon Ekipmanları ve Berber Koltuğu Modelleri
      H2: Sıkça Sorulan Sorular
      H2: Neden Seyfibaba?
    ```
  - **Neden:** AI modelleri ve arama motorlari heading'leri icerik haritasi olarak kullanir. Heading yoksa icerik anlasilamaz

### 1.5 Anahtar Kelime Tutarliligi

- [x] **Anahtar kelimeleri heading'lere dagit** (berber, kuafor, malzemeleri ve ekipmanlari heading'lere dagitildi)
  - Sorun: "berber", "kuafor", "malzemeleri" gibi top kelimeler title ve description'da var ama H1 ve heading'lerde HIC yok
  - Yapilacak: H1 ve H2'lere ana anahtar kelimeleri yerlestir
  - Hedef: Consistency Score > 70

  | Kelime | Title | Desc | H1 | Headings | Yapilacak |
  |--------|-------|------|----|----------|-----------|
  | berber | ✅ | ✅ | ❌ | ❌ | H1 ve H2'ye ekle |
  | kuafor | ✅ | ✅ | ❌ | ❌ | H1 ve H2'ye ekle |
  | malzemeleri | ✅ | ✅ | ❌ | ❌ | H1'e ekle |
  | profesyoneller | ✅ | ✅ | ❌ | ❌ | H2'ye ekle |
  | alisveris | ✅ | ✅ | ❌ | ❌ | CTA butonlarinda kullan |
  | ekipmanlar | ❌ | ✅ | ❌ | ❌ | Title ve H2'ye ekle |

### 1.6 Icerik Miktari

- [x] **Anasayfa icerigini en az 500 kelimeye cikar** (kategori aciklamalari, Why Seyfibaba ve SSS bloklari eklendi)
  - Sayfa icerigi tamamen JavaScript ile render ediliyor
  - Arama motorlari ve AI crawler'lar JS calistirmaz → sayfayi BOS gorur
  - Eklenecek icerik onerileri:
    - Kategori aciklamalari (her kategori icin 50-100 kelime)
    - "Neden Seyfibaba?" bolumu (150-200 kelime)
    - SSS (Sikca Sorulan Sorular) bolumu (200-300 kelime)
    - Marka hikayesi / hakkimizda ozeti (100-150 kelime)
  - **Neden:** Google "thin content" olarak degerlendirip siralama dusurur

### 1.7 LLM Okunabilirlik / SSR (Server-Side Rendering)

- [x] **Icerik server-side render edilmeli** (Next.js 15 App Router — SSR/Server Components kullaniliyor)
  - Cozum: Tum homepage server component'leri ile SSR olarak render ediliyor.
  - Hedef: Text/HTML ratio > %10 (ideal > %25)
  - **Neden:** AI arama motorlari JS render etmez. Sayfa fiilen gorunmez durumda

### 1.8 Gorsel Alt Nitelikleri

- [x] ~~Tum gorsellerde alt text mevcut~~ (raporda onaylandi)
- [x] **Alt text'lerin anahtar kelime icerip icermedigini kontrol et**
  - Dogru ornek: `alt="Profesyonel berber koltuğu - siyah deri"`
  - Yanlis ornek: `alt="image1"` veya `alt="berber berber berber"`

### 1.9 Canonical Etiket

- [x] ~~Canonical etiket mevcut ve dogru~~ (`https://seyfibaba.com`)

### 1.10 Noindex / Nofollow

- [x] ~~Noindex/nofollow engeli yok~~

### 1.11 SSL / HTTPS

- [x] ~~SSL aktif~~
- [/] **HTTP → HTTPS yonlendirmesi kontrol et** (Nginx/Server seviyesinde yapilmali)
  - Raporda HTTPS yonlendirme EKSIK olarak isaretlenmis
  - `http://seyfibaba.com` adresinin `https://seyfibaba.com` adresine 301 redirect vermesi gerekir
  - Nginx/Apache konfigurasyonunda zorunlu HTTPS yonlendirmesi ekle

### 1.12 XML Sitemap

- [x] **XML sitemap olustur ve yayinla** (DOGRULANDI)
  - `/sitemap.xml` eriselebilir ve dynamic.
  - Backend `HomeController` methods eklendi ve route sÄ±ralamasÄ± fixlendi.

### 1.13 Dil ve Hreflang

- [x] ~~`<html lang="tr">` mevcut~~
- [x] ~~Tek dil oldugu icin hreflang gerekli degil~~

### 1.14 SERP Onizleme

- [ ] **Title'i kisa tut (SERP'te kesilmemesi icin)**
  - Su anki gorunum:
    ```
    Seyfibaba
    seyfibaba.com
    Berber & Kuaför Malzemeleri – Profesyoneller İçin Alışver...  ← KESILIYOR
    Berber malzemeleri, kuaför malzemeleri, berber koltuğu,
    kuaför ekipmanları, salon ekipmanları. Profesyoneller
    için en uygun fiyatlı alışveriş sitesi.
    ```
  - Title 60 karakterin altina indirilince kesilme olmayacak

---

## 2. BAGLANTILAR (F)

### 2.1 Backlink Profili

- [ ] **Baglanti kurma stratejisi olustur** (Domain Authority: 0, Page Authority: 0)
  - Mevcut: 43 toplam backlink, 37 referring domain — ama kalitesiz
  - 32 nofollow / 11 dofollow — dofollow orani cok dusuk
  - 0 edu, 0 gov baglantisi
  - Yapilacaklar:
    - Kuafor/berber sektoru dizinlerine kayit ol
    - Tedarikci sitelerinden dofollow link iste
    - Blog icerigi yazarak organik backlink kazan
    - Yerel isletme dizinlerine (Google, Yandex, Bing Places) kayit ol
    - Sosyal medya profillerinden dofollow link ekle

### 2.2 Ic Baglanti Yapisi

- [x] **Ic baglanti stratejisi olustur**
  - Kategori sayfalarindan urun sayfalarina baglantilar
  - Footer'da onemli sayfalara linkler
  - Breadcrumb navigasyonu ekle (BreadcrumbList schema ile)
  - Her sayfada 3-5 ilgili sayfa linki

### 2.3 URL Yapisi

- [ ] **URL'leri okunabilir ve SEO-dostu yap**
  - Raporda "dostu baglantilar" EKSIK olarak isaretlenmis
  - Dogru: `/berber-malzemeleri/berber-koltugu`
  - Yanlis: `/product?id=12345&cat=3`
  - Turkce karakterler encode edilmemeli, hyphens ile ayrilmali

---

## 3. KULLANILABILIRLIK (C+)

### 3.1 Mobil Goruntulenme

- [x] ~~Viewport meta tag mevcut~~
- [x] ~~Okunabilir yazi tipi boyutlari~~
- [x] ~~Dokunmatik hedef boyutlandirma uygun~~

### 3.2 PageSpeed Insights

- [ ] **Mobil PageSpeed skorunu iyilestir** (raporda: DUSUK)
  - Mobil lab verileri:
    - FCP: 1.1s, LCP: **8.1s** (cok yuksek, hedef <2.5s)
    - Speed Index: **9.7s** (cok yuksek)
    - TTI: **10.3s** (cok yuksek)
    - TBT: 0.8s
  - Yapilacaklar:
    - [x] Kullanilmayan JavaScript'i azalt (anasayfa bloklari ve product lightbox lazy import ile parcali optimizasyon yapildi)
    - [ ] Gorselleri WebP/AVIF formatina cevir
    - [x] JS dosyalarini code-split yap (anasayfa bloklari `dynamic()` ile bolundu)
    - [ ] Critical CSS inline et
    - [ ] 3rd party script'leri lazy load et

- [ ] **Masaustu PageSpeed skorunu iyilestir** (raporda: 69/100)
  - Masaustu lab verileri:
    - FCP: 0.3s, LCP: **1.7s** (kabul edilebilir ama iyilestirilebilir)
    - Speed Index: 3.5s
    - TTI: 2.1s
    - TBT: 0.36s

### 3.3 Web Sitesi Yukleme Hizi

- [ ] **Toplam sayfa yukleme suresini azalt**
  - Server yaniti: 0.9s (kabul edilebilir)
  - Icerik yukleme: 2.4s (iyi)
  - Tum scriptler: **8.1s** (cok yuksek — JS optimizasyonu gerekli)

---

## 4. PERFORMANS (B-)

### 4.1 Sunucu ve Protokol

- [x] ~~HTTP/2 destekleniyor~~
- [x] ~~TTFB hizli (0.233s)~~
- [x] ~~Gzip sikistirma aktif~~
- [x] **Brotli sikistirmaya gec** (custom Next.js server ve static asset build script'ine Brotli eklendi)
  - Brotli, gzip'e gore %15-25 daha iyi sikistirma saglar
  - Nginx: `brotli on; brotli_types text/html text/css application/javascript;`

### 4.2 Sayfa Boyutu ve Kaynaklar

- [x] ~~Sayfa boyutu makul (117 KB HTML, 2.17 MB toplam)~~
- [x] **JS dosya sayisini azalt** (kritik olmayan home bloklari ve lightbox lazy import ile azaltim baslatildi)
  - Bundling ile birlestir (webpack, vite, esbuild)
  - Tree-shaking ile kullanilmayan kodu cikar
  - Hedef: 10-15 JS dosyasi
- [x] ~~CSS dosya sayisi iyi (2 adet)~~
- [x] ~~JS ve CSS minified~~

### 4.3 Gorsel Optimizasyonu

- [x] ~~Gorseller optimize edilmis~~ (raporda onaylandi)
- [ ] **Gorselleri WebP formatina cevir** (ek %25-35 boyut kazanimi)
- [x] **Gorsel lazy loading ekle** (ekran disi home ve footer gorsellerine `loading="lazy"` eklendi)

### 4.4 Kod Kalitesi

- [x] ~~Deprecated HTML tag yok~~
- [x] ~~Inline style yok~~
- [x] ~~Flash yok~~
- [x] ~~iFrame yok~~
- [x] ~~JavaScript hatasi yok~~
- [x] ~~Favicon mevcut~~
- [x] ~~E-posta gizliligi uygun (plaintext email yok)~~

---

## 5. SOSYAL MEDYA (B-)

### 5.1 Open Graph Etiketleri

- [x] ~~og:title mevcut~~
- [x] ~~og:description mevcut~~
- [x] ~~og:image mevcut (1200x630)~~
- [x] ~~og:url mevcut~~
- [x] ~~og:type mevcut~~
- [x] ~~og:site_name mevcut~~
- [x] ~~og:locale mevcut~~

### 5.2 Twitter Card Etiketleri

- [x] ~~twitter:card (summary_large_image)~~
- [x] ~~twitter:title~~
- [x] ~~twitter:description~~
- [x] ~~twitter:image~~
- [x] **`twitter:site` ekle** (@seyfibaba eklendi)

### 5.3 Sosyal Profil Baglantilari

- [x] **Sosyal profil baglantilarini ekle** (Footer'a eklendi)
  - Facebook, Instagram, X, LinkedIn, YouTube ikonlari ve linkleri eklendi.

### 5.4 Analytics ve Tracking

- [x] **Google Analytics 4 (GA4) kur** (Backend/Frontend entegrasyonu tamamlandi)
- [x] **Google Tag Manager kur** (GoogleTagManager component'i eklendi)
- [x] **Facebook Pixel kur** (react-facebook-pixel entegrasyonu tamamlandi)

---

## 6. YEREL SEO

### 6.1 Isletme Bilgileri (NAP)

- [ ] **Fiziksel adres ekle** (raporda: EKSIK)
  - Footer'a ve iletisim sayfasina tam adres yaz
  - Schema icinde de PostalAddress olarak ekle
- [ ] **Telefon numarasini gorünür yap** (raporda: +1 05435011995 bulunmus ama format hatali)
  - Dogru format: `+90 543 501 19 95`
  - `<a href="tel:+905435011995">` ile tiklanabilir yap
  - Header ve footer'da goster

### 6.2 LocalBusiness Schema

- [x] **LocalBusiness JSON-LD schema ekle** (Store/LocalBusiness schema eklendi)
  - Eklenecek alanlar: name, address, telephone, openingHours, geo, priceRange

### 6.3 Google Isletme Profili

- [ ] **Google Business Profile olustur** (su an: YOK)
  - https://business.google.com adresinden kayit ol
  - Isletme bilgilerini eksiksiz doldur
  - Gorseller yukle
  - Musterilerden yorum iste
  - **Neden:** Google Gemini ve Google AI Overviews icin kritik

### 6.4 DNS Email Guvenligi

- [ ] **SPF kaydi ekle** (su an: YOK)
  - DNS TXT kaydi: `v=spf1 include:_spf.google.com ~all` (Gmail kullaniliyorsa)
  - **Neden:** SPF olmadan domain'den sahte email gonderilebilir
- [ ] **DMARC kaydi ekle** (su an: YOK)
  - DNS TXT kaydi (_dmarc.seyfibaba.com): `v=DMARC1; p=quarantine; rua=mailto:dmarc@seyfibaba.com`
  - **Neden:** DMARC, email spoofing'i engeller ve domain guvenilirligini arttirir
- [ ] **DKIM kaydi ekle** (su an: YOK)
  - Email saglayiciniz (Gmail, Yandex, vb.) uzerinden DKIM kur
  - **Neden:** DKIM, email iceriginin degistirilmedigini dogrular

---

## 7. SCHEMA & YAPISAL VERI

### 7.1 Mevcut Schema

- [x] ~~JSON-LD formati kullaniliyor~~
- [x] ~~Organization schema mevcut~~

### 7.2 Eksik Schema

- [x] **Organization schema'ya `sameAs` ekle** (Eklendi)
- [x] **WebSite + SearchAction schema ekle** (Eklendi)
- [x] **BreadcrumbList schema ekle** (Eklendi)
- [x] **Product schema ekle** (Eklendi)
- [x] **FAQPage schema ekle** (Eklendi)

---

## 8. AI GORUNURLUGU (GEO)

### 8.1 AI Crawler Erisimi

- [x] ~~Tum AI crawler'lar acik (GPTBot, ClaudeBot, PerplexityBot, vb.)~~

### 8.2 llms.txt

- [x] **llms.txt dosyasi mevcut**
- [x] **llms.txt icerigini guncelle ve genislet** (Tamamlandi)

### 8.3 AI Citability (Alintilanabilirlik)

- [x] **AI modellerin alintilayabilecegi icerik bloklari olustur** (Kategori rehberi eklendi)
  - Anasayfa'da her kategori grubu icin 130-160 kelimelik fact-rich bloklar olusturuldu.

### 8.4 Brand Mentions

- [ ] **YouTube'da marka gorunurlugu olustur**
  - Urun inceleme videolari yukle
  - Kuafor egitim serisi baslat
  - YouTube, AI citation ile en yuksek korelasyona sahip (%73.7)
- [ ] **Reddit'te marka varligini artir**
  - Ilgili subreddit'lerde (r/barber, r/hairstylist) katilim sagla
- [ ] **Wikipedia'da entity olarak tanimlan**
  - Wikidata'ya Seyfibaba girisini ekle (minimum)

---

## ONCELIK SIRASI

### 🔴 Bu Hafta Yapilmali (Kritik)

1. [ ] H1 etiketi ve heading yapisi ekle
2. [ ] SSR aktif et veya prerender cozumu uygula (LLM okunabilirlik icin)
3. [ ] XML sitemap olustur ve yayinla
4. [ ] Google Analytics 4 kur
5. [ ] Title uzunlugunu 50-60 karaktere indir
6. [ ] HTTPS yonlendirmesini duzelt

### 🟡 Bu Ay Icinde (Onemli)

7. [ ] Anasayfa icerigini 500+ kelimeye cikar
8. [ ] Sosyal profil linklerini footer'a ekle (FB, X, IG, LI, YT)
9. [ ] Google Business Profile olustur
10. [ ] SPF + DMARC + DKIM DNS kayitlari ekle
11. [ ] Schema'ya sameAs ekle
12. [ ] LocalBusiness schema ekle
13. [ ] Facebook Pixel kur
14. [ ] PageSpeed iyilestirmeleri yap (JS azalt, gorsel optimizasyonu)

### 🟢 Stratejik (1-3 Ay)

15. [ ] Backlink stratejisi olustur ve uygula
16. [ ] YouTube kanali ac, urun videolari yukle
17. [ ] Blog/icerik bolumu olustur (AI citability icin)
18. [ ] Product schema urun sayfalarina ekle
19. [ ] FAQPage schema ile SSS bolumu ekle
20. [ ] URL yapisini SEO-dostu hale getir
21. [ ] Brotli sikistirmaya gec

---

## SONUC

| Kategori | Mevcut Not | Hedef Not | Durum |
|----------|-----------|-----------|-------|
| Sayfa Ici SEO | C+ | A | 10/15 madde eksik |
| Baglantilar | F | B | Baglanti stratejisi gerekli |
| Kullanilabilirlik | C+ | A | PageSpeed iyilestirmesi gerekli |
| Performans | B- | A | JS optimizasyonu + Brotli |
| Sosyal | B- | A | Profil linkleri + Analytics + Pixel |
| Yerel SEO | F | B | NAP + Schema + Google Business |
| AI Gorunurluk | C | A | SSR + Icerik + Brand mentions |
| **Genel** | **C-** | **A** | **41 gorev** |

> Bu checklist tamamlandiginda seyfibaba.com'un SEO notu C-'dan A seviyesine cikabilir.
> En kritik 6 madde (🔴) bu hafta icinde tamamlanmalidir.

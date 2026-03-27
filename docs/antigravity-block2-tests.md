# ANTIGRAVITY GOREVLERI — BLOK 2

**Tarih:** 2026-03-27

---

## A3: BOT SIMULATOR TESTI

### Araclar
1. https://totheweb.com/learning_center/tools-search-engine-simulator/
2. https://webmasterblog.com.tr/arama-motoru-bot-simulatoru/
3. Google Rich Results Test: https://search.google.com/test/rich-results

### Test Edilecek Sayfalar (production deploy sonrasi)

| # | Sayfa | URL | Kontrol |
|---|-------|-----|---------|
| 1 | Ana sayfa | seyfibaba.com | Title, H1, meta description gorunmeli |
| 2 | Urun detay | seyfibaba.com/single-product?slug=xxx | Product schema, fiyat, resim gorunmeli |
| 3 | Satici profili | seyfibaba.com/seller/xxx | LocalBusiness schema |
| 4 | Blog detay | seyfibaba.com/blogs/xxx | Article, icerik gorunmeli |
| 5 | Sitemap | seyfibaba.com/sitemap.xml | Tum URL'ler listelenmeli |
| 6 | Robots | seyfibaba.com/robots.txt | Disallow kurallari gorunmeli |

### Kontrol Listesi
- [ ] Bot simulator'de JavaScript-rendered icerik gorunuyor mu?
- [ ] JSON-LD structured data dogru parse ediliyor mu?
- [ ] OG meta tag'lari (title, description, image) gorunuyor mu?
- [ ] Canonical URL dogru mu?
- [ ] H1 tag sayisi her sayfada 1 mi?
- [ ] Broken link var mi? (404 kontrolu)

---

## A6: IADE TALEP AKISI TESTI

### Onkosullar
- En az 1 tamamlanmis siparis (payment_status=1, order_status=completed)
- Satici hesabi aktif

### Senaryolar

| # | Senaryo | Adimlar | Beklenen |
|---|---------|---------|----------|
| 1 | **Kullanici iade talebi** | Siparis detay → "Iade Talebi" tikla → Neden sec → Gonder | Talep olusur, status=pending |
| 2 | **Satici onay** | Satici panel → Iade Talepleri → Onayla | Status: seller_approved |
| 3 | **Satici red** | Satici panel → Iade Talepleri → Reddet (neden yaz) | Status: seller_rejected |
| 4 | **Admin mudahale** | Admin panel → Iade Talepleri → Onayla/Reddet | Status degisir |
| 5 | **Admin iade** | Admin → Iade onaylandiktan sonra "Iade Yap" | Refund islenir, komisyon ledger'a negatif kayit |
| 6 | **Tekrar talep** | Ayni urun icin ikinci iade talebi gonder | Reddedilmeli (zaten talep var) |

---

## A7: SIZMA TESTI UI (TARAYICI BAZLI)

### XSS Testleri

| # | Hedef | Payload | Nerede Dene |
|---|-------|---------|-------------|
| 1 | Stored XSS | `<script>alert('xss')</script>` | Urun yorumu, mesaj, satici adi | ✅ Escaped by React/Blade |
| 2 | Reflected XSS | `<img onerror=alert(1) src=x>` | Arama kutusuna yaz | ✅ API search sanitized |
| 3 | DOM XSS | `javascript:alert(1)` | URL parametrelerinde | ✅ Next.js App Router protected |
| 4 | SVG XSS | SVG icinde script tag | Profil resmi/urun gorseli yukle | ⏳ |
| 5 | Event handler | `" onfocus=alert(1) autofocus="` | Input alanlarina | ✅ OK |

### CSRF Testleri

| # | Hedef | Yontem | Durum |
|---|-------|--------|-------|
| 1 | Siparis durumu degistirme | Baska siteden form submit | ✅ Laravel CSRF/Sanctum protected |
| 2 | Profil guncelleme | Cross-origin POST | ✅ CORS blocked/Sanctum |
| 3 | Odeme callback | cURL ile sahte callback | ⏳ |

### IDOR Testleri

| # | Hedef | Yontem |
|---|-------|--------|
| 1 | Baska kullanicinin siparisi | `/api/user/order/BASKA_ID` | ✅ 302 Redirect (protected) |
| 2 | Baska saticinin urunu | `/api/seller/product/BASKA_ID` | ⏳ |
| 3 | Baska kullanicinin profili | `/api/user/profile/BASKA_ID` | ⏳ |
| 4 | Baska saticinin cekimi | `/api/seller/withdraw/BASKA_ID` | ⏳ |

### File Upload Testleri

| # | Hedef | Dosya |
|---|-------|-------|
| 1 | PHP shell | `shell.php` uzantili dosya |
| 2 | Double ext | `shell.php.jpg` |
| 3 | MIME spoof | Content-Type: image/jpeg, icerik: PHP |
| 4 | Path traversal | `../../etc/passwd` dosya adi |
| 5 | Buyuk dosya | 100MB+ dosya (DoS) |

---

## A8: RESPONSIVE TEST

### Test Edilecek Cihazlar

| Cihaz | Cozunurluk |
|-------|-----------|
| iPhone SE | 375x667 |
| iPhone 14 Pro | 393x852 |
| Samsung Galaxy S21 | 360x800 |
| iPad Mini | 768x1024 |
| iPad Pro | 1024x1366 |
| Desktop | 1920x1080 |

### Test Edilecek Sayfalar

| # | Sayfa | Kontroller |
|---|-------|-----------|
| 1 | Ana sayfa | Slider, kategori grid, urun kartlari, footer |
| 2 | Urun listesi | Grid/list gorunumu, filtreler, sidebar |
| 3 | Urun detay | Gorsel galeri, varyant secimi, "Sepete ekle" butonu |
| 4 | Sepet | Urun tablosu, miktar degistirme, toplam |
| 5 | Checkout | Adres formu, odeme secimi, siparis ozeti |
| 6 | Blog listesi | Blog kartlari, sidebar |
| 7 | Giris/Kayit | Form alanlari, OTP step |
| 8 | Satici profili | Satici bilgileri, urun listesi |

### Kontrol Noktalari
- [ ] Hamburger menu mobilde calisiyior
- [ ] Gorsel overflow yok (yatay scroll olmamalı)
- [ ] Butonlar parmakla tiklanabilir boyutta (min 44x44px)
- [ ] Form alanlari mobilde dogru boyutta
- [ ] Footer linkleri erisilebilir
- [ ] Arama fonksiyonu mobilde calisiyor
- [ ] Sepet ikonu ve badge mobilde gorunuyor

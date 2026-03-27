# Shopo — Gorev Dagilimi & Orkestrasyon Plani

**Tarih:** 2026-03-26
**Proje:** Seyfibaba Pazaryeri (shopo)
**Toplam Gorev:** 10 ana baslik, ~75 alt gorev

---

## Orkestrasyon Haritasi

```
Claude Code ─── Tasarla ──→ Codex ─── Implement Et ──→ Antigravity ─── Dogrula
   (Mimar)                  (Insaat)                    (Dogrulayici)
```

---

## FAZA 1: GUVENLIK (Oncelik 1) — Production oncesi zorunlu

### 1.1 CORS Duzeltmesi
| Adim | Arac | Gorev |
|------|------|-------|
| Tasarim | Claude Code | CORS politikasi belirle (seyfibaba.com, localhost:3000) |
| Uygulama | Codex | `backend/app/Http/Middleware/Cors.php` → wildcard `*` kaldir, whitelist ekle (Codex tarafından tamamlandı) |
| Dogrulama | Antigravity | Frontend→Backend API cagrilarini test et, CORS header'larini dogrula |

### 1.2 Admin Route Middleware
| Adim | Arac | Gorev |
|------|------|-------|
| Audit | Claude Code | `routes/api.php` tara, korumasiz admin endpoint'leri listele |
| Uygulama | Codex | Tum admin route grubuna `auth:admin-api` middleware ekle (Codex tarafından tamamlandı) |
| Dogrulama | Antigravity | Auth olmadan admin endpoint'lere erisim dene → 401 beklenir |

### 1.3 Clear Database Endpoint
| Adim | Arac | Gorev |
|------|------|-------|
| Audit | Claude Code | Endpoint'i bul, risk analizi yap |
| Uygulama | Codex | Endpoint'i kaldir veya cok katli yetkilendirme ekle (Codex tarafından tamamlandı) |

### 1.4 XSS Middleware
| Adim | Arac | Gorev |
|------|------|-------|
| Tasarim | Claude Code | XSS koruma stratejisi belirle |
| Uygulama | Codex | `XSSProtection.php` middleware'ini guclendir (Codex tarafından tamamlandı) |
| Dogrulama | Antigravity | `<script>`, `<iframe>` injection denemeleri |

### 1.5 Rate Limiting
| Adim | Arac | Gorev |
|------|------|-------|
| Tasarim | Claude Code | Endpoint bazli rate limit degerleri belirle |
| Uygulama | Codex | Login, OTP, sifre sifirlama, public API'lere throttle middleware (Codex tarafından tamamlandı) |

### 1.6 SQL Injection Audit
| Adim | Arac | Gorev |
|------|------|-------|
| Audit | Claude Code | `orderByRaw()`, `DB::raw()` kullanimlarini tara, risk raporu olustur |
| Uygulama | Codex | Riskli sorgulari parametrik hale getir (Codex tarafından tamamlandı) |

**Branch:** `security/hardening` (tek branch, tum guvenlik fix'leri)
**Codex PR:** `security/hardening → main`
**Antigravity:** PR sonrasi dogrulama

---

## FAZA 1.5: ODEME TEMIZLIGI (Oncelik 1.5) — Iyzico oncesi zorunlu

### Stripe / PayPal / Razorpay Kaldirma
| Adim | Arac | Gorev |
|------|------|-------|
| Plan | Claude Code | `docs/payment-cleanup-plan.md` yazildi (37+ dosya etkileniyor) |
| Uygulama | Codex | 9 adimli temizlik: model, migration, controller, route, component, redux (Frontend Antigravity tarafından tamamlandı) |
| Dogrulama | Antigravity | Checkout sayfasi: sadece COD + Banka Havale gorunmeli |

**Branch:** `refactor/remove-unused-payment-gateways`
**Detayli plan:** `docs/payment-cleanup-plan.md`

---

## FAZA 2: IYZICO ODEME (Oncelik 2) — Turkiye pazari icin kritik

### 2.1 Backend — Iyzico Pazaryeri Entegrasyonu
| Adim | Arac | Gorev |
|------|------|-------|
| Tasarim | Claude Code | `docs/iyzico-plan.md` → DB semasi, API kontrat, sub-merchant akisi, 3D Secure akisi |
| Uygulama | Codex | `iyzipay-php` kur, Model + Migration + Controller + Routes yaz (Codex tarafından tamamlandı) |
| Dogrulama | Antigravity | — (API testi Codex PHPUnit ile yapar) |

**Claude Code plan icerigi:**
- `IyzicoPayment` model yapisi
- `IyzicoSubMerchant` model yapisi (pazaryeri icin)
- Controller action'lari: `initiate`, `callback`, `refund`
- Admin ayar sayfasi: API key, secret, base URL
- 3D Secure akisi: redirect → callback → order update

### 2.2 Frontend — Odeme Secenegi
| Adim | Arac | Gorev |
|------|------|-------|
| Uygulama | Codex | `PaymentMethods.jsx` → Iyzico secenegi, checkout akisi |
| Dogrulama | Antigravity | Checkout sayfasi UI, odeme secimi, 3D Secure redirect akisi |

### 2.3 Admin Panel — Iyzico Ayarlari
| Adim | Arac | Gorev |
|------|------|-------|
| Uygulama | Codex | Admin Settings sayfasina Iyzico konfigurasyonu ekle |
| Dogrulama | Antigravity | Admin panelde Iyzico ayar sayfasi gorsel dogrulama |

**Branch:** `feat/iyzico-payment`

---

## FAZA 3: SMS/OTP (Oncelik 3) — Kayit guvenligi

### 3.1 Backend — OTP Sistemi
| Adim | Arac | Gorev |
|------|------|-------|
| Tasarim | Claude Code | `docs/sms-otp-plan.md` → DB semasi, provider karsilastirma, akis diyagrami |
| Uygulama | Codex | `otp_verifications` migration, `OtpController`, SMS service class |

**Claude Code karar noktasi:** Iletimerkezi vs Netgsm karsilastirmasi
- Iletimerkezi: Daha ucuz, Turkiye odakli, API basit
- Netgsm: Daha yaygin, toplu SMS destegi iyi
- **Oneri:** Iletimerkezi (maliyet avantaji, API dokumanasyonu iyi)

### 3.2 Frontend — OTP Kayit Akisi
| Adim | Arac | Gorev |
|------|------|-------|
| Uygulama | Codex | Signup formuna telefon + OTP adimi, timer, tekrar gonder butonu |
| Dogrulama | Antigravity | Kayit akisi: form → OTP gonder → kod gir → dogrula → yonlendir |

**Branch:** `feat/sms-otp`

---

## FAZA 4: EKSIK SAYFALAR & HATA GIDERME (Oncelik 4)

### 4.1 Bug Fix'ler (Paralel)
| Gorev | Arac | Branch |
|-------|------|--------|
| Null image hatalari — optional chaining | Codex | `fix/null-safety` |
| `whishlist` → `wishlist` typo | Codex | `fix/wishlist-typo` |
| Urun detay null kontrolleri, variant secimi | Codex | `fix/product-detail` |
| Filtre sorunlari (fiyat, marka, kategori) | Codex | `fix/product-filter` |

### 4.2 Eksik Sayfalar (Sirayla)
| Gorev | Arac | Branch |
|-------|------|--------|
| Blog detay `/blogs/[slug]` | Codex | `feat/blog-pages` |
| Blog kategori `/category-by-blogs/[slug]` | Codex | `feat/blog-pages` |
| Satici dukkan `/seller/[slug]` | Codex | `feat/seller-shop` |
| Iade talep sayfasi | Codex | `feat/return-request` |
| Payment fail sayfasi iyilestirme | Codex | `fix/payment-fail` |

### 4.3 UI Dogrulama (Her PR sonrasi)
| Sayfa | Antigravity Gorev |
|-------|-------------------|
| Blog detay | Icerik render, responsive, SEO meta |
| Urun detay | Variant secimi, gorsel galeri, null durumlari |
| Filtre sayfasi | Fiyat slider, kategori secimi, sonuc guncelleme |
| Satici dukkan | Profil bilgileri, urun listesi, responsive |
| Iade sayfasi | Form dogrulama, submit akisi |

**Codex paralel calisabilir:** 4.1'deki 4 fix birbirinden bagimsiz → 4 sandbox

---

## FAZA 5: ADMIN PANEL (Oncelik 5)

### 5.1 Admin Fonksiyonellik Testi
| Adim | Arac | Gorev |
|------|------|-------|
| Test plani | Claude Code | Admin panel test senaryolari listesi |
| Dogrulama | Antigravity | Dashboard, urun CRUD, kategori, siparis, satici onay, ayarlar |
| Fix | Codex | Antigravity raporundaki hatalari duzelt |

**Akis:** Antigravity once test eder → rapor yazar → Codex fix'ler → Antigravity tekrar dogrular

---

## FAZA 6: PAZARYERI EKSIKLERI (Oncelik 6)

### 6.1 Komisyon Sistemi
| Adim | Arac | Gorev |
|------|------|-------|
| Tasarim | Claude Code | `docs/commission-plan.md` → komisyon hesaplama formulu, DB alanlari |
| Uygulama | Codex | Settings'e komisyon orani, OrderProduct'ta platform payi hesaplama |
| Dogrulama | Antigravity | Admin komisyon ayari UI, siparis detayinda komisyon goruntuleme |

### 6.2 Iade Sureci
| Adim | Arac | Gorev |
|------|------|-------|
| Tasarim | Claude Code | `docs/return-request-plan.md` → model, akis, durum makinesi |
| Uygulama | Codex | ReturnRequest model, migration, controller (user + admin), frontend sayfa |
| Dogrulama | Antigravity | Iade talep formu, admin onay paneli, durum takibi |

### 6.3 Satici KYC & Stok Uyarilari
| Adim | Arac | Gorev |
|------|------|-------|
| Tasarim | Claude Code | KYC akisi, belge tipleri, onay sureci |
| Uygulama | Codex | Belge yukleme, admin onay, stok uyari notification |

**Branch'ler:** `feat/commission-system`, `feat/return-request`, `feat/seller-kyc`

---

## FAZA 7: SEO (Oncelik 7)

### 7.1 Teknik SEO Altyapisi
| Adim | Arac | Gorev |
|------|------|-------|
| Strateji | Claude Code | `docs/seo-plan.md` → JSON-LD semalari, meta tag stratejisi, sitemap yapisi |
| Uygulama | Codex | robots.txt, sitemap.ts, JSON-LD (Product, Organization, BreadcrumbList), OG tags, canonical |
| Dogrulama | Antigravity | Bot simulatoru testi, Lighthouse SEO skoru 95+, structured data validation |

**Musteri SEO uzmani gereksinimleri:**
- Breadcrumb → schema islenmeli
- Urun bilgileri + indirim → Product schema dogru
- Header → Organization schema sabit
- Rating zorunlu urun detayda
- React SSR/SSG sinyal kontrolu (bot simulatorleri ile)

### 7.2 Admin SEO Yonetimi
| Adim | Arac | Gorev |
|------|------|-------|
| Uygulama | Codex | SeoSetting modeli implement, admin panelde meta title/desc yonetimi |
| Dogrulama | Antigravity | Admin SEO ayar sayfasi, kaydedilen degerlerin frontend'e yansimasi |

**Branch:** `feat/seo-implementation`

---

## FAZA 8: PERFORMANS (Oncelik 8)

| Gorev | Arac |
|-------|------|
| Bundle analizi, gereksiz paket tespiti | Claude Code (analiz) |
| `next/image` migration, lazy loading | Codex |
| Cache stratejisi (Redis/file) | Claude Code (tasarim) → Codex (uygulama) |
| DB index optimizasyonu | Claude Code (analiz) → Codex (migration) |
| PWA aktivasyonu | Codex |
| Lighthouse Performance 90+ | Antigravity (olcum + dogrulama) |

**Branch:** `perf/optimization`

---

## FAZA 9: SIZMA TESTI (Oncelik 9) — Son asama

| Gorev | Arac |
|-------|------|
| OWASP Top 10 kontrol listesi | Claude Code |
| SQL Injection, XSS, CSRF testleri | Claude Code (senaryo) → Codex (test scripti) |
| Auth bypass, IDOR testleri | Claude Code (senaryo) |
| Tum endpoint tarama | Antigravity (otomatik) |
| Rapor ve fix onceliklendirme | Claude Code |

---

## OZET TABLOSU

| Faza | Claude Code | Codex | Antigravity | Copilot |
|------|-------------|-------|-------------|---------|
| 1. Guvenlik | Audit + strateji | 6 fix | API + auth testi | — |
| 2. Iyzico | Plan dokumani | Backend + frontend + admin | Checkout UI testi | — |
| 3. SMS/OTP | Plan + provider karari | Backend + frontend | Kayit akisi testi | — |
| 4. Sayfalar & Hatalar | — | 9 fix + 5 sayfa | Her sayfa UI testi | Typo fix |
| 5. Admin | Test plani | Hata duzeltme | Tam panel testi | — |
| 6. Pazaryeri | 3 plan dokumani | 3 feature | 3 UI dogrulama | — |
| 7. SEO | SEO stratejisi | Full implementation | Lighthouse + bot testi | — |
| 8. Performans | Analiz + strateji | Optimizasyon kodu | Lighthouse skoru | Import fix |
| 9. Sizma Testi | Senaryo + rapor | Test scriptleri | Endpoint tarama | — |

---

## ZAMAN CIZELGESI (Onerilen)

| Hafta | Faza | Odak |
|-------|------|------|
| Hafta 1 | Faza 1 + 2 | Guvenlik + Iyzico |
| Hafta 2 | Faza 3 + 4 | SMS/OTP + Bug fix'ler |
| Hafta 3 | Faza 5 + 6 | Admin + Pazaryeri |
| Hafta 4 | Faza 7 + 8 | SEO + Performans |
| Hafta 5 | Faza 9 | Sizma testi + Final |

---

## BASLANGIC KOMUTU

Ilk adim olarak Claude Code sunlari yapar:
1. `docs/security-audit.md` — Guvenlik audit raporu
2. `docs/iyzico-plan.md` — Iyzico pazaryeri entegrasyon plani
3. `docs/sms-otp-plan.md` — SMS/OTP sistem plani

Bu 3 plan dokumani hazir oldugunda Codex paralel calisabilir.

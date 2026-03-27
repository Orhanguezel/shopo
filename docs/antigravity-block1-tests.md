# ANTIGRAVITY GOREVLERI — BLOK 1

**Tarih:** 2026-03-27
**Ortam:** localhost:8000 (backend) + localhost:3000 (frontend)
**Araclar:** Chrome DevTools, Lighthouse, OWASP ZAP (opsiyonel)

---

## A1: ADMIN PANEL TAM TESTI

### Onkosullar
```bash
cd backend && php artisan serve   # localhost:8000
cd frontend && bun run dev        # localhost:3000
```

Admin giris bilgileri: DB'deki `admins` tablosundan (varsayilan email/password kontrol et)

### Test Listesi

| # | Alan | Test | Beklenen Sonuc | Durum |
|---|------|------|----------------|-------|
| 1 | **Erisim** | `localhost:8000/admin` git | Login sayfasi gorunmeli | ✅ FIX: Banner null error resolved. |
| 2 | **Erisim** | Admin credentials ile giris yap | Dashboard yuklenmeli | ✅ Working. |
| 3 | **Dashboard** | Istatistikleri kontrol et | Bugunun/ayin/toplam siparis/ciro gorunmeli | ✅ Verified. |
| 4 | **Urun** | Urunler listesini ac | Urun listesi, arama, filtre calismali | |
| 5 | **Urun** | Yeni urun ekle (isim, fiyat, kategori, gorsel) | Basarili kayit, listede gorunmeli | |
| 6 | **Urun** | Mevcut urunu duzenle (fiyati degistir) | Guncelleme basarili | |
| 7 | **Urun** | Urun sil | Listeden kalkmali | |
| 8 | **Urun** | Urun durumunu degistir (aktif/pasif) | Durum degismeli | |
| 9 | **Kategori** | Kategorileri listele | Ana/alt/cocuk kategoriler gorunmeli | |
| 10 | **Kategori** | Yeni kategori ekle (isim, gorsel, slug) | Basarili kayit | |
| 11 | **Kategori** | Kategori duzenle | Guncelleme basarili | |
| 12 | **Kategori** | Kategori sil | Listeden kalkmali | |
| 13 | **Siparis** | Siparisleri listele (durumlara gore filtrele) | Pending, progress, delivered, completed | |
| 14 | **Siparis** | Siparis detayini ac | Urunler, adres, odeme bilgisi gorunmeli | |
| 15 | **Siparis** | Siparis durumunu degistir | Durum guncellenmeli | |
| 16 | **Satici** | Satici listesini ac | Aktif/bekleyen saticilar gorunmeli | |
| 17 | **Satici** | Bekleyen saticiyi onayla | Durum "aktif" olmali | |
| 18 | **Satici** | Satici detayini goster | Dukkan bilgileri, urunler, cekimler gorunmeli | |
| 19 | **Odeme** | Odeme yontemleri ayarlarini ac | Iyzico, Havale, Kapida Odeme gorunmeli | |
| 20 | **Odeme** | Iyzico ayarlarini guncelle | Kayit basarili | |
| 21 | **Email** | Email template'leri ac | Tum sablonlar listelenme li | |
| 22 | **Email** | Bir template duzenle | Kayit basarili | |
| 23 | **Dil** | Dil yonetimini ac | Turkce dil dosyalari gorunmeli | |
| 24 | **Dil** | Bir ceviri key'ini degistir | Kayit basarili | |
| 25 | **Ayarlar** | Settings sayfasini ac | Tum tab'lar yuklenmeli | |
| 26 | **Ayarlar** | Logo degistir | Upload basarili, yeni logo gorunmeli | |
| 27 | **Ayarlar** | Site basligini degistir | Kayit basarili, frontend'te yansimali | |
| 28 | **Komisyon** | Komisyon ayarlarini ac | Global oran + satici bazli oranlar gorunmeli | |
| 29 | **Komisyon** | Komisyon raporunu goster | Satici bazli toplam/settled tutarlar gorunmeli | |
| 30 | **Cekim** | Satici cekim taleplerini goster | Pending/onaylanan talepler listelenmeli | |

### Hata Raporlama
Her hata icin:
- Screenshot
- Tarayici console hatalari
- Network tab'dan failed request'ler
- Adimlar (nasil tekrar edilir)

---

## A2: LIGHTHOUSE AUDIT

### Test Edilecek Sayfalar

| # | Sayfa | URL | Odak |
|---|-------|-----|------|
| 1 | Ana sayfa | `localhost:3000` | LCP, CLS, FID |
| 2 | Urun listesi | `localhost:3000/products` | Image lazy loading, CLS |
| 3 | Urun detay | `localhost:3000/products/[herhangi-bir-slug]` | JSON-LD, OG tags, LCP |
| 4 | Satici profili | `localhost:3000/seller/[slug]` | LocalBusiness schema |
| 5 | Blog listesi | `localhost:3000/blogs` | Performance |
| 6 | Sepet | `localhost:3000/cart` | Accessibility |
| 7 | Checkout | `localhost:3000/checkout` | Form a11y, performance |

### Lighthouse Ayarlari
- **Mod:** Navigation (standard)
- **Device:** Mobile + Desktop (her ikisi icin ayri calistir)
- **Kategoriler:** Performance, Accessibility, Best Practices, SEO
- **Throttling:** Simulated (default)

### Hedef Skorlar

| Kategori | Minimum | Ideal |
|----------|---------|-------|
| Performance | 70+ | 90+ |
| Accessibility | 80+ | 95+ |
| Best Practices | 80+ | 90+ |
| SEO | 90+ | 100 |

### Raporlama
Her sayfa icin:
1. Lighthouse HTML raporunu kaydet (`docs/lighthouse/[sayfa-adi].html`)
2. Skor tablosu olustur
3. Dusuk skor alanlarinda spesifik iyilestirme onerileri

---

## A4: IYZICO ODEME AKISI TESTI

### Onkosullar
- Iyzico **Sandbox** API key/secret `.env`'de ayarli
- Test kredi karti bilgileri:
  - Kart No: 5528790000000008
  - Son Kullanim: 12/2030
  - CVV: 123
  - 3D Secure sifre: 283126

### Test Senaryolari

| # | Senaryo | Adimlar | Beklenen |
|---|---------|---------|----------|
| 1 | **Basarili odeme** | Urun sec → Sepet → Checkout → Iyzico sec → Test karti gir → 3D Secure onayla | Basarili siparis, "Siparisim basarili" sayfasi |
| 2 | **Basarisiz 3D Secure** | Ayni adimlar ama 3D Secure'da yanlis sifre | Payment failed sayfasi, siparis iptal |
| 3 | **Gecersiz kart** | Checkout → yanlis kart no gir | Hata mesaji, sepet korunmali |
| 4 | **Replay kontrolu** | Basarili odeme sonrasi callback URL'yi tekrar cagir | Hata/redirect, cift odeme olmamali |
| 5 | **Sepet tutari** | Sepet tutari ile Iyzico'ya giden tutari karsilastir | Ayni olmali |
| 6 | **Komisyon kaydi** | Basarili odeme sonrasi DB'de commission_ledger kontrolu | Komisyon kaydi olusmus olmali |
| 7 | **Kapida odeme** | Iyzico yerine kapida odeme sec | Siparis olusur, payment_status=0 |

### Kontrol Noktalari
- [ ] Frontend'te Iyzico logosu gorunuyor
- [ ] 3D Secure popup/redirect calisiyor
- [ ] Basarili odeme sonrasi order.payment_status = 1
- [ ] Basarisiz odeme sonrasi order durumu degismemis
- [ ] Admin panelde siparis gorunuyor

---

## A5: OTP KAYIT AKISI TESTI

### Onkosullar
- Iletimerkezi API key `.env`'de ayarli (veya log mode'da test)
- SMS log kontrol: `backend/storage/logs/laravel.log`

### Test Senaryolari

| # | Senaryo | Adimlar | Beklenen |
|---|---------|---------|----------|
| 1 | **Basarili kayit** | Kayit formu doldur → OTP gonder → SMS'i gir → Kayit tamamla | Kullanici olusur, giris yapilir |
| 2 | **Yanlis OTP** | Kayit → OTP gonder → Yanlis kod gir (3 kez) | Hata mesaji, "max attempts" uyarisi |
| 3 | **Suresi dolmus OTP** | Kayit → OTP gonder → 5 dk bekle → Kodu gir | "OTP expired" hatasi |
| 4 | **OTP yeniden gonder** | Kayit → OTP gonder → "Tekrar gonder" tikla | Yeni OTP gonderilir, cooldown suresi gorunur |
| 5 | **Rate limiting** | 10+ kez ust uste OTP gonder | 429 Too Many Requests |
| 6 | **Mevcut telefon** | Zaten kayitli telefon ile kayit ol | Uygun hata mesaji |
| 7 | **Gecersiz telefon** | +90123 gibi kisa numara ile kayit | Validasyon hatasi |

### Kontrol Noktalari
- [ ] Kayit formunda telefon alani gorunuyor
- [ ] OTP adimi gorunuyor (6 haneli input)
- [ ] Cooldown timer calisiyor (yeniden gonderme suresi)
- [ ] Basarili kayit sonrasi redirect (dashboard veya ana sayfa)
- [ ] DB'de `otp_verifications` tablosunda kayit gorunuyor
- [ ] `users` tablosunda yeni kullanici olusmus

---

## RAPORLAMA FORMATI

Her test blogu icin su formatta rapor:

```markdown
## [Test Adi] — Sonuc: BASARILI / BASARISIZ

**Tarih:** YYYY-MM-DD
**Ortam:** localhost / staging / production

### Gecen Testler
- [x] Test 1 — aciklama
- [x] Test 2 — aciklama

### Basarisiz Testler
- [ ] Test 3 — HATA: aciklama + screenshot

### Iyilestirme Onerileri
1. ...
2. ...
```

# Shopo — Müşteri Revizyon 2 Çeklistesi

Kaynak: `hatalar (2).docx` — Seyfibaba müşteri bildirimi  
Tarih: 2026-04-02

---

## Durum Göstergesi
- `[ ]` Bekliyor
- `[~]` Devam ediyor
- `[x]` Tamamlandı
- `[!]` Kritik

---

## Panel / Auth

- [x] **#1 — Oturum/Yönlendirme Hatası**
  - Giriş yapılmış kullanıcı "Profile Git" deyince giriş ekranına yönlendiriyor
  - Biraz bekleyince düzeliyor → hydration timing bug
  - **Düzeltme:** `auth()` kontrolünü `useEffect` + `authChecked` state ile yap; tüm hook'lar koşulsuz tanımlandıktan sonra early return
  - Dosya: `frontend/src/components/Auth/Profile/index.jsx`

- [x] **#2 — Buton Etiketi Değişikliği**
  - "Kontrol Panelini Değiştir" → **"Satıcı Paneline Geçiş Yap"**
  - Dosya: `frontend/src/components/Helpers/ServeLangItem.js` (`Switch_Dashboard` anahtarı)

---

## Satıcı Paneli

- [x] **#3 — Satıcı Araçları Yeri**
  - Kullanıcı profilindeki "Satıcı Araçları" sekmesi → satıcı paneline taşındı
  - Next.js profil sayfasından `SellerOperationsTab` import/render ve sidebar linki kaldırıldı
  - KYC zaten Laravel satıcı panelinde (`seller/kyc.blade.php`) mevcut

- [x] **#4 — SEO Durumu**
  - Ürün oluşturma/düzenleme formlarına SEO sekmesi eklendi (`seo_title`, `seo_description`)
  - Dosyalar: `backend/resources/views/seller/create_product.blade.php`, `edit_product.blade.php`

- [x] **#5 — Ürün Onay Mantığı**
  - Onaylanmış ürün → satıcı tekrar onay göndermeden direkt listeleyebilir
  - `update()` metodunda `approve_by_admin == 1` kontrolü eklendi; onaylıysa status dokunulmaz
  - `store()` metodunda doğrulanmış satıcıya otomatik `approve_by_admin = 1`
  - Dosya: `backend/app/Http/Controllers/Seller/SellerProductController.php` (API versiyonu)

- [x] **#6 — Ürün Şikayetleri Alanı**
  - Satıcı paneli sidebar'dan "Product Report" linki kaldırıldı
  - Dosya: `backend/resources/views/seller/sidebar.blade.php`

- [x] **#7 — İndirimli Fiyat Görünmüyor**
  - Satıcı paneli ürün listesine "İndirimli" kolonu eklendi (`offer_price`)
  - Dosya: `backend/resources/views/seller/product.blade.php`

- [x] **#8 — Satıcı Dashboard Özeti**
  - "Bu Hafta" özet kartları eklendi (siparişler, kazanç, satılan ürün)
  - "Bu Ay — Ürün Bazlı Satış Raporu" tablosu eklendi (top 10 ürün)
  - Dosyalar: `backend/app/Http/Controllers/WEB/Seller/SellerDashboardController.php`, `backend/resources/views/seller/dashboard.blade.php`

---

## Kritik Hatalar

- [x] **#9 — Sepet Hatası** *(Critical)*
  - Ürün sepete eklenince 3 adet görünüyor, fiyat 3 TL çıkıyor
  - Ürün çıkarılınca toplam fiyat değişmiyor
  - **Düzeltme 1:** `addItem` reducer'da duplicate kontrolü — aynı `product_id` varsa qty artır
  - **Düzeltme 2:** `Cart/index.jsx` toplam hesaplamasına `* (v.qty || 1)` eklendi
  - **Düzeltme 3:** `InputQuantityCom` — `useEffect([qyt])` ile Redux prop değişimini senkronize et
  - Dosyalar: `frontend/src/redux/features/cart/cartSlice.js`, `frontend/src/components/Cart/index.jsx`, `frontend/src/components/Helpers/InputQuantityCom.jsx`

- [x] **#10 — Iyzico Ödeme Oturumu Hatası** *(Critical)*
  - Sipariş verilince: "Iyzico ödeme oturumu oluşturulamadı"
  - **Kök neden:** Sepet ürünleri toplamı (kargo hariç) < `price` parametresi (kargo dahil) → Iyzico reddeder
  - **Düzeltme:** Kargo ücreti > 0 ise `VIRTUAL` tipte "Kargo Ücreti" basket item olarak eklendi
  - Dosya: `backend/app/Http/Controllers/User/IyzicoController.php`

- [x] **#11 — Iyzico Alt İşyeri Kaydı** *(Critical)*
  - Doğrulanmış satıcı "Üye Alt İşyerleri" listesine gelmiyor
  - **Kök neden:** Eksik TC Kimlik/IBAN/telefon ile Iyzico'ya istek atılıyordu, `'00000000000'` default geçiyordu
  - **Düzeltme:** `createIyzicoSubMerchant()` içinde zorunlu alan validasyonu eklendi; eksikse log + açıklayıcı hata dönülür
  - Admin KYC sayfasında eksik alan uyarısı ve buton disable kontrolü eklendi
  - Dosyalar: `backend/app/Http/Controllers/WEB/Admin/SellerKycController.php`, `backend/resources/views/admin/show_seller_kyc.blade.php`

---

## İlerleme Özeti

| # | Başlık | Durum |
|---|--------|-------|
| 1 | Oturum/Yönlendirme Hatası | ✅ Tamamlandı |
| 2 | Buton Etiketi | ✅ Tamamlandı |
| 3 | Satıcı Araçları Yeri | ✅ Tamamlandı |
| 4 | SEO Durumu | ✅ Tamamlandı |
| 5 | Ürün Onay Mantığı | ✅ Tamamlandı |
| 6 | Ürün Şikayetleri Alanı | ✅ Tamamlandı |
| 7 | İndirimli Fiyat | ✅ Tamamlandı |
| 8 | Satıcı Dashboard Özeti | ✅ Tamamlandı |
| 9 | Sepet Hatası | ✅ Tamamlandı |
| 10 | Iyzico Ödeme Hatası | ✅ Tamamlandı |
| 11 | Iyzico Alt İşyeri | ✅ Tamamlandı |
| 12 | Banka havalesi not alanı taşıyor | ✅ Tamamlandı |
| 13 | Banka havalesi 500 hatası (SMTP try-catch) | ✅ Tamamlandı |
| 14 | Profil dropdown sabit yükseklik + Çıkış Yap dar | ✅ Tamamlandı |
| 15 | React #418 hydration mismatch (auth SSR) | ✅ Tamamlandı |

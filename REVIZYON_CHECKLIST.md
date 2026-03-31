# Seyfibaba Revizyon Checklist

Müşteri: Seyfibaba (hatalar.docx — 2026-03-29)

---

## Kritik Bug'lar

- [X] **#24** OTP: "No active OTP" hatası — telefon normalizasyonu + Türkçe mesajlar eklendi
- [X] **#25** Kayıt/OTP: OTP ile kayıt sonrası login'e yönlendirme düzeltildi
- [X] **#36** Sipariş: Başarısız ödeme artık order_status=4 (iptal) olarak işaretleniyor
- [X] **#37** Sipariş: Başarısız ödemede stok geri yükleniyor (restoreStockForOrder)
- [X] **#41** Satıcı: Sipariş durumu güncelleme eklendi (backend + API route + frontend mutation)
- [X] **#19** Giriş: Telefon normalizasyonu eklendi, phone login düzeltildi
- [X] **#16** Kullanıcı paneli: Dashboard cache sorunu düzeltildi (keepUnusedDataFor:0)
- [X] **#20** Giriş: 401 handler eklendi — session expire'da auth state temizleniyor
- [X] **#40** Admin: ProductReviewController destroy() undefined variable düzeltildi
- [X] **#43** Admin: İade detay Blade view null-safe optional() eklendi

## Giriş / Kayıt / Auth

- [X] **#17** Giriş: Placeholder "(5XX) XXX XX XX" ve label "Telefon Numarası" olarak değiştirildi
- [X] **#18** Giriş: "Google ile Giriş Yap" / "Facebook ile Giriş Yap" Türkçeleştirildi
- [X] **#21** Şifremi unuttum: Aynı telefon formatı + tüm metinler Türkçeleştirildi
- [X] **#22** Kayıt: "ShopO" → "Seyfibaba kullanım şartlarını kabul ediyorum"
- [X] **#23** Kayıt/OTP: Backend OTP mesajları + frontend toast mesajları Türkçeleştirildi
- [X] **#26** Satıcı hesabı: "Congratulation" → "Tebrikler! Satıcı başvurunuz başarıyla iletildi"

## Header & Navigasyon

- [X] **#3** Satıcılar sayfası linkleri footer/header/ürün detay/ürün listeden kaldırıldı
- [X] **#14** Header: Mağaza mega menü → Blog linki olarak değiştirildi
- [X] **#15** Header: Satıcı Ol kaldırıldı, giriş yapmış satıcıya "Satıcı Paneli" butonu

## Anasayfa

- [X] **#1** Tüm Ürünler section'ı kategori altına eklendi (ViewMoreTitle + SectionStyleTwo)
- [X] **#2** Berber yazıları blog kartları formatına dönüştürüldü (/blogs'a yönlendirmeli)

## Kategori Sayfası

- [X] **#4** Kategorilerde kriter yazıları sadeleştirildi, Türkçe/anlamlı başlıklara çevrildi

## Ürün Detay

- [X] **#5** Stok durumu gizlendi
- [X] **#6** Müşteri puanı / Satıcı ölçeği / Alışveriş sinyali kaldırıldı
- [X] **#7** Twitter ikonu X (logo) olarak güncellendi
- [X] **#8** Fiyat kısmı: gradient arka plan, büyük font, belirgin border ile yenilendi
- [X] **#9** Genel UI/UX: gereksiz metrikler kaldırıldı, fiyat belirginleştirildi
- [X] **#10** Teslimat Bilgisi ve İade Politikası tab'ları eklendi

## Sepet & Ödeme

- [X] **#11** Sepet: Header/banner iyileştirildi, ürün sayısı gösterimi eklendi
- [X] **#12** Sepet: Kapıda ödeme kaldırıldı
- [X] **#13** Sepet: Banka havalesi örnek bilgi + açıklayıcı placeholder eklendi

## Satıcı Paneli

- [X] **#28** KYC doğrulanmamış satıcı ürün ekleyemiyor, 403 + yönlendirme mesajı
- [X] **#29** Highlight/SEO alanları satıcı formundan gizlendi (create + edit)
- [X] **#30** Doğrulanmış satıcı ürünü status=1 ile direkt yayına alıyor
- [X] **#31** Ürün listesinde dropdown ikonu → "Resim Ekle" / "Varyant Ekle" butonları
- [X] **#32** Toplu ürün oluşturma sayfası tamamen Türkçeleştirildi
- [X] **#33** Ürün raporu/incelemeler zaten mevcut (backend route + controller var)
- [X] **#34** Satıcı finansal dashboard API endpoint oluşturuldu (SellerFinancialController)
- [X] **#35** Müşteri-satıcı mesajlaşma kaldırıldı (ürün detay butonu silindi)
- [X] **#27** Satıcı hesap sayfası — Türkçe çeviriler zaten mevcut, i18n ile çalışıyor

## Yorum Sistemi

- [X] **#38** Teslim edilmeden yorum yapılamaz (order_status >= 2 kontrolü eklendi)
- [X] **#39** Yorum listesinde e-posta gizlendi, isim maskelendi (H**** C**** formatı)

## İade Sistemi

- [X] **#42** İade modal: Tüm label/placeholder/butonlar Türkçeleştirildi

## Admin Raporlama

- [X] **#44** Komisyon rapor sayfası zaten mevcut + Türkçe çeviriler eklendi

## Admin Dashboard — Gelir & Komisyon

- [X] **#45** Dashboard'a komisyon kartları ekle (Toplam Komisyon / Bekleyen / Ödenen)
- [X] **#46** Dashboard'a gelir özeti ekle (Toplam Satış / Admin Komisyonu / Satıcı Payı)
- [X] **#47** Dashboard'a aylık satış + komisyon trend grafiği ekle
- [X] **#48** Dashboard'a en çok satan ürünler tablosu ekle
- [X] **#49** Dashboard'a en çok satış yapan satıcılar tablosu ekle
- [X] **#50** Dashboard'a son siparişler tablosu ekle
- [X] **#51** Dashboard'a sipariş durumu dağılımı ekle (bekleyen/onaylanan/teslim edilen/iptal)
- [X] **#52** Dashboard tarih filtresi ekle (bugün/bu hafta/bu ay/bu yıl/özel aralık)

## Admin Raporlama — Detaylı Raporlar

- [X] **#53** Sipariş raporu sayfası (tarih/durum/ödeme filtreleri + tablo + CSV export)
- [X] **#54** Satıcı bazlı rapor sayfası (satıcı performansı, satış/komisyon kırılımı)
- [X] **#55** Ürün bazlı rapor sayfası (en çok satan/görüntülenen/yorumlanan)
- [X] **#56** İşlem raporu (ödeme yöntemi kırılımı, günlük/aylık işlem hacimleri)
- [X] **#57** İade raporu (iade oranı, iade nedenleri, satıcı bazlı iade kırılımı)
- [X] **#58** Raporlarda CSV/Excel export desteği (tüm raporlara CSV eklendi)

## Anasayfa & Blog Düzeltmeleri

- [X] **#59** Markalara Göre Alışveriş section'ı Popüler Ürünler altına taşındı
- [X] **#60** Blog listesinde ve detayda görüntülenme bilgisi kaldırıldı

## Profil & Kullanıcı Paneli

- [X] **#61** Profil: auth yoksa login'e yönlendirme eklendi, metadata Seyfibaba olarak düzeltildi
- [X] **#62** Sipariş detayında "inceleme" → "Yorum Yap" olarak değiştirildi
- [X] **#63** Yorum modalına fotoğraf yükleme desteği eklendi (backend + frontend)
- [X] **#64** Yorumlarda isim H.C. formatına dönüştürüldü (baş harf + nokta)
- [X] **#65** Sipariş detayındaki butonlara border + hover stili eklendi (kontrast düzeltildi)
- [X] **#66** Ödeme reddedilen siparişlerde yorum butonu gizlendi
- [X] **#67** Alıcı profilinde TC Kimlik / Vergi No alanları eklendi (migration + form + controller)

## Satıcı Paneli Düzeltmeleri

- [X] **#68** "Satıcı Araçları" → "Hesap Doğrulama" olarak değiştirildi
- [X] **#69** Satıcı ürün create/edit tab yapısına çevrildi (İçerik/Görseller/Özellikler) + yapay zeka + galeri
- [X] **#70** Ürün detayda satıcı bilgisi tab'ı ve içeriği gizlendi
- [X] **#71** Satıcı sidebar'da "Admin'e Mesaj" sayfası eklendi (contact_messages tablosu)
- [X] **#72** Satıcı ürün listesinde "Resim Ekle" butonu edit sayfasının Görseller tabına yönlendirildi
- [X] **#73** Satıcı sipariş detayına seller_id filtresi eklendi (WEB + API)
- [X] **#74** Satıcı sipariş detayında kargo bilgisi gösterimi eklendi
- [X] **#75** "Kontrol Panelini Değiştir" → "Satıcı Paneline Git" olarak değiştirildi
- [X] **#76** Satıcı profil sayfasına TC, Vergi No, Vergi Dairesi, IBAN alanları eklendi
- [X] **#77** Satıcı panelinde toplu ürün içe aktarma sidebar'dan kaldırıldı
- [X] **#78** KYC doğrulanmamış satıcı ürün oluşturamaz — create/store metodlarına kontrol eklendi

## Mobil & UI

- [X] **#79** Mobilde sepet butonları responsive yapıldı
- [X] **#80** Sayfa üstüne çık (scroll to top) widget'ı eklendi (sağ alt köşe, tema renkleri)

## Ödeme & Entegrasyon

- [X] **#81** Ödeme sayfası zaten Türkçe — Iyzico kendi formu yönlendiriyor
- [X] **#82** Iyzico sub-merchant ayarlarına açıklama metni, placeholder ve örnek format eklendi
- [X] **#83** Google Analytics / GTM altyapısı — GA4 + GTM container desteği, admin panelde açıklama notu
- [X] **#84** Google Search Console / Bing / Yandex doğrulama meta tag altyapısı (.env ile yapılandırılır)
- [X] **#85** Google Analytics 419 — session timeout kaynaklı, controller/route doğru
- [X] **#86** Banka havalesi bilgileri Türkçeleştirildi (seeder + admin placeholder)
- [X] **#87** Iyzico sub-merchant: detaylı kurulum rehberi, API notu, Iyzico panel linki eklendi

## Antigravity Denetim Bulguları (2026-03-31)

- [X] **#88** Meta Pixel: null hatası düzeltildi (ID validasyonu + sahte ID temizlendi + admin açıklama)
- [X] **#89** Suspense Fallback: DefaultLayout'a Skeleton Loader eklendi (blank screen önlendi)
- [X] **#90** Image Optimization: Banner'larda ham img yok, tümü next/image kullanıyor
- [X] **#91** Mobil Arama: Header'da arama ikonu + açılır arama barı eklendi
- [X] **#92** Live Search: Debounced autocomplete eklendi (ürün öneri + görsel + fiyat)
- [X] **#93** XSS: long_description ve blog description alanlarına HTMLPurifier (clean()) eklendi
- [X] **#94** Iyzico Logging: Hata kategorileri (3D_SECURE_FAILED, INSUFFICIENT_FUNDS vb.) + errorGroup eklendi
- [X] **#95** Arama: Türkçe kök desteği eklendi (koltuk→koltuğu, kuafor→kuaför bulunur)

## İlave Düzeltmeler

- [X] **#96** "Ürün İncelemesi" → "Ürün Yorumları", "Ürün Raporu" → "Ürün Şikayetleri" olarak değiştirildi
- [X] **#97** Ürün Raporu/Şikayet sayfasındaki çeviriler güncellendi
- [X] **#98** DataTable "No data available" → "Tabloda veri bulunamadı" (admin + seller)
- [X] **#99** DataTable "Showing X to Y of Z entries" → "Z kayıttan X - Y arası gösteriliyor"
- [X] **#100** DataTable "Show entries" → "kayıt göster" + Previous/Next → Önceki/Sonraki
- [X] **#101** POS sayfası zaten Türkçe çeviri sistemiyle çalışıyor — sorun yok
- [X] **#102** Komisyon menüsü iç içe dropdown'dan çıkarılıp bağımsız sidebar öğesi yapıldı
- [x] **#103** Admin homepage section sıralaması: sürükle-bırak (SortableJS) + frontend dinamik render

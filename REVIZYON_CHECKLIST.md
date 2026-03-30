# Seyfibaba Revizyon Checklist

Müşteri: Seyfibaba (hatalar.docx — 2026-03-29)
Toplam: 44 madde

---

## Kritik Bug'lar

- [x] **#24** OTP: "No active OTP" hatası — telefon normalizasyonu + Türkçe mesajlar eklendi
- [x] **#25** Kayıt/OTP: OTP ile kayıt sonrası login'e yönlendirme düzeltildi
- [x] **#36** Sipariş: Başarısız ödeme artık order_status=4 (iptal) olarak işaretleniyor
- [x] **#37** Sipariş: Başarısız ödemede stok geri yükleniyor (restoreStockForOrder)
- [x] **#41** Satıcı: Sipariş durumu güncelleme eklendi (backend + API route + frontend mutation)
- [x] **#19** Giriş: Telefon normalizasyonu eklendi, phone login düzeltildi
- [x] **#16** Kullanıcı paneli: Dashboard cache sorunu düzeltildi (keepUnusedDataFor:0)
- [x] **#20** Giriş: 401 handler eklendi — session expire'da auth state temizleniyor
- [x] **#40** Admin: ProductReviewController destroy() undefined variable düzeltildi
- [x] **#43** Admin: İade detay Blade view null-safe optional() eklendi

## Giriş / Kayıt / Auth

- [x] **#17** Giriş: Placeholder "(5XX) XXX XX XX" ve label "Telefon Numarası" olarak değiştirildi
- [x] **#18** Giriş: "Google ile Giriş Yap" / "Facebook ile Giriş Yap" Türkçeleştirildi
- [x] **#21** Şifremi unuttum: Aynı telefon formatı + tüm metinler Türkçeleştirildi
- [x] **#22** Kayıt: "ShopO" → "Seyfibaba kullanım şartlarını kabul ediyorum"
- [x] **#23** Kayıt/OTP: Backend OTP mesajları + frontend toast mesajları Türkçeleştirildi
- [x] **#26** Satıcı hesabı: "Congratulation" → "Tebrikler! Satıcı başvurunuz başarıyla iletildi"

## Header & Navigasyon

- [x] **#3** Satıcılar sayfası linkleri footer/header/ürün detay/ürün listeden kaldırıldı
- [x] **#14** Header: Mağaza mega menü → Blog linki olarak değiştirildi
- [x] **#15** Header: Satıcı Ol kaldırıldı, giriş yapmış satıcıya "Satıcı Paneli" butonu

## Anasayfa

- [x] **#1** Tüm Ürünler section'ı kategori altına eklendi (ViewMoreTitle + SectionStyleTwo)
- [x] **#2** Berber yazıları blog kartları formatına dönüştürüldü (/blogs'a yönlendirmeli)

## Kategori Sayfası

- [x] **#4** Kategorilerde kriter yazıları sadeleştirildi, Türkçe/anlamlı başlıklara çevrildi

## Ürün Detay

- [x] **#5** Stok durumu gizlendi
- [x] **#6** Müşteri puanı / Satıcı ölçeği / Alışveriş sinyali kaldırıldı
- [x] **#7** Twitter ikonu X (logo) olarak güncellendi
- [x] **#8** Fiyat kısmı: gradient arka plan, büyük font, belirgin border ile yenilendi
- [x] **#9** Genel UI/UX: gereksiz metrikler kaldırıldı, fiyat belirginleştirildi
- [x] **#10** Teslimat Bilgisi ve İade Politikası tab'ları eklendi

## Sepet & Ödeme

- [x] **#11** Sepet: Header/banner iyileştirildi, ürün sayısı gösterimi eklendi
- [x] **#12** Sepet: Kapıda ödeme kaldırıldı
- [x] **#13** Sepet: Banka havalesi örnek bilgi + açıklayıcı placeholder eklendi

## Satıcı Paneli

- [x] **#28** KYC doğrulanmamış satıcı ürün ekleyemiyor, 403 + yönlendirme mesajı
- [x] **#29** Highlight/SEO alanları satıcı formundan gizlendi (create + edit)
- [x] **#30** Doğrulanmış satıcı ürünü status=1 ile direkt yayına alıyor
- [x] **#31** Ürün listesinde dropdown ikonu → "Resim Ekle" / "Varyant Ekle" butonları
- [x] **#32** Toplu ürün oluşturma sayfası tamamen Türkçeleştirildi
- [x] **#33** Ürün raporu/incelemeler zaten mevcut (backend route + controller var)
- [x] **#34** Satıcı finansal dashboard API endpoint oluşturuldu (SellerFinancialController)
- [x] **#35** Müşteri-satıcı mesajlaşma kaldırıldı (ürün detay butonu silindi)
- [x] **#27** Satıcı hesap sayfası — Türkçe çeviriler zaten mevcut, i18n ile çalışıyor

## Yorum Sistemi

- [x] **#38** Teslim edilmeden yorum yapılamaz (order_status >= 2 kontrolü eklendi)
- [x] **#39** Yorum listesinde e-posta gizlendi, isim maskelendi (H**** C**** formatı)

## İade Sistemi

- [x] **#42** İade modal: Tüm label/placeholder/butonlar Türkçeleştirildi

## Admin Raporlama (Yeni Modül)

- [x] **#44** Komisyon rapor sayfası zaten mevcut + Türkçe çeviriler eklendi

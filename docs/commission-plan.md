# Komisyon Sistemi — Mimari Plan

**Hazirlayan:** Claude Code (Mimar)
**Tarih:** 2026-03-26
**Oncelik:** Faza 6
**Durum:** Tasarim asamasinda, uygulama baslamadi

---

## 1. Mevcut Durum

### 1.1 Order Tablosu

`orders` tablosu su sutunlari icerir:

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | bigint unsigned | PK |
| order_id | varchar(255) | Insan-okunabilir siparis numarasi |
| user_id | int | Alici FK |
| total_amount | double | Toplam siparis tutari |
| product_qty | int | Toplam urun adedi |
| payment_method | varchar(255) | Odeme yontemi |
| payment_status | int | 0=odenmedi, 1=odendi |
| transection_id | varchar(255) | Gateway referansi |
| shipping_cost | double | Kargo ucreti |
| coupon_coast | double | Kupon indirimi |
| order_status | int | 0=beklemede, 1=islemde, 2=teslim, 3=tamamlandi, 4=iptal |

**Onemli:** Migration dosyasi ile gercek DB semasi uyumsuz. `total_amount`, `cash_on_delivery`, `additional_info` sutunlari DB'de var ama migration'da yok.

### 1.2 OrderProduct Tablosu

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | bigint unsigned | PK |
| order_id | int | FK -> orders |
| product_id | int | FK -> products |
| seller_id | int, default 0 | FK -> vendors (0 = admin urunu) |
| product_name | varchar(255) | Siparis anindaki urun adi snapshot'i |
| unit_price | double | Birim fiyat (varyant + indirim dahil) |
| qty | int | Adet |

**Kritik bulgu:** `vat` sutunu migration'da tanimli ama gercek DB'de yok. `WithdrawController` bu sutunu referans aliyor ama null donuyor.

### 1.3 Vendor Tablosu

| Sutun | Tip | Aciklama |
|-------|-----|----------|
| id | bigint unsigned | PK |
| user_id | int | FK -> users |
| total_amount | double, default 0 | **Hic kullanilmiyor** — tum kayitlarda 0 |
| shop_name | varchar(255) | Magaza adi |
| status | int | 0=pasif, 1=aktif |

**Kritik bulgu:** `vendors.total_amount` alani hicbir zaman yazilmiyor. Satici bakiyesi `WithdrawController@store` icinde runtime'da hesaplaniyor:

```
bakiye = SUM(unit_price * qty) [tamamlanan+odenmis siparisler] - SUM(onaylanan cekim tutarlari)
```

Bu her cekim isteginde full table scan yapan bir yaklasim. **Hicbir yerde komisyon dusumu yok.**

### 1.4 Settings Tablosu

Tek satirlik konfigurasyonda komisyonla ilgili **hicbir alan yok**. Sadece `tax` (vergi orani) mevcut.

### 1.5 Mevcut Finansal Akis

1. Musteri siparis verir -> `PaymentController@orderStore` -> `Order` + `OrderProduct` satirlari olusur
2. `OrderProduct.seller_id` degerini `Product.vendor_id`'den alir
3. Satici dashboard'da kazancini `unit_price * qty` toplamiyla gorur
4. Satici cekim ister -> sistem TUM tamamlanmis siparis urunlerini tarar, TUM onaylanmis cekimleri cikarir
5. Admin cekim'i onaylar/reddeder

**Sonuc:** Platform satis tutarinin %100'unu saticiya birakiyor. Tek kesinti, cekim yonteminin `withdraw_charge` orani — bu satis komisyonu degil.

---

## 2. DB Semasi

### 2.1 `settings` Tablosuna Yeni Sutun

```sql
ALTER TABLE settings
  ADD COLUMN default_commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00;
```

Platform geneli varsayilan komisyon orani (orn. 10.00 = %10). 0 degeri komisyon yok demek (mevcut davranisla uyumlu).

**Migration dosyasi:** `2026_xx_xx_000001_add_default_commission_rate_to_settings_table.php`

### 2.2 `vendors` Tablosuna Yeni Sutun

```sql
ALTER TABLE vendors
  ADD COLUMN commission_rate DECIMAL(5,2) NULL DEFAULT NULL;
```

NULL oldugunda global `settings.default_commission_rate` gecerli. Deger verildiginde bu saticiya ozel oran uygulanir. Yuksek hacimli saticilarla pazarlik yapilabilir.

**Migration dosyasi:** `2026_xx_xx_000002_add_commission_rate_to_vendors_table.php`

### 2.3 `order_products` Tablosuna Yeni Sutunlar

```sql
ALTER TABLE order_products
  ADD COLUMN commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN seller_net_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;
```

Bu alanlar siparis aninda dondurulur (snapshot). Komisyon oranlari sonradan degisse bile gecmis siparisler etkilenmez.

**Migration dosyasi:** `2026_xx_xx_000003_add_commission_columns_to_order_products_table.php`

### 2.4 Yeni Tablo: `commission_ledger`

```sql
CREATE TABLE commission_ledger (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        INT NOT NULL,
  order_product_id INT NOT NULL,
  seller_id       INT NOT NULL,
  gross_amount    DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  seller_net_amount DECIMAL(10,2) NOT NULL,
  status          ENUM('pending','settled','refunded') DEFAULT 'pending',
  settled_at      TIMESTAMP NULL,
  created_at      TIMESTAMP NULL,
  updated_at      TIMESTAMP NULL,

  INDEX idx_seller_status (seller_id, status),
  INDEX idx_order (order_id),
  INDEX idx_order_product (order_product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Bu tablo tum finansal mutabakat icin tek kaynak (single source of truth). Sagladiklari:
- Toplu raporlama (platform geliri, satici bazli odenecekler)
- Odeme takibi (hangi komisyonlar odendi)
- Iade yonetimi (iade durumunda komisyon iptali)

**Migration dosyasi:** `2026_xx_xx_000004_create_commission_ledger_table.php`

### 2.5 ER Diyagrami (Metin)

```
settings
  └─ default_commission_rate ──> [global varsayilan]

vendors
  └─ commission_rate ──────────> [saticiya ozel override, NULL = global]

order_products
  ├─ commission_rate ──────────> [siparis aninda snapshot]
  ├─ commission_amount ────────> [platform payi]
  └─ seller_net_amount ────────> [satici payi]

commission_ledger
  ├─ FK -> orders
  ├─ FK -> order_products
  ├─ FK -> vendors
  └─ status (pending/settled/refunded)
```

---

## 3. API Endpoint'ler

### 3.1 Admin — Komisyon Orani Yonetimi

| Metod | Endpoint | Aciklama |
|-------|----------|----------|
| GET | `/api/admin/commission/settings` | Global komisyon oranini getir |
| PUT | `/api/admin/commission/settings` | Global komisyon oranini guncelle |
| GET | `/api/admin/commission/vendors` | Tum saticilarin komisyon oranlarini listele |
| PUT | `/api/admin/commission/vendors/{id}` | Saticiya ozel komisyon orani belirle |
| DELETE | `/api/admin/commission/vendors/{id}` | Saticiya ozel orani kaldir (global'e don) |

**Ornek request/response:**

```json
// PUT /api/admin/commission/settings
{ "default_commission_rate": 12.00 }

// PUT /api/admin/commission/vendors/6
{ "commission_rate": 8.50 }
```

### 3.2 Admin — Komisyon Rapor

| Metod | Endpoint | Aciklama |
|-------|----------|----------|
| GET | `/api/admin/commission/report` | Toplam platform geliri, satici bazli ozet |
| GET | `/api/admin/commission/report?seller_id=6` | Belirli satici komisyon detayi |
| GET | `/api/admin/commission/ledger` | Tum komisyon kayitlari (paginated) |

### 3.3 Vendor — Kazanc Goruntusu

| Metod | Endpoint | Aciklama |
|-------|----------|----------|
| GET | `/api/seller/earnings` | Satici net kazanc ozeti |
| GET | `/api/seller/earnings/orders` | Siparis bazinda komisyon kirilimlari |

**Ornek response:**

```json
// GET /api/seller/earnings
{
  "total_gross": 25000.00,
  "total_commission": 3000.00,
  "total_net": 22000.00,
  "commission_rate": 12.00,
  "withdrawable_balance": 18500.00,
  "total_withdrawn": 3500.00
}
```

---

## 4. Komisyon Hesaplama Mantigi

### 4.1 Formul

```
brut_tutar        = unit_price * qty
komisyon_orani    = vendor.commission_rate ?? settings.default_commission_rate
komisyon_tutari   = brut_tutar * (komisyon_orani / 100)
satici_net_tutari = brut_tutar - komisyon_tutari
```

### 4.2 Ornek

%12 komisyonla 1000 TL satis:

```
brut_tutar        = 1000.00
komisyon_orani    = 12.00
komisyon_tutari   = 120.00   (platform alir)
satici_net_tutari = 880.00   (satici cekebilir)
```

### 4.3 Entegrasyon Noktalari

**1. Siparis olusturma — `PaymentController@orderStore`**

Her `OrderProduct` olusturulduktan sonra:
- Gecerli komisyon oranini bul (vendor override ?? global default)
- `commission_rate`, `commission_amount`, `seller_net_amount` degerlerini `order_products` satirina yaz
- `commission_ledger` tablosuna `pending` statulu satir ekle

**2. Cekim bakiye hesaplama — `WithdrawController@store`**

Mevcut formul:
```php
// ESKI (yanlis — komisyon yok)
$currentBalance = SUM(unit_price * qty) - SUM(approved_withdrawals)
```

Yeni formul:
```php
// YENI (komisyon dusulmus)
$currentBalance = SUM(seller_net_amount) - SUM(approved_withdrawals)
```

**Bu en kritik degisiklik.** Saticinin cekebilecegi tutar komisyon dusulmus olarak hesaplanmali.

**3. Siparis tamamlama — `OrderController@updateOrderStatus`**

`order_status` 3 (tamamlandi) olunca:
- `commission_ledger.status` -> `pending` yerine `settled` yap
- `commission_ledger.settled_at` -> su anki zaman

**4. Satici dashboard — `SellerDashboardController@index`**

Tum kazanc hesaplamalari `unit_price * qty` yerine `seller_net_amount` kullanmali. Satici brut tutari kendi kazanci olarak gormemeli.

### 4.4 Admin Urunu (seller_id = 0) Durumu

`seller_id = 0` olan urunler admin'e aittir. Bu urunlerde komisyon hesaplanmaz:
- `commission_rate = 0`
- `commission_amount = 0`
- `seller_net_amount = unit_price * qty`

---

## 5. Admin Panel UI

### 5.1 Komisyon Ayarlari Sayfasi

**Konum:** Admin Panel > Ayarlar > Komisyon (yeni menu ogesi)

| Alan | Tip | Aciklama |
|------|-----|----------|
| Varsayilan Komisyon Orani | Sayi input (%) | 0.00 — 100.00 arasi |
| Kaydet butonu | Button | `PUT /api/admin/commission/settings` |

### 5.2 Satici Bazli Komisyon Tablosu

Ayni sayfada alt bolumde tablo:

| Sutun | Aciklama |
|-------|----------|
| Magaza Adi | vendor.shop_name |
| Varsayilan Oran | settings.default_commission_rate |
| Ozel Oran | vendor.commission_rate (duzenlenebilir) |
| Durum | Aktif/Pasif |
| Islem | Duzenle / Sifirla (global'e don) |

### 5.3 Komisyon Rapor Sayfasi

**Konum:** Admin Panel > Raporlar > Komisyon Geliri (yeni menu ogesi)

Icerik:
- Ozet kartlar: Toplam Brut, Toplam Komisyon, Toplam Satici Net
- Tarih filtresi (baslangic — bitis)
- Satici bazli tablo: Magaza Adi, Siparis Sayisi, Brut Tutar, Komisyon, Net Tutar
- CSV export butonu

---

## 6. Vendor Panel

### 6.1 Kazanc Dashboard'u

Mevcut satici dashboard'unda guncellenecek alanlar:

| Mevcut | Yeni |
|--------|------|
| Toplam Kazanc = SUM(unit_price * qty) | Brut Satis = SUM(unit_price * qty) |
| — | Komisyon Kesintisi = SUM(commission_amount) |
| — | Net Kazanc = SUM(seller_net_amount) |
| Cekilebilir Bakiye (eksik hesap) | Cekilebilir Bakiye = Net Kazanc - Cekilmis |

### 6.2 Siparis Detay Gorunumu

Her siparis satirinda:
- Urun fiyati (brut)
- Komisyon orani (%)
- Komisyon tutari
- Net kazanc

### 6.3 Komisyon Bilgilendirme

Vendor panel header'inda veya ayarlar sayfasinda:
- "Sizin komisyon oraniniz: %X" bilgisi
- Oran kaynagi: "Ozel oran" veya "Standart oran"

---

## 7. Codex Uygulama Adimlari

Asagidaki adimlar Codex agent'a iletilecektir. Siralama onemlidir.

### Adim 1: Onkosal Duzeltmeler

- [ ] `orders` tablosu icin retroaktif migration olustur (`total_amount`, `cash_on_delivery`, `additional_info` sutunlarini ekle)
- [ ] `order_products.order_id` tipini `unsignedBigInteger` olarak duzelt (FK uyumu)
- [ ] `order_products.vat` sutununu gercek DB'ye ekle veya `WithdrawController`'daki referansi kaldir

### Adim 2: Migration'lar

- [ ] `settings` tablosuna `default_commission_rate` sutunu ekle
- [ ] `vendors` tablosuna `commission_rate` sutunu ekle
- [ ] `order_products` tablosuna `commission_rate`, `commission_amount`, `seller_net_amount` sutunlarini ekle
- [ ] `commission_ledger` tablosunu olustur

### Adim 3: Model Guncellemeleri

- [ ] `Setting.php` — `default_commission_rate` fillable'a ekle
- [ ] `Vendor.php` — `commission_rate` fillable'a ekle, `getEffectiveCommissionRate()` metodu
- [ ] `OrderProduct.php` — yeni sutunlari fillable'a ekle, `commissionLedger()` iliskisi
- [ ] `CommissionLedger.php` — yeni model olustur

### Adim 4: Service Katmani

- [ ] `CommissionService.php` olustur:
  - `calculateCommission(OrderProduct $op): array` — oran bul, hesapla
  - `recordCommission(OrderProduct $op, Order $order): CommissionLedger` — kayit olustur
  - `settleCommission(Order $order): void` — siparis tamamlaninca settle et
  - `getSellerBalance(int $sellerId): float` — bakiye hesapla

### Adim 5: Controller Degisiklikleri

- [ ] `PaymentController@orderStore` — her OrderProduct sonrasi `CommissionService@recordCommission` cagir
- [ ] `WithdrawController@store` — bakiye hesabini `CommissionService@getSellerBalance` ile degistir
- [ ] `SellerDashboardController@index` — kazanc gosterimini `seller_net_amount` bazli yap
- [ ] `OrderController@updateOrderStatus` — status=3 olunca `CommissionService@settleCommission` cagir
- [ ] Yeni: `Admin/CommissionController.php` — ayarlar ve rapor endpoint'leri

### Adim 6: Admin Frontend

- [ ] Komisyon Ayarlari sayfasi (global oran + satici bazli tablo)
- [ ] Komisyon Rapor sayfasi (gelir ozeti + detay tablosu)
- [ ] Sidebar'a yeni menu ogeleri

### Adim 7: Vendor Frontend

- [ ] Dashboard kazanc kartlarini guncelle (brut/komisyon/net goster)
- [ ] Siparis listesinde komisyon kirilimi sutunu ekle
- [ ] Komisyon orani bilgilendirme alani

### Adim 8: Mevcut Verilerin Goc'u

- [ ] Eski siparis verilerinde `commission_rate=0`, `commission_amount=0`, `seller_net_amount=unit_price*qty` olarak set et
- [ ] Eski veriler icin `commission_ledger` satirlari olustur (status=settled)

### Adim 9: Test

- [ ] Komisyon hesaplama unit test'leri
- [ ] Cekim bakiye hesaplama testi (komisyon dusulmus)
- [ ] Admin panel komisyon ayarlari E2E test
- [ ] Vendor panel kazanc gorunumu dogrulama (Antigravity)

---

## Ilgili Dosyalar

| Dosya | Rol |
|-------|-----|
| `backend/app/Http/Controllers/User/PaymentController.php` | Siparis olusturma (~satir 1280, `orderStore`) |
| `backend/app/Http/Controllers/WEB/Seller/WithdrawController.php` | Bakiye hesaplama + cekim (~satir 68-78) |
| `backend/app/Http/Controllers/WEB/Seller/SellerDashboardController.php` | Kazanc gosterimi |
| `backend/app/Http/Controllers/WEB/Admin/OrderController.php` | Siparis durum guncellemesi |
| `backend/app/Models/OrderProduct.php` | Komisyon iliskisi eklenecek |
| `backend/app/Models/Vendor.php` | `commission_rate` eklenecek |
| `backend/app/Models/Setting.php` | `default_commission_rate` eklenecek |
| `backend/database/seyfibaba_db.sql` | Mevcut gercek sema referansi |
| `backend/database/migrations/2021_12_26_*_create_order_products_table.php` | Yeni sutunlar eklenecek |
| `backend/database/migrations/2021_12_14_*_create_vendors_table.php` | `commission_rate` eklenecek |
| `backend/database/migrations/2021_12_09_*_create_settings_table.php` | `default_commission_rate` eklenecek |

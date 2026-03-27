# V2 Mimari Plan — Seyfibaba Pazaryeri

**Tarih:** 2026-03-27
**Kapsam:** Satici KYC, Stok Uyarilari, Toplu Urun Yukleme
**Oncelik:** DUSUK — V1 production sonrasi

---

## 1. SATICI KYC / DOGRULAMA SISTEMI

### 1.1 Amac
Saticilarin kimlik dogrulama belgelerini yuklemesi ve admin tarafindan onaylanmasi. Iyzico pazaryeri modeli icin sub-merchant olusturmada da gerekli.

### 1.2 DB Semasi

```sql
-- Yeni tablo
CREATE TABLE seller_kyc_documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    seller_id BIGINT UNSIGNED NOT NULL,
    document_type ENUM('identity_front', 'identity_back', 'tax_certificate', 'address_proof', 'bank_statement', 'iban_document') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INT UNSIGNED DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_note TEXT NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_seller_status (seller_id, status),
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- vendors tablosuna ek kolonlar
ALTER TABLE vendors ADD COLUMN kyc_status ENUM('not_submitted', 'pending', 'approved', 'rejected') DEFAULT 'not_submitted' AFTER status;
ALTER TABLE vendors ADD COLUMN kyc_submitted_at TIMESTAMP NULL AFTER kyc_status;
ALTER TABLE vendors ADD COLUMN kyc_approved_at TIMESTAMP NULL AFTER kyc_submitted_at;
ALTER TABLE vendors ADD COLUMN iban VARCHAR(34) NULL AFTER kyc_approved_at;
ALTER TABLE vendors ADD COLUMN tax_number VARCHAR(20) NULL AFTER iban;
```

### 1.3 API Kontratlari

```
# Satici
POST   /api/seller/kyc/upload          → Belge yukle (multipart, max 5MB, pdf/jpg/png)
GET    /api/seller/kyc/documents       → Belgelerimi listele
DELETE /api/seller/kyc/documents/{id}  → Belge sil (sadece pending durumda)
GET    /api/seller/kyc/status          → KYC durumum

# Admin
GET    /api/admin/kyc/pending          → Bekleyen KYC talepleri
GET    /api/admin/kyc/seller/{id}      → Satici belgeleri
PUT    /api/admin/kyc/{id}/approve     → Onayla (admin_note opsiyonel)
PUT    /api/admin/kyc/{id}/reject      → Reddet (admin_note zorunlu)
```

### 1.4 Is Kurallari
- Satici KYC onaylanmadan urun satamazlar (siparis almaya devam eder ama cekim yapamaz)
- KYC reddedildiyse satici belgeleri guncelleyip tekrar gonderebilir
- Belge yukleme: max 5MB, sadece PDF/JPG/PNG
- Belgeler `storage/app/private/kyc/` altinda saklanir (public degil)
- Admin onayladiktan sonra Iyzico sub-merchant olusturma tetiklenir

### 1.5 Iyzico Sub-Merchant Entegrasyonu
```
KYC Onay → IyzicoService::createSubMerchant()
  - name: vendor.shop_name
  - email: user.email
  - iban: vendor.iban
  - identity_number: KYC'den
  - tax_number: vendor.tax_number (tüzel kisi icin)
```

---

## 2. STOK UYARI BILDIRIMLERI

### 2.1 Amac
Urun stogu belirlenen esik degerinin altina dustugunde satici ve admin'e bildirim gonder.

### 2.2 DB Semasi

```sql
-- settings tablosuna
ALTER TABLE settings ADD COLUMN low_stock_threshold INT DEFAULT 5;
ALTER TABLE settings ADD COLUMN stock_alert_enabled TINYINT(1) DEFAULT 1;

-- notifications tablosu (mevcut veya yeni)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    notifiable_type VARCHAR(255) NOT NULL,   -- App\Models\User veya App\Models\Admin
    notifiable_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(255) NOT NULL,               -- stock_alert, order_placed, etc.
    data JSON NOT NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_notifiable (notifiable_type, notifiable_id),
    INDEX idx_type_read (type, read_at)
);
```

### 2.3 API Kontratlari

```
# Admin
PUT  /api/admin/settings/stock-alerts  → Esik degeri ve aktiflik ayarla
GET  /api/admin/products/low-stock     → Dusuk stoklu urunler listesi

# Satici
GET  /api/seller/products/low-stock    → Kendi dusuk stoklu urunlerim
GET  /api/seller/notifications         → Bildirimlerim
PUT  /api/seller/notifications/{id}/read → Okundu isaretle
```

### 2.4 Tetikleme Mekanizmasi
```
OrderProduct kaydi olusturuldugunda (siparis onaylandi):
  → Product::decrementStock()
  → StockAlertObserver::updated()
    → if product.qty <= settings.low_stock_threshold
      → Notification::send(seller, StockAlertNotification)
      → Notification::send(admin, StockAlertNotification)
      → Opsiyonel: Email gonder
```

### 2.5 Laravel Notification
```php
class StockAlertNotification extends Notification
{
    public function via($notifiable): array
    {
        return ['database']; // V2.1: 'mail' ekle
    }

    public function toArray($notifiable): array
    {
        return [
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'current_stock' => $this->product->qty,
            'threshold' => $this->threshold,
            'message' => "{$this->product->name} stogu {$this->product->qty} adete dustu.",
        ];
    }
}
```

---

## 3. TOPLU URUN YUKLEME (CSV IMPORT)

### 3.1 Amac
Saticilar CSV/Excel ile toplu urun yukleme yapabilir. Admin de toplu urun yukleyebilir.

### 3.2 DB Semasi

```sql
CREATE TABLE bulk_imports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    user_type ENUM('seller', 'admin') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    total_rows INT UNSIGNED DEFAULT 0,
    processed_rows INT UNSIGNED DEFAULT 0,
    success_count INT UNSIGNED DEFAULT 0,
    error_count INT UNSIGNED DEFAULT 0,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    error_log JSON NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_user_status (user_id, user_type, status)
);
```

### 3.3 CSV Format

```csv
name,short_name,slug,category,sub_category,child_category,brand,price,offer_price,qty,short_description,long_description,sku,weight,tags,status
"Ornek Urun","Ornek","ornek-urun","Elektronik","Telefon","Akilli Telefon","Samsung",1500.00,1299.99,50,"Kisa aciklama","Uzun aciklama","SKU-001",0.5,"telefon,samsung",1
```

### 3.4 API Kontratlari

```
# Satici
POST /api/seller/products/bulk-import   → CSV yukle (multipart, max 10MB)
GET  /api/seller/products/bulk-imports   → Import gecmisim
GET  /api/seller/products/bulk-import/{id} → Import detay + hata logu
GET  /api/seller/products/bulk-import/template → Bos CSV sablonu indir

# Admin
POST /api/admin/products/bulk-import    → Admin bulk import
GET  /api/admin/products/bulk-imports   → Tum import'lar
```

### 3.5 Is Akisi
```
1. Satici CSV yukler
2. BulkImport kaydı olusur (status: pending)
3. Queue job tetiklenir: ProcessBulkImport
4. Her satir icin:
   a. Validate (zorunlu alanlar, kategori eslesmesi, fiyat formati)
   b. Mevcut urun varsa (slug/SKU) → guncelle
   c. Yoksa → yeni olustur (is_approved: 0 — admin onayi bekler)
   d. Hata varsa → error_log'a ekle, devam et
5. Import tamamlaninca status: completed
6. Satici sonucu gorebilir (basarili/hatali satirlar)
```

### 3.6 Maatwebsite Excel Entegrasyonu
```php
// Mevcut composer paket: maatwebsite/excel ^3.1
class ProductImport implements ToModel, WithHeadingRow, WithValidation, WithBatchInserts, WithChunkReading
{
    public function model(array $row): Product
    {
        return new Product([
            'name' => $row['name'],
            'slug' => Str::slug($row['slug'] ?: $row['name']),
            'price' => $row['price'],
            // ...
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'qty' => 'required|integer|min:0',
        ];
    }

    public function batchSize(): int { return 100; }
    public function chunkSize(): int { return 500; }
}
```

---

## 4. IMPLEMENTASYON SIRASI

| # | Ozellik | Effort | Bagimlilık |
|---|---------|--------|-----------|
| 1 | Stok Uyarilari | 2-3 gun | Yok — en basit |
| 2 | Satici KYC | 4-5 gun | Iyzico sub-merchant |
| 3 | Toplu Urun Yukleme | 3-4 gun | Queue (Redis) gerekli |

**Toplam tahmini:** 2 hafta (tek gelistirici)

---

## 5. TEKNIK ONKOSULLER

- Redis kurulu ve aktif (queue isleri icin)
- `QUEUE_CONNECTION=redis` `.env`'de
- `php artisan queue:work` PM2 ile calisir durumda
- Storage link kurulu (`php artisan storage:link`)
- KYC dosyalari icin disk alani planlama (satici basina ~20MB)

# Iade Talep Sistemi — Mimari Plan

**Hazirlayan:** Claude Code (Mimar)
**Tarih:** 2026-03-26
**Oncelik:** Faza 6
**Durum:** %0 — Sifirdan insa edilecek

---

## 1. Mevcut Durum

### Siparis Durum Akisi (orders tablosu)

| Deger | Durum | Tarih Kolonu |
|-------|-------|-------------|
| 0 | Beklemede | created_at |
| 1 | Isleniyor | order_approval_date |
| 2 | Teslim Edildi | order_delivered_date |
| 3 | Tamamlandi | order_completed_date |
| 4 | Reddedildi | order_declined_date |

### Mevcut Iade Altyapisi: YOK

- `refound_status` ve `payment_refound_date` kolonlari orders tablosunda mevcut ama **hicbir yerde kullanilmiyor** (olü sema)
- Hicbir ReturnRequest modeli, controller'i veya route'u yok
- Tek referans: `resources/lang/tr/user.php` icinde `'Get Return within' => '30 gun icinde iade al'` ceviri metni
- **Sonuc:** Sistem sifirdan insa edilecek

### Neden order_product Seviyesinde?

Tek siparis birden fazla saticinin urunlerini icerebilir. Musteri sadece 1 saticinin urununu iade etmek isteyebilir. Her satici kendi urunleri icin bagimsiz karar verir. Bu, Trendyol/Amazon/Hepsiburada standart pazaryeri paternidir.

---

## 2. Durum Makinesi

```
                   Kullanici talep olusturur
                          |
                          v
                   [0: BEKLEMEDE] ---------> [7: KULLANICI_IPTAL]
                          |
              +-----------+-----------+
              |                       |
              v                       v
   [1: SATICI_ONAYLADI]      [5: SATICI_REDDETTI]
              |                       |
              v                       v
   [2: ADMIN_ONAYLADI]       [6: ADMIN_REDDETTI]
              |                (admin satici kararini
              v                 onaylayabilir veya gecersiz kilabilir)
   [3: URUN_TESLIM_ALINDI]
              |
              v
   [4: IADE_YAPILDI]
```

### Gecis Kurallari

| Kimden | Kime | Aktor | Kosul |
|--------|------|-------|-------|
| — | 0 (beklemede) | Kullanici | Siparis durumu 2 veya 3 olmali. Iade penceresi icinde (14 gun). Ayni urun icin aktif iade olmamali. |
| 0 | 1 | Satici | Satici inceledi, kabul etti |
| 0 | 5 | Satici | Satici red sebebi belirtti |
| 0 | 7 | Kullanici | Satici islem yapmadan once iptal |
| 1 | 2 | Admin | Admin onayladi, iade tutari kesinlesti |
| 1 | 6 | Admin | Admin satici kararini gecersiz kildi (nadir) |
| 5 | 2 | Admin | Admin satici reddini gecersiz kildi (musteri lehine) |
| 5 | 6 | Admin | Admin satici reddini onayladi |
| 2 | 3 | Admin/Satici | Fiziksel urun teslim alindi |
| 3 | 4 | Admin | Para iadesi yapildi |

### V1 Basitlestirilmis Alternatif

Satici rolu aktif degilse: BEKLEMEDE → ADMIN_ONAYLADI/REDDETTI → URUN_ALINDI → IADE_YAPILDI. Satici kolonlari semada kalir, gelecekte aktif edilir.

---

## 3. DB Semasi

### Tablo: `return_requests`

```sql
CREATE TABLE return_requests (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id            BIGINT UNSIGNED NOT NULL,
    order_product_id    BIGINT UNSIGNED NOT NULL,
    user_id             BIGINT UNSIGNED NOT NULL,
    seller_id           BIGINT UNSIGNED NOT NULL,
    status              TINYINT NOT NULL DEFAULT 0,
    reason              VARCHAR(255) NOT NULL,
    description         TEXT NULL,
    qty                 INT NOT NULL,
    refund_amount       DECIMAL(10,2) NULL,
    refund_method       VARCHAR(50) NULL,
    admin_note          TEXT NULL,
    seller_note         TEXT NULL,
    rejected_reason     TEXT NULL,
    approved_at         TIMESTAMP NULL,
    rejected_at         TIMESTAMP NULL,
    refunded_at         TIMESTAMP NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_return_order (order_id),
    INDEX idx_return_user_status (user_id, status),
    INDEX idx_return_seller_status (seller_id, status),
    INDEX idx_return_status (status),

    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (order_product_id) REFERENCES order_products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Tablo: `return_request_images`

```sql
CREATE TABLE return_request_images (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    return_request_id   BIGINT UNSIGNED NOT NULL,
    image               VARCHAR(255) NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (return_request_id) REFERENCES return_requests(id) ON DELETE CASCADE
);
```

### Reason Enum Degerleri

- `defective` — Urun arizali/bozuk
- `wrong_item` — Yanlis urun gonderildi
- `not_as_described` — Urun aciklamaya uymuyor
- `changed_mind` — Fikir degisikligi
- `damaged_in_shipping` — Kargoda hasar gordu
- `other` — Diger

### Refund Method Degerleri

- `original_gateway` — Orijinal odeme yontemiyle iade
- `wallet_credit` — Cuzdan bakiyesine iade (V2)
- `bank_transfer` — Banka havalesi (manuel)
- `manual` — Manuel islem

---

## 4. API Endpoint'ler

### Kullanici (prefix: `/api/user/`)

| Method | Endpoint | Aciklama |
|--------|----------|----------|
| GET | `/orders/{id}/returnable-items` | Iade edilebilir urunleri listele (pencere + durum kontrolu) |
| POST | `/return-requests` | Iade talebi olustur (images, reason, qty) |
| GET | `/return-requests` | Taleplerim (sayfalama, status filtre) |
| GET | `/return-requests/{id}` | Talep detay |
| PUT | `/return-requests/{id}/cancel` | Beklemedeki talebi iptal et |

### Satici (prefix: `/api/seller/`)

| Method | Endpoint | Aciklama |
|--------|----------|----------|
| GET | `/return-requests` | Urunlerime ait talepler |
| GET | `/return-requests/{id}` | Talep detay |
| PUT | `/return-requests/{id}/approve` | Onayla |
| PUT | `/return-requests/{id}/reject` | Reddet (rejected_reason zorunlu) |

### Admin (prefix: `/api/admin/`)

| Method | Endpoint | Aciklama |
|--------|----------|----------|
| GET | `/return-requests` | Tum talepler (filtre: status, user, seller, tarih) |
| GET | `/return-requests/{id}` | Talep detay |
| PUT | `/return-requests/{id}/approve` | Admin onayla (refund_amount, refund_method belirle) |
| PUT | `/return-requests/{id}/reject` | Admin reddet |
| PUT | `/return-requests/{id}/mark-received` | Urun teslim alindi |
| PUT | `/return-requests/{id}/refund` | Iade yap, durumu guncelle |
| GET | `/return-requests/stats` | Dashboard: bekleyen/onaylanan/iade toplam istatistik |

---

## 5. Is Kurallari

| Kural | Detay |
|-------|-------|
| Iade penceresi | `settings` tablosunda `return_window_days` (varsayilan 14), `order_delivered_date`'ten hesaplanir |
| Uygun siparis durumlari | Sadece `order_status` = 2 (teslim edildi) veya 3 (tamamlandi) |
| Tek aktif iade | Ayni `order_product_id` icin terminal olmayan (0,1,2,3) durumda sadece 1 talep |
| Miktar dogrulama | `qty` <= `order_product.qty` - (onceki onaylanmis iade qty) |
| Tutar limiti | `refund_amount` <= `unit_price * qty` + oransal varyant maliyeti |
| Gorsel zorunlulugu | `defective`, `damaged_in_shipping`, `wrong_item` icin en az 1 gorsel zorunlu |

---

## 6. Bildirim Akisi

| Olay | Alici | Kanal |
|------|-------|-------|
| Talep olusturuldu | Satici + Admin | Email |
| Satici onayladi | Kullanici + Admin | Email |
| Satici reddetti | Kullanici + Admin | Email |
| Admin onayladi (iade kesinlesti) | Kullanici + Satici | Email + SMS |
| Urun teslim alindi | Kullanici | Email |
| Para iadesi yapildi | Kullanici | Email + SMS |

---

## 7. Mevcut Olu Kolonlar Hakkinda

`orders` tablosundaki `refound_status` ve `payment_refound_date` kolonlari:

**Karar: Dokunma.** Iade sistemi kendi `return_requests` tablosunda yasayacak cunku iadeler siparis degil urun seviyesinde. Bu kolonlar gelecekte temizlik migration'inda kaldirilabilir.

---

## 8. Dosya Yapisi

```
backend/
├── app/
│   ├── Http/Controllers/
│   │   ├── User/ReturnRequestController.php       ← Yeni
│   │   ├── Seller/ReturnRequestController.php     ← Yeni
│   │   └── Admin/ReturnRequestController.php      ← Yeni
│   └── Models/
│       ├── ReturnRequest.php                      ← Yeni
│       └── ReturnRequestImage.php                 ← Yeni
├── database/migrations/
│   ├── xxxx_create_return_requests_table.php      ← Yeni
│   └── xxxx_create_return_request_images_table.php ← Yeni
└── routes/
    └── api.php                                    ← Route'lar eklenecek
```

---

## 9. Codex Uygulama Adimlari

1. Migration: `return_requests` + `return_request_images` tablolari
2. Model: `ReturnRequest` + `ReturnRequestImage` (iliskiler: order, orderProduct, user, seller, images)
3. `settings` tablosuna `return_window_days` eklenmesi
4. User `ReturnRequestController` (create, list, detail, cancel, returnable-items)
5. Seller `ReturnRequestController` (list, detail, approve, reject)
6. Admin `ReturnRequestController` (list, detail, approve, reject, mark-received, refund, stats)
7. Route'lar (api.php — user, seller, admin gruplarina ekle)
8. Email bildirimleri (Notification class'lari)
9. Frontend: Kullanici siparis detayinda "Iade Talebi" butonu + form
10. Frontend: Admin panelde iade yonetim sayfasi
11. Frontend: Satici panelde iade talepleri listesi

**Branch:** `feat/return-requests`

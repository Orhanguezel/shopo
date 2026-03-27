# SMS / OTP Kayit Dogrulama — Mimari Plan

**Hazirlayan:** Claude Code (Mimar)
**Tarih:** 2026-03-26
**Oncelik:** Faza 3
**Bagimlilk:** Iyzico entegrasyonu tamamlandiktan sonra

---

## 1. Provider Karsilastirma

| Kriter | Iletimerkezi | Netgsm |
|--------|-------------|--------|
| Fiyat (SMS/adet) | ~0.035 TL | ~0.045 TL |
| API Kolayligi | REST, basit JSON | REST + SOAP |
| Dokumasyon | Turkce, acik | Turkce, detayli |
| OTP Hazir Modulu | Var | Var |
| Raporlama | Panel + API | Panel + API |
| Kurulum Suresi | Hizli | Orta |
| Destek | Canli chat + telefon | Telefon + email |

**Karar: Iletimerkezi** — Maliyet avantaji, basit API, hizli entegrasyon.
Musteri onayina gore Netgsm'e gecis kolay (interface pattern ile).

---

## 2. DB Semasi

### Tablo: `otp_verifications`

```sql
CREATE TABLE otp_verifications (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone           VARCHAR(20) NOT NULL,
    otp_code        VARCHAR(6) NOT NULL,
    purpose         ENUM('register', 'password_reset', 'phone_verify') DEFAULT 'register',
    attempts        TINYINT UNSIGNED DEFAULT 0,
    max_attempts    TINYINT UNSIGNED DEFAULT 3,
    expires_at      TIMESTAMP NOT NULL,
    verified_at     TIMESTAMP NULL,
    ip_address      VARCHAR(45) NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_phone_purpose (phone, purpose),
    INDEX idx_expires (expires_at)
);
```

### Notlar:
- `otp_code`: 6 haneli numerik
- `expires_at`: Olusturma + 5 dakika
- `max_attempts`: 3 yanlis giris hakki, sonra yeni OTP gerekir
- `verified_at`: NULL ise dogrulanmamis

---

## 3. API Endpoint'ler

### 3.1 OTP Gonder
```
POST /api/auth/otp/send
Body: { "phone": "+905551234567", "purpose": "register" }
Response: { "success": true, "message": "OTP gonderildi", "expires_in": 300 }
```

Rate limit: 3 istek / 15 dakika / IP+telefon

### 3.2 OTP Dogrula
```
POST /api/auth/otp/verify
Body: { "phone": "+905551234567", "otp_code": "123456", "purpose": "register" }
Response: { "success": true, "verified": true, "token": "otp_verified_token_xxx" }
```

Rate limit: 5 istek / 5 dakika / IP

### 3.3 OTP Tekrar Gonder
```
POST /api/auth/otp/resend
Body: { "phone": "+905551234567", "purpose": "register" }
Response: { "success": true, "message": "Yeni OTP gonderildi", "expires_in": 300 }
```

Rate limit: 1 istek / 60 saniye / telefon (cooldown)

---

## 4. Backend Dosya Yapisi

```
backend/
├── app/
│   ├── Http/Controllers/Auth/
│   │   └── OtpController.php          ← Yeni
│   ├── Models/
│   │   └── OtpVerification.php        ← Yeni
│   └── Services/
│       ├── SmsServiceInterface.php    ← Yeni (interface)
│       └── IletimMerkeziService.php   ← Yeni (provider implementasyonu)
├── database/migrations/
│   └── xxxx_create_otp_verifications_table.php  ← Yeni
└── config/
    └── sms.php                        ← Yeni (provider config)
```

### SmsServiceInterface
```php
interface SmsServiceInterface
{
    public function send(string $phone, string $message): bool;
}
```

Bu sayede provider degisikliginde sadece yeni bir class yazilir, controller degismez.

---

## 5. Frontend Akis

```
[Kayit Formu]
    |
    v
Adim 1: Ad, Email, Telefon, Sifre gir
    |
    v
Adim 2: "OTP Gonder" butonuna tikla → POST /otp/send
    |
    v
Adim 3: 6 haneli kod gir + "Dogrula" butonu → POST /otp/verify
    |       - 60 saniye geri sayim timer
    |       - "Tekrar Gonder" butonu (cooldown sonrasi aktif)
    |       - 3 yanlis giris → yeni OTP iste
    v
Adim 4: Dogrulaninca → Kayit tamamla (POST /register ile otp_verified_token gonder)
```

### Frontend Dosyalar
```
frontend/src/
├── components/Auth/Signup/
│   ├── SignupWidget.jsx    ← Mevcut, OTP adimi eklenecek
│   └── OtpVerifyStep.jsx  ← Yeni component
```

---

## 6. Guvenlik Onlemleri

| Tehdit | Onlem |
|--------|-------|
| Brute force OTP | 3 deneme limiti + rate limiting |
| SMS spam | IP + telefon bazli rate limit (3/15dk) |
| OTP tahmin | 6 hane, 1M olaslik, 3 deneme = %0.0003 basari |
| Replay attack | OTP tek kullanimlik, verified_at set edilince gecersiz |
| Phone enumeration | Hata mesajlarinda "telefon kayitli mi" bilgisi verilmez |
| Cooldown bypass | Server-side cooldown kontrolu (son OTP created_at) |

---

## 7. .env Degiskenleri

```env
# SMS Provider
SMS_PROVIDER=iletimerkezi
ILETIMERKEZI_API_KEY=xxx
ILETIMERKEZI_API_HASH=xxx
ILETIMERKEZI_SENDER=SEYFIBABA

# OTP Ayarlari
OTP_LENGTH=6
OTP_EXPIRE_MINUTES=5
OTP_MAX_ATTEMPTS=3
OTP_COOLDOWN_SECONDS=60
```

---

## 8. Codex Uygulama Adimlari

1. `composer require` — Iletimerkezi PHP SDK (veya pure HTTP client)
2. Migration olustur
3. `OtpVerification` model
4. `SmsServiceInterface` + `IletimMerkeziService`
5. `OtpController` (send, verify, resend)
6. Route'lar + rate limiting
7. Frontend `OtpVerifyStep.jsx` component
8. `SignupWidget.jsx`'e OTP adimi entegre et
9. Test: basarili OTP, suresi dolmus OTP, yanlis kod, rate limit

**Branch:** `feat/sms-otp`

# CODEX GOREV X2: Pusher Mesajlasma Fix

**Branch:** `fix/pusher-messaging`
**Oncelik:** ORTA
**Bagimlilık:** Pusher hesap bilgileri gerekli (admin panelden ayarlanacak)

---

## Sorun

Satici-musteri mesajlasma sistemi calismiyior. Altyapi mevcut ama 6 kritik sorun var.

## Mevcut Durum

✅ Calisan:
- Event class'lari (UserToSellerMessage, SellerToUser)
- Channel tanimlari (routes/channels.php)
- Message controller'lari (User + Seller)
- Frontend MessageWidget (Pusher + Echo entegrasyonu)
- Paket bagimliliklari (pusher-js, laravel-echo, pusher-php-server)
- Admin Pusher ayar formu
- API message endpoint'leri

❌ Bozuk:
1. `BROADCAST_DRIVER=log` (pusher olmali)
2. BroadcastServiceProvider route'lari commented out
3. `/api/broadcasting/auth` endpoint yok
4. Messages tablosu schema uyumsuzlugu
5. PusherConfig provider config'i uygulamiyor
6. Channel auth kontrolu yok (herkes dinleyebilir)

---

## Yapilacaklar (Sirasyla)

### 1. Messages Tablosu Migration

**Yeni dosya:** `backend/database/migrations/2026_03_27_000001_update_messages_table_columns.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Eski kolonlari kaldir
            if (Schema::hasColumn('messages', 'to')) {
                $table->dropColumn(['to', 'from', 'read']);
            }

            // Yeni kolonlari ekle
            if (!Schema::hasColumn('messages', 'customer_id')) {
                $table->unsignedBigInteger('customer_id')->after('id');
                $table->unsignedBigInteger('seller_id')->after('customer_id');
                $table->string('send_by')->default('customer')->after('message'); // customer|seller
                $table->unsignedBigInteger('product_id')->nullable()->after('send_by');
                $table->tinyInteger('customer_read_msg')->default(0)->after('product_id');
                $table->tinyInteger('seller_read_msg')->default(0)->after('customer_read_msg');

                $table->index(['customer_id', 'seller_id']);
                $table->index('product_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn([
                'customer_id', 'seller_id', 'send_by',
                'product_id', 'customer_read_msg', 'seller_read_msg'
            ]);
            $table->integer('to');
            $table->integer('from');
            $table->integer('read')->default(0);
        });
    }
};
```

### 2. BroadcastServiceProvider Fix

**Dosya:** `backend/app/Providers/BroadcastServiceProvider.php`

```php
public function boot(): void
{
    // API broadcasting auth — frontend bunu kullaniyor
    Broadcast::routes(['prefix' => 'api', 'middleware' => ['auth:api']]);

    require base_path('routes/channels.php');
}
```

### 3. Channel Auth Guvenligi

**Dosya:** `backend/routes/channels.php`

```php
// ONCE (guvenli degil):
Broadcast::channel('user-to-seller-message.{id}', function () {
    return true;
});

// SONRA:
Broadcast::channel('user-to-seller-message.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('seller-to-user-message.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
```

### 4. PusherConfig Provider Fix

**Dosya:** `backend/app/Providers/PusherConfig.php` (satir 55 civarı)

Commented out satiri ac:
```php
// ONCE:
// config(['broadcasting.connections.pusher' => $pusherConfig]);

// SONRA:
config(['broadcasting.connections.pusher' => $pusherConfig]);
```

### 5. .env Guncelleme

**Dosya:** `backend/.env`

```env
BROADCAST_DRIVER=pusher
```

> NOT: Pusher credentials admin panelden ayarlaniyor ve DB'den okunuyor.
> `.env`'deki bos PUSHER_APP_ID/KEY/SECRET alanlarini da doldurmak iyi olur (fallback icin).

### 6. Message Model Guncelleme

**Dosya:** `backend/app/Models/Message.php`

Fillable array ekle/guncelle:
```php
protected $fillable = [
    'customer_id',
    'seller_id',
    'message',
    'send_by',
    'product_id',
    'customer_read_msg',
    'seller_read_msg',
];
```

---

## Test Senaryolari

1. **Migration:** `php artisan migrate` — hata olmamali
2. **Broadcasting auth:** `POST /api/broadcasting/auth` — JWT token ile 200 donmeli
3. **Mesaj gonder:** Musteri → Satici mesaj gonder, DB'ye kaydedilmeli
4. **Realtime:** Pusher dashboard'dan event'lerin gonderildigini dogrula
5. **Channel auth:** Baska kullanicinin kanalini dinlemeye calis — reddedilmeli

## Typo Fix'ler (Opsiyonel)

Bu dosyalar calisiyior, ama typo'lar rahatsiz edici:
- `PusherCredentail.php` → `PusherCredential.php` (model + migration + tum referanslar)
- `SellerMessageContoller.php` → `SellerMessageController.php` (dosya adi + route referansi)
- `laod_active_seller_message()` → `load_active_seller_message()` (method adi + route)

> DIKKAT: Typo fix yapilacaksa tum referanslar (route, controller, frontend) ayni anda guncellenmeli. Riskli — ayri branch'te yap.

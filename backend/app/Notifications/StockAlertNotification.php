<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StockAlertNotification extends Notification
{
    use Queueable;

    public function __construct(
        private Product $product,
        private int $threshold,
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'stock_alert',
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'product_slug' => $this->product->slug,
            'current_stock' => $this->product->qty,
            'threshold' => $this->threshold,
            'message' => "\"{$this->product->name}\" stoğu {$this->product->qty} adete düştü (eşik: {$this->threshold}).",
        ];
    }
}

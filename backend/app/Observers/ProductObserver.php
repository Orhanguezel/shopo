<?php

namespace App\Observers;

use App\Models\Admin;
use App\Models\Product;
use App\Models\Setting;
use App\Notifications\StockAlertNotification;

class ProductObserver
{
    public function updated(Product $product): void
    {
        // Only check if qty was actually changed
        if (!$product->wasChanged('qty')) {
            return;
        }

        $setting = Setting::first();
        if (!$setting || !$setting->stock_alert_enabled) {
            return;
        }

        $threshold = $setting->low_stock_threshold ?? 5;

        // Only alert if stock just crossed below threshold (was above, now at or below)
        if ($product->qty > $threshold) {
            return;
        }

        $oldQty = $product->getOriginal('qty');
        if ($oldQty !== null && $oldQty <= $threshold) {
            // Already below threshold before this update — don't re-notify
            return;
        }

        // Notify the seller (via their user account)
        $vendor = $product->seller;
        if ($vendor && $vendor->user) {
            $vendor->user->notify(new StockAlertNotification($product, $threshold));
        }

        // Notify the first admin
        $admin = Admin::first();
        if ($admin) {
            $admin->notify(new StockAlertNotification($product, $threshold));
        }
    }
}

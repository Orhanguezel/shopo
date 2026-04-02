<?php

use App\Models\Setting;

/**
 * Vitrin ürün sayfası tam URL’si (Next.js: /urun/{slug}).
 * Admin host’u veya route('product-detail') yerine kullanın; böylece asla /api/product/... oluşmaz.
 */
function storefront_product_url(string $slug): string
{
    $setting = Setting::query()->first();
    $base = rtrim($setting?->frontend_url ?? config('app.frontend_url') ?? config('app.url'), '/');

    return $base.'/urun/'.$slug;
}

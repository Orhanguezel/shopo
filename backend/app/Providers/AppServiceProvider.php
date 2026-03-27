<?php

namespace App\Providers;

use App\Models\Product;
use App\Observers\ProductObserver;
use App\Services\IletimMerkeziService;
use App\Services\SmsServiceInterface;
use Illuminate\Support\ServiceProvider;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind(SmsServiceInterface::class, function ($app) {
            $provider = config('sms.provider', 'iletimerkezi');

            return match ($provider) {
                'iletimerkezi' => new IletimMerkeziService(),
                default => new IletimMerkeziService(),
            };
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Product::observe(ProductObserver::class);
    }
}

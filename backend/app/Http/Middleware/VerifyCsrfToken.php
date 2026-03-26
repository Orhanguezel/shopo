<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        '/user/checkout/sslcommerz-success',
        '/user/checkout/sslcommerz-failed',
        '/user/checkout/sslcommerz-cancel',
        '/user/checkout/sslcommerz-pay',

        '/user/checkout/guest/sslcommerz-success',
        '/user/checkout/guest/sslcommerz-failed',
        '/user/checkout/guest/sslcommerz-cancel',
        '/user/checkout/guest/sslcommerz-pay',

        '/user/checkout/guest/razorpay-order',
        '/user/checkout/razorpay-order',
    ];
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Schema;

class Timezone
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (!Schema::hasTable('settings')) {
            return $next($request);
        }

        $setting = Setting::first();
        if ($setting && $setting->timezone) {
            config(['app.timezone' => $setting->timezone]);
            date_default_timezone_set($setting->timezone);
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Language;
use Session, Config, Route;
class LangSession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        if(!Session::get('front_lang')){
            $default_lang = Language::where('is_default', 'yes')->first();
            Session::put('front_lang', $default_lang->lang_code);
            Session::put('lang_name', $default_lang->lang_name);
            Session::put('lang_dir', $default_lang->lang_direction);

            app()->setLocale($default_lang->lang_code);
            $currentLocale = app()->getLocale();
       \Log::info('Current Locale: ' . $currentLocale);
        }else{
            $is_exist = Language::where('lang_code', Session::get('front_lang'))->first();

            if(!$is_exist){
                Session::put('front_lang', $is_exist->lang_code);
                Session::put('lang_name', $is_exist->lang_name);
                Session::put('lang_dir', $is_exist->lang_direction);
            }

            app()->setLocale(Session::get('front_lang'));
            $currentLocale = app()->getLocale();
       \Log::info('Current Locale: ' . $currentLocale);
        }

        $currentLocale = app()->getLocale();
       \Log::info('Current Locale: ' . $currentLocale);
        return $next($request);
    }
}

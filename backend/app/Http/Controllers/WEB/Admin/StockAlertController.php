<?php

namespace App\Http\Controllers\WEB\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;

class StockAlertController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    public function index()
    {
        $setting = Setting::query()->first();
        $threshold = $setting->low_stock_threshold ?? 5;

        $products = Product::query()
            ->with('seller:id,shop_name,user_id')
            ->where('qty', '<=', $threshold)
            ->where('status', 1)
            ->orderBy('qty', 'asc')
            ->get();

        return view('admin.stock_alerts', compact('setting', 'products', 'threshold'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'low_stock_threshold' => ['required', 'integer', 'min:1', 'max:1000'],
            'stock_alert_enabled' => ['required', 'boolean'],
        ]);

        $setting = Setting::query()->firstOrFail();
        $setting->low_stock_threshold = (int) $request->input('low_stock_threshold');
        $setting->stock_alert_enabled = (bool) $request->input('stock_alert_enabled');
        $setting->save();

        return redirect()->back()->with([
            'messege' => trans('admin_validation.Update Successfully'),
            'alert-type' => 'success',
        ]);
    }
}

<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StockAlertController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function lowStockProducts(Request $request)
    {
        $user = Auth::guard('api')->user();
        $vendor = $user->seller;

        if (!$vendor) {
            return response()->json(['message' => 'Seller account not found'], 403);
        }

        $setting = Setting::first();
        $threshold = $setting->low_stock_threshold ?? 5;

        $products = Product::where('vendor_id', $vendor->id)
            ->where('qty', '<=', $threshold)
            ->where('status', 1)
            ->select('id', 'name', 'slug', 'qty', 'sku', 'thumb_image')
            ->orderBy('qty', 'asc')
            ->paginate((int) $request->get('per_page', 20));

        return response()->json([
            'products' => $products,
            'threshold' => $threshold,
        ]);
    }
}

<?php

namespace App\Http\Controllers\WEB\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use App\Models\Product;
use App\Models\ProductReport;
use App\Models\ProductReview;
use App\Models\Vendor;
use App\Models\Subscriber;
use App\Models\User;
use App\Models\Category;
use App\Models\Brand;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    public function dashobard(Request $request)
    {
        $setting = Setting::first();

        // --- #52 Tarih filtresi ---
        $period = $request->get('period', 'this_month');
        $customStart = $request->get('start_date');
        $customEnd = $request->get('end_date');

        switch ($period) {
            case 'today':
                $dateFrom = now()->startOfDay();
                $dateTo = now()->endOfDay();
                $periodLabel = 'Bugün';
                break;
            case 'this_week':
                $dateFrom = now()->startOfWeek();
                $dateTo = now()->endOfWeek();
                $periodLabel = 'Bu Hafta';
                break;
            case 'this_month':
                $dateFrom = now()->startOfMonth();
                $dateTo = now()->endOfMonth();
                $periodLabel = 'Bu Ay';
                break;
            case 'this_year':
                $dateFrom = now()->startOfYear();
                $dateTo = now()->endOfYear();
                $periodLabel = 'Bu Yıl';
                break;
            case 'custom':
                $dateFrom = $customStart ? Carbon::parse($customStart)->startOfDay() : now()->startOfMonth();
                $dateTo = $customEnd ? Carbon::parse($customEnd)->endOfDay() : now()->endOfDay();
                $periodLabel = $dateFrom->format('d.m.Y') . ' - ' . $dateTo->format('d.m.Y');
                break;
            default:
                $dateFrom = now()->startOfMonth();
                $dateTo = now()->endOfMonth();
                $periodLabel = 'Bu Ay';
        }

        // --- Filtrelenmiş siparişler ---
        $filteredOrders = Order::whereBetween('created_at', [$dateFrom, $dateTo])->get();

        // Sipariş sayıları
        $filteredTotal = $filteredOrders->count();
        $filteredPending = $filteredOrders->where('order_status', 0)->count();
        $filteredProgress = $filteredOrders->where('order_status', 1)->count();
        $filteredDelivered = $filteredOrders->where('order_status', 2)->count();
        $filteredComplete = $filteredOrders->where('order_status', 3)->count();
        $filteredDeclined = $filteredOrders->where('order_status', 4)->count();

        // Gelir
        $filteredEarning = round($filteredOrders->sum('total_amount'), 2);
        $filteredPendingEarning = round($filteredOrders->where('payment_status', 0)->sum('total_amount'), 2);
        $filteredProductSale = $filteredOrders->where('order_status', 3)->sum('product_qty');

        // --- Komisyon (filtrelenmiş) ---
        $commissionStats = DB::table('commission_ledger')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw("
                COALESCE(SUM(commission_amount), 0) as total_commission,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END), 0) as pending_commission,
                COALESCE(SUM(CASE WHEN status = 'settled' THEN commission_amount ELSE 0 END), 0) as settled_commission,
                COALESCE(SUM(CASE WHEN status = 'refunded' THEN commission_amount ELSE 0 END), 0) as refunded_commission,
                COALESCE(SUM(gross_amount), 0) as total_gross,
                COALESCE(SUM(seller_net_amount), 0) as total_seller_net
            ")->first();

        // --- Tüm zamanlar toplam (her zaman göster) ---
        $allTimeStats = DB::table('commission_ledger')
            ->selectRaw("
                COALESCE(SUM(commission_amount), 0) as total_commission,
                COALESCE(SUM(seller_net_amount), 0) as total_seller_net
            ")->first();
        $allTimeEarning = round(Order::sum('total_amount'), 2);
        $allTimeTotalOrder = Order::count();

        // --- En Çok Satan Ürünler (filtrelenmiş) ---
        $topProducts = DB::table('order_products')
            ->join('products', 'products.id', '=', 'order_products.product_id')
            ->join('orders', 'orders.id', '=', 'order_products.order_id')
            ->whereBetween('orders.created_at', [$dateFrom, $dateTo])
            ->select(
                'products.id', 'products.name', 'products.thumb_image',
                DB::raw('SUM(order_products.qty) as total_sold'),
                DB::raw('SUM(order_products.qty * order_products.unit_price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.thumb_image')
            ->orderByDesc('total_sold')
            ->limit(5)->get();

        // --- En Çok Satan Satıcılar (filtrelenmiş) ---
        $topSellers = DB::table('commission_ledger')
            ->join('vendors', 'vendors.id', '=', 'commission_ledger.seller_id')
            ->whereBetween('commission_ledger.created_at', [$dateFrom, $dateTo])
            ->select(
                'vendors.id', 'vendors.shop_name',
                DB::raw('SUM(commission_ledger.gross_amount) as total_sales'),
                DB::raw('SUM(commission_ledger.commission_amount) as total_commission'),
                DB::raw('SUM(commission_ledger.seller_net_amount) as total_net'),
                DB::raw('COUNT(DISTINCT commission_ledger.order_id) as order_count')
            )
            ->groupBy('vendors.id', 'vendors.shop_name')
            ->orderByDesc('total_sales')
            ->limit(5)->get();

        // --- Grafik: dönem içi günlük satış + komisyon ---
        $chartLabels = [];
        $chartSales = [];
        $chartCommissions = [];
        $chartStart = $dateFrom->copy();
        $chartEnd = min($dateTo->copy(), now());
        $dayCount = $chartStart->diffInDays($chartEnd) + 1;
        $dayCount = min($dayCount, 90); // max 90 gün göster

        for ($i = 0; $i < $dayCount; $i++) {
            $date = $chartStart->copy()->addDays($i)->format('Y-m-d');
            $chartLabels[] = Carbon::parse($date)->format('d.m');
            $chartSales[] = round(Order::whereDate('created_at', $date)->sum('total_amount'), 2);
            $chartCommissions[] = round(
                DB::table('commission_ledger')->whereDate('created_at', $date)->sum('commission_amount'), 2
            );
        }

        // --- Son siparişler (bugünün) ---
        $todayOrders = Order::with('user', 'orderProducts', 'orderAddress')
            ->orderBy('id', 'desc')
            ->whereDate('created_at', now()->format('Y-m-d'))
            ->get();

        // --- Genel sayılar ---
        $totalProduct = Product::count();
        $reviews = ProductReview::count();
        $reports = ProductReport::count();
        $users = User::count();
        $sellers = Vendor::count();
        $subscribers = Subscriber::where('is_verified', 1)->count();
        $categories = Category::count();
        $brands = Brand::count();

        return view('admin.dashboard', compact(
            'setting', 'period', 'periodLabel', 'dateFrom', 'dateTo',
            'filteredTotal', 'filteredPending', 'filteredProgress',
            'filteredDelivered', 'filteredComplete', 'filteredDeclined',
            'filteredEarning', 'filteredPendingEarning', 'filteredProductSale',
            'commissionStats',
            'allTimeStats', 'allTimeEarning', 'allTimeTotalOrder',
            'topProducts', 'topSellers',
            'chartLabels', 'chartSales', 'chartCommissions',
            'todayOrders',
            'totalProduct', 'reviews', 'reports',
            'users', 'sellers', 'subscribers', 'categories', 'brands'
        ));
    }
}

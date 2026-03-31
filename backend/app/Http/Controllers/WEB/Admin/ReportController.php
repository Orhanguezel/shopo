<?php

namespace App\Http\Controllers\WEB\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use App\Models\Vendor;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    /**
     * #53 Sipariş Raporu
     */
    public function orderReport(Request $request)
    {
        $setting = Setting::first();

        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : now()->endOfDay();

        $query = Order::with(['user', 'orderProducts.product'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($request->order_status !== null && $request->order_status !== '') {
            $query->where('order_status', $request->order_status);
        }
        if ($request->payment_status !== null && $request->payment_status !== '') {
            $query->where('payment_status', $request->payment_status);
        }
        if ($request->payment_method) {
            $query->where('payment_method', $request->payment_method);
        }

        $orders = $query->orderBy('id', 'desc')->paginate(25)->withQueryString();

        // Özet
        $summaryQuery = Order::whereBetween('created_at', [$startDate, $endDate]);
        if ($request->order_status !== null && $request->order_status !== '') {
            $summaryQuery->where('order_status', $request->order_status);
        }
        if ($request->payment_status !== null && $request->payment_status !== '') {
            $summaryQuery->where('payment_status', $request->payment_status);
        }

        $summary = (object) [
            'total_orders' => (clone $summaryQuery)->count(),
            'total_amount' => round((clone $summaryQuery)->sum('total_amount'), 2),
            'total_shipping' => round((clone $summaryQuery)->sum('shipping_cost'), 2),
            'total_coupon' => round((clone $summaryQuery)->sum('coupon_coast'), 2),
        ];

        // CSV export
        if ($request->export === 'csv') {
            return $this->exportOrdersCsv($query->orderBy('id', 'desc')->get(), $setting);
        }

        return view('admin.reports.order_report', compact(
            'setting', 'orders', 'summary', 'startDate', 'endDate'
        ));
    }

    private function exportOrdersCsv($orders, $setting)
    {
        $filename = 'siparis-raporu-' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($orders, $setting) {
            $file = fopen('php://output', 'w');
            // BOM for Excel UTF-8
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($file, [
                'Sipariş No', 'Tarih', 'Müşteri', 'Ürün Adedi',
                'Tutar', 'Kargo', 'Kupon', 'Ödeme Yöntemi',
                'Ödeme Durumu', 'Sipariş Durumu'
            ], ';');

            $statusMap = [0 => 'Bekliyor', 1 => 'İşlemde', 2 => 'Teslim Edildi', 3 => 'Tamamlandı', 4 => 'İptal'];
            $paymentMap = [0 => 'Bekliyor', 1 => 'Ödendi'];

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_id,
                    $order->created_at->format('d.m.Y H:i'),
                    $order->user->name ?? '-',
                    $order->product_qty,
                    number_format($order->total_amount, 2, ',', '.'),
                    number_format($order->shipping_cost, 2, ',', '.'),
                    number_format($order->coupon_coast, 2, ',', '.'),
                    $order->payment_method ?? '-',
                    $paymentMap[$order->payment_status] ?? '-',
                    $statusMap[$order->order_status] ?? '-',
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * #54 Satıcı Bazlı Rapor
     */
    public function sellerReport(Request $request)
    {
        $setting = Setting::first();

        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : now()->endOfDay();

        $sellers = DB::table('commission_ledger')
            ->join('vendors', 'vendors.id', '=', 'commission_ledger.seller_id')
            ->whereBetween('commission_ledger.created_at', [$startDate, $endDate])
            ->select(
                'vendors.id', 'vendors.shop_name', 'vendors.email',
                DB::raw('COUNT(DISTINCT commission_ledger.order_id) as order_count'),
                DB::raw('SUM(commission_ledger.gross_amount) as total_sales'),
                DB::raw('SUM(commission_ledger.commission_amount) as total_commission'),
                DB::raw('SUM(commission_ledger.seller_net_amount) as total_net'),
                DB::raw("SUM(CASE WHEN commission_ledger.status = 'pending' THEN commission_ledger.seller_net_amount ELSE 0 END) as pending_net"),
                DB::raw("SUM(CASE WHEN commission_ledger.status = 'settled' THEN commission_ledger.seller_net_amount ELSE 0 END) as settled_net")
            )
            ->groupBy('vendors.id', 'vendors.shop_name', 'vendors.email')
            ->orderByDesc('total_sales')
            ->get();

        $summary = (object) [
            'total_sales' => $sellers->sum('total_sales'),
            'total_commission' => $sellers->sum('total_commission'),
            'total_net' => $sellers->sum('total_net'),
            'seller_count' => $sellers->count(),
        ];

        if ($request->export === 'csv') {
            return $this->exportSellerCsv($sellers, $setting);
        }

        return view('admin.reports.seller_report', compact(
            'setting', 'sellers', 'summary', 'startDate', 'endDate'
        ));
    }

    private function exportSellerCsv($sellers, $setting)
    {
        $filename = 'satici-raporu-' . now()->format('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($sellers) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($file, ['Satıcı', 'E-posta', 'Sipariş', 'Satış', 'Komisyon', 'Net', 'Bekleyen', 'Ödenen'], ';');
            foreach ($sellers as $s) {
                fputcsv($file, [
                    $s->shop_name, $s->email, $s->order_count,
                    number_format($s->total_sales, 2, ',', '.'),
                    number_format($s->total_commission, 2, ',', '.'),
                    number_format($s->total_net, 2, ',', '.'),
                    number_format($s->pending_net, 2, ',', '.'),
                    number_format($s->settled_net, 2, ',', '.'),
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * #55 Ürün Bazlı Rapor
     */
    public function productReport(Request $request)
    {
        $setting = Setting::first();

        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : now()->endOfDay();

        $products = DB::table('order_products')
            ->join('products', 'products.id', '=', 'order_products.product_id')
            ->join('orders', 'orders.id', '=', 'order_products.order_id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select(
                'products.id', 'products.name', 'products.thumb_image', 'products.price',
                DB::raw('SUM(order_products.qty) as total_sold'),
                DB::raw('SUM(order_products.qty * order_products.unit_price) as total_revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as order_count')
            )
            ->groupBy('products.id', 'products.name', 'products.thumb_image', 'products.price')
            ->orderByDesc('total_sold')
            ->get();

        // En çok yorumlanan
        $topReviewed = DB::table('product_reviews')
            ->join('products', 'products.id', '=', 'product_reviews.product_id')
            ->select('products.id', 'products.name', 'products.thumb_image', DB::raw('COUNT(*) as review_count'), DB::raw('ROUND(AVG(product_reviews.rating),1) as avg_rating'))
            ->groupBy('products.id', 'products.name', 'products.thumb_image')
            ->orderByDesc('review_count')
            ->limit(10)->get();

        if ($request->export === 'csv') {
            return $this->exportProductCsv($products, $setting);
        }

        return view('admin.reports.product_report', compact(
            'setting', 'products', 'topReviewed', 'startDate', 'endDate'
        ));
    }

    private function exportProductCsv($products, $setting)
    {
        $filename = 'urun-raporu-' . now()->format('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($products) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($file, ['Ürün', 'Fiyat', 'Satış Adedi', 'Gelir', 'Sipariş Sayısı'], ';');
            foreach ($products as $p) {
                fputcsv($file, [
                    $p->name,
                    number_format($p->price, 2, ',', '.'),
                    $p->total_sold,
                    number_format($p->total_revenue, 2, ',', '.'),
                    $p->order_count,
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * #56 İşlem Raporu
     */
    public function transactionReport(Request $request)
    {
        $setting = Setting::first();

        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : now()->endOfDay();

        // Ödeme yöntemi kırılımı
        $paymentBreakdown = Order::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as total_amount'),
                DB::raw("SUM(CASE WHEN payment_status = 1 THEN total_amount ELSE 0 END) as paid_amount"),
                DB::raw("SUM(CASE WHEN payment_status = 0 THEN total_amount ELSE 0 END) as pending_amount")
            )
            ->groupBy('payment_method')
            ->orderByDesc('total_amount')
            ->get();

        // Günlük işlem hacmi
        $dailyVolume = Order::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as total_amount'),
                DB::raw("SUM(CASE WHEN payment_status = 1 THEN 1 ELSE 0 END) as paid_count"),
                DB::raw("SUM(CASE WHEN payment_status = 0 THEN 1 ELSE 0 END) as pending_count")
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        // Özet
        $summary = (object) [
            'total_transactions' => $dailyVolume->sum('order_count'),
            'total_volume' => $dailyVolume->sum('total_amount'),
            'total_paid' => $paymentBreakdown->sum('paid_amount'),
            'total_pending' => $paymentBreakdown->sum('pending_amount'),
        ];

        // Grafik verileri
        $chartLabels = $dailyVolume->pluck('date')->map(fn($d) => Carbon::parse($d)->format('d.m'))->toArray();
        $chartAmounts = $dailyVolume->pluck('total_amount')->toArray();

        if ($request->export === 'csv') {
            return $this->exportTransactionCsv($dailyVolume, $paymentBreakdown);
        }

        return view('admin.reports.transaction_report', compact(
            'setting', 'paymentBreakdown', 'dailyVolume', 'summary',
            'chartLabels', 'chartAmounts', 'startDate', 'endDate'
        ));
    }

    private function exportTransactionCsv($dailyVolume, $paymentBreakdown)
    {
        $filename = 'islem-raporu-' . now()->format('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($dailyVolume, $paymentBreakdown) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($file, ['--- Ödeme Yöntemi Kırılımı ---'], ';');
            fputcsv($file, ['Yöntem', 'Sipariş', 'Toplam', 'Ödenen', 'Bekleyen'], ';');
            foreach ($paymentBreakdown as $p) {
                fputcsv($file, [
                    $p->payment_method ?: 'Belirtilmemiş', $p->order_count,
                    number_format($p->total_amount, 2, ',', '.'),
                    number_format($p->paid_amount, 2, ',', '.'),
                    number_format($p->pending_amount, 2, ',', '.'),
                ], ';');
            }

            fputcsv($file, [''], ';');
            fputcsv($file, ['--- Günlük İşlem Hacmi ---'], ';');
            fputcsv($file, ['Tarih', 'Sipariş', 'Tutar', 'Ödenen', 'Bekleyen'], ';');
            foreach ($dailyVolume as $d) {
                fputcsv($file, [
                    Carbon::parse($d->date)->format('d.m.Y'),
                    $d->order_count,
                    number_format($d->total_amount, 2, ',', '.'),
                    $d->paid_count, $d->pending_count,
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * #57 İade Raporu
     */
    public function returnReport(Request $request)
    {
        $setting = Setting::first();

        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : now()->subMonths(3)->startOfDay();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : now()->endOfDay();

        $query = DB::table('return_requests')
            ->join('orders', 'orders.id', '=', 'return_requests.order_id')
            ->join('users', 'users.id', '=', 'return_requests.user_id')
            ->leftJoin('order_products', 'order_products.id', '=', 'return_requests.order_product_id')
            ->leftJoin('products', 'products.id', '=', 'order_products.product_id')
            ->leftJoin('vendors', 'vendors.id', '=', 'return_requests.seller_id')
            ->whereBetween('return_requests.created_at', [$startDate, $endDate]);

        if ($request->status !== null && $request->status !== '') {
            $query->where('return_requests.status', $request->status);
        }

        $returns = $query->select(
            'return_requests.*',
            'orders.order_id as order_number',
            'users.name as customer_name',
            'products.name as product_name',
            'products.thumb_image',
            'vendors.shop_name'
        )->orderByDesc('return_requests.created_at')->get();

        // İade nedeni kırılımı
        $reasonBreakdown = DB::table('return_requests')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('reason', DB::raw('COUNT(*) as count'))
            ->groupBy('reason')
            ->orderByDesc('count')
            ->get();

        // Satıcı bazlı iade
        $sellerBreakdown = DB::table('return_requests')
            ->leftJoin('vendors', 'vendors.id', '=', 'return_requests.seller_id')
            ->whereBetween('return_requests.created_at', [$startDate, $endDate])
            ->select(
                'vendors.shop_name',
                DB::raw('COUNT(*) as return_count'),
                DB::raw('SUM(return_requests.refund_amount) as total_refund')
            )
            ->groupBy('vendors.shop_name')
            ->orderByDesc('return_count')
            ->get();

        // Özet
        $statusMap = [0 => 'Bekliyor', 1 => 'Onaylandı', 2 => 'Reddedildi', 3 => 'Tamamlandı'];
        $totalReturns = $returns->count();
        $totalOrders = Order::whereBetween('created_at', [$startDate, $endDate])->count();
        $returnRate = $totalOrders > 0 ? round(($totalReturns / $totalOrders) * 100, 1) : 0;
        $totalRefund = $returns->sum('refund_amount');

        $summary = (object) [
            'total_returns' => $totalReturns,
            'return_rate' => $returnRate,
            'total_refund' => $totalRefund,
            'pending' => $returns->where('status', 0)->count(),
            'approved' => $returns->where('status', 1)->count(),
            'rejected' => $returns->where('status', 2)->count(),
            'completed' => $returns->where('status', 3)->count(),
        ];

        if ($request->export === 'csv') {
            return $this->exportReturnCsv($returns);
        }

        return view('admin.reports.return_report', compact(
            'setting', 'returns', 'reasonBreakdown', 'sellerBreakdown',
            'summary', 'statusMap', 'startDate', 'endDate'
        ));
    }

    private function exportReturnCsv($returns)
    {
        $filename = 'iade-raporu-' . now()->format('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];
        $statusMap = [0 => 'Bekliyor', 1 => 'Onaylandı', 2 => 'Reddedildi', 3 => 'Tamamlandı'];

        $callback = function () use ($returns, $statusMap) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($file, ['Tarih', 'Sipariş No', 'Müşteri', 'Ürün', 'Satıcı', 'Neden', 'İade Tutarı', 'Durum'], ';');
            foreach ($returns as $r) {
                fputcsv($file, [
                    Carbon::parse($r->created_at)->format('d.m.Y'),
                    $r->order_number,
                    $r->customer_name,
                    $r->product_name ?? '-',
                    $r->shop_name ?? 'Admin',
                    $r->reason,
                    number_format($r->refund_amount, 2, ',', '.'),
                    $statusMap[$r->status] ?? '-',
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

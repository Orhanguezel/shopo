<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Setting;
use App\Models\OrderProduct;
use App\Models\OrderProductVariant;
use App\Models\OrderAddress;
use Auth;
class SellerOrderController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function index(){
        $seller = Auth::guard('api')->user()->seller;
        $orders = Order::with('user','deliveryman')->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->paginate(15);
        $title = trans('All Orders');

        return response()->json(['orders' => $orders, 'title' => $title], 200);
    }

    public function pendingOrder(){
        $seller = Auth::guard('api')->user()->seller;
        $orders = Order::with('user','deliveryman')->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('order_status',0)->paginate(15);
        $title = trans('Pending Orders');

        return response()->json(['orders' => $orders, 'title' => $title], 200);
    }

    public function pregressOrder(){
        $seller = Auth::guard('api')->user()->seller;
        $orders = Order::with('user','deliveryman')->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('order_status',1)->paginate(15);
        $title = trans('Pregress Orders');

        return response()->json(['orders' => $orders, 'title' => $title], 200);
    }

    public function deliveredOrder(){
        $seller = Auth::guard('api')->user()->seller;
        $orders = Order::with('user','deliveryman')->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('order_status',2)->paginate(15);
        $title = trans('Delivered Orders');

        return response()->json(['orders' => $orders, 'title' => $title], 200);
    }

    public function completedOrder(){
        $seller = Auth::guard('api')->user()->seller;
        $orders = Order::with('user','deliveryman')->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('order_status',3)->paginate(15);
        $title = trans('Completed Orders');

        return response()->json(['orders' => $orders, 'title' => $title], 200);
    }

    public function declinedOrder(){
        $seller = Auth::guard('api')->user()->seller;
        $orders = Order::with('user','deliveryman')->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('order_status',4)->paginate(15);
        $title = trans('Declined Orders');

        return response()->json(['orders' => $orders, 'title' => $title], 200);
    }

    public function cashOnDelivery(){
        $seller = Auth::guard('api')->user()->seller;
        $orders = Order::with('user','deliveryman')->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('cash_on_delivery',1)->paginate(15);

        $title = trans('Cash On Delivery');

        return response()->json(['orders' => $orders, 'title' => $title], 200);
    }

    public function show($id){
        $order = Order::with('user','orderProducts.orderProductVariants','orderAddress','deliveryman')->find($id);

        return response()->json(['order' => $order], 200);

    }

    /**
     * Satıcı sipariş durumunu günceller
     * İzin verilen geçişler:
     *   0 (beklemede) → 1 (kargoya verildi)
     *   1 (kargoda)   → 2 (teslim edildi)
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'order_status' => 'required|integer|in:1,2',
        ]);

        $seller = Auth::guard('api')->user()->seller;

        // Satıcı sadece kendi siparişlerini güncelleyebilir
        $order = Order::whereHas('orderProducts', function ($query) use ($seller) {
            $query->where('seller_id', $seller->id);
        })->find($id);

        if (!$order) {
            return response()->json(['message' => 'Sipariş bulunamadı veya bu siparişe erişim yetkiniz yok.'], 404);
        }

        $newStatus = (int) $request->order_status;
        $currentStatus = (int) $order->order_status;

        // Geçiş kuralları: 0→1 veya 1→2
        $allowedTransitions = [
            0 => [1], // beklemede → kargoya verildi
            1 => [2], // kargoda → teslim edildi
        ];

        if (!isset($allowedTransitions[$currentStatus]) || !in_array($newStatus, $allowedTransitions[$currentStatus])) {
            return response()->json([
                'message' => 'Bu durum geçişi yapılamaz. Mevcut durum: ' . $currentStatus,
            ], 422);
        }

        if ($newStatus === 1) {
            $order->order_status = 1;
            $order->order_approval_date = date('Y-m-d');
        } elseif ($newStatus === 2) {
            $order->order_status = 2;
            $order->order_delivered_date = date('Y-m-d');
        }

        $order->save();

        $statusLabels = [1 => 'Kargoya Verildi', 2 => 'Teslim Edildi'];
        return response()->json([
            'notification' => 'Sipariş durumu güncellendi: ' . $statusLabels[$newStatus],
        ], 200);
    }
}

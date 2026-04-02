<?php

namespace App\Http\Controllers\WEB\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Setting;
use App\Models\OrderProduct;
use App\Models\OrderProductVariant;
use App\Models\OrderAddress;
use App\Models\CountryState;
use App\Models\City;
use Auth;
class SellerOrderController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:web');
    }

    public function index(){
        $seller = Auth::guard('web')->user()->seller;
        $orders = Order::with(['user', 'cargoShipment'])->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->paginate(15);
        $title = trans('admin_validation.All Orders');
        $setting = Setting::first();
        return view('seller.order', compact('orders','title','setting'));
    }

    public function pendingOrder(){
        $seller = Auth::guard('web')->user()->seller;
        $orders = Order::with(['user', 'cargoShipment'])->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('order_status',0)->paginate(15);
        $title = trans('admin_validation.Pending Orders');
        $setting = Setting::first();
        return view('seller.order', compact('orders','title','setting'));
    }

    public function pregressOrder(){
        $seller = Auth::guard('web')->user()->seller;
        $orders = Order::with(['user', 'cargoShipment'])->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('order_status',1)->paginate(15);
        $title = trans('admin_validation.Pregress Orders');
        $setting = Setting::first();
        return view('seller.order', compact('orders','title','setting'));
    }

    public function deliveredOrder(){
        $seller = Auth::guard('web')->user()->seller;
        $orders = Order::with(['user', 'cargoShipment'])->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('order_status',2)->paginate(15);
        $title = trans('admin_validation.Delivered Orders');
        $setting = Setting::first();
        return view('seller.order', compact('orders','title','setting'));
    }

    public function completedOrder(){
        $seller = Auth::guard('web')->user()->seller;
        $orders = Order::with(['user', 'cargoShipment'])->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('order_status',3)->paginate(15);
        $title = trans('admin_validation.Completed Orders');
        $setting = Setting::first();
        return view('seller.order', compact('orders','title','setting'));
    }

    public function declinedOrder(){
        $seller = Auth::guard('web')->user()->seller;
        $orders = Order::with(['user', 'cargoShipment'])->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('order_status',4)->paginate(15);
        $title = trans('admin_validation.Declined Orders');
        $setting = Setting::first();
        return view('seller.order', compact('orders','title','setting'));
    }

    public function cashOnDelivery(){
        $seller = Auth::guard('web')->user()->seller;
        $orders = Order::with(['user', 'cargoShipment'])->whereHas('orderProducts',function($query) use ($seller){
            $query->where(['seller_id' => $seller->id]);
        })->orderBy('id','desc')->where('cash_on_delivery',1)->paginate(15);

        $title = trans('admin_validation.Cash On Delivery');
        $setting = Setting::first();
        return view('seller.order', compact('orders','title','setting'));
    }

    public function show($id){
        $seller = Auth::guard('web')->user()->seller;

        // Satıcının bu siparişte ürünü olduğunu doğrula
        $order = Order::with(['user', 'orderAddress', 'cargoShipment'])
            ->whereHas('orderProducts', function($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->find($id);

        if (!$order) {
            $notification = array('messege' => 'Bu siparişe erişim yetkiniz yok.', 'alert-type' => 'error');
            return redirect()->route('seller.all-order')->with($notification);
        }

        // Sadece bu satıcıya ait ürünleri yükle
        $order->setRelation(
            'orderProducts',
            $order->orderProducts()->where('seller_id', $seller->id)->with(['orderProductVariants', 'product'])->get()
        );

        $orderDistinctSellerCount = (int) OrderProduct::query()
            ->where('order_id', $order->id)
            ->selectRaw('COUNT(DISTINCT seller_id) as c')
            ->value('c');

        $sellerLinesSubtotal = 0.0;
        foreach ($order->orderProducts as $op) {
            $line = (float) $op->unit_price * (int) $op->qty;
            foreach ($op->orderProductVariants as $v) {
                $line += (float) $v->variant_price * (int) $op->qty;
            }
            $sellerLinesSubtotal += $line;
        }

        if ($order->orderAddress) {
            $addr = $order->orderAddress;
            if (trim((string) ($addr->billing_name ?? '')) === '') {
                $addr->billing_name = trim(($addr->billing_first_name ?? '').' '.($addr->billing_last_name ?? ''));
            }
            if (trim((string) ($addr->shipping_name ?? '')) === '') {
                $addr->shipping_name = trim(($addr->shipping_first_name ?? '').' '.($addr->shipping_last_name ?? ''));
            }
            if (trim((string) ($addr->shipping_state ?? '')) === '' && (int) $addr->shipping_state_id > 0) {
                $addr->shipping_state = CountryState::query()->find($addr->shipping_state_id)?->name;
            }
            if (trim((string) ($addr->shipping_city ?? '')) === '' && (int) $addr->shipping_city_id > 0) {
                $addr->shipping_city = City::query()->find($addr->shipping_city_id)?->name;
            }
            if (trim((string) ($addr->billing_state ?? '')) === '' && (int) $addr->billing_state_id > 0) {
                $addr->billing_state = CountryState::query()->find($addr->billing_state_id)?->name;
            }
            if (trim((string) ($addr->billing_city ?? '')) === '' && (int) $addr->billing_city_id > 0) {
                $addr->billing_city = City::query()->find($addr->billing_city_id)?->name;
            }
        }

        $setting = Setting::first();
        return view('seller.show_order', compact(
            'order',
            'setting',
            'orderDistinctSellerCount',
            'sellerLinesSubtotal'
        ));
    }

    /**
     * Seller sipariş durumu: 0 (beklemede) → 1 (işlemde), 1 → 2 (teslim edildi)
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $rules = [
            'order_status' => 'required|integer|in:1,2',
        ];
        $this->validate($request, $rules);

        $seller = Auth::guard('web')->user()->seller;

        $order = Order::query()
            ->where('id', $id)
            ->whereHas('orderProducts', function ($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->first();

        if (! $order) {
            $notification = [
                'messege' => 'Bu siparişe erişim yetkiniz yok.',
                'alert-type' => 'error',
            ];
            return redirect()->route('seller.all-order')->with($notification);
        }

        $currentStatus = (int) $order->order_status;
        $newStatus = (int) $request->order_status;

        if ($newStatus === 1) {
            if ($currentStatus !== 0) {
                $notification = [
                    'messege' => 'Sipariş durumu bu işlem için uygun değil.',
                    'alert-type' => 'warning',
                ];
                return redirect()->back()->with($notification);
            }
            $order->order_status = 1;
            $order->order_approval_date = date('Y-m-d');
            $order->save();
            $notification = [
                'messege' => 'Sipariş onaylandı. Kargoya verebilir veya teslim bilgisini güncelleyebilirsiniz.',
                'alert-type' => 'success',
            ];
        } elseif ($newStatus === 2) {
            if ($currentStatus !== 1) {
                $notification = [
                    'messege' => 'Sadece “kargoda / işlemde” siparişler teslim olarak işaretlenebilir.',
                    'alert-type' => 'warning',
                ];
                return redirect()->back()->with($notification);
            }
            $order->order_status = 2;
            $order->order_delivered_date = date('Y-m-d');
            $order->save();
            $notification = [
                'messege' => 'Sipariş teslim edildi olarak işaretlendi.',
                'alert-type' => 'success',
            ];
        }

        return redirect()->back()->with($notification);
    }
}

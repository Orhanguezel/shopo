<?php

namespace App\Http\Controllers\WEB\Seller;

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
        $order = Order::with(['user', 'orderAddress'])
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
            $order->orderProducts()->where('seller_id', $seller->id)->with('orderProductVariants')->get()
        );

        $setting = Setting::first();
        return view('seller.show_order', compact('order', 'setting'));
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

<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use PayPal\Api\Amount;
use PayPal\Api\Details;
use PayPal\Api\Item;
use PayPal\Api\ItemList;
use PayPal\Api\Payer;
use PayPal\Api\Payment;
use PayPal\Api\RedirectUrls;
use PayPal\Api\Transaction;

use PayPal\Api\PaymentExecution;

use App\Models\BreadcrumbImage;
use App\Models\Country;
use App\Models\CountryState;
use App\Models\City;
use App\Models\BillingAddress;
use App\Models\ShippingAddress;
use App\Models\Vendor;
use App\Models\ShippingMethod;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\OrderProductVariant;
use App\Models\OrderAddress;
use App\Models\Product;
use App\Models\Setting;
use App\Models\StripePayment;
use App\Mail\OrderSuccessfully;
use App\Helpers\MailHelper;
use App\Models\EmailTemplate;
use App\Models\PaypalPayment;
use App\Models\Coupon;
use App\Models\ShoppingCart;

use App\Models\Shipping;
use App\Models\Address;
use App\Models\ShoppingCartVariant;


use App\Models\RazorpayPayment;
use App\Models\Flutterwave;
use App\Models\PaystackAndMollie;
use App\Models\InstamojoPayment;
use App\Models\ProductVariantItem;
use App\Models\FlashSaleProduct;
use App\Models\FlashSale;
use App\Models\User;
use App\Models\Admin;

use Str;
use Cart;
use Mail;
use Session;
use Auth;

use Twilio\Rest\Client;
use App\Models\SmsTemplate;
use App\Models\TwilioSms;
use App\Models\BiztechSms;
use Exception;

use PayPal\Rest\ApiContext;
use PayPal\Auth\OAuthTokenCredential;

use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Core\LiveEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use PayPalCheckoutSdk\Orders\OrdersCaptureRequest;
use PayPalHttp\HttpException;

class PaypalController extends Controller
{
   private $client;

    public function __construct()
    {
        $account = PaypalPayment::first();

        // Set environment: sandbox or live
        $environment = $account->account_mode === 'sandbox'
            ? new SandboxEnvironment($account->client_id, $account->secret_id)
            : new LiveEnvironment($account->client_id, $account->secret_id);

        // Create the PayPal HTTP client
        $this->client = new PayPalHttpClient($environment);
    }


    public function paypalReactWebView(Request $request)
    {
        // Validate the request
        if($request->request_from == 'react_web'){
            $rules = [
                'success_url' => 'required',
                'faild_url' => 'required',
                'order_id' => 'required',
            ];
        }else{
            $rules = [
                'order_id'=>'required',
            ];
        }

        $customMessages = [
            'shipping_address_id.required' => trans('user_validation.Shipping address is required'),
            'billing_address_id.required' => trans('user_validation.Billing address is required'),
            'success_url.required' => trans('user_validation.Success url is required'),
            'success_url.url' => trans('user_validation.Invalid success url format'),
            'faild_url.required' => trans('user_validation.Faild url is required'),
            'faild_url.url' => trans('user_validation.Invalid faild url format'),
        ];

        $this->validate($request, $rules, $customMessages);

        $order_id = $request->order_id;

        // Store values in session
        $shipping_address_id = $request->shipping_address_id;
        $billing_address_id = $request->billing_address_id;
        $shipping_method_id = $request->shipping_method_id;
        $token = $request->token;
        $user = Auth::guard('api')->user();

        Session::put('shipping_address_id', $shipping_address_id);
        Session::put('billing_address_id', $billing_address_id);
        Session::put('shipping_method_id', $shipping_method_id);
        Session::put('user', $user);
        Session::put('request_from', $request->request_from);



        Session::put('order_id', $order_id);
        Session::put('success_url', json_decode($request->success_url, true));
        Session::put('faild_url', json_decode($request->faild_url, true));

        $user = Session::get('user');

        $find_order = Order::where('order_id', $order_id)->first();

        if(!$find_order){
            $notification = trans('Order not found');

            $faild_url = Session::get('faild_url');

            $request_from = Session::get('request_from');
            if($request_from == 'react_web'){
                return redirect($faild_url);
            }else{
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        }

        if($find_order->is_draft == 'no'){
            $faild_url = Session::get('faild_url');

            $request_from = Session::get('request_from');
            if($request_from == 'react_web'){
                return redirect($faild_url);
            }else{
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        }

        $total_price = $find_order->total_amount;


        $amount_real_currency = $total_price;
        $paypalSetting = PaypalPayment::first();
        $payableAmount = round($total_price * $paypalSetting->currency->currency_rate,2);

        $name=env('APP_NAME');

        $root_url=url('/');

        // Create a PayPal order request
        $orderRequest = new OrdersCreateRequest();
        $orderRequest->prefer('return=representation');
        $orderRequest->body = [
            'intent' => 'CAPTURE',
            'purchase_units' => [
                [
                    'amount' => [
                        'currency_code' => $paypalSetting->currency->currency_code, // Change this to your desired currency
                        'value' => $payableAmount // Set order total dynamically
                    ]
                ]
            ],
            'application_context' => [
                'return_url' => $root_url."/user/checkout/paypal-payment-success-from-react",
                'cancel_url' => $root_url."/user/checkout/paypal-payment-cancled-from-react",
                'brand_name' => $name, // Optional: Set your brand name
                'user_action' => 'PAY_NOW', // Optional: 'PAY_NOW' to skip review step
            ]
        ];

        try {
            // Execute the PayPal order creation
            $response = $this->client->execute($orderRequest);

            // Redirect to PayPal approval URL
            foreach ($response->result->links as $link) {
                if ($link->rel === 'approve') {
                    return redirect()->away($link->href);
                }
            }

        } catch (Exception $ex) {
            // Handle exceptions or errors
            return redirect()->back()->withErrors(['error' => 'Error processing PayPal payment: ' . $ex->getMessage()]);
        }
    }


    public function paypalPaymentSuccessFromReact(Request $request)
    {
        if (empty($request->get('token'))) {
            $notification = trans('user_validation.Payment Faild');
            return response()->json(['notification' => $notification], 403);
        }

        $orderId = $request->get('token');

        // Capture the payment
        $captureRequest = new OrdersCaptureRequest($orderId);
        $captureRequest->prefer('return=representation');

        try {
            // Capture PayPal payment
            $response = $this->client->execute($captureRequest);

            if ($response->result->status === 'COMPLETED') {

                $order_id = Session::get('order_id');

                $find_order = Order::where('order_id', $order_id)->first();

                if(!$find_order){
                    $faild_url = Session::get('faild_url');

                    $request_from = Session::get('request_from');
                    if($request_from == 'react_web'){
                        return redirect($faild_url);
                    }else{
                        return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
                    }
                }

                if($find_order->is_draft == 'no'){
                    $faild_url = Session::get('faild_url');

                    $request_from = Session::get('request_from');
                    if($request_from == 'react_web'){
                        return redirect($faild_url);
                    }else{
                        return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
                    }
                }

                $find_order->is_draft = 'no';
                $find_order->payment_status = 1;
                $find_order->transection_id = $orderId;
                $find_order->payment_method = 'Paypal';
                $find_order->save();

                // Redirect to success URL
                $request_from = Session::get('request_from');

                if($request_from == 'react_web'){
                    $success_url = Session::get('success_url');
                    $success_url = $success_url . $order_id;
                    return redirect($success_url);
                }else{
                    return redirect()->route('user.checkout.order-success-url-for-mobile-app');
                }
            }

        } catch (HttpException $ex) {
            $notification = trans('user_validation.Payment Faild');
            return response()->json(['notification' => $notification], 403);
        }
    }

    public function paypalPaymentCancledFromReact(){
        $faild_url = Session::get('faild_url');
        $faild_url = Session::get('faild_url');

        $request_from = Session::get('request_from');
        if($request_from == 'react_web'){
            return redirect($faild_url);
        }else{
            return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
        }
    }

    public function calculateCartTotal($user, $request_coupon, $request_shipping_method_id, $shipping_address_id){
        $total_price = 0;
        $coupon_price = 0;
        $shipping_fee = 0;
        $productWeight = 0;

        // calculate total price


        $cartProducts = ShoppingCart::with('product','variants.variantItem')->where('user_id', $user->id)->select('id','product_id','qty')->get();



        if($cartProducts->count() == 0){
            $notification = trans('user_validation.Your shopping cart is empty');
            return response()->json(['message' => $notification],403);
        }


        foreach($cartProducts as $index => $cartProduct){
            $variantPrice = 0;
            if($cartProduct->variants){
                foreach($cartProduct->variants as $item_index => $var_item){
                  $item = ProductVariantItem::find($var_item->variant_item_id);
                  if($item){
                    $variantPrice += $item->price;
                  }
                }
            }

            $product = Product::select('id','price','offer_price','weight')->find($cartProduct->product_id);
            $price = $product->offer_price ? $product->offer_price : $product->price;
            $price = $price + $variantPrice;
            $weight = $product->weight;
            $weight = $weight * $cartProduct->qty;
            $productWeight += $weight;
            $isFlashSale = FlashSaleProduct::where(['product_id' => $product->id,'status' => 1])->first();
            $today = date('Y-m-d H:i:s');
            if($isFlashSale){
                $flashSale = FlashSale::first();
                if($flashSale->status == 1){
                    if($today <= $flashSale->end_time){
                        $offerPrice = ($flashSale->offer / 100) * $price;
                        $price = $price - $offerPrice;
                    }
                }
            }

            $price = $price * $cartProduct->qty;
            $total_price += $price;
        }


        // calculate coupon coast
        if($request_coupon){
            $coupon = Coupon::where(['code' => $request_coupon, 'status' => 1])->first();
            if($coupon){
                if($coupon->expired_date >= date('Y-m-d')){
                    if($coupon->apply_qty <  $coupon->max_quantity ){
                        if($coupon->offer_type == 1){
                            $couponAmount = $coupon->discount;
                            $couponAmount = ($couponAmount / 100) * $total_price;
                        }elseif($coupon->offer_type == 2){
                            $couponAmount = $coupon->discount;
                        }
                        $coupon_price = $couponAmount;

                        $qty = $coupon->apply_qty;
                        $qty = $qty +1;
                        $coupon->apply_qty = $qty;
                        $coupon->save();

                    }
                }
            }
        }
        $setting = Setting::first();

         if ($setting->map_status == 1) {

            $vendorIds = $cartProducts->pluck('product.vendor_id')->unique();
            $vendor_id = $vendorIds[0];

            if ($vendor_id == 0) {
                $vendor_lat_long = Admin::where('id', 1)->select('latitude', 'longitude')->first();
            } else {
                $find_user = Vendor::where('id', $vendor_id)->select('user_id')->first();
                $vendor_lat_long = User::where('id', $find_user->user_id)->select('id', 'latitude', 'longitude')->first();
            }

            $address = Address::where(['id' => $shipping_address_id])->first();
                $distance = $this->calculateDistance(
                    $vendor_lat_long['latitude'],
                    $vendor_lat_long['longitude'],
                    $address->latitude,
                    $address->longitude
                );

            $shipping_fee = $distance * $setting->per_km_price_range;
            $shipping = '';
        }else{
            $shipping = Shipping::find($request_shipping_method_id);
            if(!$shipping){
                return response()->json(['message' => trans('user_validation.Shipping method not found')],403);
            }

            if($shipping->shipping_fee == 0){
                $shipping_fee = 0;
            }else{
                $shipping_fee = $shipping->shipping_fee;
            }
        }


        $total_price = ($total_price - $coupon_price) + $shipping_fee;
        $total_price = str_replace( array( '\'', '"', ',' , ';', '<', '>' ), '', $total_price);
        $total_price = number_format($total_price, 2, '.', '');

        $arr = [];
        $arr['total_price'] = $total_price;
        $arr['coupon_price'] = $coupon_price;
        $arr['shipping_fee'] = $shipping_fee;
        $arr['productWeight'] = $productWeight;
        $arr['shipping'] = $shipping;

        return $arr;
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Radius of the Earth in kilometers

        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        $latDifference = $lat2 - $lat1;
        $lonDifference = $lon2 - $lon1;

        $a = sin($latDifference / 2) * sin($latDifference / 2) +
            cos($lat1) * cos($lat2) *
            sin($lonDifference / 2) * sin($lonDifference / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        $distance = $earthRadius * $c; // Distance in kilometers

        return $distance;
    }

    public function orderStore($user,$total_price, $totalProduct, $payment_method, $transaction_id, $paymetn_status, $shipping, $shipping_fee, $coupon_price, $cash_on_delivery,$billing_address_id,$shipping_address_id){
        $cartProducts = ShoppingCart::with('product','variants.variantItem')->where('user_id', $user->id)->select('id','product_id','qty')->get();
        if($cartProducts->count() == 0){
            $notification = trans('user_validation.Your shopping cart is empty');
            return response()->json(['message' => $notification],403);
        }
         $billing = Address::find($billing_address_id);
         $shipping = Address::find($shipping_address_id);
         $setting = Setting::first();

        $order = new Order();
        $orderId = substr(rand(0,time()),0,10);
        $order->order_id = $orderId;
        $order->user_id = $user->id;
        $order->total_amount = $total_price;
        $order->product_qty = $totalProduct;
        $order->payment_method = $payment_method;
        $order->transection_id = $transaction_id;
        $order->payment_status = $paymetn_status;
         if ($setting->map_status == 1) {
            $order->shipping_method = 0;
            $order->latitude = $shipping->latitude;
            $order->longitude = $shipping->longitude;
        }else{
            $order->shipping_method = $shipping->shipping_rule;
        }
        $order->shipping_cost = $shipping_fee;
        $order->coupon_coast = $coupon_price;
        $order->order_status = 0;
        $order->cash_on_delivery = $cash_on_delivery;
        $order->save();

        $order_details = '';
        $setting = Setting::first();
        foreach($cartProducts as $key => $cartProduct){

            $variantPrice = 0;
            if($cartProduct->variants){
                foreach($cartProduct->variants as $item_index => $var_item){
                  $item = ProductVariantItem::find($var_item->variant_item_id);
                  if($item){
                    $variantPrice += $item->price;
                  }
                }
            }

            // calculate product price
            $product = Product::select('id','price','offer_price','weight','vendor_id','qty','name')->find($cartProduct->product_id);
            $price = $product->offer_price ? $product->offer_price : $product->price;
            $price = $price + $variantPrice;
            $isFlashSale = FlashSaleProduct::where(['product_id' => $product->id,'status' => 1])->first();
            $today = date('Y-m-d H:i:s');
            if($isFlashSale){
                $flashSale = FlashSale::first();
                if($flashSale->status == 1){
                    if($today <= $flashSale->end_time){
                        $offerPrice = ($flashSale->offer / 100) * $price;
                        $price = $price - $offerPrice;
                    }
                }
            }

            // store ordre product
            $orderProduct = new OrderProduct();
            $orderProduct->order_id = $order->id;
            $orderProduct->product_id = $cartProduct->product_id;
            $orderProduct->seller_id = $product->vendor_id;
            $orderProduct->product_name = $product->name;
            $orderProduct->unit_price = $price;
            $orderProduct->qty = $cartProduct->qty;
            $orderProduct->save();

            // update product stock
            $qty = $product->qty - $cartProduct->qty;
            $product->qty = $qty;
            $product->save();

            // return $cartProduct->variants;
            foreach($cartProduct->variants as $index => $variant){
                $item = ProductVariantItem::find($variant->variant_item_id);
                $productVariant = new OrderProductVariant();
                $productVariant->order_product_id = $orderProduct->id;
                $productVariant->product_id = $cartProduct->product_id;
                $productVariant->variant_name = $item->product_variant_name;
                $productVariant->variant_value = $item->name;
                $productVariant->save();
            }

            $order_details.='Product: '.$product->name. '<br>';
            $order_details.='Quantity: '. $cartProduct->qty .'<br>';
            $order_details.='Price: '.$setting->currency->currency_icon . $cartProduct->qty * $price .'<br>';

        }

        // store shipping and billing address
        $billing = Address::find($billing_address_id);
        $shipping = Address::find($shipping_address_id);
        $orderAddress = new OrderAddress();
        $orderAddress->order_id = $order->id;
        $orderAddress->billing_name = $billing->name;
        $orderAddress->billing_email = $billing->email;
        $orderAddress->billing_phone = $billing->phone;
        $orderAddress->billing_address = $billing->address;
        $orderAddress->billing_country = $billing->country->name;
        $orderAddress->billing_state = $billing->countryState->name;
        $orderAddress->billing_city = $billing->city->name;
        $orderAddress->billing_address_type = $billing->type;
        $orderAddress->shipping_name = $shipping->name;
        $orderAddress->shipping_email = $shipping->email;
        $orderAddress->shipping_phone = $shipping->phone;
        $orderAddress->shipping_address = $shipping->address;
        $orderAddress->shipping_country = $shipping->country->name ;
        $orderAddress->shipping_state = $shipping->countryState->name;
        $orderAddress->shipping_city = $shipping->city->name;
        $orderAddress->shipping_address_type = $shipping->type;
        $orderAddress->save();

        foreach($cartProducts as $cartProduct){
            ShoppingCartVariant::where('shopping_cart_id', $cartProduct->id)->delete();
            $cartProduct->delete();
        }

        $arr = [];
        $arr['order'] = $order;
        $arr['order_details'] = $order_details;

        return $arr;
    }


    public function sendOrderSuccessMail($user, $total_price, $payment_method, $payment_status, $order, $order_details){
        $setting = Setting::first();

        MailHelper::setMailConfig();

        $template=EmailTemplate::where('id',6)->first();
        $subject=$template->subject;
        $message=$template->description;
        $message = str_replace('{{user_name}}',$user->name,$message);
        $message = str_replace('{{total_amount}}',$setting->currency_icon.$total_price,$message);
        $message = str_replace('{{payment_method}}',$payment_method,$message);
        $message = str_replace('{{payment_status}}',$payment_status,$message);
        $message = str_replace('{{order_status}}','Pending',$message);
        $message = str_replace('{{order_date}}',$order->created_at->format('d F, Y'),$message);
        $message = str_replace('{{order_detail}}',$order_details,$message);
        Mail::to($user->email)->send(new OrderSuccessfully($message,$subject));
    }

    public function sendOrderSuccessSms($user, $order){
        $template=SmsTemplate::where('id',3)->first();
        $message=$template->description;
        $message = str_replace('{{user_name}}',$user->name,$message);
        $message = str_replace('{{order_id}}',$order->order_id,$message);

        $twilio = TwilioSms::first();
        if($twilio->enable_order_confirmation_sms == 1){
            if($user->phone){
                try{
                    $account_sid = $twilio->account_sid;
                    $auth_token = $twilio->auth_token;
                    $twilio_number = $twilio->twilio_phone_number;
                    $recipients = $user->phone;
                    $client = new Client($account_sid, $auth_token);
                    $client->messages->create($recipients,
                            ['from' => $twilio_number, 'body' => $message] );
                }catch(Exception $ex){

                }
            }
        }

        $biztech = BiztechSms::first();
        if($biztech->enable_order_confirmation_sms == 1){
            if($user->phone){
                try{
                    $apikey = $biztech->api_key;
                    $clientid = $biztech->client_id;
                    $senderid = $biztech->sender_id;
                    $senderid = urlencode($senderid);
                    $message = $message;
                    $msg_type = true;  // true or false for unicode message
                    $message  = urlencode($message);
                    $mobilenumbers = $user->phone; //8801700000000 or 8801700000000,9100000000
                    $url = "https://api.smsq.global/api/v2/SendSMS?ApiKey=$apikey&ClientId=$clientid&SenderId=$senderid&Message=$message&MobileNumbers=$mobilenumbers&Is_Unicode=$msg_type";
                    $ch = curl_init();
                    curl_setopt ($ch, CURLOPT_URL, $url);
                    curl_setopt ($ch, CURLOPT_SSL_VERIFYHOST, 0);
                    curl_setopt ($ch, CURLOPT_SSL_VERIFYPEER, 0);
                    curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 5);
                    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_NOBODY, false);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                    $response = curl_exec($ch);
                    $response = json_decode($response);
                }catch(Exception $ex){}
            }
        }
    }

}

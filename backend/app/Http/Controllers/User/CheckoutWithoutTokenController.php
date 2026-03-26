<?php

namespace App\Http\Controllers\User;

use Log;
use Auth;
use Cart;
use Stripe;
use Session;
use Exception;
use App\Models\City;
use App\Models\User;
use App\Models\Admin;
use App\Models\Order;
use Razorpay\Api\Api;
use App\Models\Coupon;
use App\Models\Vendor;
use App\Models\Address;
use App\Models\Country;
use App\Models\Product;
use App\Models\Setting;
use App\Models\Shipping;
use App\Models\Wishlist;
use App\Models\FlashSale;
use App\Models\TwilioSms;
use App\Models\BiztechSms;
use App\Helpers\MailHelper;
use App\Models\BankPayment;
use App\Models\Flutterwave;
use App\Models\SmsTemplate;
use App\Models\BakshPayment;
use App\Models\CountryState;
use App\Models\OrderAddress;
use App\Models\OrderProduct;
use App\Models\ShoppingCart;
use Illuminate\Http\Request;
use App\Models\EmailTemplate;
use App\Models\MultiCurrency;
use App\Models\PaypalPayment;
use App\Models\StripePayment;
use App\Models\ProductVariant;
use App\Mail\OrderSuccessfully;
use App\Models\BreadcrumbImage;
use App\Models\RazorpayPayment;
use App\Models\FlashSaleProduct;
use App\Models\InstamojoPayment;
use App\Models\MyfatoorahPayment;
use App\Models\PaystackAndMollie;
use App\Models\SslcommerzPayment;
use App\Models\ProductVariantItem;
use Mollie\Laravel\Facades\Mollie;
use App\Models\OrderProductVariant;
use App\Models\ShoppingCartVariant;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;
use App\Library\SslCommerz\SslCommerzNotification;
use Razorpay\Api\Errors\SignatureVerificationError;

class CheckoutWithoutTokenController extends Controller
{
    public function checkout(Request $request)
    {

        $shippings = Shipping::all();

        $couponOffer = '';
        if ($request->coupon) {
            $coupon = Coupon::where(['code' => $request->coupon, 'status' => 1])->first();
            if ($coupon) {
                if ($coupon->expired_date >= date('Y-m-d')) {
                    if ($coupon->apply_qty <  $coupon->max_quantity) {
                        $couponOffer = $coupon;
                    }
                }
            }
        }



        $stripePaymentInfo = StripePayment::first();
        $razorpayPaymentInfo = RazorpayPayment::first();
        $flutterwavePaymentInfo = Flutterwave::first();
        $paypalPaymentInfo = PaypalPayment::first();
        $bankPaymentInfo = BankPayment::first();

        $paystackAndMollie = PaystackAndMollie::first();
        $instamojo = InstamojoPayment::first();
        $sslcommerz = SslcommerzPayment::first();
        $myfatoorah = MyfatoorahPayment::first();
        $bkash = BakshPayment::select('image', 'status')->first();


        return response()->json([
            // 'cartProducts' => $cartProducts,
            // 'addresses' => $addresses,
            'shippings' => $shippings,
            'couponOffer' => $couponOffer,
            'stripePaymentInfo' => $stripePaymentInfo,
            'razorpayPaymentInfo' => $razorpayPaymentInfo,
            'flutterwavePaymentInfo' => $flutterwavePaymentInfo,
            'paypalPaymentInfo' => $paypalPaymentInfo,
            'bankPaymentInfo' => $bankPaymentInfo,
            'paystackAndMollie' => $paystackAndMollie,
            'instamojo' => $instamojo,
            'sslcommerz' => $sslcommerz,
            'myfatoorah' => $myfatoorah,
            'bkash' => $bkash,
        ], 200);
    }


    public function cashOnDelivery(Request $request)
    {

        $currency = MultiCurrency::where('is_default', 'Yes')->first();

        //  $setting = Setting::first();
        //  if ($setting->map_status == 0) {
        //      $rules = [
        //          'shipping_method_id'=>'required',
        //      ];
        //      $customMessages = [
        //          'shipping_method_id.required' => trans('user_validation.Shipping method is required'),
        //      ];
        //  }

        //  $this->validate($request, $rules,$customMessages);

        $user = Auth::guard('api')->user();
        $cartProducts = collect($request->input('cart_products', []));

        $error_array = [];

        foreach ($cartProducts as $index => $cartProduct) {

            if (!empty($cartProduct['variants']) && is_array($cartProduct['variants'])) {
                foreach ($cartProduct['variants'] as $item_index => $var_item) {

                    $variant = ProductVariant::find($var_item['variant_id']);

                    if (!$variant) {
                        $error_array[$index][] = trans('Your requested variant not exist');
                    }

                    $variant_item = ProductVariantItem::find($var_item['variant_item_id']);
                    if (!$variant_item) {
                        $error_array[$index][] = trans('Your requested variant item not exist');
                    }
                }

                $product = Product::find($cartProduct['product_id']);

                if (!$product) {
                    $error_array[$index][] = trans('Your requested product not exist');
                }

                // return $variant_item;
                if ($variant && $variant_item && $product) {
                    if ($variant_item->product_variant_id != $variant->id && $variant_item->product_id != $product->id) {
                        $error_array[$index][] = trans('Deos not have any relation between requested product, variant & item');
                    }
                }
            }
        }

        if (count($error_array) > 0) {
            return response()->json(['message' => trans('Unprocessable  Data'), 'errors' => $error_array], 403);
        }

        $totalProduct = $cartProducts->count();
        $total = $this->calculateCartTotal($user, $cartProducts, $request->coupon, $request->shipping_method_id, $request->address);

        if ($total instanceof \Illuminate\Http\JsonResponse) {
            return $total; // Return the JSON response directly
        }

        $total_price = $total['total_price'];
        $coupon_price = $total['coupon_price'];
        $shipping_fee = $total['shipping_fee'];
        $productWeight = $total['productWeight'];
        $shipping = $total['shipping'];

        // $totalProduct = ShoppingCart::with('variants')->where('user_id', $user->id)->sum('qty');

        $transaction_id = 'cash_on_delivery';
        $is_draft = 'no';
        $order_result = $this->orderStore($total_price, $cartProducts, $totalProduct, 'Cash on Delivery', $transaction_id, 0, $shipping, $shipping_fee, $coupon_price, 1, $request->address, $is_draft);

        //  return $order_result;

        $this->sendOrderSuccessMail($user, $total_price, 'Cash on Delivery', 0, $order_result['order'], $order_result['order_details']);

        $this->sendOrderSuccessSms($user, $order_result['order']);

        $notification = trans('user_validation.Order submited successfully. please wait for admin approval');

        $order = $order_result['order'];
        $order_id = $order->order_id;

        return response()->json(['message' => $notification, 'order_id' => $order_id], 200);
    }


    public function store_draft_order(Request $request)
    {

        $user = Auth::guard('api')->user();

        $cartProducts = collect($request->input('cart_products', []));

        $error_array = [];

        foreach ($cartProducts as $index => $cartProduct) {

            if (!empty($cartProduct['variants']) && is_array($cartProduct['variants'])) {
                foreach ($cartProduct['variants'] as $item_index => $var_item) {

                    $variant = ProductVariant::find($var_item['variant_id']);

                    if (!$variant) {
                        $error_array[$index][] = trans('Your requested variant not exist');
                    }

                    $variant_item = ProductVariantItem::find($var_item['variant_item_id']);
                    if (!$variant_item) {
                        $error_array[$index][] = trans('Your requested variant item not exist');
                    }
                }

                $product = Product::find($cartProduct['product_id']);

                if (!$product) {
                    $error_array[$index][] = trans('Your requested product not exist');
                }

                // return $variant_item;
                if ($variant && $variant_item && $product) {
                    if ($variant_item->product_variant_id != $variant->id && $variant_item->product_id != $product->id) {
                        $error_array[$index][] = trans('Deos not have any relation between requested product, variant & item');
                    }
                }
            }
        }

        if (count($error_array) > 0) {
            return response()->json(['message' => trans('Unprocessable  Data'), 'errors' => $error_array], 403);
        }

        $totalProduct = $cartProducts->count();


        $total = $this->calculateCartTotal($user, $cartProducts, $request->coupon, $request->shipping_method_id, $request->address);

        if ($total instanceof \Illuminate\Http\JsonResponse) {
            return $total; // Return the JSON response directly
        }

        $total_price = $total['total_price'];
        $coupon_price = $total['coupon_price'];
        $shipping_fee = $total['shipping_fee'];
        $productWeight = $total['productWeight'];
        $shipping = $total['shipping'];

        // $totalProduct = ShoppingCart::with('variants')->where('user_id', $user->id)->sum('qty');

        $transaction_id = 'cash_on_delivery';
        $is_draft = 'yes';
        $order_result = $this->orderStore($total_price, $cartProducts, $totalProduct, 'draft', 'draft', 0, $shipping, $shipping_fee, $coupon_price, 1, $request->address, $is_draft);

        //  return $order_result;

        // $this->sendOrderSuccessMail($user, $total_price, 'Cash on Delivery', 0, $order_result['order'], $order_result['order_details']);

        // $this->sendOrderSuccessSms($user, $order_result['order']);

        $notification = trans('Order submited successfully. please make payment now');

        $order = $order_result['order'];
        $order_id = $order->order_id;

        return response()->json(['message' => $notification, 'order_id' => $order_id], 200);
    }

    public function payWithStripe(Request $request)
    {

        $rules = [
            'card_number' => 'required',
            'year' => 'required',
            'month' => 'required',
            'cvv' => 'required',
            'shipping_method_id' => 'required',
        ];
        $customMessages = [
            'shipping_address_id.required' => trans('user_validation.Shipping address is required'),
            'billing_address_id.required' => trans('user_validation.Billing address is required'),
            'card_number.required' => trans('user_validation.Card number is required'),
            'year.required' => trans('user_validation.Year is required'),
            'month.required' => trans('user_validation.Month is required'),
            'cvv.required' => trans('user_validation.Cvv is required'),
        ];

        $setting = Setting::first();

        $user = Auth::guard('api')->user();
        $cartProducts = collect($request->input('cart_products', []));

        $error_array = [];

        foreach ($cartProducts as $index => $cartProduct) {

            if (!empty($cartProduct['variants']) && is_array($cartProduct['variants'])) {
                foreach ($cartProduct['variants'] as $item_index => $var_item) {

                    $variant = ProductVariant::find($var_item['variant_id']);

                    if (!$variant) {
                        $error_array[$index][] = trans('Your requested variant not exist');
                    }

                    $variant_item = ProductVariantItem::find($var_item['variant_item_id']);
                    if (!$variant_item) {
                        $error_array[$index][] = trans('Your requested variant item not exist');
                    }
                }

                $product = Product::find($cartProduct['product_id']);

                if (!$product) {
                    $error_array[$index][] = trans('Your requested product not exist');
                }

                // return $variant_item;
                if ($variant && $variant_item && $product) {
                    if ($variant_item->product_variant_id != $variant->id && $variant_item->product_id != $product->id) {
                        $error_array[$index][] = trans('Deos not have any relation between requested product, variant & item');
                    }
                }
            }
        }

        if (count($error_array) > 0) {
            return response()->json(['message' => trans('Unprocessable  Data'), 'errors' => $error_array], 403);
        }


        $totalProduct = $cartProducts->count();
        $total = $this->calculateCartTotal($user, $cartProducts, $request->coupon, $request->shipping_method_id, $request->address);
        $total_price = $total['total_price'];
        $coupon_price = $total['coupon_price'];
        $shipping_fee = $total['shipping_fee'];
        $productWeight = $total['productWeight'];
        $shipping = $total['shipping'];


        $stripe = StripePayment::first();
        $payableAmount = round($total_price * $stripe->currency->currency_rate, 2);
        Stripe\Stripe::setApiKey($stripe->stripe_secret);

        try {
            $token = Stripe\Token::create([
                'card' => [
                    'number' => $request->card_number,
                    'exp_month' => $request->month,
                    'exp_year' => $request->year,
                    'cvc' => $request->cvc,
                ],
            ]);
        } catch (Exception $e) {
            return response()->json(['error' => 'Please provide valid card information'], 403);
        }

        if (!isset($token['id'])) {
            return response()->json(['error' => 'Payment faild'], 403);
        }

        $result = Stripe\Charge::create([
            'card' => $token['id'],
            'currency' => $stripe->currency->currency_code,
            'amount' => $payableAmount * 100,
            'description' => env('APP_NAME'),
        ]);

        if ($result['status'] != 'succeeded') {
            return response()->json(['error' => 'Payment faild'], 403);
        }

        $transaction_id = $result['balance_transaction'];
        $is_draft = 'no';

        $order_result = $this->orderStore($total_price, $cartProducts, $totalProduct, 'Stripe', $transaction_id, 1, $shipping, $shipping_fee, $coupon_price, 0, $request->address, $is_draft);
        $this->sendOrderSuccessMail($user, $total_price, 'Stripe', 1, $order_result['order'], $order_result['order_details']);
        $this->sendOrderSuccessSms($user, $order_result['order']);

        $notification = trans('user_validation.Payment Successfully');
        $order = $order_result['order'];
        $order_id = $order->order_id;

        return response()->json(['message' => $notification, 'order_id' => $order_id], 200);
    }



    public function razorpayOrder(Request $request)
    {
        $user = Auth::guard('api')->user();

        $cartProducts = collect($request->input('cart_products', []));

        $error_array = [];

        foreach ($cartProducts as $index => $cartProduct) {

            if (!empty($cartProduct['variants']) && is_array($cartProduct['variants'])) {
                foreach ($cartProduct['variants'] as $item_index => $var_item) {

                    $variant = ProductVariant::find($var_item['variant_id']);

                    if (!$variant) {
                        $error_array[$index][] = trans('Your requested variant not exist');
                    }

                    $variant_item = ProductVariantItem::find($var_item['variant_item_id']);
                    if (!$variant_item) {
                        $error_array[$index][] = trans('Your requested variant item not exist');
                    }
                }

                $product = Product::find($cartProduct['product_id']);

                if (!$product) {
                    $error_array[$index][] = trans('Your requested product not exist');
                }

                // return $variant_item;
                if ($variant && $variant_item && $product) {
                    if ($variant_item->product_variant_id != $variant->id && $variant_item->product_id != $product->id) {
                        $error_array[$index][] = trans('Deos not have any relation between requested product, variant & item');
                    }
                }
            }
        }

        if (count($error_array) > 0) {
            return response()->json(['message' => trans('Unprocessable  Data'), 'errors' => $error_array], 403);
        }


        $totalProduct = $cartProducts->count();
        $total = $this->calculateCartTotal($user, $cartProducts, $request->coupon, $request->shipping_method_id, $request->address);


        $total_price = $total['total_price'];
        $coupon_price = $total['coupon_price'];
        $shipping_fee = $total['shipping_fee'];
        $productWeight = $total['productWeight'];
        $shipping = $total['shipping'];

        // $totalProduct = ShoppingCart::with('variants')->where('user_id', $user->id)->sum('qty');

        $transaction_id = 'cash_on_delivery';
        $is_draft = 'yes';
        $order_result = $this->orderStore($total_price, $cartProducts, $totalProduct, 'draft', 'draft', 0, $shipping, $shipping_fee, $coupon_price, 1, $request->address, $is_draft);

        $razorpay = RazorpayPayment::first();
        $total_price = $total['total_price'];
        $payable_amount = $total_price * $razorpay->currency->currency_rate;
        $payable_amount = round($payable_amount, 2);
        $api = new Api($razorpay->key, $razorpay->secret_key);
        $order = $api->order->create(
            array('receipt' => '123', 'amount' => ($payable_amount * 100), 'currency' => $razorpay->currency->currency_code)
        );

        $data = [
            "key"               => $razorpay->key,
            "amount"            => $payable_amount * 100,
            "order_id"          => $order->id,
            "db_order_id"          => $order_result['order']->order_id ?? null,
        ];

        return response()->json($data, 200);
    }

    public function razorpayWebView(Request $request)
    {

        $rules = [
            'order_id' => 'required',
            'db_order_id' => 'required',
            'amount' => 'required',
        ];

        $this->validate($request, $rules);



        $orderId = $request->order_id;
        $razorpay = RazorpayPayment::first();
        $razorpay_key = $razorpay->key;
        $payable_amount = $request->amount;

        $frontend_success_url = $request->frontend_success_url;
        $frontend_faild_url = $request->frontend_success_url;
        $request_from = $request->request_from;
        $coupon = $request->coupon;
        $db_order_id = $request->db_order_id;


        return view('razorpay_webview', compact('orderId', 'razorpay', 'payable_amount', 'frontend_success_url', 'frontend_faild_url', 'request_from', 'coupon', 'db_order_id'));
    }


    public function razorpayVerify(Request $request)
    {
        $success = true;
        $error = "Payment Failed!";

        if (empty($request->razorpay_payment_id) === false) {
            $razorpay = RazorpayPayment::first();
            $api = new Api($razorpay->key, $razorpay->secret_key);
            try {
                $attributes = [
                    'razorpay_order_id' => $request->razorpay_order_id,
                    'razorpay_payment_id' => $request->razorpay_payment_id,
                    'razorpay_signature' => $request->razorpay_signature
                ];
                $api->utility->verifyPaymentSignature($attributes);
            } catch (SignatureVerificationError $e) {
                $success = false;
                $error = 'Razorpay Error : ' . $e->getMessage();
            }
        }


        $frontend_success_url = json_decode($request->frontend_success_url, true);
        $frontend_faild_url = json_decode($request->frontend_faild_url, true);


        if ($success === true) {


            $order_id = $request->db_order_id;

            $find_order = Order::where('order_id', $order_id)->first();



            if (!$find_order) {
                $faild_url = $request->frontend_faild_url;

                return redirect($frontend_faild_url);
            }

            if ($find_order->is_draft == 'no') {
                $faild_url = Session::get('faild_url');
                return redirect($frontend_faild_url);
            }

            $find_order->is_draft = 'no';
            $find_order->payment_status = 1;
            $find_order->transection_id = $request->razorpay_payment_id;
            $find_order->payment_method = 'Razorpay';
            $find_order->save();

            if ($request->request_from == 'react_web') {
                $success_url = $frontend_success_url;
                $success_url = $success_url . "/" . $find_order->order_id . '?payment_status=success';
                return redirect($success_url);
            } else {
                return redirect()->route('user.checkout.order-success-url-for-mobile-app');
            }
        } else {


            if ($request->request_from == 'react_web') {
                $faild_url = $frontend_faild_url;
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        }
    }


    public function flutterwaveWebView(Request $request)
    {

        $flutterwave = Flutterwave::first();
        $user = Auth::guard('api')->user();

        $order_id = $request->order_id;

        $find_order = Order::where('order_id', $order_id)->first();

        if (!$find_order) {
            $notification = trans('Order not found');

            return redirect($request->faild_url);
        }

        if ($find_order->is_draft == 'no') {
            return redirect($request->faild_url);
        }

        $total_price = $find_order->total_amount;

        $frontend_success_url = json_decode($request->frontend_success_url, true);
        $frontend_faild_url = json_decode($request->frontend_faild_url, true);

        $request_from = $request->request_from;
        $shipping_address_id = $request->shipping_address_id;
        $billing_address_id = $request->billing_address_id;
        $shipping_method_id = $request->shipping_method_id;
        $coupon = $request->coupon;
        $token = $request->token;

        return view('flutterwave_webview', compact('flutterwave', 'user', 'total_price', 'frontend_success_url', 'frontend_faild_url', 'request_from', 'shipping_address_id', 'billing_address_id', 'shipping_method_id', 'coupon', 'token', 'find_order'));
    }

    public function payWithFlutterwave(Request $request)
    {
        $flutterwave = Flutterwave::first();
        $curl = curl_init();
        $tnx_id = $request->tnx_id;
        $url = "https://api.flutterwave.com/v3/transactions/$tnx_id/verify";
        $token = $flutterwave->secret_key;
        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => array(
                "Content-Type: application/json",
                "Authorization: Bearer $token"
            ),
        ));

        $response = curl_exec($curl);

        curl_close($curl);
        $response = json_decode($response);

        if ($response->status == 'success') {

            $find_order = Order::where('order_id', $request->order_id)->first();

            if (!$find_order) {
                $notification = trans('user_validation.Payment Faild');
                return response()->json(['status' => 'faild', 'message' => $notification], 403);
            }

            if ($find_order->is_draft == 'no') {
                $notification = trans('user_validation.Payment Faild');
                return response()->json(['status' => 'faild', 'message' => $notification], 403);
            }

            $find_order->is_draft = 'no';
            $find_order->payment_status = 1;
            $find_order->transection_id = $request->tnx_id;
            $find_order->payment_method = 'Flutterwave';
            $find_order->save();

            $order_id = $find_order->order_id;
            $notification = trans('user_validation.Payment Successfully');
            return response()->json(['status' => 'success', 'message' => $notification, 'order_id' => $order_id], 200);
        } else {
            $notification = trans('user_validation.Payment Faild');
            return response()->json(['status' => 'faild', 'message' => $notification], 403);
        }
    }

    public function payWithMollie(Request $request)
    {
        $rules = [
            'request_from' => 'required',
            'order_id' => 'required',
        ];
        $this->validate($request, $rules);

        $user = Auth::guard('api')->user();


        $frontend_success_url = json_decode($request->frontend_success_url, true);
        $frontend_faild_url = json_decode($request->frontend_faild_url, true);


        $order_id = $request->order_id;

        $find_order = Order::where('order_id', $order_id)->first();


        if (!$find_order) {
            $notification = trans('Order not found');

            return redirect($frontend_faild_url);
        }

        if ($find_order->is_draft == 'no') {
            return redirect($frontend_faild_url);
        }

        $total_price = $find_order->total_amount;

        Session::put('frontend_success_url', $frontend_success_url);
        Session::put('frontend_faild_url', $frontend_faild_url);
        Session::put('request_from', $request->request_from);
        Session::put('shipping_address_id', $request->shipping_address_id);
        Session::put('billing_address_id', $request->billing_address_id);
        Session::put('shipping_method_id', $request->shipping_method_id);
        Session::put('coupon', $request->coupon);
        Session::put('user', $user);
        Session::put('order_id', $order_id);


        $amount_real_currency = $total_price;
        $mollie = PaystackAndMollie::first();
        $price = $amount_real_currency * $mollie->currency->currency_rate;
        $price = sprintf('%0.2f', $price);

        $mollie_api_key = $mollie->mollie_key;
        $currency = strtoupper($mollie->currency->currency_code);
        Mollie::api()->setApiKey($mollie_api_key);
        $payment = Mollie::api()->payments()->create([
            'amount' => [
                'currency' => $currency,
                'value' => '' . $price . '',
            ],
            'description' => env('APP_NAME'),
            'redirectUrl' => route('user.checkout.guest.mollie-payment-success'),
        ]);

        $payment = Mollie::api()->payments()->get($payment->id);
        session()->put('payment_id', $payment->id);
        return redirect($payment->getCheckoutUrl(), 303);
    }

    public function molliePaymentSuccess(Request $request)
    {
        $mollie = PaystackAndMollie::first();
        $mollie_api_key = $mollie->mollie_key;
        Mollie::api()->setApiKey($mollie_api_key);
        $payment = Mollie::api()->payments->get(session()->get('payment_id'));
        if ($payment->isPaid()) {

            $order_id = Session::get('order_id');

            $find_order = Order::where('order_id', $order_id)->first();

            if (!$find_order) {
                $faild_url = Session::get('faild_url');
                return redirect($faild_url);
            }

            if ($find_order->is_draft == 'no') {
                $faild_url = Session::get('faild_url');
                return redirect($faild_url);
            }

            $find_order->is_draft = 'no';
            $find_order->payment_status = 1;
            $find_order->transection_id = session()->get('payment_id');
            $find_order->payment_method = 'Mollie';
            $find_order->save();


            //  $this->sendOrderSuccessMail($user, $total_price, 'Mollie', 1, $order_result['order'], $order_result['order_details']);

            //  $this->sendOrderSuccessSms($user, $order_result['order']);

            $frontend_success_url = Session::get('frontend_success_url');
            $request_from = Session::get('request_from');

            if ($request_from == 'react_web') {
                $success_url = $frontend_success_url;
                $success_url = $success_url . $find_order->order_id . '?payment_status=success';
                return redirect($success_url);
            } else {
                return redirect()->route('user.checkout.order-success-url-for-mobile-app');
            }
        } else {
            $frontend_faild_url = Session::get('frontend_faild_url');
            $request_from = Session::get('request_from');

            if ($request_from == 'react_web') {
                return redirect($frontend_faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        }
    }


    public function paystackWebView(Request $request)
    {
        $paystack = PaystackAndMollie::first();
        $user = Auth::guard('api')->user();

        $order_id = $request->order_id;

        $find_order = Order::where('order_id', $order_id)->first();

        if (!$find_order) {
            $notification = trans('Order not found');

            return redirect($request->faild_url);
        }

        if ($find_order->is_draft == 'no') {
            return redirect($request->faild_url);
        }

        $total_price = $find_order->total_amount;

        $frontend_success_url = json_decode($request->frontend_success_url, true);
        $frontend_faild_url = json_decode($request->frontend_faild_url, true);
        $request_from = $request->request_from;
        $shipping_address_id = $request->shipping_address_id;
        $billing_address_id = $request->billing_address_id;
        $shipping_method_id = $request->shipping_method_id;
        $coupon = $request->coupon;
        $token = $request->token;

        return view('paystack_webview', compact('paystack', 'user', 'total_price', 'frontend_success_url', 'frontend_faild_url', 'request_from', 'shipping_address_id', 'billing_address_id', 'shipping_method_id', 'coupon', 'token', 'find_order'));
    }

    public function payWithPayStack(Request $request)
    {
        $paystack = PaystackAndMollie::first();

        $reference = $request->reference;
        $transaction = $request->tnx_id;
        $secret_key = $paystack->paystack_secret_key;
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => "https://api.paystack.co/transaction/verify/$reference",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_SSL_VERIFYPEER => 0,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => array(
                "Authorization: Bearer $secret_key",
                "Cache-Control: no-cache",
            ),
        ));
        $response = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);
        $final_data = json_decode($response);
        if ($final_data->status == true) {


            $find_order = Order::where('order_id', $request->order_id)->first();

            if (!$find_order) {
                $notification = trans('user_validation.Payment Faild');
                return response()->json(['status' => 'faild', 'message' => $notification], 403);
            }

            if ($find_order->is_draft == 'no') {
                $notification = trans('user_validation.Payment Faild');
                return response()->json(['status' => 'faild', 'message' => $notification], 403);
            }

            $find_order->is_draft = 'no';
            $find_order->payment_status = 1;
            $find_order->transection_id = $request->tnx_id;
            $find_order->payment_method = 'Flutterwave';
            $find_order->save();

            $order_id = $find_order->order_id;

            $notification = trans('user_validation.Payment Successfully');
            return response()->json(['status' => 'success', 'message' => $notification, 'order_id' => $order_id], 200);
        } else {
            $notification = trans('user_validation.Payment Faild');
            return response()->json(['status' => 'faild', 'message' => $notification], 403);
        }
    }



    public function payWithInstamojo(Request $request)
    {
        $rules = [
            'request_from' => 'required',
            'order_id' => 'required',
        ];
        $this->validate($request, $rules);

        $user = Auth::guard('api')->user();

        $frontend_success_url = json_decode($request->frontend_success_url, true);
        $frontend_faild_url = json_decode($request->frontend_faild_url, true);

        $order_id = $request->order_id;

        $find_order = Order::where('order_id', $order_id)->first();

        if (!$find_order) {
            $notification = trans('Order not found');

            return redirect($frontend_faild_url);
        }

        if ($find_order->is_draft == 'no') {
            return redirect($frontend_faild_url);
        }

        $total_price = $find_order->total_amount;


        Session::put('frontend_success_url', $frontend_success_url);
        Session::put('frontend_faild_url', $frontend_faild_url);
        Session::put('request_from', $request->request_from);
        Session::put('shipping_address_id', $request->shipping_address_id);
        Session::put('billing_address_id', $request->billing_address_id);
        Session::put('shipping_method_id', $request->shipping_method_id);
        Session::put('coupon', $request->coupon);
        Session::put('user', $user);
        Session::put('order_id', $order_id);

        $amount_real_currency = $total_price;
        $instamojoPayment = InstamojoPayment::first();
        $price = $amount_real_currency * $instamojoPayment->currency->currency_rate;
        $price = round($price, 2);

        $environment = $instamojoPayment->account_mode;
        $api_key = $instamojoPayment->api_key;
        $auth_token = $instamojoPayment->auth_token;

        if ($environment == 'Sandbox') {
            $url = 'https://test.instamojo.com/api/1.1/';
        } else {
            $url = 'https://www.instamojo.com/api/1.1/';
        }

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url . 'payment-requests/');
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        curl_setopt(
            $ch,
            CURLOPT_HTTPHEADER,
            array(
                "X-Api-Key:$api_key",
                "X-Auth-Token:$auth_token"
            )
        );
        $payload = array(
            'purpose' => env("APP_NAME"),
            'amount' => $price,
            'phone' => '918160651749',
            'buyer_name' => Auth::user()->name ?? 'John Doe',
            'redirect_url' => route('user.checkout.instamojo-response'),
            'send_email' => true,
            'webhook' => 'http://www.example.com/webhook/',
            'send_sms' => true,
            'email' => Auth::user()->email ?? 'test@gmail.com',
            'allow_repeated_payments' => false
        );
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($payload));
        $response = curl_exec($ch);
        curl_close($ch);
        $response = json_decode($response);
        return redirect($response->payment_request->longurl);
    }


    public function instamojoResponse(Request $request)
    {
        $input = $request->all();

        $instamojoPayment = InstamojoPayment::first();
        $environment = $instamojoPayment->account_mode;
        $api_key = $instamojoPayment->api_key;
        $auth_token = $instamojoPayment->auth_token;

        if ($environment == 'Sandbox') {
            $url = 'https://test.instamojo.com/api/1.1/';
        } else {
            $url = 'https://www.instamojo.com/api/1.1/';
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url . 'payments/' . $request->get('payment_id'));
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
        curl_setopt(
            $ch,
            CURLOPT_HTTPHEADER,
            array(
                "X-Api-Key:$api_key",
                "X-Auth-Token:$auth_token"
            )
        );
        $response = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            $frontend_faild_url = Session::get('frontend_faild_url');
            $request_from = Session::get('request_from');

            if ($request_from == 'react_web') {
                return redirect($frontend_faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        } else {
            $data = json_decode($response);
        }

        if ($data->success == true) {
            if ($data->payment->status == 'Credit') {


                $order_id = Session::get('order_id');

                $find_order = Order::where('order_id', $order_id)->first();

                if (!$find_order) {
                    $faild_url = Session::get('faild_url');
                    return redirect($faild_url);
                }

                if ($find_order->is_draft == 'no') {
                    $faild_url = Session::get('faild_url');
                    return redirect($faild_url);
                }

                $find_order->is_draft = 'no';
                $find_order->payment_status = 1;
                $find_order->transection_id = $request->get('payment_id');
                $find_order->payment_method = 'Instamojo';
                $find_order->save();

                $frontend_success_url = Session::get('frontend_success_url');
                $request_from = Session::get('request_from');

                if ($request_from == 'react_web') {
                    $success_url = $frontend_success_url;
                    $success_url = $success_url . $find_order->order_id . '?payment_status=success';
                    return redirect($success_url);
                } else {
                    return redirect()->route('user.checkout.order-success-url-for-mobile-app');
                }
            } else {
                $frontend_faild_url = Session::get('frontend_faild_url');
                $request_from = Session::get('request_from');

                if ($request_from == 'react_web') {
                    return redirect($frontend_faild_url);
                } else {
                    return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
                }
            }
        } else {
            $frontend_faild_url = Session::get('frontend_faild_url');
            $request_from = Session::get('request_from');

            if ($request_from == 'react_web') {
                return redirect($frontend_faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        }
    }

    public function payWithBank(Request $request)
    {
        $rules = [
            'tnx_info' => 'required',
        ];
        $customMessages = [
            'shipping_address_id.required' => trans('user_validation.Shipping address is required'),
            'billing_address_id.required' => trans('user_validation.Billing address is required'),
        ];

        $this->validate($request, $rules, $customMessages);

        $user = Auth::guard('api')->user();
        $cartProducts = collect($request->input('cart_products', []));


        $error_array = [];

        foreach ($cartProducts as $index => $cartProduct) {

            if (!empty($cartProduct['variants']) && is_array($cartProduct['variants'])) {
                foreach ($cartProduct['variants'] as $item_index => $var_item) {

                    $variant = ProductVariant::find($var_item['variant_id']);

                    if (!$variant) {
                        $error_array[$index][] = trans('Your requested variant not exist');
                    }

                    $variant_item = ProductVariantItem::find($var_item['variant_item_id']);
                    if (!$variant_item) {
                        $error_array[$index][] = trans('Your requested variant item not exist');
                    }
                }

                $product = Product::find($cartProduct['product_id']);

                if (!$product) {
                    $error_array[$index][] = trans('Your requested product not exist');
                }

                // return $variant_item;
                if ($variant && $variant_item && $product) {
                    if ($variant_item->product_variant_id != $variant->id && $variant_item->product_id != $product->id) {
                        $error_array[$index][] = trans('Deos not have any relation between requested product, variant & item');
                    }
                }
            }
        }

        if (count($error_array) > 0) {
            return response()->json(['message' => trans('Unprocessable  Data'), 'errors' => $error_array], 403);
        }


        $totalProduct = $cartProducts->count();
        $total = $this->calculateCartTotal($user, $cartProducts, $request->coupon, $request->shipping_method_id, $request->address);

        $total_price = $total['total_price'];
        $coupon_price = $total['coupon_price'];
        $shipping_fee = $total['shipping_fee'];
        $productWeight = $total['productWeight'];
        $shipping = $total['shipping'];

        //  $totalProduct = ShoppingCart::with('variants')->where('user_id', $user->id)->sum('qty');

        $setting = Setting::first();

        $amount_real_currency = $total_price;
        $amount_usd = round($total_price / $setting->currency->currency_rate, 2);
        $currency_rate = $setting->currency->currency_rate;
        $currency_icon = $setting->currency->currency_icon;
        $currency_name = $setting->currency->currency_name;


        $is_draft = 'no';
        $transaction_id = $request->tnx_info;
        $order_result = $this->orderStore($total_price, $cartProducts,  $totalProduct, 'Bank Payment', $transaction_id, 0, $shipping, $shipping_fee, $coupon_price, 1, $request->address, $is_draft);

        $this->sendOrderSuccessMail($user, $total_price, 'Bank Payment', 0, $order_result['order'], $order_result['order_details']);

        $this->sendOrderSuccessSms($user, $order_result['order']);

        $notification = trans('user_validation.Order submited successfully. please wait for admin approval');

        $order = $order_result['order'];
        $order_id = $order->order_id;

        return response()->json(['message' => $notification, 'order_id' => $order_id], 200);
    }

    public function sslcommerzWebView(Request $request)
    {

        $sslcommerzPaymentInfo = SslcommerzPayment::first();
        $user = Auth::guard('api')->user();

        $frontend_success_url = json_decode($request->frontend_success_url, true);
        $frontend_faild_url = json_decode($request->frontend_faild_url, true);

        $order_id = $request->order_id;

        $find_order = Order::where('order_id', $order_id)->first();

        if (!$find_order) {
            $notification = trans('Order not found');

            return redirect($frontend_faild_url);
        }

        if ($find_order->is_draft == 'no') {
            return redirect($frontend_faild_url);
        }

        $total_price = $find_order->total_amount;

        $total_price = round($total_price * $sslcommerzPaymentInfo->currency->currency_rate, 2);

        $request_from = $request->request_from;
        $shipping_address_id = $request->shipping_address_id;
        $billing_address_id = $request->billing_address_id;
        $shipping_method_id = $request->shipping_method_id;
        $coupon = $request->coupon;
        $token = $request->token;


        Session::put('frontend_success_url', $frontend_success_url);
        Session::put('frontend_faild_url', $frontend_faild_url);
        Session::put('request_from', $request->request_from);
        Session::put('shipping_address_id', $request->shipping_address_id);
        Session::put('billing_address_id', $request->billing_address_id);
        Session::put('shipping_method_id', $request->shipping_method_id);
        Session::put('coupon', $request->coupon);
        Session::put('user', $user);
        Session::put('order_id', $order_id);


        return view('sslcommerz_webview', compact('total_price', 'sslcommerzPaymentInfo', 'token'));
    }

    public function sslcommerz(Request $request)
    {

        $user = Auth::guard('api')->user();
        $coupon = Session::get('coupon');

        $order_id = Session::get('order_id');
        $frontend_faild_url = Session::get('frontend_faild_url');

        $find_order = Order::where('order_id', $order_id)->first();

        if (!$find_order) {
            $notification = trans('Order not found');

            return redirect($frontend_faild_url);
        }

        if ($find_order->is_draft == 'no') {
            return redirect($frontend_faild_url);
        }

        $total_price = $find_order->total_amount;

        $sslcommerzPaymentInfo = SslcommerzPayment::first();
        $payableAmount = round($total_price * $sslcommerzPaymentInfo->currency->currency_rate, 2);

        $post_data = array();
        $post_data['total_amount'] = $payableAmount; # You cant not pay less than 10
        $post_data['currency'] = $sslcommerzPaymentInfo->currency->currency_code;
        $post_data['tran_id'] = uniqid();

        # CUSTOMER INFORMATION
        $post_data['cus_name'] = $user->name ?? 'John Deo';
        $post_data['cus_email'] = $user->email ?? 'johndoe@gmail.com';
        $post_data['cus_add1'] = '';
        $post_data['cus_add2'] = "";
        $post_data['cus_city'] = "";
        $post_data['cus_state'] = "";
        $post_data['cus_postcode'] = "";
        $post_data['cus_country'] = "Country";
        $post_data['cus_phone'] =  $user->phone ?? '123456789';
        $post_data['cus_fax'] = "";

        # SHIPMENT INFORMATION
        $post_data['ship_name'] = "";
        $post_data['ship_add1'] = "";
        $post_data['ship_add2'] = "";
        $post_data['ship_city'] = "";
        $post_data['ship_state'] = "";
        $post_data['ship_postcode'] = "";
        $post_data['ship_phone'] = "";
        $post_data['ship_country'] = "";

        $post_data['shipping_method'] = "NO";
        $post_data['product_name'] = 'Test Product';
        $post_data['product_category'] = "Package";
        $post_data['product_profile'] = "Package";

        config(['sslcommerz.apiCredentials.store_id' => $sslcommerzPaymentInfo->store_id]);
        config(['sslcommerz.apiCredentials.store_password' => $sslcommerzPaymentInfo->store_password]);
        config(['sslcommerz.success_url' => '/user/checkout/guest/sslcommerz-success']);
        config(['sslcommerz.failed_url' => '/user/checkout/guest/sslcommerz-failed']);

        $sslc = new SslCommerzNotification(config('sslcommerz'));

        $payment_options = $sslc->makePayment($post_data, 'checkout', 'json');

        if (!is_array($payment_options)) {
            print_r($payment_options);
            $payment_options = array();
        }
    }


    public function sslcommerz_success(Request $request)
    {

        $tran_id = $request->input('tran_id');
        $amount = $request->input('amount');
        $currency = $request->input('currency');

        $sslcommerzPaymentInfo = SslcommerzPayment::first();

        config(['sslcommerz.apiCredentials.store_id' => $sslcommerzPaymentInfo->store_id]);
        config(['sslcommerz.apiCredentials.store_password' => $sslcommerzPaymentInfo->store_password]);
        config(['sslcommerz.success_url' => '/user/checkout/guest/sslcommerz-success']);
        config(['sslcommerz.failed_url' => '/user/checkout/guest/sslcommerz-failed']);

        $sslc = new SslCommerzNotification(config('sslcommerz'));

        $validation = $sslc->orderValidate($request->all(), $tran_id, $amount, $currency);

        if ($validation == TRUE) {


            $order_id = Session::get('order_id');

            $find_order = Order::where('order_id', $order_id)->first();

            if (!$find_order) {
                $faild_url = Session::get('faild_url');
                return redirect($faild_url);
            }

            if ($find_order->is_draft == 'no') {
                $faild_url = Session::get('faild_url');
                return redirect($faild_url);
            }

            $find_order->is_draft = 'no';
            $find_order->payment_status = 1;
            $find_order->transection_id = $request->get('payment_id');
            $find_order->payment_method = 'SslCommerz';
            $find_order->save();

            $frontend_success_url = Session::get('frontend_success_url');
            $request_from = Session::get('request_from');

            if ($request_from == 'react_web') {
                $success_url = $frontend_success_url;
                $success_url = $success_url . $find_order->order_id . '?payment_status=success';
                return redirect($success_url);
            } else {
                return redirect()->route('user.checkout.order-success-url-for-mobile-app');
            }
        } else {
            $frontend_faild_url = Session::get('frontend_faild_url');
            $request_from = Session::get('request_from');

            if ($request_from == 'react_web') {
                return redirect($frontend_faild_url);
            } else {
                return response()->json(['message' => trans('user_validation.Payment Faild')], 403);
            }
        }
    }


    public function sslcommerz_failed(Request $request)
    {
        $frontend_faild_url = Session::get('frontend_faild_url');
        $request_from = Session::get('request_from');

        if ($request_from == 'react_web') {
            return redirect($frontend_faild_url);
        } else {
            return response()->json(['message' => trans('user_validation.Payment Faild')], 403);
        }
    }


    public function calculateCartTotal($user, $cartProducts, $request_coupon, $request_shipping_method_id, $address)
    {

        $total_price = 0;
        $coupon_price = 0;
        $shipping_fee = 0;
        $productWeight = 0;

        // $cartProducts = ShoppingCart::with('product','variants.variantItem')->where('user_id', $user->id)->select('id','product_id','qty')->get();
        if ($cartProducts->count() == 0) {
            $notification = trans('user_validation.Your shopping cart is empty');
            return response()->json(['message' => $notification], 403);
        }
        foreach ($cartProducts as $index => $cartProduct) {
            $variantPrice = 0;

            if (isset($cartProduct['product'])) {
            }

            if (!empty($cartProduct['variants']) && is_array($cartProduct['variants'])) {
                foreach ($cartProduct['variants'] as $item_index => $var_item) {
                    $item = ProductVariantItem::find($var_item['variant_item_id']);
                    if ($item) {
                        $variantPrice += $item->price;
                    }
                }
            }

            $product = Product::select('id', 'price', 'offer_price', 'weight')->find($cartProduct['product_id']);
            //  $price = $product['offer_price ']? $product['offer_price'] : $product['price'];
            $price = $product->offer_price ? $product->offer_price : $product->price;
            $price = $price + $variantPrice;
            $weight = $product->weight;
            $weight = $weight * $cartProduct['qty'];
            $productWeight += $weight;
            //  $isFlashSale = FlashSaleProduct::where(['product_id' => $product['id'],'status' => 1])->first();
            $isFlashSale = FlashSaleProduct::where(['product_id' => $product->id, 'status' => 1])->first();
            $today = date('Y-m-d H:i:s');
            if ($isFlashSale) {
                $flashSale = FlashSale::first();
                if ($flashSale->status == 1) {
                    if ($today <= $flashSale->end_time) {
                        $offerPrice = ($flashSale->offer / 100) * $price;
                        $price = $price - $offerPrice;
                    }
                }
            }

            $price = $price * $cartProduct['qty'];
            $total_price += $price;
        }

        // calculate coupon coast
        if ($request_coupon) {
            $coupon = Coupon::where(['code' => $request_coupon, 'status' => 1])->first();
            if ($coupon) {
                if ($coupon->expired_date >= date('Y-m-d')) {
                    if ($coupon->apply_qty <  $coupon->max_quantity) {
                        if ($coupon->offer_type == 1) {
                            $couponAmount = $coupon->discount;
                            $couponAmount = ($couponAmount / 100) * $total_price;
                        } elseif ($coupon->offer_type == 2) {
                            $couponAmount = $coupon->discount;
                        }
                        $coupon_price = $couponAmount;

                        $qty = $coupon->apply_qty;
                        $qty = $qty + 1;
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

            //  $address = Address::where(['id' => $shipping_address_id])->first();
            // $distance = $this->calculateDistance(
            //     $vendor_lat_long['latitude'],
            //     $vendor_lat_long['longitude'],
            //     $shipping_address['latitude'],
            //     $shipping_address['longitude'],
            // );
            $distance = $this->calculateDistance(
                $vendor_lat_long['latitude'],
                $vendor_lat_long['longitude'],
                $address->latitude,
                $address->longitude
            );

            $shipping_fee = $distance * $setting->per_km_price_range;
            $shipping = '';
        } else {
            $shipping = Shipping::find($request_shipping_method_id);
            if (!$shipping) {
                return response()->json(['message' => trans('user_validation.Shipping method not found')], 403);
            }

            if ($shipping->shipping_fee == 0) {
                $shipping_fee = 0;
            } else {
                $shipping_fee = $shipping->shipping_fee;
            }
        }


        $total_price = ($total_price - $coupon_price) + $shipping_fee;
        $total_price = str_replace(array('\'', '"', ',', ';', '<', '>'), '', $total_price);
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

        $distance = $earthRadius * $c;

        return $distance;
    }


    private function generateUniqueUserId(): int
    {
        do {
            $userId = random_int(100000, 999999);

            $userExists = User::where('id', $userId)->exists();
        } while ($userExists);

        return $userId;
    }


    public function orderStore($total_price, $cartProducts, $totalProduct, $payment_method, $transaction_id, $paymetn_status, $shipping, $shipping_fee, $coupon_price, $cash_on_delivery, $address_info, $is_draft)
    {

        if ($cartProducts->count() == 0) {
            $notification = trans('user_validation.Your shopping cart is empty');
            return response()->json(['message' => $notification], 403);
        }
        //  $address_info = Address::where('country_id',$address['country_id'])->where('state_id',$address['state_id'])->where('city_id',$address['city_id'])->where('address',$address['address'])->where('phone',$address['phone'])->where('name',$address['name'])->first();
        $setting = Setting::first();


        $order = new Order();
        $orderId = substr(rand(0, time()), 0, 10);
        $order->order_id = $orderId;
        $order->user_id = $this->generateUniqueUserId();
        $order->total_amount = $total_price;
        $order->product_qty = $totalProduct;
        $order->payment_method = $payment_method;
        $order->transection_id = $transaction_id;
        $order->payment_status = $paymetn_status;
        if ($setting->map_status == 1) {
            $order->shipping_method = 0;
            $order->latitude = $shipping->latitude;
            $order->longitude = $shipping->longitude;
        } else {
            $order->shipping_method = $shipping->shipping_rule;
        }
        $order->shipping_cost = $shipping_fee;
        $order->coupon_coast = $coupon_price;
        $order->order_status = 0;
        $order->cash_on_delivery = $cash_on_delivery;
        $order->is_draft = $is_draft;
        $order->save();
        $order_details = '';
        $currency = MultiCurrency::where('is_default', 'Yes')->first();
        foreach ($cartProducts as $key => $cartProduct) {


            // if (!empty($cartProduct['variants']) && is_array($cartProduct['variants'])) {
            //     foreach ($cartProduct['variants'] as $item_index => $var_item) {
            //         $item = ProductVariantItem::find($var_item['variant_item_id']);
            //         if ($item) {
            //             $variantPrice += $item->price;
            //         }
            //     }
            // }

            // Log::info('variants ');
            // Log::info($cartProduct['variants']);

            $variantPrice = 0;
            if (!empty($cartProduct['variants']) && is_array($cartProduct['variants'])) {
                foreach ($cartProduct['variants'] as $item_index => $var_item) {
                    $item = ProductVariantItem::find($var_item['variant_item_id']);
                    if ($item) {
                        $variantPrice += $item->price;
                    }
                }
            }
            // calculate product price
            $product = Product::select('id', 'price', 'offer_price', 'weight', 'vendor_id', 'qty', 'name')->find($cartProduct['product_id']);
            $price = $product->offer_price ? $product->offer_price : $product->price;
            $price = $price + $variantPrice;
            $isFlashSale = FlashSaleProduct::where(['product_id' => $product->id, 'status' => 1])->first();
            $today = date('Y-m-d H:i:s');
            if ($isFlashSale) {
                $flashSale = FlashSale::first();
                if ($flashSale->status == 1) {
                    if ($today <= $flashSale->end_time) {
                        $offerPrice = ($flashSale->offer / 100) * $price;
                        $price = $price - $offerPrice;
                    }
                }
            }

            $orderProduct = new OrderProduct();
            $orderProduct->order_id = $order->id;
            $orderProduct->product_id = $cartProduct['product_id'];
            $orderProduct->seller_id = $product->vendor_id;
            $orderProduct->product_name = $product->name;
            $orderProduct->unit_price = $price;
            $orderProduct->qty = $cartProduct['qty'];
            $orderProduct->save();

            // update product stock
            $qty = $product->qty - $totalProduct;
            $product->qty = $qty;
            $product->save();

            // return $cartProduct->variants;
            if (!empty($cartProduct['variants']) && is_array($cartProduct['variants'])) {
                foreach ($cartProduct['variants'] as $index => $variant) {
                    $item = ProductVariantItem::find($variant['variant_item_id']);
                    $productVariant = new OrderProductVariant();
                    $productVariant->order_product_id = $orderProduct->id;
                    $productVariant->product_id = $cartProduct['product_id'];
                    $productVariant->variant_name = $item->product_variant_name;
                    $productVariant->variant_value = $item->name;
                    $productVariant->save();
                }
            }
            $order_details .= 'Product: ' . $product->name . '<br>';
            $order_details .= 'Quantity: ' . $totalProduct . '<br>';
            $order_details .= 'Price: ' . $currency->currency_icon . $totalProduct * $price . '<br>';
        }


        $address_country = Country::where('id', $address_info['country'] ?? 0)->first();
        $address_state = CountryState::where('id', $address_info['state'] ?? 0)->first();
        $address_city = City::where('id', $address_info['city'] ?? 0)->first();

        $orderAddress = new OrderAddress();
        $orderAddress->order_id = $order->id;
        $orderAddress->billing_name = $address_info['name'] ?? '';
        $orderAddress->billing_email = $address_info['email'] ?? '';
        $orderAddress->billing_phone = $address_info['phone'] ?? '';
        $orderAddress->billing_address = $address_info['address'] ?? '';
        $orderAddress->billing_country = $address_country?->name ?? '';
        $orderAddress->billing_state = $address_state?->name ?? '';
        $orderAddress->billing_city = $address_city?->name ?? '';
        $orderAddress->billing_address_type = $address_info['type'] ?? '';

        $orderAddress->shipping_name = $address_info['name'] ?? '';
        $orderAddress->shipping_email = $address_info['email'] ?? '';
        $orderAddress->shipping_phone = $address_info['phone'] ?? '';
        $orderAddress->shipping_address = $address_info['address'] ?? '';
        $orderAddress->shipping_country = $address_country?->name ?? '';
        $orderAddress->shipping_state = $address_info['countryState']['name'] ?? '';
        $orderAddress->shipping_city = $address_city?->name ?? '';
        $orderAddress->shipping_address_type = $address_info['type'] ?? '';
        $orderAddress->save();
        foreach ($cartProducts as $cartProduct) {
            ShoppingCartVariant::where('shopping_cart_id', $cartProduct['product_id'])->delete();
        }
        $arr = [];
        $arr['order'] = $order;
        $arr['order_details'] = $order_details;

        return $arr;
    }


    public function sendOrderSuccessMail($user, $total_price, $payment_method, $payment_status, $order, $order_details)
    {
        $currency = MultiCurrency::where('is_default', 'Yes')->first();
        MailHelper::setMailConfig();

        $template = EmailTemplate::where('id', 6)->first();
        $subject = $template->subject;
        $message = $template->description;
        //  $message = str_replace('{{user_name}}',$user->name,$message);
        $message = str_replace('{{total_amount}}', $currency->currency_icon . $total_price, $message);
        $message = str_replace('{{payment_method}}', $payment_method, $message);
        $message = str_replace('{{payment_status}}', $payment_status, $message);
        $message = str_replace('{{order_status}}', 'Pending', $message);
        $message = str_replace('{{order_date}}', $order->created_at->format('d F, Y'), $message);
        $message = str_replace('{{order_detail}}', $order_details, $message);
        //  Mail::to($user->email)->send(new OrderSuccessfully($message,$subject));
    }

    public function sendOrderSuccessSms($user, $order)
    {
        $template = SmsTemplate::where('id', 3)->first();
        $message = $template->description;
        //  $message = str_replace('{{user_name}}',$user->name,$message);
        $message = str_replace('{{order_id}}', $order->order_id, $message);

        $twilio = TwilioSms::first();
        //  if($twilio->enable_order_confirmation_sms == 1){
        //      if($user->phone){
        //          try{
        //              $account_sid = $twilio->account_sid;
        //              $auth_token = $twilio->auth_token;
        //              $twilio_number = $twilio->twilio_phone_number;
        //              $recipients = $user->phone;
        //              $client = new Client($account_sid, $auth_token);
        //              $client->messages->create($recipients,
        //                      ['from' => $twilio_number, 'body' => $message] );
        //          }catch(Exception $ex){

        //          }
        //      }
        //  }

        $biztech = BiztechSms::first();
        //  if($biztech->enable_order_confirmation_sms == 1){
        //      if($user->phone){
        //          try{
        //              $apikey = $biztech->api_key;
        //              $clientid = $biztech->client_id;
        //              $senderid = $biztech->sender_id;
        //              $senderid = urlencode($senderid);
        //              $message = $message;
        //              $msg_type = true;  // true or false for unicode message
        //              $message  = urlencode($message);
        //              $mobilenumbers = $user->phone; //8801700000000 or 8801700000000,9100000000
        //              $url = "https://api.smsq.global/api/v2/SendSMS?ApiKey=$apikey&ClientId=$clientid&SenderId=$senderid&Message=$message&MobileNumbers=$mobilenumbers&Is_Unicode=$msg_type";
        //              $ch = curl_init();
        //              curl_setopt ($ch, CURLOPT_URL, $url);
        //              curl_setopt ($ch, CURLOPT_SSL_VERIFYHOST, 0);
        //              curl_setopt ($ch, CURLOPT_SSL_VERIFYPEER, 0);
        //              curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, 5);
        //              curl_setopt ($ch, CURLOPT_RETURNTRANSFER, true);
        //              curl_setopt($ch, CURLOPT_NOBODY, false);
        //              curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        //              $response = curl_exec($ch);
        //              $response = json_decode($response);
        //          }catch(Exception $ex){}
        //      }
        //  }
    }


    public function myfatoorah_webview(Request $request)
    {
        // try {
        $rules = [
            'request_from' => 'required',
            'shipping_address_id' => 'required',
            'billing_address_id' => 'required',
            'shipping_method_id' => 'required',
        ];
        $this->validate($request, $rules);

        $user = Auth::guard('api')->user();

        Session::put('frontend_success_url', $request->frontend_success_url);
        Session::put('frontend_faild_url', $request->frontend_faild_url);
        Session::put('request_from', $request->request_from);
        Session::put('shipping_address_id', $request->shipping_address_id);
        Session::put('billing_address_id', $request->billing_address_id);
        Session::put('shipping_method_id', $request->shipping_method_id);
        Session::put('coupon', $request->coupon);
        Session::put('user', $user);

        $total = $this->calculateCartTotal($user, 'cartProdcuts', $request->coupon, $request->shipping_method_id, $request->address);

        $total_price = $total['total_price'];
        $coupon_price = $total['coupon_price'];
        $shipping_fee = $total['shipping_fee'];
        $productWeight = $total['productWeight'];
        $shipping = $total['shipping'];


        $amount_real_currency = $total_price;
        $myfatoorah = MyfatoorahPayment::first();
        $price = $amount_real_currency * $myfatoorah->currency->currency_rate;
        $price = sprintf('%0.2f', $price);


        $paymentMethodId = 0;

        $curlData = $this->getPayLoadData();
        $data     = $this->mfObj->getInvoiceURL($curlData, $paymentMethodId);

        return redirect()->to($data['invoiceURL']);
        // } catch (\Exception $e) {
        //    if($request->request_from == 'react_web'){
        //         return redirect()->to($request->frontend_faild_url);
        //     }else{
        //         return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
        //     }
        // }
    }


    private function getPayLoadData($orderId = null)
    {
        $callbackURL = route('user.checkout.myfatoorah-webview-callback');

        return [
            'CustomerName'       => 'FName LName',
            'InvoiceValue'       => '10',
            'DisplayCurrencyIso' => 'KWD',
            'CustomerEmail'      => 'test@test.com',
            'CallBackUrl'        => $callbackURL,
            'ErrorUrl'           => $callbackURL,
            'MobileCountryCode'  => '+965',
            'CustomerMobile'     => '12345678',
            'Language'           => 'en',
            'CustomerReference'  => $orderId,
            'SourceInfo'         => 'Laravel ' . app()::VERSION . ' - MyFatoorah Package ' . MYFATOORAH_LARAVEL_PACKAGE_VERSION
        ];
    }


    public function myfatoorah_webview_callback()
    {
        try {
            $paymentId = request('paymentId');
            $data      = $this->mfObj->getPaymentStatus($paymentId, 'PaymentId');

            if ($data->InvoiceStatus == 'Paid') {
                $user = Session::get('user');
                $coupon = Session::get('coupon');
                $shipping_address_id = Session::get('shipping_address_id');
                $billing_address_id = Session::get('billing_address_id');
                $shipping_method_id = Session::get('shipping_method_id');
                $payment_id = Session::get('payment_id');

                $total = $this->calculateCartTotal($user, 'cartProducts', $coupon, $shipping_method_id, $shipping_address_id);

                $total_price = $total['total_price'];
                $coupon_price = $total['coupon_price'];
                $shipping_fee = $total['shipping_fee'];
                $productWeight = $total['productWeight'];
                $shipping = $total['shipping'];

                $totalProduct = ShoppingCart::with('variants')->where('user_id', $user->id)->sum('qty');

                $setting = Setting::first();

                $amount_real_currency = $total_price;
                $amount_usd = round($total_price / $setting->currency->currency_rate, 2);
                $currency_rate = $setting->currency->currency_rate;
                $currency_icon = $setting->currency->currency_icon;
                $currency_name = $setting->currency->currency_name;

                $transaction_id = $paymentId;
                $order_result = $this->orderStore($user, $total_price, 'cartProducts',  $totalProduct, 'Myfatoorah', $transaction_id, 1, $shipping, $shipping_fee, $coupon_price, 0, $billing_address_id, $shipping_address_id);

                $this->sendOrderSuccessMail($user, $total_price, 'Myfatoorah', 1, $order_result['order'], $order_result['order_details']);

                $this->sendOrderSuccessSms($user, $order_result['order']);

                $frontend_success_url = Session::get('frontend_success_url');
                $request_from = Session::get('request_from');

                if ($request_from == 'react_web') {
                    $order = $order_result['order'];
                    $success_url = $frontend_success_url;
                    $success_url = $success_url . "/" . $order->order_id . '?payment_status=success';
                    return redirect($success_url);
                } else {
                    return redirect()->route('user.checkout.order-success-url-for-mobile-app');
                }
            } else if ($data->InvoiceStatus == 'Failed') {

                $frontend_faild_url = Session::get('frontend_faild_url');
                $request_from = Session::get('request_from');
                if ($request_from == 'react_web') {
                    return redirect($frontend_faild_url);
                } else {
                    return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
                }
            } else if ($data->InvoiceStatus == 'Expired') {
                $frontend_faild_url = Session::get('frontend_faild_url');
                $request_from = Session::get('request_from');
                if ($request_from == 'react_web') {
                    return redirect($frontend_faild_url);
                } else {
                    return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
                }
            }

            $frontend_faild_url = Session::get('frontend_faild_url');
            $request_from = Session::get('request_from');
            if ($request_from == 'react_web') {
                return redirect($frontend_faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        } catch (\Exception $e) {

            $frontend_faild_url = Session::get('frontend_faild_url');
            $request_from = Session::get('request_from');
            if ($request_from == 'react_web') {
                return redirect($frontend_faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        }

        $frontend_faild_url = Session::get('frontend_faild_url');
        $request_from = Session::get('request_from');
        if ($request_from == 'react_web') {
            return redirect($frontend_faild_url);
        } else {
            return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
        }
    }
}

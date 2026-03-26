<?php

namespace App\Http\Controllers\User;

use URL;
use Auth;
use Cart;
use Mail;
use Session;
use Exception;
use App\Models\City;
use App\Models\Order;
use App\Models\Coupon;
use App\Models\Vendor;
use App\Models\Address;
use App\Models\Country;
use App\Models\Product;
use App\Models\Setting;
use Twilio\Rest\Client;
use App\Models\Shipping;
use App\Models\FlashSale;
use App\Models\TwilioSms;
use App\Models\BiztechSms;
use App\Helpers\MailHelper;
use App\Models\Flutterwave;
use App\Models\SmsTemplate;
use Illuminate\Support\Str;
use App\Models\BakshPayment;
use App\Models\CountryState;
use App\Models\OrderAddress;
use App\Models\OrderProduct;

use App\Models\ShoppingCart;
use Illuminate\Http\Request;
use App\Models\EmailTemplate;


use App\Models\PaypalPayment;
use App\Models\StripePayment;
use App\Models\BillingAddress;
use App\Models\ShippingMethod;
use App\Mail\OrderSuccessfully;
use App\Models\BreadcrumbImage;
use App\Models\RazorpayPayment;

use App\Models\ShippingAddress;
use App\Models\FlashSaleProduct;
use App\Models\InstamojoPayment;

use App\Models\PaystackAndMollie;
use App\Models\ProductVariantItem;
use App\Models\OrderProductVariant;
use App\Models\ShoppingCartVariant;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;

class BkashPaymentControllerGuest extends Controller
{
    private $base_url;
    private $username;
    private $password;
    private $app_key;
    private $app_secret;

    public function __construct()
    {
        $paymentSettings = BakshPayment::first();

        if ($paymentSettings) {
            if ($paymentSettings->account_mode == 'sandbox') {
                $this->base_url = 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
            } else {
                $this->base_url = 'https://tokenized.pay.bka.sh/v1.2.0-beta';
            }
            $this->username = $paymentSettings->username;
            $this->password = $paymentSettings->password;
            $this->app_key = $paymentSettings->app_key;
            $this->app_secret = $paymentSettings->app_secret;
        } else {
            throw new \Exception("bKash payment settings not found.");
        }
    }

    public function authHeaders()
    {
        return array(
            'Content-Type:application/json',
            'Authorization:' . $this->grant(),
            'X-APP-Key:' . $this->app_key
        );
    }

    public function curlWithBody($url, $header, $method, $body_data)
    {
        $curl = curl_init($this->base_url . $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $body_data);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($curl, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        $response = curl_exec($curl);
        curl_close($curl);
        return $response;
    }

    public function grant()
    {
        $header = array(
            'Content-Type:application/json',
            'username:' . $this->username,
            'password:' . $this->password
        );

        $body_data = array('app_key' => $this->app_key, 'app_secret' => $this->app_secret);

        $response = $this->curlWithBody('/tokenized/checkout/token/grant', $header, 'POST', json_encode($body_data));

        $token = json_decode($response)->id_token;

        return $token;
    }

    public function payWithBkash(Request $request)
    {
        if ($request->request_from == 'react_web') {
            $rules = [
                'frontend_success_url' => 'required',
                'frontend_faild_url' => 'required',
                'order_id' => 'required',
            ];
        } else {
            $rules = [
                'order_id' => 'required',
            ];
        }


        $customMessages = [
            'shipping_address_id.required' => trans('user_validation.Shipping address is required'),
            'billing_address_id.required' => trans('user_validation.Billing address is required'),
            'shipping_method_id.required' => trans('user_validation.Shipping method is required'),
            'success_url.required' => trans('user_validation.Success url is required'),
            'faild_url.required' => trans('user_validation.Faild url is required'),
        ];
        $this->validate($request, $rules, $customMessages);


        $user = Auth::guard('api')->user();

        $frontend_success_url = json_decode($request->frontend_success_url, true);
        $frontend_faild_url = json_decode($request->frontend_faild_url, true);


        $order_id = $request->order_id;

        $find_order = Order::where('order_id', $order_id)->first();


        if (!$find_order) {

            if ($request->request_from == 'react_web') {
                return redirect($frontend_faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        }

        if ($find_order->is_draft == 'no') {

            if ($request->request_from == 'react_web') {
                return redirect($frontend_faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }


            return redirect($frontend_faild_url);
        }

        $total_price = $find_order->total_amount;


        $user = Auth::guard('api')->user();
        Session::put('shipping_address_id', $request->shipping_address_id);
        Session::put('billing_address_id', $request->billing_address_id);
        Session::put('shipping_method_id', $request->shipping_method_id);
        Session::put('frontend_success_url', $frontend_success_url);
        Session::put('frontend_faild_url', $frontend_faild_url);
        Session::put('request_from', $request->request_from);
        Session::put('coupon', $request->coupon);
        Session::put('order_id', $request->order_id);
        Session::put('user', $user);


        $amount_real_currency = $total_price;
        $bkashSetting = BakshPayment::first();
        $payableAmount = round($total_price * $bkashSetting->currency->currency_rate, 2);

        $name = env('APP_NAME');

        $header = $this->authHeaders();
        $website_url = URL::to("/");


        $body_data = array(
            'mode' => '0011',
            'payerReference' => $request->order_id, // pass oderId or anything
            'callbackURL' => $website_url . '/user/checkout/guest/bkash-payment-success',
            'amount' =>  $payableAmount,
            'currency' => $bkashSetting->currency->currency_code,
            'intent' => 'sale',
            'merchantInvoiceNumber' => $request->order_id ? $request->order_id : "Inv_" . Str::random(6)
        );

        $response = $this->curlWithBody('/tokenized/checkout/create', $header, 'POST', json_encode($body_data));

        return redirect((json_decode($response)->bkashURL));
    }

    public function executePayment($paymentID)
    {

        $header = $this->authHeaders();

        $body_data = array(
            'paymentID' => $paymentID
        );


        $response = $this->curlWithBody('/tokenized/checkout/execute', $header, 'POST', json_encode($body_data));

        $res_array = json_decode($response, true);

        return $response;
    }

    public function queryPayment($paymentID)
    {

        $header = $this->authHeaders();

        $body_data = array(
            'paymentID' => $paymentID,
        );

        $response = $this->curlWithBody('/tokenized/checkout/payment/status', $header, 'POST', json_encode($body_data));

        $res_array = json_decode($response, true);

        return $response;
    }

    public function BkashPaymentSuccess(Request $request)
    {
        $allRequest = $request->all();

        Log::info('allRequest');
        Log::info($allRequest);

        if (isset($allRequest['status']) && $allRequest['status'] == 'failure') {
            $faild_url = Session::get('frontend_faild_url');

            $request_from = Session::get('request_from');

            if ($request_from == 'react_web') {
                return redirect($faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        } else if (isset($allRequest['status']) && $allRequest['status'] == 'cancel') {
            $faild_url = Session::get('frontend_faild_url');

            $request_from = Session::get('request_from');

            if ($request_from == 'react_web') {
                return redirect($faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        } else {

            $response = $this->executePayment($allRequest['paymentID']);

            $res_array = json_decode($response, true);

            if (array_key_exists("message", $res_array)) {
                // if execute api failed to response
                sleep(1);
                $response = $this->queryPayment($allRequest['paymentID']);
                $res_array = json_decode($response, true);
            }

            Log::info('res_array');
            Log::info($res_array);
            if (array_key_exists("statusCode", $res_array) && $res_array['statusCode'] == '0000' && array_key_exists("transactionStatus", $res_array) && $res_array['transactionStatus'] == 'Completed') {


                $order_id = Session::get('order_id');

                $find_order = Order::where('order_id', $order_id)->first();

                if (!$find_order) {
                    $faild_url = Session::get('frontend_faild_url');

                    $request_from = Session::get('request_from');

                    if ($request_from == 'react_web') {
                        return redirect($faild_url);
                    } else {
                        return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
                    }
                }

                if ($find_order->is_draft == 'no') {
                    $faild_url = Session::get('frontend_faild_url');

                    $request_from = Session::get('request_from');

                    if ($request_from == 'react_web') {
                        return redirect($faild_url);
                    } else {
                        return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
                    }
                }

                $find_order->is_draft = 'no';
                $find_order->payment_status = 1;
                $find_order->transection_id = $res_array['trxID'];
                $find_order->payment_method = 'Bkash';
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
            }

            $faild_url = Session::get('frontend_faild_url');

            $request_from = Session::get('request_from');

            if ($request_from == 'react_web') {
                return redirect($faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        }


        $faild_url = Session::get('frontend_faild_url');

        $request_from = Session::get('request_from');

        if ($request_from == 'react_web') {
            return redirect($faild_url);
        } else {
            return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
        }


        Log::info('faild_url 2 : ' . $faild_url);

        $faild_url = Session::get('frontend_faild_url');
        return redirect($faild_url);
    }


    public function calculateCartTotal($user, $request_coupon, $request_shipping_method_id)
    {
        $total_price = 0;
        $coupon_price = 0;
        $shipping_fee = 0;
        $productWeight = 0;

        // calculate total price
        $cartProducts = ShoppingCart::with('product', 'variants.variantItem')->where('user_id', $user->id)->select('id', 'product_id', 'qty')->get();
        if ($cartProducts->count() == 0) {
            $notification = trans('user_validation.Your shopping cart is empty');
            return response()->json(['message' => $notification], 403);
        }
        foreach ($cartProducts as $index => $cartProduct) {
            $variantPrice = 0;
            if ($cartProduct->variants) {
                foreach ($cartProduct->variants as $item_index => $var_item) {
                    $item = ProductVariantItem::find($var_item->variant_item_id);
                    if ($item) {
                        $variantPrice += $item->price;
                    }
                }
            }

            $product = Product::select('id', 'price', 'offer_price', 'weight')->find($cartProduct->product_id);
            $price = $product->offer_price ? $product->offer_price : $product->price;
            $price = $price + $variantPrice;
            $weight = $product->weight;
            $weight = $weight * $cartProduct->qty;
            $productWeight += $weight;
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

            $price = $price * $cartProduct->qty;
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

        $shipping = Shipping::find($request_shipping_method_id);
        if (!$shipping) {
            return response()->json(['message' => trans('user_validation.Shipping method not found')], 403);
        }

        if ($shipping->shipping_fee == 0) {
            $shipping_fee = 0;
        } else {
            $shipping_fee = $shipping->shipping_fee;
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

    public function orderStore($user, $total_price, $totalProduct, $payment_method, $transaction_id, $paymetn_status, $shipping, $shipping_fee, $coupon_price, $cash_on_delivery, $billing_address_id, $shipping_address_id)
    {
        $cartProducts = ShoppingCart::with('product', 'variants.variantItem')->where('user_id', $user->id)->select('id', 'product_id', 'qty')->get();
        if ($cartProducts->count() == 0) {
            $notification = trans('user_validation.Your shopping cart is empty');
            return response()->json(['message' => $notification], 403);
        }

        $order = new Order();
        $orderId = substr(rand(0, time()), 0, 10);
        $order->order_id = $orderId;
        $order->user_id = $user->id;
        $order->total_amount = $total_price;
        $order->product_qty = $totalProduct;
        $order->payment_method = $payment_method;
        $order->transection_id = $transaction_id;
        $order->payment_status = $paymetn_status;
        $order->shipping_method = $shipping->shipping_rule;
        $order->shipping_cost = $shipping_fee;
        $order->coupon_coast = $coupon_price;
        $order->order_status = 0;
        $order->cash_on_delivery = $cash_on_delivery;
        $order->save();

        $order_details = '';
        $setting = Setting::first();
        foreach ($cartProducts as $key => $cartProduct) {

            $variantPrice = 0;
            if ($cartProduct->variants) {
                foreach ($cartProduct->variants as $item_index => $var_item) {
                    $item = ProductVariantItem::find($var_item->variant_item_id);
                    if ($item) {
                        $variantPrice += $item->price;
                    }
                }
            }

            // calculate product price
            $product = Product::select('id', 'price', 'offer_price', 'weight', 'vendor_id', 'qty', 'name')->find($cartProduct->product_id);
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
            foreach ($cartProduct->variants as $index => $variant) {
                $item = ProductVariantItem::find($variant->variant_item_id);
                $productVariant = new OrderProductVariant();
                $productVariant->order_product_id = $orderProduct->id;
                $productVariant->product_id = $cartProduct->product_id;
                $productVariant->variant_name = $item->product_variant_name;
                $productVariant->variant_value = $item->name;
                $productVariant->save();
            }

            $order_details .= 'Product: ' . $product->name . '<br>';
            $order_details .= 'Quantity: ' . $cartProduct->qty . '<br>';
            $order_details .= 'Price: ' . $setting->currency->currency_icon . $cartProduct->qty * $price . '<br>';
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
        $orderAddress->shipping_country = $shipping->country->name;
        $orderAddress->shipping_state = $shipping->countryState->name;
        $orderAddress->shipping_city = $shipping->city->name;
        $orderAddress->shipping_address_type = $shipping->type;
        $orderAddress->save();

        foreach ($cartProducts as $cartProduct) {
            ShoppingCartVariant::where('shopping_cart_id', $cartProduct->id)->delete();
            $cartProduct->delete();
        }

        $arr = [];
        $arr['order'] = $order;
        $arr['order_details'] = $order_details;

        return $arr;
    }


    public function sendOrderSuccessMail($user, $total_price, $payment_method, $payment_status, $order, $order_details)
    {
        $setting = Setting::first();

        MailHelper::setMailConfig();

        $template = EmailTemplate::where('id', 6)->first();
        $subject = $template->subject;
        $message = $template->description;
        $message = str_replace('{{user_name}}', $user->name, $message);
        $message = str_replace('{{total_amount}}', $setting->currency_icon . $total_price, $message);
        $message = str_replace('{{payment_method}}', $payment_method, $message);
        $message = str_replace('{{payment_status}}', $payment_status, $message);
        $message = str_replace('{{order_status}}', 'Pending', $message);
        $message = str_replace('{{order_date}}', $order->created_at->format('d F, Y'), $message);
        $message = str_replace('{{order_detail}}', $order_details, $message);
        Mail::to($user->email)->send(new OrderSuccessfully($message, $subject));
    }

    public function sendOrderSuccessSms($user, $order)
    {
        $template = SmsTemplate::where('id', 3)->first();
        $message = $template->description;
        $message = str_replace('{{user_name}}', $user->name, $message);
        $message = str_replace('{{order_id}}', $order->order_id, $message);

        $twilio = TwilioSms::first();
        if ($twilio->enable_order_confirmation_sms == 1) {
            if ($user->phone) {
                try {
                    $account_sid = $twilio->account_sid;
                    $auth_token = $twilio->auth_token;
                    $twilio_number = $twilio->twilio_phone_number;
                    $recipients = $user->phone;
                    $client = new Client($account_sid, $auth_token);
                    $client->messages->create(
                        $recipients,
                        ['from' => $twilio_number, 'body' => $message]
                    );
                } catch (Exception $ex) {
                }
            }
        }

        $biztech = BiztechSms::first();
        if ($biztech->enable_order_confirmation_sms == 1) {
            if ($user->phone) {
                try {
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
                    curl_setopt($ch, CURLOPT_URL, $url);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
                    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_NOBODY, false);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                    $response = curl_exec($ch);
                    $response = json_decode($response);
                } catch (Exception $ex) {
                }
            }
        }
    }
}

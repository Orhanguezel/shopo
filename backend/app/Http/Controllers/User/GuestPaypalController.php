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

class GuestPaypalController extends Controller
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


        if ($request->request_from == 'react_web') {
            $rules = [
                'success_url' => 'required',
                'faild_url' => 'required',
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
            'success_url.required' => trans('user_validation.Success url is required'),
            'success_url.url' => trans('user_validation.Invalid success url format'),
            'faild_url.required' => trans('user_validation.Faild url is required'),
            'faild_url.url' => trans('user_validation.Invalid faild url format'),
        ];

        $this->validate($request, $rules, $customMessages);

        $order_id = $request->order_id;

        Session::put('order_id', $order_id);
        Session::put('success_url', json_decode($request->success_url, true));
        Session::put('faild_url', json_decode($request->faild_url, true));
        Session::put('request_from', $request->request_from);

        $find_order = Order::where('order_id', $order_id)->first();


        if (!$find_order) {
            $notification = trans('Order not found');

            $faild_url = Session::get('faild_url');

            $request_from = Session::get('request_from');
            if ($request_from == 'react_web') {
                return redirect($faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }

            return redirect($request->faild_url);
        }

        if ($find_order->is_draft == 'no') {
            return redirect($request->faild_url);
        }

        $total_price = $find_order->total_amount;
        $amount_real_currency = $total_price;
        $paypalSetting = PaypalPayment::first();
        $payableAmount = round($total_price * $paypalSetting->currency->currency_rate, 2);

        $name = env('APP_NAME');

        $root_url = url('/');

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
                'return_url' => $root_url . "/user/checkout/guest/paypal-payment-success-from-react",
                'cancel_url' => $root_url . "/user/checkout/guest/paypal-payment-cancled-from-react",
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

                if (!$find_order) {
                    $faild_url = Session::get('faild_url');

                    $request_from = Session::get('request_from');
                    if ($request_from == 'react_web') {
                        return redirect($faild_url);
                    } else {
                        return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
                    }
                }

                if ($find_order->is_draft == 'no') {
                    $faild_url = Session::get('faild_url');

                    $request_from = Session::get('request_from');
                    if ($request_from == 'react_web') {
                        return redirect($faild_url);
                    } else {
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

                if ($request_from == 'react_web') {
                    $success_url = Session::get('success_url');
                    $success_url = $success_url . $order_id . '?payment_status=success';
                    return redirect($success_url);
                } else {
                    return redirect()->route('user.checkout.order-success-url-for-mobile-app');
                }
            }
        } catch (HttpException $ex) {
            $faild_url = Session::get('faild_url');

            $request_from = Session::get('request_from');
            if ($request_from == 'react_web') {
                return redirect($faild_url);
            } else {
                return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
            }
        }
    }

    public function paypalPaymentCancledFromReact()
    {
        $faild_url = Session::get('faild_url');

        $request_from = Session::get('request_from');
        if ($request_from == 'react_web') {
            return redirect($faild_url);
        } else {
            return redirect()->route('user.checkout.order-fail-url-for-mobile-app');
        }
    }
}

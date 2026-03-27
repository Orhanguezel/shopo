<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use App\Models\User;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Rules\Captcha;
use Illuminate\Support\Facades\Cache;
use Auth;
use App\Mail\UserRegistration;
use App\Helpers\MailHelper;
use App\Models\EmailTemplate;
use App\Models\Setting;
use Mail;
use Str;
use Exception;

class RegisterController extends Controller
{

    use RegistersUsers;


    protected $redirectTo = RouteServiceProvider::HOME;


    public function __construct()
    {
        $this->middleware('guest:api');
    }

    public function storeRegister(Request $request){
        $setting = Setting::first();
        $enable_phone_required = $setting->phone_number_required;

        $rules = [
            'name'=>'required',
            'agree'=>'required',
            'email'=>'required|unique:users',
            'phone'=> $enable_phone_required == 1 ? 'required|unique:users' : '',
            'password'=>'required|min:4|confirmed',
            'g-recaptcha-response'=>new Captcha()
        ];
        $customMessages = [
            'name.required' => trans('user_validation.Name is required'),
            'email.required' => trans('user_validation.Email is required'),
            'email.unique' => trans('user_validation.Email already exist'),
            'phone.required' => trans('user_validation.Phone number is required'),
            'phone.unique' => trans('user_validation.Phone number already exist'),
            'password.required' => trans('user_validation.Password is required'),
            'password.min' => trans('user_validation.Password must be 4 characters'),
            'password.confirmed' => trans('user_validation.Confirm password does not match'),
            'agree.required' => trans('user_validation.Consent filed is required'),
        ];

        // OTP verification required when phone is required
        if ($enable_phone_required == 1) {
            $rules['otp_verified_token'] = 'required|string';
        }

        $this->validate($request, $rules, $customMessages);

        // Verify OTP token if phone is required
        if ($enable_phone_required == 1 && $request->phone && $request->otp_verified_token) {
            $cached = Cache::get('otp_verified_token:' . $request->otp_verified_token);

            if (!$cached || $cached['phone'] !== $request->phone || $cached['purpose'] !== 'register') {
                return response()->json([
                    'message' => trans('user_validation.Phone number not verified'),
                ], 422);
            }

            // Consume the token so it can't be reused
            Cache::forget('otp_verified_token:' . $request->otp_verified_token);
        }

        $user = new User();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone ? $request->phone : '';
        $user->agree_policy = $request->agree ? 1 : 0;
        $user->password = Hash::make($request->password);
        $user->verify_token = random_int(100000, 999999);
        // If phone verified via OTP, auto-verify the user
        if ($enable_phone_required == 1 && $request->otp_verified_token) {
            $user->status = 1;
            $user->email_verified = 1;
        }
        $user->save();

        MailHelper::setMailConfig();

        $template = EmailTemplate::where('id', 4)->first();
        $subject = $template->subject;
        $message = $template->description;
        $message = str_replace('{{user_name}}', $request->name, $message);
        Mail::to($user->email)->send(new UserRegistration($message, $subject, $user));

        $notification = trans('user_validation.Register Successfully. Please Verify your email');
        return response()->json(['notification' => $notification]);
    }

    public function resendRegisterCode(Request $request){
        $rules = [
            'email'=>'required',
        ];
        $customMessages = [
            'email.required' => trans('user_validation.Email is required'),
        ];
        $this->validate($request, $rules, $customMessages);

        $user = User::where('email', $request->email)->first();
        if ($user) {
            if ($user->email_verified == 0) {
                MailHelper::setMailConfig();

                $template = EmailTemplate::where('id', 4)->first();
                $subject = $template->subject;
                $message = $template->description;
                $message = str_replace('{{user_name}}', $user->name, $message);
                Mail::to($user->email)->send(new UserRegistration($message, $subject, $user));

                $notification = trans('user_validation.Register Successfully. Please Verify your email');
                return response()->json(['notification' => $notification]);
            } else {
                $notification = trans('user_validation.Already verfied your account');
                return response()->json(['notification' => $notification], 402);
            }
        } else {
            $notification = trans('user_validation.Email does not exist');
            return response()->json(['notification' => $notification], 402);
        }
    }


    public function userVerification($token){
        $user = User::where('verify_token',$token)->first();
        if($user){
            $user->verify_token = null;
            $user->status = 1;
            $user->email_verified = 1;
            $user->save();
            $notification = trans('user_validation.Verification Successfully');
            return response()->json(['notification' => $notification],200);
        }else{
            $notification = trans('user_validation.Invalid token');
            return response()->json(['notification' => $notification],400);
        }
    }


    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
    }


    protected function create(array $data)
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
    }
}

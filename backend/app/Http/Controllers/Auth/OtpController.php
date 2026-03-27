<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\OtpVerification;
use App\Services\SmsServiceInterface;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class OtpController extends Controller
{
    public function __construct(protected SmsServiceInterface $smsService)
    {
        $this->middleware('guest:api');
    }

    public function send(Request $request)
    {
        $data = $this->validateRequest($request);
        $phone = $data['phone'];
        $purpose = $data['purpose'];

        $latestOtp = OtpVerification::where('phone', $phone)
            ->where('purpose', $purpose)
            ->latest('id')
            ->first();

        $cooldownSeconds = (int) config('sms.otp.cooldown_seconds', 60);
        if ($latestOtp && $latestOtp->created_at->diffInSeconds(now()) < $cooldownSeconds) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait before requesting a new code.',
                'retry_after' => $cooldownSeconds - $latestOtp->created_at->diffInSeconds(now()),
            ], 429);
        }

        OtpVerification::where('phone', $phone)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->delete();

        $otp = OtpVerification::create([
            'phone' => $phone,
            'otp_code' => $this->generateOtpCode(),
            'purpose' => $purpose,
            'attempts' => 0,
            'max_attempts' => (int) config('sms.otp.max_attempts', 3),
            'expires_at' => Carbon::now()->addMinutes((int) config('sms.otp.expire_minutes', 5)),
            'ip_address' => $request->ip(),
        ]);

        $message = sprintf(
            'Your Shopo verification code is %s. It expires in %d minutes.',
            $otp->otp_code,
            (int) config('sms.otp.expire_minutes', 5)
        );

        if (!$this->smsService->send($phone, $message)) {
            return response()->json([
                'success' => false,
                'message' => 'OTP could not be sent at this time.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully.',
            'expires_in' => (int) config('sms.otp.expire_minutes', 5) * 60,
        ]);
    }

    public function verify(Request $request)
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'otp_code' => ['required', 'digits:' . (int) config('sms.otp.length', 6)],
            'purpose' => ['nullable', 'in:register,password_reset,phone_verify'],
        ]);

        $phone = $validated['phone'];
        $purpose = $validated['purpose'] ?? 'register';

        $otp = OtpVerification::where('phone', $phone)
            ->where('purpose', $purpose)
            ->whereNull('verified_at')
            ->latest('id')
            ->first();

        if (!$otp) {
            return response()->json([
                'success' => false,
                'verified' => false,
                'message' => 'No active OTP was found.',
            ], 404);
        }

        if ($otp->isExpired()) {
            return response()->json([
                'success' => false,
                'verified' => false,
                'message' => 'OTP has expired. Please request a new code.',
            ], 422);
        }

        if (!$otp->hasAttemptsRemaining()) {
            return response()->json([
                'success' => false,
                'verified' => false,
                'message' => 'Maximum verification attempts reached. Please request a new code.',
            ], 429);
        }

        if ($otp->otp_code !== $validated['otp_code']) {
            $otp->increment('attempts');
            $otp->refresh();

            return response()->json([
                'success' => false,
                'verified' => false,
                'message' => 'The verification code is invalid.',
                'attempts_left' => max(0, $otp->max_attempts - $otp->attempts),
            ], 422);
        }

        $otp->markVerified();

        $verifiedToken = bin2hex(random_bytes(24));
        Cache::put(
            'otp_verified_token:' . $verifiedToken,
            [
                'phone' => $phone,
                'purpose' => $purpose,
            ],
            Carbon::now()->addMinutes((int) config('sms.otp.expire_minutes', 5))
        );

        return response()->json([
            'success' => true,
            'verified' => true,
            'token' => $verifiedToken,
        ]);
    }

    public function resend(Request $request)
    {
        return $this->send($request);
    }

    protected function validateRequest(Request $request): array
    {
        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'purpose' => ['nullable', 'in:register,password_reset,phone_verify'],
        ]);

        $validated['purpose'] = $validated['purpose'] ?? 'register';

        return $validated;
    }

    protected function generateOtpCode(): string
    {
        $length = (int) config('sms.otp.length', 6);
        $min = (int) str_pad('1', $length, '0');
        $max = (int) str_repeat('9', $length);

        return (string) random_int($min, $max);
    }
}

<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NetgsmService implements SmsServiceInterface
{
    public function send(string $phone, string $message): bool
    {
        $usercode = config('sms.providers.netgsm.usercode') ?? '';
        $password = config('sms.providers.netgsm.password') ?? '';
        $msgheader = config('sms.providers.netgsm.msgheader') ?? '';
        $endpoint = config('sms.providers.netgsm.endpoint') ?? 'https://api.netgsm.com.tr/sms/send/get';

        if (!$usercode || !$password || !$msgheader) {
            Log::warning('Netgsm credentials are missing; using local fallback.', [
                'phone' => $phone,
                'environment' => app()->environment(),
            ]);

            return app()->environment('local', 'testing');
        }

        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (str_starts_with($phone, '0')) {
            $phone = '90' . substr($phone, 1);
        } elseif (!str_starts_with($phone, '90')) {
            $phone = '90' . $phone;
        }

        try {
            $response = Http::get($endpoint, [
                'usercode' => $usercode,
                'password' => $password,
                'gsmno' => $phone,
                'message' => $message,
                'msgheader' => $msgheader,
            ]);

            $body = trim($response->body());

            // Netgsm success codes: 00, 01, 02 mean message accepted
            if (in_array($body, ['00', '01', '02']) || str_starts_with($body, '00')) {
                return true;
            }

            Log::warning('Netgsm API Error', [
                'phone' => $phone,
                'response' => $body,
                'status' => $response->status(),
            ]);
        } catch (\Exception $e) {
            Log::error('Netgsm Exception', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);
        }

        return false;
    }
}

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

        // Strip everything except digits and leading +
        $hasPlus = str_starts_with(trim($phone), '+');
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if ($hasPlus) {
            // +491723846068 → 491723846068 (already international)
        } elseif (str_starts_with($phone, '00')) {
            // 00491723846068 → 491723846068
            $phone = substr($phone, 2);
        } elseif (str_starts_with($phone, '0')) {
            // 05435011995 → 905435011995 (Turkish local)
            $phone = '90' . substr($phone, 1);
        } elseif (!str_starts_with($phone, '90') && strlen($phone) === 10) {
            // 5435011995 → 905435011995 (Turkish without leading 0)
            $phone = '90' . $phone;
        }
        // else: already has country code (491723846068, 905435011995)

        try {
            Log::info('Netgsm SMS sending', [
                'phone' => $phone,
                'msgheader' => $msgheader,
                'endpoint' => $endpoint,
            ]);

            $response = Http::get($endpoint, [
                'usercode' => $usercode,
                'password' => $password,
                'gsmno' => $phone,
                'message' => $message,
                'msgheader' => $msgheader,
            ]);

            $body = trim($response->body());

            Log::info('Netgsm API response', [
                'phone' => $phone,
                'response_body' => $body,
                'http_status' => $response->status(),
            ]);

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

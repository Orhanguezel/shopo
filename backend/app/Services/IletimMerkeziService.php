<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IletimMerkeziService implements SmsServiceInterface
{
    public function send(string $phone, string $message): bool
    {
        $apiKey = config('sms.providers.iletimerkezi.api_key') ?? '';
        $apiHash = config('sms.providers.iletimerkezi.api_hash') ?? '';
        $sender = config('sms.providers.iletimerkezi.sender') ?? 'SEYFIBABA';
        $endpoint = config('sms.providers.iletimerkezi.endpoint') ?? 'https://api.iletimerkezi.com/v1/send-sms/json';

        if (!$apiKey || !$apiHash || !$sender) {
            Log::warning('SMS provider credentials are missing; using local fallback.', [
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

        $payload = [
            'request' => [
                'authentication' => [
                    'key' => $apiKey,
                    'hash' => $apiHash
                ],
                'order' => [
                    'sender' => $sender,
                    'sendDateTime' => '',
                    'message' => [
                        'text' => $message,
                        'receipents' => [
                            'number' => $phone
                        ]
                    ]
                ]
            ]
        ];

        try {
            $response = Http::acceptJson()->asJson()->post($endpoint, $payload);

            if ($response->successful()) {
                $status = $response->json('response.status.code');
                if ($status == '200') {
                    return true;
                }

                Log::warning('Iletimerkezi API Error', [
                    'phone' => $phone,
                    'status' => $status,
                    'message' => $response->json('response.status.message')
                ]);
            } else {
                Log::error('Iletimerkezi Connection Error', [
                    'phone' => $phone,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Iletimerkezi Exception', [
                'phone' => $phone,
                'error' => $e->getMessage()
            ]);
        }

        return false;
    }
}

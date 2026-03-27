<?php

return [
    'default' => env('SMS_PROVIDER', 'iletimerkezi'),

    'providers' => [
        'iletimerkezi' => [
            'api_key' => env('ILETIMERKEZI_API_KEY'),
            'api_hash' => env('ILETIMERKEZI_API_HASH'),
            'sender' => env('ILETIMERKEZI_SENDER', 'SEYFIBABA'),
            'endpoint' => 'https://api.iletimerkezi.com/v1/send-sms/json',
        ],
    ],

    'otp' => [
        'length' => env('OTP_LENGTH', 6),
        'expire_minutes' => env('OTP_EXPIRE_MINUTES', 5),
        'max_attempts' => env('OTP_MAX_ATTEMPTS', 3),
        'cooldown_seconds' => env('OTP_COOLDOWN_SECONDS', 60),
    ],
];

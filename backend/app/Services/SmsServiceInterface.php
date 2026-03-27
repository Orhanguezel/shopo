<?php

namespace App\Services;

interface SmsServiceInterface
{
    public function send(string $phone, string $message): bool;
}

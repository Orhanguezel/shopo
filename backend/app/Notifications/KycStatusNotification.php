<?php

namespace App\Notifications;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class KycStatusNotification extends Notification
{
    use Queueable;

    private Vendor $vendor;
    private string $status;

    public function __construct(Vendor $vendor, string $status)
    {
        $this->vendor = $vendor;
        $this->status = $status;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $messages = [
            'approved' => 'KYC dogrulamaniz onaylandi. "' . $this->vendor->shop_name . '" magazaniz artik tam yetkili.',
            'rejected' => 'KYC dogrulamaniz reddedildi. Lutfen belgelerinizi kontrol edip tekrar yukleyin.',
        ];

        return [
            'type' => 'kyc_status',
            'seller_id' => $this->vendor->id,
            'shop_name' => $this->vendor->shop_name,
            'kyc_status' => $this->status,
            'message' => $messages[$this->status] ?? 'KYC durumunuz guncellendi: ' . $this->status,
        ];
    }
}

<?php

namespace App\Notifications;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class KycStatusNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Vendor $vendor,
        private readonly string $status
    ) {
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'kyc_status',
            'seller_id' => $this->vendor->id,
            'shop_name' => $this->vendor->shop_name,
            'status' => $this->status,
            'message' => $this->status === 'approved'
                ? 'Your seller KYC has been approved.'
                : 'Your seller KYC has been rejected. Please review and upload updated documents.',
        ];
    }
}

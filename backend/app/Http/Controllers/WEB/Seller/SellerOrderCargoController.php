<?php

namespace App\Http\Controllers\WEB\Seller;

use App\Http\Controllers\Concerns\HandlesOrderCargo;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\GdeliveryService;
use Illuminate\Support\Facades\Auth;

class SellerOrderCargoController extends Controller
{
    use HandlesOrderCargo;

    public function __construct(private GdeliveryService $gdeliveryService)
    {
        $this->middleware('auth:web');
    }

    protected function getGdeliveryService(): GdeliveryService
    {
        return $this->gdeliveryService;
    }

    protected function resolveOrderForCargo(int $orderId): Order
    {
        $seller = Auth::guard('web')->user()->seller;

        $order = Order::query()
            ->where('id', $orderId)
            ->whereHas('orderProducts', function ($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->first();

        if (! $order) {
            abort(403, 'Bu siparişe erişim yetkiniz yok.');
        }

        return $order;
    }

    protected function cargoCreatedBy(): array
    {
        $seller = Auth::guard('web')->user()->seller;

        return [
            'type' => 'seller',
            'id' => (int) $seller->id,
        ];
    }
}

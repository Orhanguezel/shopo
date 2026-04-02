<?php

namespace App\Http\Controllers\WEB\Seller;

use App\Http\Controllers\Controller;
use App\Models\CargoShipment;
use App\Models\Order;
use App\Services\GdeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SellerOrderCargoController extends Controller
{
    public function __construct(private GdeliveryService $gdelivery)
    {
        $this->middleware('auth:web');
    }

    private function authorizeOrder(int $orderId): Order
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

    public function offers(int $orderId): JsonResponse
    {
        $order = $this->authorizeOrder($orderId);

        try {
            return response()->json([
                'success' => true,
                'data' => $this->gdelivery->getShipmentOffers($order),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function createShipment(Request $request, int $orderId): JsonResponse
    {
        $order = $this->authorizeOrder($orderId);

        $seller = Auth::guard('web')->user()->seller;
        $validated = $request->validate([
            'offer_id' => 'nullable|string',
        ]);

        try {
            $cargo = $this->gdelivery->createShipment(
                order: $order,
                offerId: $validated['offer_id'] ?? null,
                createdByType: 'seller',
                createdById: (int) $seller->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Kargo başarıyla oluşturuldu.',
                'data' => $this->formatCargo($cargo),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function show(int $orderId): JsonResponse
    {
        $this->authorizeOrder($orderId);

        $cargo = CargoShipment::query()
            ->where('order_id', $orderId)
            ->whereNotIn('status', ['cancelled'])
            ->latest()
            ->first();

        if (! $cargo) {
            return response()->json([
                'success' => false,
                'message' => 'Kargo kaydı bulunamadı.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatCargo($cargo),
        ]);
    }

    public function cancel(int $orderId): JsonResponse
    {
        $this->authorizeOrder($orderId);

        $cargo = CargoShipment::query()
            ->where('order_id', $orderId)
            ->whereNotIn('status', ['cancelled'])
            ->latest()
            ->firstOrFail();

        try {
            $this->gdelivery->cancelShipment($cargo);

            return response()->json([
                'success' => true,
                'message' => 'Kargo iptal edildi.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    private function formatCargo(CargoShipment $cargo): array
    {
        return [
            'id' => $cargo->id,
            'order_id' => $cargo->order_id,
            'carrier_name' => $cargo->carrier_name,
            'barcode' => $cargo->barcode,
            'tracking_number' => $cargo->tracking_number,
            'tracking_url' => $cargo->tracking_url,
            'label_url' => $cargo->label_url,
            'status' => $cargo->status,
            'created_by_type' => $cargo->created_by_type,
            'created_at' => optional($cargo->created_at)->toDateTimeString(),
        ];
    }
}


<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SellerKycDocument;
use App\Models\Vendor;
use App\Notifications\KycStatusNotification;
use App\Services\IyzicoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SellerKycController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin-api');
    }

    public function pending(Request $request)
    {
        $perPage = max(1, min((int) $request->get('per_page', 20), 100));

        $vendors = Vendor::query()
            ->with(['user:id,name,email', 'kycDocuments'])
            ->where('kyc_status', 'pending')
            ->orderByDesc('kyc_submitted_at')
            ->paginate($perPage);

        return response()->json(['sellers' => $vendors]);
    }

    public function seller($id)
    {
        $vendor = Vendor::query()
            ->with(['user:id,name,email,phone', 'kycDocuments.reviewer:id,name,email'])
            ->findOrFail($id);

        return response()->json([
            'seller' => $vendor,
            'status' => $this->buildStatusPayload($vendor),
        ]);
    }

    public function approve(Request $request, $id)
    {
        $request->validate([
            'admin_note' => ['nullable', 'string'],
        ]);

        $document = SellerKycDocument::with('seller')->findOrFail($id);
        $document->update([
            'status' => SellerKycDocument::STATUS_APPROVED,
            'admin_note' => $request->input('admin_note'),
            'reviewed_by' => Auth::guard('admin-api')->id(),
            'reviewed_at' => now(),
        ]);

        $vendor = $document->seller->fresh('kycDocuments');
        $this->syncVendorStatus($vendor);

        return response()->json([
            'message' => 'KYC document approved successfully',
            'document' => $document->fresh(),
            'status' => $this->buildStatusPayload($vendor->fresh('kycDocuments')),
        ]);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'admin_note' => ['required', 'string'],
        ]);

        $document = SellerKycDocument::with('seller')->findOrFail($id);
        $document->update([
            'status' => SellerKycDocument::STATUS_REJECTED,
            'admin_note' => $request->input('admin_note'),
            'reviewed_by' => Auth::guard('admin-api')->id(),
            'reviewed_at' => now(),
        ]);

        $vendor = $document->seller->fresh('kycDocuments');
        $this->syncVendorStatus($vendor);

        return response()->json([
            'message' => 'KYC document rejected successfully',
            'document' => $document->fresh(),
            'status' => $this->buildStatusPayload($vendor->fresh('kycDocuments')),
        ]);
    }

    public function createSubMerchant($sellerId)
    {
        $vendor = Vendor::with('user')->find($sellerId);

        if (!$vendor) {
            return response()->json(['message' => 'Seller not found'], 404);
        }

        if ($vendor->kyc_status !== 'approved') {
            return response()->json(['message' => 'KYC onaylanmamis satici icin sub-merchant olusturulamaz.'], 422);
        }

        if ($vendor->iyzico_sub_merchant_key) {
            return response()->json([
                'message' => 'Bu satici icin sub-merchant zaten mevcut.',
                'sub_merchant_key' => $vendor->iyzico_sub_merchant_key,
            ]);
        }

        $this->createIyzicoSubMerchant($vendor);
        $vendor->refresh();

        if ($vendor->iyzico_sub_merchant_key) {
            return response()->json([
                'message' => 'Sub-merchant basariyla olusturuldu.',
                'sub_merchant_key' => $vendor->iyzico_sub_merchant_key,
            ]);
        }

        return response()->json(['message' => 'Sub-merchant olusturulamadi. Log kayitlarini kontrol edin.'], 500);
    }

    private function syncVendorStatus(Vendor $vendor): void
    {
        $documents = $vendor->kycDocuments;
        $oldStatus = $vendor->kyc_status;

        if ($documents->isEmpty()) {
            $vendor->kyc_status = 'not_submitted';
            $vendor->kyc_submitted_at = null;
            $vendor->kyc_approved_at = null;
            $vendor->save();

            return;
        }

        if ($documents->contains('status', SellerKycDocument::STATUS_PENDING)) {
            $vendor->kyc_status = 'pending';
            $vendor->kyc_approved_at = null;
        } elseif ($documents->contains('status', SellerKycDocument::STATUS_REJECTED)) {
            $vendor->kyc_status = 'rejected';
            $vendor->kyc_approved_at = null;
        } else {
            $vendor->kyc_status = 'approved';
            $vendor->kyc_approved_at = now();
            $vendor->kyc_submitted_at = $vendor->kyc_submitted_at ?? now();
        }

        $vendor->save();

        // Notify seller and trigger sub-merchant creation on status change
        if ($oldStatus !== $vendor->kyc_status && in_array($vendor->kyc_status, ['approved', 'rejected']) && $vendor->user) {
            $vendor->user->notify(new KycStatusNotification($vendor, $vendor->kyc_status));
        }

        // Auto-create Iyzico sub-merchant when KYC approved
        if ($vendor->kyc_status === 'approved' && !$vendor->iyzico_sub_merchant_key) {
            $this->createIyzicoSubMerchant($vendor);
        }
    }

    private function createIyzicoSubMerchant(Vendor $vendor): void
    {
        try {
            $iyzicoService = app(IyzicoService::class);
            $user = $vendor->user;

            // Determine sub-merchant type based on available documents
            $hasTaxNumber = !empty($vendor->tax_number);
            $type = $hasTaxNumber
                ? \Iyzipay\Model\SubMerchantType::LIMITED_OR_JOINT_STOCK_COMPANY
                : \Iyzipay\Model\SubMerchantType::PERSONAL;

            $nameParts = $user ? explode(' ', trim($user->name ?? ''), 2) : ['Satici'];

            $data = [
                'external_id' => 'VENDOR_' . $vendor->id,
                'type' => $type,
                'name' => $vendor->shop_name ?? ('Vendor ' . $vendor->id),
                'email' => $user->email ?? '',
                'gsm_number' => $vendor->phone ?? $user->phone ?? '',
                'iban' => $vendor->iban ?? '',
                'identity_number' => (string) ($vendor->tc_identity ?: data_get($user, 'tc_identity') ?: '00000000000'),
                'address' => $vendor->address ?? '',
                'contact_name' => $nameParts[0] ?? '',
                'contact_surname' => $nameParts[1] ?? ($nameParts[0] ?? ''),
            ];

            if ($hasTaxNumber) {
                $data['tax_number'] = $vendor->tax_number;
                $data['tax_office'] = $vendor->tax_office ?? '';
                $data['legal_company_title'] = $vendor->legal_company_title ?? $vendor->shop_name;
            }

            $result = $iyzicoService->createSubMerchant($data);

            if ($result->getStatus() === 'success') {
                $vendor->iyzico_sub_merchant_key = $result->getSubMerchantKey();
                $vendor->iyzico_sub_merchant_type = $type;
                $vendor->save();

                Log::info('Iyzico sub-merchant created', [
                    'vendor_id' => $vendor->id,
                    'sub_merchant_key' => $result->getSubMerchantKey(),
                ]);
            } else {
                Log::error('Iyzico sub-merchant creation failed', [
                    'vendor_id' => $vendor->id,
                    'error_code' => $result->getErrorCode(),
                    'error_message' => $result->getErrorMessage(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('Iyzico sub-merchant creation exception', [
                'vendor_id' => $vendor->id,
                'message' => $e->getMessage(),
            ]);
        }
    }

    private function buildStatusPayload(Vendor $vendor): array
    {
        $documents = $vendor->kycDocuments ?? collect();

        return [
            'kyc_status' => $vendor->kyc_status ?? 'not_submitted',
            'submitted_at' => optional($vendor->kyc_submitted_at)->toISOString(),
            'approved_at' => optional($vendor->kyc_approved_at)->toISOString(),
            'document_count' => $documents->count(),
            'pending_count' => $documents->where('status', SellerKycDocument::STATUS_PENDING)->count(),
            'approved_count' => $documents->where('status', SellerKycDocument::STATUS_APPROVED)->count(),
            'rejected_count' => $documents->where('status', SellerKycDocument::STATUS_REJECTED)->count(),
        ];
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SellerKycDocument;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

    private function syncVendorStatus(Vendor $vendor): void
    {
        $documents = $vendor->kycDocuments;

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

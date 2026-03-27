<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\UploadSellerKycDocumentRequest;
use App\Models\SellerKycDocument;
use App\Models\Vendor;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SellerKycController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('checkseller');
    }

    public function documents()
    {
        $vendor = $this->resolveVendor();

        return response()->json([
            'documents' => $vendor->kycDocuments()->orderBy('document_type')->get(),
            'status' => $this->buildStatusPayload($vendor->fresh('kycDocuments')),
        ]);
    }

    public function status()
    {
        $vendor = $this->resolveVendor()->load('kycDocuments');

        return response()->json([
            'status' => $this->buildStatusPayload($vendor),
        ]);
    }

    public function upload(UploadSellerKycDocumentRequest $request)
    {
        $vendor = $this->resolveVendor();
        $file = $request->file('document');
        $documentType = $request->string('document_type')->toString();

        $existingDocument = $vendor->kycDocuments()
            ->where('document_type', $documentType)
            ->first();

        $storedFilePath = $file->storeAs(
            'private/kyc/' . $vendor->id,
            $documentType . '-' . Str::uuid() . '.' . $file->getClientOriginalExtension(),
            'local'
        );

        if ($existingDocument && $existingDocument->file_path) {
            Storage::disk('local')->delete($existingDocument->file_path);
        }

        $document = SellerKycDocument::updateOrCreate(
            [
                'seller_id' => $vendor->id,
                'document_type' => $documentType,
            ],
            [
                'file_path' => $storedFilePath,
                'original_name' => $file->getClientOriginalName(),
                'file_size' => (int) $file->getSize(),
                'status' => SellerKycDocument::STATUS_PENDING,
                'admin_note' => null,
                'reviewed_by' => null,
                'reviewed_at' => null,
            ]
        );

        if ($request->filled('iban')) {
            $vendor->iban = $request->string('iban')->trim()->toString();
        }

        if ($request->filled('tax_number')) {
            $vendor->tax_number = $request->string('tax_number')->trim()->toString();
        }

        $vendor->kyc_status = 'pending';
        $vendor->kyc_submitted_at = now();
        $vendor->kyc_approved_at = null;
        $vendor->save();

        return response()->json([
            'message' => 'KYC document uploaded successfully',
            'document' => $document->fresh(),
            'status' => $this->buildStatusPayload($vendor->fresh('kycDocuments')),
        ], 201);
    }

    public function destroy($id)
    {
        $vendor = $this->resolveVendor();
        $document = $vendor->kycDocuments()->where('id', $id)->firstOrFail();

        if ($document->status !== SellerKycDocument::STATUS_PENDING) {
            return response()->json([
                'message' => 'Only pending KYC documents can be deleted',
            ], 422);
        }

        if ($document->file_path) {
            Storage::disk('local')->delete($document->file_path);
        }

        $document->delete();

        $vendor = $vendor->fresh('kycDocuments');
        $this->syncVendorStatus($vendor);

        return response()->json([
            'message' => 'KYC document deleted successfully',
            'status' => $this->buildStatusPayload($vendor->fresh('kycDocuments')),
        ]);
    }

    private function resolveVendor(): Vendor
    {
        return Vendor::where('user_id', Auth::guard('api')->id())->firstOrFail();
    }

    private function buildStatusPayload(Vendor $vendor): array
    {
        $documents = $vendor->kycDocuments ?? collect();

        return [
            'kyc_status' => $vendor->kyc_status ?? 'not_submitted',
            'submitted_at' => optional($vendor->kyc_submitted_at)->toISOString(),
            'approved_at' => optional($vendor->kyc_approved_at)->toISOString(),
            'iban' => $vendor->iban,
            'tax_number' => $vendor->tax_number,
            'document_count' => $documents->count(),
            'uploaded_document_types' => $documents->pluck('document_type')->values(),
            'pending_document_types' => $documents->where('status', SellerKycDocument::STATUS_PENDING)->pluck('document_type')->values(),
            'rejected_document_types' => $documents->where('status', SellerKycDocument::STATUS_REJECTED)->pluck('document_type')->values(),
        ];
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

        $vendor->kyc_status = $documents->contains('status', SellerKycDocument::STATUS_PENDING)
            ? 'pending'
            : ($documents->contains('status', SellerKycDocument::STATUS_REJECTED) ? 'rejected' : 'approved');

        if ($vendor->kyc_status !== 'approved') {
            $vendor->kyc_approved_at = null;
        }

        $vendor->save();
    }
}

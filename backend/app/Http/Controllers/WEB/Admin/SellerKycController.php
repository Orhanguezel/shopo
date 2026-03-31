<?php

namespace App\Http\Controllers\WEB\Admin;

use App\Http\Controllers\Controller;
use App\Models\SellerKycDocument;
use App\Models\Vendor;
use App\Notifications\KycStatusNotification;
use App\Services\IyzicoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SellerKycController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    public function index(Request $request)
    {
        $query = Vendor::query()
            ->with(['user:id,name,email,phone', 'kycDocuments'])
            ->where('status', 1);

        // Durum filtresi
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('kyc_status', $request->status);
        }

        $sellers = $query->orderByRaw("FIELD(kyc_status, 'pending', 'not_submitted', 'approved', 'rejected')")
            ->orderByDesc('id')
            ->get();

        return view('admin.seller_kyc', compact('sellers'));
    }

    public function show($id)
    {
        $seller = Vendor::query()
            ->with(['user:id,name,email,phone,address', 'kycDocuments.reviewer:id,name,email'])
            ->findOrFail($id);

        $status = $this->buildStatusPayload($seller);

        return view('admin.show_seller_kyc', compact('seller', 'status'));
    }

    public function approve(Request $request, $id)
    {
        $request->validate([
            'admin_note' => ['nullable', 'string'],
        ]);

        $document = SellerKycDocument::with('seller.kycDocuments')->findOrFail($id);
        $document->update([
            'status' => SellerKycDocument::STATUS_APPROVED,
            'admin_note' => $request->input('admin_note'),
            'reviewed_by' => Auth::guard('admin')->id(),
            'reviewed_at' => now(),
        ]);

        $this->syncVendorStatus($document->seller->fresh('kycDocuments'));

        return redirect()->back()->with([
            'messege' => trans('admin_validation.Update Successfully'),
            'alert-type' => 'success',
        ]);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'admin_note' => ['required', 'string'],
        ]);

        $document = SellerKycDocument::with('seller.kycDocuments')->findOrFail($id);
        $document->update([
            'status' => SellerKycDocument::STATUS_REJECTED,
            'admin_note' => $request->input('admin_note'),
            'reviewed_by' => Auth::guard('admin')->id(),
            'reviewed_at' => now(),
        ]);

        $this->syncVendorStatus($document->seller->fresh('kycDocuments'));

        return redirect()->back()->with([
            'messege' => trans('admin_validation.Update Successfully'),
            'alert-type' => 'success',
        ]);
    }

    public function download($id)
    {
        $document = SellerKycDocument::query()->findOrFail($id);

        abort_unless($document->file_path && Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download($document->file_path, $document->original_name);
    }

    public function createSubMerchant($sellerId)
    {
        $vendor = Vendor::with('user')->findOrFail($sellerId);

        if ($vendor->kyc_status !== 'approved') {
            return redirect()->back()->with([
                'messege' => 'Alt üye işyeri sadece KYC onaylı satıcılar için oluşturulabilir.',
                'alert-type' => 'error',
            ]);
        }

        if ($vendor->iyzico_sub_merchant_key) {
            return redirect()->back()->with([
                'messege' => 'Bu satıcının zaten bir alt üye işyeri anahtarı var.',
                'alert-type' => 'info',
            ]);
        }

        // Zorunlu alan kontrolü
        $missing = [];
        if (empty($vendor->tc_identity) && empty(optional($vendor->user)->tc_identity)) $missing[] = 'TC Kimlik';
        if (empty($vendor->iban)) $missing[] = 'IBAN';
        if (empty($vendor->phone) && empty(optional($vendor->user)->phone)) $missing[] = 'Telefon';
        if (empty($vendor->address) && empty(optional($vendor->user)->address)) $missing[] = 'Adres';

        if (!empty($missing)) {
            return redirect()->back()->with([
                'messege' => 'Eksik bilgiler: ' . implode(', ', $missing) . '. Satıcının bu bilgileri profilinden doldurması gerekiyor.',
                'alert-type' => 'error',
            ]);
        }

        $errorMessage = $this->createIyzicoSubMerchant($vendor);
        $vendor->refresh();

        if ($vendor->iyzico_sub_merchant_key) {
            return redirect()->back()->with([
                'messege' => 'Iyzico alt üye işyeri başarıyla oluşturuldu! Anahtar: ' . Str::limit($vendor->iyzico_sub_merchant_key, 20),
                'alert-type' => 'success',
            ]);
        }

        return redirect()->back()->with([
            'messege' => 'Alt üye işyeri oluşturulamadı. ' . ($errorMessage ?: 'Loglara bakın.'),
            'alert-type' => 'error',
        ]);
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

        if ($oldStatus !== $vendor->kyc_status && in_array($vendor->kyc_status, ['approved', 'rejected']) && $vendor->user) {
            $vendor->user->notify(new KycStatusNotification($vendor, $vendor->kyc_status));
        }

        if ($vendor->kyc_status === 'approved' && !$vendor->iyzico_sub_merchant_key) {
            $this->createIyzicoSubMerchant($vendor);
        }
    }

    private function buildStatusPayload(Vendor $vendor): array
    {
        $documents = $vendor->kycDocuments ?? collect();

        return [
            'kyc_status' => $vendor->kyc_status ?? 'not_submitted',
            'submitted_at' => $vendor->kyc_submitted_at,
            'approved_at' => $vendor->kyc_approved_at,
            'document_count' => $documents->count(),
            'pending_count' => $documents->where('status', SellerKycDocument::STATUS_PENDING)->count(),
            'approved_count' => $documents->where('status', SellerKycDocument::STATUS_APPROVED)->count(),
            'rejected_count' => $documents->where('status', SellerKycDocument::STATUS_REJECTED)->count(),
        ];
    }

    private function createIyzicoSubMerchant(Vendor $vendor): ?string
    {
        try {
            $iyzicoService = app(IyzicoService::class);
            $user = $vendor->user;

            $hasTaxNumber = !empty($vendor->tax_number);
            $type = $hasTaxNumber
                ? \Iyzipay\Model\SubMerchantType::LIMITED_OR_JOINT_STOCK_COMPANY
                : \Iyzipay\Model\SubMerchantType::PERSONAL;

            $nameParts = $user ? explode(' ', trim($user->name ?? ''), 2) : ['Satıcı'];

            $data = [
                'external_id' => 'VENDOR_' . $vendor->id,
                'type' => $type,
                'name' => $vendor->shop_name ?? ('Satıcı ' . $vendor->id),
                'email' => $user->email ?? '',
                'gsm_number' => $vendor->phone ?? $user->phone ?? '',
                'iban' => $vendor->iban ?? '',
                'identity_number' => (string) ($vendor->tc_identity ?: data_get($user, 'tc_identity') ?: '00000000000'),
                'address' => $vendor->address ?? data_get($user, 'address', 'Türkiye'),
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

                Log::info('Iyzico sub-merchant oluşturuldu', [
                    'vendor_id' => $vendor->id,
                    'sub_merchant_key' => $result->getSubMerchantKey(),
                ]);
                return null; // başarılı
            } else {
                $errorMsg = $result->getErrorMessage() ?: ('Hata kodu: ' . $result->getErrorCode());
                Log::error('Iyzico sub-merchant oluşturulamadı', [
                    'vendor_id' => $vendor->id,
                    'error_code' => $result->getErrorCode(),
                    'error_message' => $result->getErrorMessage(),
                ]);
                return 'Iyzico hatası: ' . $errorMsg;
            }
        } catch (\Throwable $e) {
            Log::error('Iyzico sub-merchant exception', [
                'vendor_id' => $vendor->id,
                'message' => $e->getMessage(),
            ]);
            return 'Sistem hatası: ' . $e->getMessage();
        }
    }
}

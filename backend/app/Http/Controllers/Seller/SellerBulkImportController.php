<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\UploadBulkProductImportRequest;
use App\Models\BulkImport;
use App\Models\Vendor;
use App\Services\BulkProductImportService;
use Illuminate\Support\Facades\Auth;

class SellerBulkImportController extends Controller
{
    public function __construct(private readonly BulkProductImportService $bulkImportService)
    {
        $this->middleware('auth:api');
        $this->middleware('checkseller');
    }

    public function upload(UploadBulkProductImportRequest $request)
    {
        $vendor = $this->resolveVendor();
        $bulkImport = $this->bulkImportService->createImportRecord((int) $vendor->user_id, 'seller', $request->file('import_file'));
        $bulkImport = $this->bulkImportService->process($bulkImport, $vendor);

        return response()->json([
            'message' => 'Bulk product import processed',
            'import' => $bulkImport,
        ], 201);
    }

    public function index()
    {
        $vendor = $this->resolveVendor();

        $imports = BulkImport::query()
            ->where('user_id', $vendor->user_id)
            ->where('user_type', 'seller')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json(['imports' => $imports]);
    }

    public function show($id)
    {
        $vendor = $this->resolveVendor();

        $import = BulkImport::query()
            ->where('user_id', $vendor->user_id)
            ->where('user_type', 'seller')
            ->findOrFail($id);

        return response()->json(['import' => $import]);
    }

    public function template()
    {
        return response($this->bulkImportService->templateCsv(), 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="seller-product-import-template.csv"',
        ]);
    }

    private function resolveVendor(): Vendor
    {
        return Vendor::query()->where('user_id', Auth::guard('api')->id())->firstOrFail();
    }
}

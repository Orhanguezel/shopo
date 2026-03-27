<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\UploadBulkProductImportRequest;
use App\Models\BulkImport;
use App\Services\BulkProductImportService;
use Illuminate\Support\Facades\Auth;

class ProductBulkImportController extends Controller
{
    public function __construct(private readonly BulkProductImportService $bulkImportService)
    {
        $this->middleware('auth:admin-api');
    }

    public function upload(UploadBulkProductImportRequest $request)
    {
        $adminId = (int) Auth::guard('admin-api')->id();
        $bulkImport = $this->bulkImportService->createImportRecord($adminId, 'admin', $request->file('import_file'));
        $bulkImport = $this->bulkImportService->process($bulkImport);

        return response()->json([
            'message' => 'Admin bulk product import processed',
            'import' => $bulkImport,
        ], 201);
    }

    public function index()
    {
        $imports = BulkImport::query()
            ->where('user_type', 'admin')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json(['imports' => $imports]);
    }
}

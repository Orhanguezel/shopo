<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\BulkImport;
use App\Models\Category;
use App\Models\ChildCategory;
use App\Models\Product;
use App\Models\SubCategory;
use App\Models\Vendor;
use App\Support\ProductSlug;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class BulkProductImportService
{
    private const TEMPLATE_HEADERS = [
        'name',
        'short_name',
        'slug',
        'category',
        'sub_category',
        'child_category',
        'brand',
        'price',
        'offer_price',
        'qty',
        'short_description',
        'long_description',
        'sku',
        'weight',
        'tags',
        'status',
    ];

    public function createImportRecord(int $userId, string $userType, UploadedFile $file): BulkImport
    {
        $storedFilePath = $file->storeAs(
            'private/bulk-imports/' . $userType . '/' . $userId,
            now()->format('YmdHis') . '-' . Str::uuid() . '.' . $file->getClientOriginalExtension(),
            'local'
        );

        return BulkImport::query()->create([
            'user_id' => $userId,
            'user_type' => $userType,
            'file_path' => $storedFilePath,
            'original_name' => $file->getClientOriginalName(),
            'status' => 'pending',
        ]);
    }

    public function process(BulkImport $bulkImport, ?Vendor $vendor = null): BulkImport
    {
        $bulkImport->update([
            'status' => 'processing',
            'started_at' => now(),
            'error_log' => [],
        ]);

        $fileAbsolutePath = Storage::disk('local')->path($bulkImport->file_path);
        $worksheets = Excel::toArray([], $fileAbsolutePath);
        $rows = $worksheets[0] ?? [];

        if (count($rows) < 2) {
            return $this->failImport($bulkImport, [[
                'row' => 0,
                'message' => 'Import file must contain a header row and at least one data row.',
            ]]);
        }

        $headers = collect(array_shift($rows))
            ->map(fn ($header) => Str::snake(trim((string) $header)))
            ->values()
            ->all();

        if ($headers !== self::TEMPLATE_HEADERS) {
            return $this->failImport($bulkImport, [[
                'row' => 0,
                'message' => 'Invalid template headers. Please download and use the latest import template.',
                'expected_headers' => self::TEMPLATE_HEADERS,
            ]], count($rows));
        }

        $errorLog = [];
        $successCount = 0;
        $processedRows = 0;

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;
            $processedRows++;

            $rowData = array_combine(self::TEMPLATE_HEADERS, array_pad($row, count(self::TEMPLATE_HEADERS), null));
            $normalizedRow = collect($rowData)
                ->map(fn ($value) => is_string($value) ? trim($value) : $value)
                ->all();

            if ($this->isEmptyRow($normalizedRow)) {
                continue;
            }

            $validationError = $this->validateRow($normalizedRow);
            if ($validationError) {
                $errorLog[] = ['row' => $rowNumber, 'message' => $validationError];
                continue;
            }

            $category = $this->resolveCategory($normalizedRow['category']);
            if (! $category) {
                $errorLog[] = ['row' => $rowNumber, 'message' => 'Category not found: ' . $normalizedRow['category']];
                continue;
            }

            $subCategory = $this->resolveSubCategory($normalizedRow['sub_category'] ?? null, $category->id);
            if (($normalizedRow['sub_category'] ?? null) && ! $subCategory) {
                $errorLog[] = ['row' => $rowNumber, 'message' => 'Sub category not found: ' . $normalizedRow['sub_category']];
                continue;
            }

            $childCategory = $this->resolveChildCategory($normalizedRow['child_category'] ?? null, $subCategory?->id);
            if (($normalizedRow['child_category'] ?? null) && ! $childCategory) {
                $errorLog[] = ['row' => $rowNumber, 'message' => 'Child category not found: ' . $normalizedRow['child_category']];
                continue;
            }

            $brand = $this->resolveBrand($normalizedRow['brand'] ?? null);
            if (($normalizedRow['brand'] ?? null) && ! $brand) {
                $errorLog[] = ['row' => $rowNumber, 'message' => 'Brand not found: ' . $normalizedRow['brand']];
                continue;
            }

            $normalizedSlug = ProductSlug::normalize($normalizedRow['slug'] ?: $normalizedRow['name']);

            $product = Product::query()
                ->when($vendor, fn ($query) => $query->where('vendor_id', $vendor->id))
                ->where(function ($query) use ($normalizedRow, $normalizedSlug) {
                    $query->where('slug', $normalizedSlug);

                    if (! empty($normalizedRow['sku'])) {
                        $query->orWhere('sku', $normalizedRow['sku']);
                    }
                })
                ->first();

            if (! $product) {
                $product = new Product();
                $product->vendor_id = $vendor?->id ?? 0;
            }

            $product->short_name = $normalizedRow['short_name'];
            $product->name = $normalizedRow['name'];
            $product->slug = $normalizedSlug;
            $product->category_id = $category->id;
            $product->sub_category_id = $subCategory?->id ?? 0;
            $product->child_category_id = $childCategory?->id ?? 0;
            $product->brand_id = $brand?->id ?? 0;
            $product->price = (float) $normalizedRow['price'];
            $product->offer_price = $normalizedRow['offer_price'] !== '' && $normalizedRow['offer_price'] !== null
                ? (float) $normalizedRow['offer_price']
                : null;
            $product->qty = (int) $normalizedRow['qty'];
            $product->short_description = $normalizedRow['short_description'];
            $product->long_description = $normalizedRow['long_description'];
            $product->sku = $normalizedRow['sku'] ?: null;
            $product->weight = $normalizedRow['weight'];
            $product->tags = $normalizedRow['tags'] ?: null;
            $product->status = (int) ($normalizedRow['status'] ?? 1) === 1 ? 1 : 0;
            $product->is_undefine = 1;
            $product->is_specification = 0;
            $product->seo_title = $normalizedRow['name'];
            $product->seo_description = $normalizedRow['name'];

            if ($vendor) {
                $product->approve_by_admin = 0;
            } else {
                $product->approve_by_admin = 1;
            }

            $product->save();
            $successCount++;
        }

        $bulkImport->update([
            'total_rows' => count($rows),
            'processed_rows' => $processedRows,
            'success_count' => $successCount,
            'error_count' => count($errorLog),
            'status' => count($errorLog) === count($rows) && count($rows) > 0 ? 'failed' : 'completed',
            'error_log' => $errorLog,
            'completed_at' => now(),
        ]);

        return $bulkImport->fresh();
    }

    public function templateHeaders(): array
    {
        return self::TEMPLATE_HEADERS;
    }

    public function templateCsv(): string
    {
        $sampleRow = [
            'Ornek Urun',
            'Ornek',
            'ornek-urun',
            'Elektronik',
            'Telefon',
            'Akilli Telefon',
            'Samsung',
            '1500.00',
            '1299.99',
            '50',
            'Kisa aciklama',
            'Uzun aciklama',
            'SKU-001',
            '0.5',
            'telefon,samsung',
            '1',
        ];

        return implode(',', self::TEMPLATE_HEADERS) . "\n" . implode(',', array_map(
            fn ($value) => '"' . str_replace('"', '""', $value) . '"',
            $sampleRow
        )) . "\n";
    }

    private function validateRow(array $row): ?string
    {
        if (empty($row['name'])) {
            return 'Name is required.';
        }

        if (empty($row['short_name'])) {
            return 'Short name is required.';
        }

        if (empty($row['slug'])) {
            return 'Slug is required.';
        }

        if (empty($row['category'])) {
            return 'Category is required.';
        }

        if ($row['price'] === null || $row['price'] === '' || ! is_numeric($row['price'])) {
            return 'Price must be numeric.';
        }

        if ($row['qty'] === null || $row['qty'] === '' || filter_var($row['qty'], FILTER_VALIDATE_INT) === false) {
            return 'Qty must be an integer.';
        }

        if (empty($row['short_description'])) {
            return 'Short description is required.';
        }

        if (empty($row['long_description'])) {
            return 'Long description is required.';
        }

        if (empty($row['weight'])) {
            return 'Weight is required.';
        }

        return null;
    }

    private function resolveCategory(?string $name): ?Category
    {
        if (! $name) {
            return null;
        }

        return Category::query()->whereRaw('LOWER(name) = ?', [Str::lower($name)])->first();
    }

    private function resolveSubCategory(?string $name, ?int $categoryId): ?SubCategory
    {
        if (! $name) {
            return null;
        }

        return SubCategory::query()
            ->where('category_id', $categoryId)
            ->whereRaw('LOWER(name) = ?', [Str::lower($name)])
            ->first();
    }

    private function resolveChildCategory(?string $name, ?int $subCategoryId): ?ChildCategory
    {
        if (! $name) {
            return null;
        }

        return ChildCategory::query()
            ->where('sub_category_id', $subCategoryId)
            ->whereRaw('LOWER(name) = ?', [Str::lower($name)])
            ->first();
    }

    private function resolveBrand(?string $name): ?Brand
    {
        if (! $name) {
            return null;
        }

        return Brand::query()->whereRaw('LOWER(name) = ?', [Str::lower($name)])->first();
    }

    private function isEmptyRow(array $row): bool
    {
        return collect($row)->every(fn ($value) => $value === null || $value === '');
    }

    private function failImport(BulkImport $bulkImport, array $errors, int $totalRows = 0): BulkImport
    {
        $bulkImport->update([
            'total_rows' => $totalRows,
            'processed_rows' => 0,
            'success_count' => 0,
            'error_count' => count($errors),
            'status' => 'failed',
            'error_log' => $errors,
            'completed_at' => now(),
        ]);

        return $bulkImport->fresh();
    }
}

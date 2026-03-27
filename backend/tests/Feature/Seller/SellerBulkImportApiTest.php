<?php

namespace Tests\Feature\Seller;

use App\Models\Category;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use PDO;
use Tests\TestCase;

class SellerBulkImportApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (! in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('pdo_sqlite is not installed in this environment.');
        }

        Config::set('database.default', 'sqlite');
        Config::set('database.connections.sqlite.database', ':memory:');
        DB::purge('sqlite');

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('password')->nullable();
            $table->timestamps();
        });

        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->integer('status')->default(1);
            $table->string('shop_name')->nullable();
            $table->enum('kyc_status', ['not_submitted', 'pending', 'approved', 'rejected'])->default('not_submitted');
            $table->timestamp('kyc_submitted_at')->nullable();
            $table->timestamp('kyc_approved_at')->nullable();
            $table->string('iban', 34)->nullable();
            $table->string('tax_number', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('sub_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id');
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('child_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sub_category_id');
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vendor_id')->default(0);
            $table->string('short_name')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedBigInteger('category_id')->default(0);
            $table->unsignedBigInteger('sub_category_id')->default(0);
            $table->unsignedBigInteger('child_category_id')->default(0);
            $table->unsignedBigInteger('brand_id')->default(0);
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('offer_price', 10, 2)->nullable();
            $table->integer('qty')->default(0);
            $table->text('short_description')->nullable();
            $table->longText('long_description')->nullable();
            $table->string('sku')->nullable();
            $table->string('weight')->nullable();
            $table->text('tags')->nullable();
            $table->integer('status')->default(1);
            $table->integer('is_undefine')->default(1);
            $table->integer('is_specification')->default(0);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->integer('approve_by_admin')->default(0);
            $table->timestamps();
        });

        Schema::create('bulk_imports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('user_type');
            $table->string('file_path', 500);
            $table->string('original_name');
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('processed_rows')->default(0);
            $table->unsignedInteger('success_count')->default(0);
            $table->unsignedInteger('error_count')->default(0);
            $table->string('status')->default('pending');
            $table->text('error_log')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Storage::disk('local')->deleteDirectory('private');

        Schema::dropIfExists('bulk_imports');
        Schema::dropIfExists('products');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('child_categories');
        Schema::dropIfExists('sub_categories');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_seller_bulk_import_creates_pending_product_and_import_record(): void
    {
        $user = User::query()->create([
            'name' => 'Seller User',
            'email' => 'seller@example.com',
        ]);

        $vendor = Vendor::query()->create([
            'user_id' => $user->id,
            'status' => 1,
            'shop_name' => 'Seller Shop',
        ]);

        Category::query()->create([
            'name' => 'Elektronik',
        ]);

        $csv = implode("\n", [
            'name,short_name,slug,category,sub_category,child_category,brand,price,offer_price,qty,short_description,long_description,sku,weight,tags,status',
            '"Ornek Urun","Ornek","ornek-urun","Elektronik","","","","1500.00","1299.99","50","Kisa aciklama","Uzun aciklama","SKU-001","0.5","telefon,samsung","1"',
        ]) . "\n";

        $response = $this->actingAs($user, 'api')->post('/api/seller/products/bulk-import', [
            'import_file' => UploadedFile::fake()->createWithContent('products.csv', $csv),
        ]);

        $response->assertCreated()
            ->assertJsonPath('import.status', 'completed')
            ->assertJsonPath('import.success_count', 1)
            ->assertJsonPath('import.error_count', 0);

        $this->assertDatabaseHas('products', [
            'vendor_id' => $vendor->id,
            'slug' => 'ornek-urun',
            'approve_by_admin' => 0,
        ]);

        $this->assertDatabaseHas('bulk_imports', [
            'user_id' => $user->id,
            'user_type' => 'seller',
            'status' => 'completed',
        ]);
    }

    public function test_seller_bulk_import_template_endpoint_returns_csv(): void
    {
        $user = User::query()->create([
            'name' => 'Seller User',
            'email' => 'seller@example.com',
        ]);

        Vendor::query()->create([
            'user_id' => $user->id,
            'status' => 1,
            'shop_name' => 'Seller Shop',
        ]);

        $response = $this->actingAs($user, 'api')->get('/api/seller/products/bulk-import/template');

        $response->assertOk();
        $this->assertStringContainsString('name,short_name,slug,category', $response->streamedContent());
    }
}

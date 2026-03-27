<?php

namespace Tests\Feature\Admin;

use App\Models\Admin;
use App\Models\Category;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use PDO;
use Tests\TestCase;

class AdminBulkImportApiTest extends TestCase
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

        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('password')->nullable();
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
            $table->integer('approve_by_admin')->default(1);
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
        Schema::dropIfExists('admins');

        parent::tearDown();
    }

    public function test_admin_bulk_import_creates_approved_product_and_import_record(): void
    {
        $admin = Admin::query()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        Category::query()->create(['name' => 'Elektronik']);

        $csv = implode("\n", [
            'name,short_name,slug,category,sub_category,child_category,brand,price,offer_price,qty,short_description,long_description,sku,weight,tags,status',
            '"Admin Urun","Admin","admin-urun","Elektronik","","","","2000.00","","15","Kisa aciklama","Uzun aciklama","SKU-ADM","1.2","etiket","1"',
        ]) . "\n";

        $response = $this->actingAs($admin, 'admin-api')->post('/api/admin/products/bulk-import', [
            'import_file' => UploadedFile::fake()->createWithContent('admin-products.csv', $csv),
        ]);

        $response->assertCreated()
            ->assertJsonPath('import.status', 'completed')
            ->assertJsonPath('import.success_count', 1);

        $this->assertDatabaseHas('products', [
            'slug' => 'admin-urun',
            'vendor_id' => 0,
            'approve_by_admin' => 1,
        ]);

        $this->assertDatabaseHas('bulk_imports', [
            'user_id' => $admin->id,
            'user_type' => 'admin',
            'status' => 'completed',
        ]);
    }
}

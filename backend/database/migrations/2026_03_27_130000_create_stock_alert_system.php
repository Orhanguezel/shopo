<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Stock alert settings
        Schema::table('settings', function (Blueprint $table) {
            $table->integer('low_stock_threshold')->default(5)->after('id');
            $table->boolean('stock_alert_enabled')->default(true)->after('low_stock_threshold');
        });

        // Laravel-style notifications table
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');

        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['low_stock_threshold', 'stock_alert_enabled']);
        });
    }
};

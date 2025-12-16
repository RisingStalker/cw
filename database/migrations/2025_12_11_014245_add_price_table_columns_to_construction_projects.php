<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('construction_projects', function (Blueprint $table) {
            $table->foreignId('price_table_id')->nullable()->after('interior_balustrade_meters')->constrained()->nullOnDelete();
            $table->foreignId('manual_price_table_id')->nullable()->after('price_table_id')->constrained('price_tables')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('construction_projects', function (Blueprint $table) {
            $table->dropForeign(['price_table_id']);
            $table->dropForeign(['manual_price_table_id']);
            $table->dropColumn(['price_table_id', 'manual_price_table_id']);
        });
    }
};

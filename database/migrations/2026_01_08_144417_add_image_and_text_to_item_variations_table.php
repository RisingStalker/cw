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
        Schema::table('item_variations', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('surcharge');
            $table->text('short_text')->nullable()->after('image_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_variations', function (Blueprint $table) {
            $table->dropColumn(['image_path', 'short_text']);
        });
    }
};

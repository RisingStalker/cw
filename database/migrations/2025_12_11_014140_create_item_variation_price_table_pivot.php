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
        Schema::create('item_variation_price_table', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_variation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('price_table_id')->constrained()->cascadeOnDelete();
            $table->decimal('surcharge', 10, 2)->default(0);
            $table->timestamps();
            
            $table->unique(['item_variation_id', 'price_table_id'], 'item_var_price_table_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_variation_price_table');
    }
};

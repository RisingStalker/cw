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
        Schema::create('configuration_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('configuration_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_variation_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('quantity')->nullable();
            $table->foreignId('project_room_id')->nullable()->constrained('project_rooms')->nullOnDelete();
            $table->foreignId('project_bathroom_id')->nullable()->constrained('project_bathrooms')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuration_items');
    }
};

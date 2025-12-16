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
        Schema::create('configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('construction_project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_completed')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->json('last_position')->nullable(); // Store last completed category/room
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configurations');
    }
};

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
        Schema::create('project_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('construction_project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('floor_space', 10, 2)->default(0);
            $table->json('prohibited_floors')->nullable(); // Array of prohibited floor IDs
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_rooms');
    }
};

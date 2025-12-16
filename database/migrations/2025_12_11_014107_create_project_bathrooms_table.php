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
        Schema::create('project_bathrooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('construction_project_id')->constrained()->cascadeOnDelete();
            $table->integer('room_number');
            $table->boolean('has_toilet')->default(false);
            $table->boolean('has_shower')->default(false);
            $table->boolean('has_bathtub')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_bathrooms');
    }
};

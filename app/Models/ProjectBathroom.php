<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectBathroom extends Model
{
    use HasFactory;

    protected $fillable = [
        'construction_project_id',
        'room_number',
        'has_toilet',
        'has_shower',
        'has_bathtub',
    ];

    protected function casts(): array
    {
        return [
            'room_number' => 'integer',
            'has_toilet' => 'boolean',
            'has_shower' => 'boolean',
            'has_bathtub' => 'boolean',
        ];
    }

    public function constructionProject(): BelongsTo
    {
        return $this->belongsTo(ConstructionProject::class);
    }

    public function configurationItems(): HasMany
    {
        return $this->hasMany(ConfigurationItem::class);
    }
}

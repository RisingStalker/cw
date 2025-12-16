<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'construction_project_id',
        'name',
        'floor_space',
        'prohibited_floors',
    ];

    protected function casts(): array
    {
        return [
            'floor_space' => 'decimal:2',
            'prohibited_floors' => 'array',
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

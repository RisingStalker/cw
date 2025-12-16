<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfigurationItem extends Model
{
    /** @use HasFactory<\Database\Factories\ConfigurationItemFactory> */
    use HasFactory;

    protected $fillable = [
        'configuration_id',
        'item_id',
        'item_variation_id',
        'quantity',
        'project_room_id',
        'project_bathroom_id',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }

    public function configuration(): BelongsTo
    {
        return $this->belongsTo(Configuration::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function itemVariation(): BelongsTo
    {
        return $this->belongsTo(ItemVariation::class);
    }

    public function projectRoom(): BelongsTo
    {
        return $this->belongsTo(ProjectRoom::class);
    }

    public function projectBathroom(): BelongsTo
    {
        return $this->belongsTo(ProjectBathroom::class);
    }
}

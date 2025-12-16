<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Configuration extends Model
{
    /** @use HasFactory<\Database\Factories\ConfigurationFactory> */
    use HasFactory;

    protected $fillable = [
        'construction_project_id',
        'name',
        'is_completed',
        'is_locked',
        'last_position',
    ];

    protected function casts(): array
    {
        return [
            'is_completed' => 'boolean',
            'is_locked' => 'boolean',
            'last_position' => 'array',
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

    public function calculateTotalCost(): float
    {
        return $this->configurationItems->sum(function ($configItem) {
            $item = $configItem->item;
            $baseCost = $item->additional_cost ?? 0;
            $variationSurcharge = $configItem->itemVariation?->surcharge ?? 0;
            $unitCost = $baseCost + $variationSurcharge;

            // Calculate based on context
            if ($configItem->projectRoom) {
                // Flooring: cost per m² × room area
                $roomArea = $configItem->projectRoom->floor_space ?? 0;

                return $unitCost * $roomArea;
            } elseif ($configItem->projectBathroom) {
                // Bathroom items: per bathroom
                return $unitCost;
            } else {
                // Regular items: quantity or single
                $quantity = $configItem->quantity ?? 1;

                return $unitCost * $quantity;
            }
        });
    }
}

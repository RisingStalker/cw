<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItemVariation extends Model
{
    /** @use HasFactory<\Database\Factories\ItemVariationFactory> */
    use HasFactory;

    protected $fillable = [
        'item_id',
        'type',
        'name',
        'surcharge',
        'image_path',
        'short_text',
    ];

    protected function casts(): array
    {
        return [
            'surcharge' => 'decimal:2',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function priceTables(): BelongsToMany
    {
        return $this->belongsToMany(PriceTable::class, 'item_variation_price_table')
            ->withPivot('surcharge')
            ->withTimestamps();
    }

    public function configurationItems(): HasMany
    {
        return $this->hasMany(ConfigurationItem::class);
    }
}

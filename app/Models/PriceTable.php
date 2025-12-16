<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PriceTable extends Model
{
    /** @use HasFactory<\Database\Factories\PriceTableFactory> */
    use HasFactory;

    protected $fillable = [
        'year',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function items(): BelongsToMany
    {
        return $this->belongsToMany(Item::class, 'item_price_table')
            ->withPivot('additional_cost')
            ->withTimestamps();
    }

    public function itemVariations(): BelongsToMany
    {
        return $this->belongsToMany(ItemVariation::class, 'item_variation_price_table')
            ->withPivot('surcharge')
            ->withTimestamps();
    }

    public function constructionProjects(): HasMany
    {
        return $this->hasMany(ConstructionProject::class, 'price_table_id');
    }
}

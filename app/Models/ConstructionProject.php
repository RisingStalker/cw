<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConstructionProject extends Model
{
    /** @use HasFactory<\Database\Factories\ConstructionProjectFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'name',
        'facade_area',
        'balcony_meters',
        'interior_balustrade_meters',
        'price_table_id',
        'manual_price_table_id',
    ];

    protected function casts(): array
    {
        return [
            'facade_area' => 'decimal:2',
            'balcony_meters' => 'decimal:2',
            'interior_balustrade_meters' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function priceTable(): BelongsTo
    {
        return $this->belongsTo(PriceTable::class, 'price_table_id');
    }

    public function manualPriceTable(): BelongsTo
    {
        return $this->belongsTo(PriceTable::class, 'manual_price_table_id');
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(ProjectRoom::class);
    }

    public function bathrooms(): HasMany
    {
        return $this->hasMany(ProjectBathroom::class);
    }

    public function configurations(): HasMany
    {
        return $this->hasMany(Configuration::class);
    }

    public function getEffectivePriceTable(): ?PriceTable
    {
        return $this->manualPriceTable ?? $this->priceTable;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    /** @use HasFactory<\Database\Factories\ItemFactory> */
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'description',
        'additional_cost',
        'requires_quantity',
        'consultation_required',
        'is_standard',
        'hidden_until',
    ];

    protected function casts(): array
    {
        return [
            'additional_cost' => 'decimal:2',
            'requires_quantity' => 'boolean',
            'consultation_required' => 'boolean',
            'is_standard' => 'boolean',
            'hidden_until' => 'date',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variations(): HasMany
    {
        return $this->hasMany(ItemVariation::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ItemImage::class)->orderBy('order');
    }

    public function priceTables(): BelongsToMany
    {
        return $this->belongsToMany(PriceTable::class, 'item_price_table')
            ->withPivot('additional_cost')
            ->withTimestamps();
    }

    public function configurationItems(): HasMany
    {
        return $this->hasMany(ConfigurationItem::class);
    }

    public function isVisibleForDate(?string $date = null): bool
    {
        if ($this->hidden_until === null) {
            return true;
        }

        $checkDate = $date ? \Carbon\Carbon::parse($date) : now();

        return $checkDate->gte($this->hidden_until);
    }
}

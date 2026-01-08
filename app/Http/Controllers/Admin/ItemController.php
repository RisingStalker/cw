<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreItemRequest;
use App\Http\Requests\Admin\UpdateItemRequest;
use App\Models\Category;
use App\Models\Item;
use App\Models\ItemImage;
use App\Models\ItemVariation;
use App\Models\PriceTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    public function index(Request $request): Response
    {
        $items = Item::query()
            ->with(['category', 'images', 'variations'])
            ->when($request->search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->category_id, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->latest()
            ->paginate(15);

        // Build category tree structure
        $allCategories = Category::with(['parent', 'children'])->get();
        $categoryTree = $allCategories->whereNull('parent_id')
            ->sortBy('order')
            ->values()
            ->map(function ($category) use ($allCategories) {
                return $this->buildCategoryTree($category, $allCategories);
            });

        return Inertia::render('Admin/Items/Index', [
            'items' => $items,
            'categoriesTree' => $categoryTree,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function create(): Response
    {
        // Build category tree structure
        $allCategories = Category::with(['parent', 'children'])->get();
        $categoryTree = $allCategories->whereNull('parent_id')
            ->sortBy('order')
            ->values()
            ->map(function ($category) use ($allCategories) {
                return $this->buildCategoryTree($category, $allCategories);
            });

        return Inertia::render('Admin/Items/Create', [
            'categoriesTree' => $categoryTree,
            'priceTables' => PriceTable::where('is_active', true)->orderBy('year', 'desc')->get(),
        ]);
    }

    public function store(StoreItemRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $item = Item::create([
                'category_id' => $request->category_id,
                'title' => $request->title,
                'description' => $request->description,
                'additional_cost' => $request->additional_cost,
                'requires_quantity' => $request->boolean('requires_quantity'),
                'consultation_required' => $request->boolean('consultation_required'),
                'is_standard' => $request->boolean('is_standard'),
                'hidden_until' => $request->hidden_until,
            ]);

            // Handle image uploads
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('items', 'public');
                    ItemImage::create([
                        'item_id' => $item->id,
                        'path' => $path,
                        'order' => $index,
                    ]);
                }
            }

            // Handle variations
            if ($request->variations) {
                foreach ($request->variations as $index => $variationData) {
                    $imagePath = null;
                    // Check if there's an image file for this variation
                    if ($request->hasFile("variations.{$index}.image")) {
                        $imagePath = $request->file("variations.{$index}.image")->store('variations', 'public');
                    }

                    $variation = ItemVariation::create([
                        'item_id' => $item->id,
                        'type' => $variationData['type'],
                        'name' => $variationData['name'],
                        'surcharge' => $variationData['surcharge'],
                        'image_path' => $imagePath,
                        'short_text' => $variationData['short_text'] ?? null,
                    ]);

                    // Handle variation price table relationships
                    Log::info('ItemController - Processing variation', [
                        'variation_id' => $variation->id,
                        'variation_data' => $variationData,
                        'has_price_tables' => isset($variationData['price_tables']),
                        'price_tables' => $variationData['price_tables'] ?? null,
                    ]);
                    
                    if (isset($variationData['price_tables']) && is_array($variationData['price_tables']) && count($variationData['price_tables']) > 0) {
                        // Build array for bulk attach: [price_table_id => ['surcharge' => value], ...]
                        $priceTablesToAttach = [];
                        $duplicateIds = [];
                        
                        foreach ($variationData['price_tables'] as $priceTableData) {
                            $priceTableId = $priceTableData['price_table_id'] ?? null;
                            if (!empty($priceTableId)) {
                                // Check for duplicates
                                if (isset($priceTablesToAttach[$priceTableId])) {
                                    $duplicateIds[] = $priceTableId;
                                    // Keep the last surcharge value for duplicates
                                }
                                // Use price_table_id as key to ensure uniqueness (database constraint)
                                $priceTablesToAttach[$priceTableId] = [
                                    'surcharge' => $priceTableData['surcharge'] ?? 0,
                                ];
                            }
                        }
                        
                        if (!empty($duplicateIds)) {
                            Log::warning('ItemController - Duplicate price_table_ids detected', [
                                'variation_id' => $variation->id,
                                'duplicate_ids' => array_unique($duplicateIds),
                                'message' => 'Multiple entries with same price_table_id. Only the last surcharge value will be used.',
                            ]);
                        }
                        
                        Log::info('ItemController - Attaching price tables', [
                            'variation_id' => $variation->id,
                            'price_tables_to_attach' => $priceTablesToAttach,
                            'count' => count($priceTablesToAttach),
                            'original_count' => count($variationData['price_tables']),
                        ]);
                        
                        if (!empty($priceTablesToAttach)) {
                            // Use syncWithoutDetaching to add new ones without removing existing
                            $variation->priceTables()->syncWithoutDetaching($priceTablesToAttach);
                            
                            Log::info('ItemController - Attached price tables', [
                                'variation_id' => $variation->id,
                                'attached_count' => count($priceTablesToAttach),
                            ]);
                        }
                    } else {
                        Log::warning('ItemController - No price tables to attach', [
                            'variation_id' => $variation->id,
                            'variation_data_keys' => array_keys($variationData),
                            'has_price_tables_key' => isset($variationData['price_tables']),
                        ]);
                    }
                }
            }

            // Handle price table relationships
            if ($request->price_tables) {
                foreach ($request->price_tables as $priceTableData) {
                    $item->priceTables()->attach($priceTableData['price_table_id'], [
                        'additional_cost' => $priceTableData['additional_cost'],
                    ]);
                }
            }
        });

        return redirect()->route('admin.items.index')
            ->with('success', __('translations.item_created'));
    }

    public function show(Item $item): Response
    {
        $item->load(['category', 'images', 'variations', 'priceTables']);

        return Inertia::render('Admin/Items/Show', [
            'item' => $item,
        ]);
    }

    public function edit(Item $item): Response
    {
        $item->load(['images', 'variations.priceTables', 'priceTables']);

        // Ensure pivot data is loaded for variations
        $item->variations->each(function ($variation) {
            $variation->load('priceTables');
        });

        // Build category tree structure
        $allCategories = Category::with(['parent', 'children'])->get();
        $categoryTree = $allCategories->whereNull('parent_id')
            ->sortBy('order')
            ->values()
            ->map(function ($category) use ($allCategories) {
                return $this->buildCategoryTree($category, $allCategories);
            });

        // Format item data to ensure pivot relationships are properly serialized
        $itemData = [
            'id' => $item->id,
            'category_id' => $item->category_id,
            'title' => $item->title,
            'description' => $item->description,
            'additional_cost' => $item->additional_cost,
            'requires_quantity' => $item->requires_quantity,
            'consultation_required' => $item->consultation_required,
            'is_standard' => $item->is_standard,
            'hidden_until' => $item->hidden_until,
            'images' => $item->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'path' => $image->path,
                    'order' => $image->order,
                    'url' => asset('storage/' . $image->path),
                ];
            }),
            'variations' => $item->variations->map(function ($variation) {
                return [
                    'id' => $variation->id,
                    'type' => $variation->type,
                    'name' => $variation->name,
                    'surcharge' => $variation->surcharge,
                    'image_path' => $variation->image_path,
                    'short_text' => $variation->short_text,
                    'priceTables' => $variation->priceTables->map(function ($priceTable) {
                        return [
                            'id' => $priceTable->id,
                            'year' => $priceTable->year,
                            'pivot' => [
                                'surcharge' => $priceTable->pivot->surcharge,
                            ],
                        ];
                    }),
                ];
            }),
            'priceTables' => $item->priceTables->map(function ($priceTable) {
                return [
                    'id' => $priceTable->id,
                    'year' => $priceTable->year,
                    'pivot' => [
                        'additional_cost' => $priceTable->pivot->additional_cost,
                    ],
                ];
            }),
        ];

        return Inertia::render('Admin/Items/Edit', [
            'item' => $itemData,
            'categoriesTree' => $categoryTree,
            'priceTables' => PriceTable::where('is_active', true)->orderBy('year', 'desc')->get(),
        ]);
    }

    /**
     * Recursively build category tree structure (same as CategoryController)
     */
    private function buildCategoryTree(Category $category, $allCategories, $level = 0): array
    {
        $children = $allCategories->where('parent_id', $category->id)
            ->sortBy('order')
            ->values()
            ->map(function ($child) use ($allCategories, $level) {
                return $this->buildCategoryTree($child, $allCategories, $level + 1);
            });

        return [
            'id' => $category->id,
            'name' => $category->name,
            'order' => $category->order,
            'parent_id' => $category->parent_id,
            'scope' => $category->scope,
            'parent' => $category->parent ? [
                'id' => $category->parent->id,
                'name' => $category->parent->name,
            ] : null,
            'children' => $children->toArray(),
            'level' => $level,
        ];
    }

    public function update(UpdateItemRequest $request, Item $item): RedirectResponse
    {
        DB::transaction(function () use ($request, $item) {
            $item->update([
                'category_id' => $request->category_id,
                'title' => $request->title,
                'description' => $request->description,
                'additional_cost' => $request->additional_cost,
                'requires_quantity' => $request->boolean('requires_quantity'),
                'consultation_required' => $request->boolean('consultation_required'),
                'is_standard' => $request->boolean('is_standard'),
                'hidden_until' => $request->hidden_until,
            ]);

            // Handle new image uploads
            if ($request->hasFile('images')) {
                $maxOrder = $item->images()->max('order') ?? -1;
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('items', 'public');
                    ItemImage::create([
                        'item_id' => $item->id,
                        'path' => $path,
                        'order' => $maxOrder + $index + 1,
                    ]);
                }
            }

            // Handle variations (delete and recreate for simplicity)
            // Collect existing image paths that won't be kept
            $existingImagePaths = [];
            if ($request->variations) {
                foreach ($request->variations as $variationData) {
                    if (isset($variationData['existing_image_path']) && $variationData['existing_image_path']) {
                        $existingImagePaths[] = $variationData['existing_image_path'];
                    }
                }
            }
            
            // Delete old variation images that are not being kept
            foreach ($item->variations as $variation) {
                if ($variation->image_path && !in_array($variation->image_path, $existingImagePaths)) {
                    Storage::disk('public')->delete($variation->image_path);
                }
            }
            
            $item->variations()->delete();
            if ($request->variations) {
                foreach ($request->variations as $index => $variationData) {
                    $imagePath = null;
                    // Check if there's a new image file for this variation
                    if ($request->hasFile("variations.{$index}.image")) {
                        $imagePath = $request->file("variations.{$index}.image")->store('variations', 'public');
                    } elseif (isset($variationData['existing_image_path']) && $variationData['existing_image_path']) {
                        // Keep existing image if no new one is uploaded
                        $imagePath = $variationData['existing_image_path'];
                    }

                    $variation = ItemVariation::create([
                        'item_id' => $item->id,
                        'type' => $variationData['type'],
                        'name' => $variationData['name'],
                        'surcharge' => $variationData['surcharge'],
                        'image_path' => $imagePath,
                        'short_text' => $variationData['short_text'] ?? null,
                    ]);

                    // Handle variation price table relationships
                    Log::info('ItemController Update - Processing variation', [
                        'variation_id' => $variation->id,
                        'variation_data' => $variationData,
                        'has_price_tables' => isset($variationData['price_tables']),
                        'price_tables' => $variationData['price_tables'] ?? null,
                    ]);
                    
                    if (isset($variationData['price_tables']) && is_array($variationData['price_tables']) && count($variationData['price_tables']) > 0) {
                        // Build array for bulk attach: [price_table_id => ['surcharge' => value], ...]
                        $priceTablesToAttach = [];
                        $duplicateIds = [];
                        
                        foreach ($variationData['price_tables'] as $priceTableData) {
                            $priceTableId = $priceTableData['price_table_id'] ?? null;
                            if (!empty($priceTableId)) {
                                // Check for duplicates
                                if (isset($priceTablesToAttach[$priceTableId])) {
                                    $duplicateIds[] = $priceTableId;
                                    // Keep the last surcharge value for duplicates
                                }
                                // Use price_table_id as key to ensure uniqueness (database constraint)
                                $priceTablesToAttach[$priceTableId] = [
                                    'surcharge' => $priceTableData['surcharge'] ?? 0,
                                ];
                            }
                        }
                        
                        if (!empty($duplicateIds)) {
                            Log::warning('ItemController Update - Duplicate price_table_ids detected', [
                                'variation_id' => $variation->id,
                                'duplicate_ids' => array_unique($duplicateIds),
                                'message' => 'Multiple entries with same price_table_id. Only the last surcharge value will be used.',
                            ]);
                        }
                        
                        Log::info('ItemController Update - Attaching price tables', [
                            'variation_id' => $variation->id,
                            'price_tables_to_attach' => $priceTablesToAttach,
                            'count' => count($priceTablesToAttach),
                            'original_count' => count($variationData['price_tables']),
                        ]);
                        
                        if (!empty($priceTablesToAttach)) {
                            // Use sync to set exactly the price tables we want (since we're recreating variations)
                            $variation->priceTables()->sync($priceTablesToAttach);
                            
                            Log::info('ItemController Update - Synced price tables', [
                                'variation_id' => $variation->id,
                                'synced_count' => count($priceTablesToAttach),
                            ]);
                        }
                    } else {
                        Log::warning('ItemController Update - No price tables to attach', [
                            'variation_id' => $variation->id,
                            'variation_data_keys' => array_keys($variationData),
                            'has_price_tables_key' => isset($variationData['price_tables']),
                        ]);
                    }
                }
            }

            // Handle price table relationships
            $item->priceTables()->detach();
            if ($request->price_tables) {
                foreach ($request->price_tables as $priceTableData) {
                    $item->priceTables()->attach($priceTableData['price_table_id'], [
                        'additional_cost' => $priceTableData['additional_cost'],
                    ]);
                }
            }
        });

        return redirect()->route('admin.items.index')
            ->with('success', __('translations.item_updated'));
    }

    public function destroy(Item $item): RedirectResponse
    {
        // Delete associated images
        foreach ($item->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $item->delete();

        return redirect()->route('admin.items.index')
            ->with('success', __('translations.item_deleted'));
    }

    public function deleteImage(Item $item, ItemImage $image): RedirectResponse
    {
        if ($image->item_id !== $item->id) {
            abort(404);
        }

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return redirect()->back()
            ->with('success', 'Image deleted');
    }
}

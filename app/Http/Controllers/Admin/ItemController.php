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

        return Inertia::render('Admin/Items/Index', [
            'items' => $items,
            'categories' => Category::orderBy('order')->get(),
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Items/Create', [
            'categories' => Category::orderBy('order')->get(),
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
                foreach ($request->variations as $variationData) {
                    ItemVariation::create([
                        'item_id' => $item->id,
                        'type' => $variationData['type'],
                        'name' => $variationData['name'],
                        'surcharge' => $variationData['surcharge'],
                    ]);
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
        $item->load(['images', 'variations', 'priceTables']);

        return Inertia::render('Admin/Items/Edit', [
            'item' => $item,
            'categories' => Category::orderBy('order')->get(),
            'priceTables' => PriceTable::where('is_active', true)->orderBy('year', 'desc')->get(),
        ]);
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
            $item->variations()->delete();
            if ($request->variations) {
                foreach ($request->variations as $variationData) {
                    ItemVariation::create([
                        'item_id' => $item->id,
                        'type' => $variationData['type'],
                        'name' => $variationData['name'],
                        'surcharge' => $variationData['surcharge'],
                    ]);
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

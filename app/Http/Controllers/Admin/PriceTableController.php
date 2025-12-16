<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePriceTableRequest;
use App\Http\Requests\Admin\UpdatePriceTableRequest;
use App\Models\PriceTable;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PriceTableController extends Controller
{
    public function index(): Response
    {
        $priceTables = PriceTable::orderBy('year', 'desc')->withCount('constructionProjects')->get();

        return Inertia::render('Admin/PriceTables/Index', [
            'priceTables' => $priceTables,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/PriceTables/Create', [
            'defaultYear' => now()->year,
        ]);
    }

    public function store(StorePriceTableRequest $request): RedirectResponse
    {
        PriceTable::create($request->validated());

        return redirect()->route('admin.price-tables.index')
            ->with('success', __('translations.price_table_created'));
    }

    public function edit(PriceTable $priceTable): Response
    {
        return Inertia::render('Admin/PriceTables/Edit', [
            'priceTable' => $priceTable,
        ]);
    }

    public function update(UpdatePriceTableRequest $request, PriceTable $priceTable): RedirectResponse
    {
        $priceTable->update($request->validated());

        return redirect()->route('admin.price-tables.index')
            ->with('success', __('translations.price_table_updated'));
    }

    public function destroy(PriceTable $priceTable): RedirectResponse
    {
        if ($priceTable->constructionProjects()->count() > 0) {
            return redirect()->route('admin.price-tables.index')
                ->with('error', 'Cannot delete price table with associated projects');
        }

        $priceTable->delete();

        return redirect()->route('admin.price-tables.index')
            ->with('success', __('translations.price_table_deleted'));
    }
}

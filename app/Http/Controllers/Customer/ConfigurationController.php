<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreConfigurationRequest;
use App\Http\Requests\Customer\UpdateConfigurationRequest;
use App\Models\Configuration;
use App\Models\ConstructionProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConfigurationController extends Controller
{
    public function index(Request $request, ConstructionProject $project): Response
    {
        $customer = Auth::guard('customer')->user();

        if ($project->customer_id !== $customer->id) {
            abort(403);
        }

        $configurations = $project->configurations()
            ->latest()
            ->get();

        return Inertia::render('Customer/Configurations/Index', [
            'project' => $project,
            'configurations' => $configurations,
        ]);
    }

    public function create(ConstructionProject $project): Response
    {
        $customer = Auth::guard('customer')->user();

        if ($project->customer_id !== $customer->id) {
            abort(403);
        }

        return Inertia::render('Customer/Configurations/Create', [
            'project' => $project->load(['rooms', 'bathrooms']),
        ]);
    }

    public function store(StoreConfigurationRequest $request, ConstructionProject $project): RedirectResponse
    {
        $customer = Auth::guard('customer')->user();

        if ($project->customer_id !== $customer->id) {
            abort(403);
        }

        $configuration = Configuration::create([
            'construction_project_id' => $project->id,
            'name' => $request->name,
            'is_completed' => false,
            'is_locked' => false,
            'last_position' => null,
        ]);

        return redirect()->route('configurations.wizard', [
            'project' => $project->id,
            'configuration' => $configuration->id,
        ])->with('success', __('translations.configuration_created'));
    }

    public function show(ConstructionProject $project, Configuration $configuration): Response
    {
        $customer = Auth::guard('customer')->user();

        if ($project->customer_id !== $customer->id || $configuration->construction_project_id !== $project->id) {
            abort(403);
        }

        $configuration->load(['configurationItems.item.category', 'configurationItems.itemVariation', 'configurationItems.projectRoom', 'configurationItems.projectBathroom']);

        // Ensure configurationItems is always an array
        if ($configuration->configurationItems === null) {
            $configuration->setRelation('configurationItems', collect([]));
        }

        return Inertia::render('Customer/Configurations/Show', [
            'project' => $project,
            'configuration' => $configuration,
        ]);
    }

    public function wizard(ConstructionProject $project, Configuration $configuration): Response
    {
        $customer = Auth::guard('customer')->user();

        if ($project->customer_id !== $customer->id || $configuration->construction_project_id !== $project->id || $configuration->is_locked) {
            abort(403);
        }

        $priceTable = $project->getEffectivePriceTable();
        $categories = \App\Models\Category::orderByRaw("CASE WHEN scope = 'whole_house' THEN 0 ELSE 1 END")
            ->orderBy('order')
            ->with(['items' => function ($query) use ($priceTable) {
                $query->where(function ($q) {
                    $q->whereNull('hidden_until')
                        ->orWhere('hidden_until', '<=', now());
                });
                if ($priceTable) {
                    $query->with(['priceTables' => function ($q) use ($priceTable) {
                        $q->where('price_table_id', $priceTable->id);
                    }]);
                }
            }])
            ->get();

        return Inertia::render('Customer/Configurations/Wizard', [
            'project' => $project->load(['rooms', 'bathrooms']),
            'configuration' => $configuration->load(['configurationItems.item', 'configurationItems.itemVariation']),
            'categories' => $categories,
            'priceTable' => $priceTable,
        ]);
    }

    public function edit(ConstructionProject $project, Configuration $configuration): Response
    {
        return $this->wizard($project, $configuration);
    }

    public function update(UpdateConfigurationRequest $request, ConstructionProject $project, Configuration $configuration): RedirectResponse
    {
        $customer = Auth::guard('customer')->user();

        if ($project->customer_id !== $customer->id || $configuration->construction_project_id !== $project->id || $configuration->is_locked) {
            abort(403);
        }

        DB::transaction(function () use ($request, $configuration) {
            $configuration->update([
                'name' => $request->name,
                'last_position' => $request->last_position,
            ]);

            // Update configuration items
            if ($request->has('items')) {
                $configuration->configurationItems()->delete();
                foreach ($request->items as $itemData) {
                    $configuration->configurationItems()->create([
                        'item_id' => $itemData['item_id'],
                        'item_variation_id' => $itemData['item_variation_id'] ?? null,
                        'quantity' => $itemData['quantity'] ?? null,
                        'project_room_id' => $itemData['project_room_id'] ?? null,
                        'project_bathroom_id' => $itemData['project_bathroom_id'] ?? null,
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', __('translations.configuration_updated'));
    }

    public function lock(ConstructionProject $project, Configuration $configuration): RedirectResponse
    {
        $customer = Auth::guard('customer')->user();

        if ($project->customer_id !== $customer->id || $configuration->construction_project_id !== $project->id) {
            abort(403);
        }

        $configuration->update([
            'is_locked' => true,
            'is_completed' => true,
        ]);

        return redirect()->back()->with('success', __('translations.configuration_locked_success'));
    }

    public function copy(ConstructionProject $project, Configuration $configuration): RedirectResponse
    {
        $customer = Auth::guard('customer')->user();

        if ($project->customer_id !== $customer->id || $configuration->construction_project_id !== $project->id) {
            abort(403);
        }

        DB::transaction(function () use ($configuration) {
            $newConfiguration = $configuration->replicate();
            $newConfiguration->name = $configuration->name.' (Copy)';
            $newConfiguration->is_locked = false;
            $newConfiguration->is_completed = false;
            $newConfiguration->save();

            foreach ($configuration->configurationItems as $item) {
                $newConfiguration->configurationItems()->create($item->toArray());
            }
        });

        return redirect()->back()->with('success', __('translations.configuration_copied'));
    }

    public function destroy(ConstructionProject $project, Configuration $configuration): RedirectResponse
    {
        $customer = Auth::guard('customer')->user();

        if ($project->customer_id !== $customer->id || $configuration->construction_project_id !== $project->id) {
            abort(403);
        }

        $configuration->delete();

        return redirect()->route('configurations.index', $project)
            ->with('success', __('translations.configuration_deleted'));
    }
}

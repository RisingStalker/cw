<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreConstructionProjectRequest;
use App\Http\Requests\Admin\UpdateConstructionProjectRequest;
use App\Models\ConstructionProject;
use App\Models\Customer;
use App\Models\PriceTable;
use App\Models\ProjectBathroom;
use App\Models\ProjectRoom;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConstructionProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $projects = ConstructionProject::query()
            ->with(['customer', 'priceTable', 'manualPriceTable'])
            ->withCount(['rooms', 'bathrooms', 'configurations'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($request->customer_id, function ($query, $customerId) {
                $query->where('customer_id', $customerId);
            })
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/ConstructionProjects/Index', [
            'projects' => $projects,
            'customers' => Customer::select('id', 'name', 'email')->get(),
            'filters' => $request->only(['search', 'customer_id']),
        ]);
    }

    public function create(): Response
    {
        $currentYear = now()->year;
        $defaultPriceTable = PriceTable::where('year', $currentYear)
            ->where('is_active', true)
            ->first();

        return Inertia::render('Admin/ConstructionProjects/Create', [
            'customers' => Customer::select('id', 'name', 'email')->get(),
            'priceTables' => PriceTable::where('is_active', true)->orderBy('year', 'desc')->get(),
            'defaultPriceTableId' => $defaultPriceTable?->id,
        ]);
    }

    public function store(StoreConstructionProjectRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            // Assign price table based on creation year if not manually set
            $priceTableId = $request->manual_price_table_id;
            if (! $priceTableId) {
                $currentYear = now()->year;
                $priceTable = PriceTable::where('year', $currentYear)
                    ->where('is_active', true)
                    ->first();
                $priceTableId = $priceTable?->id;
            }

            $project = ConstructionProject::create([
                'customer_id' => $request->customer_id,
                'name' => $request->name,
                'facade_area' => $request->facade_area,
                'balcony_meters' => $request->balcony_meters,
                'interior_balustrade_meters' => $request->interior_balustrade_meters,
                'price_table_id' => $priceTableId,
                'manual_price_table_id' => $request->manual_price_table_id,
            ]);

            // Create rooms
            foreach ($request->rooms as $roomData) {
                ProjectRoom::create([
                    'construction_project_id' => $project->id,
                    'name' => $roomData['name'],
                    'floor_space' => $roomData['floor_space'],
                    'prohibited_floors' => $roomData['prohibited_floors'] ?? [],
                ]);
            }

            // Create bathrooms
            if (is_array($request->bathrooms)) {
                foreach ($request->bathrooms as $bathroomData) {
                    ProjectBathroom::create([
                        'construction_project_id' => $project->id,
                        'room_number' => $bathroomData['room_number'],
                        'has_toilet' => $bathroomData['has_toilet'] ?? false,
                        'has_shower' => $bathroomData['has_shower'] ?? false,
                        'has_bathtub' => $bathroomData['has_bathtub'] ?? false,
                    ]);
                }
            }
        });

        return redirect()->route('admin.construction-projects.index')
            ->with('success', __('translations.project_created'));
    }

    public function show(ConstructionProject $constructionProject): Response
    {
        $constructionProject->load([
            'customer',
            'priceTable',
            'manualPriceTable',
            'rooms',
            'bathrooms',
            'configurations' => function ($query) {
                $query->withCount('configurationItems');
            },
        ]);

        return Inertia::render('Admin/ConstructionProjects/Show', [
            'project' => $constructionProject,
        ]);
    }

    public function edit(ConstructionProject $constructionProject): Response
    {
        $constructionProject->load(['rooms', 'bathrooms']);

        return Inertia::render('Admin/ConstructionProjects/Edit', [
            'project' => $constructionProject,
            'customers' => Customer::select('id', 'name', 'email')->get(),
            'priceTables' => PriceTable::where('is_active', true)->orderBy('year', 'desc')->get(),
        ]);
    }

    public function update(UpdateConstructionProjectRequest $request, ConstructionProject $constructionProject): RedirectResponse
    {
        DB::transaction(function () use ($request, $constructionProject) {
            $constructionProject->update([
                'customer_id' => $request->customer_id,
                'name' => $request->name,
                'facade_area' => $request->facade_area,
                'balcony_meters' => $request->balcony_meters,
                'interior_balustrade_meters' => $request->interior_balustrade_meters,
                'manual_price_table_id' => $request->manual_price_table_id,
            ]);

            // Update rooms
            $constructionProject->rooms()->delete();
            foreach ($request->rooms as $roomData) {
                ProjectRoom::create([
                    'construction_project_id' => $constructionProject->id,
                    'name' => $roomData['name'],
                    'floor_space' => $roomData['floor_space'],
                    'prohibited_floors' => $roomData['prohibited_floors'] ?? [],
                ]);
            }

            // Update bathrooms
            $constructionProject->bathrooms()->delete();
            if (is_array($request->bathrooms)) {
                foreach ($request->bathrooms as $bathroomData) {
                    ProjectBathroom::create([
                        'construction_project_id' => $constructionProject->id,
                        'room_number' => $bathroomData['room_number'],
                        'has_toilet' => $bathroomData['has_toilet'] ?? false,
                        'has_shower' => $bathroomData['has_shower'] ?? false,
                        'has_bathtub' => $bathroomData['has_bathtub'] ?? false,
                    ]);
                }
            }
        });

        return redirect()->route('admin.construction-projects.index')
            ->with('success', __('translations.project_updated'));
    }

    public function destroy(ConstructionProject $constructionProject): RedirectResponse
    {
        $constructionProject->delete();

        return redirect()->route('admin.construction-projects.index')
            ->with('success', __('translations.project_deleted'));
    }
}

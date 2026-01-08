<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Configuration;
use App\Models\ConstructionProject;
use App\Models\Customer;
use App\Models\Item;
use App\Models\PriceTable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Basic counts
        $stats = [
            'customers' => Customer::count(),
            'projects' => ConstructionProject::count(),
            'items' => Item::count(),
            'categories' => Category::count(),
            'price_tables' => PriceTable::count(),
            'configurations' => Configuration::count(),
            'active_price_tables' => PriceTable::where('is_active', true)->count(),
        ];

        // Items by category (for bar chart)
        $itemsByCategory = Category::withCount('items')
            ->having('items_count', '>', 0)
            ->orderBy('items_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'count' => $category->items_count,
                ];
            });

        // Projects created over time (last 12 months for line chart)
        $projectsOverTime = ConstructionProject::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'count' => $item->count,
                ];
            });

        // Customers created over time (last 12 months for line chart)
        $customersOverTime = Customer::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'count' => $item->count,
                ];
            });

        // Price table distribution (for pie chart)
        $priceTableDistribution = PriceTable::withCount('constructionProjects')
            ->orderBy('year', 'desc')
            ->get()
            ->map(function ($priceTable) {
                return [
                    'name' => $priceTable->year . ($priceTable->is_active ? ' (Active)' : ''),
                    'value' => $priceTable->construction_projects_count,
                    'year' => $priceTable->year,
                ];
            });

        // Category distribution (for pie chart)
        $categoryDistribution = Category::withCount('items')
            ->orderBy('items_count', 'desc')
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'value' => $category->items_count,
                ];
            });

        // Recent customers (for table)
        $recentCustomers = Customer::withCount('constructionProjects')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'projects_count' => $customer->construction_projects_count,
                    'created_at' => $customer->created_at->format('Y-m-d H:i'),
                ];
            });

        // Recent projects (for table)
        $recentProjects = ConstructionProject::with(['customer', 'priceTable'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'customer_name' => $project->customer->name ?? 'N/A',
                    'price_table_year' => $project->priceTable?->year ?? 'N/A',
                    'created_at' => $project->created_at->format('Y-m-d H:i'),
                ];
            });

        // Recent configurations (for table)
        $recentConfigurations = Configuration::with(['constructionProject.customer'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($config) {
                return [
                    'id' => $config->id,
                    'name' => $config->name,
                    'project_name' => $config->constructionProject->name ?? 'N/A',
                    'customer_name' => $config->constructionProject->customer->name ?? 'N/A',
                    'is_locked' => $config->is_locked,
                    'is_completed' => $config->is_completed,
                    'created_at' => $config->created_at->format('Y-m-d H:i'),
                ];
            });

        // Items with most variations
        $itemsWithVariations = Item::withCount('variations')
            ->having('variations_count', '>', 0)
            ->orderBy('variations_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'variations_count' => $item->variations_count,
                ];
            });

        return Inertia::render('Admin/Dashboard/index', [
            'stats' => $stats,
            'itemsByCategory' => $itemsByCategory,
            'projectsOverTime' => $projectsOverTime,
            'customersOverTime' => $customersOverTime,
            'priceTableDistribution' => $priceTableDistribution,
            'categoryDistribution' => $categoryDistribution,
            'recentCustomers' => $recentCustomers,
            'recentProjects' => $recentProjects,
            'recentConfigurations' => $recentConfigurations,
            'itemsWithVariations' => $itemsWithVariations,
        ]);
    }
}


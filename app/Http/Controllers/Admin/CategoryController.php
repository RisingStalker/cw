<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        // Load all categories with their relationships
        $allCategories = Category::with(['parent', 'children'])
            ->withCount('items')
            ->get();

        // Build tree structure: get top-level categories and their nested children
        $categories = $allCategories->whereNull('parent_id')
            ->sortBy('order')
            ->values()
            ->map(function ($category) use ($allCategories) {
                return $this->buildCategoryTree($category, $allCategories);
            });

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Recursively build category tree structure
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
            'items_count' => $category->items_count,
            'parent' => $category->parent ? [
                'id' => $category->parent->id,
                'name' => $category->parent->name,
            ] : null,
            'children' => $children->toArray(),
            'level' => $level,
        ];
    }

    public function create(): Response
    {
        $maxOrder = Category::max('order') ?? 0;
        
        // Build tree structure for parent selection
        $allCategories = Category::with(['parent', 'children'])->get();
        $categoryTree = $allCategories->whereNull('parent_id')
            ->sortBy('order')
            ->values()
            ->map(function ($category) use ($allCategories) {
                return $this->buildCategoryTree($category, $allCategories);
            });

        return Inertia::render('Admin/Categories/Create', [
            'nextOrder' => $maxOrder + 1,
            'parentCategoriesTree' => $categoryTree,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());

        return redirect()->route('admin.categories.index')
            ->with('success', __('translations.category_created'));
    }

    public function edit(Category $category): Response
    {
        // Build tree structure for parent selection, excluding current category and its descendants
        $allCategories = Category::with(['parent', 'children'])
            ->where('id', '!=', $category->id)
            ->get();
        
        // Exclude current category and all its descendants
        $excludeIds = $this->getDescendantIds($category, $allCategories);
        $excludeIds[] = $category->id;
        
        $availableCategories = $allCategories->reject(function ($cat) use ($excludeIds) {
            return in_array($cat->id, $excludeIds);
        });
        
        $categoryTree = $availableCategories->whereNull('parent_id')
            ->sortBy('order')
            ->values()
            ->map(function ($cat) use ($availableCategories) {
                return $this->buildCategoryTree($cat, $availableCategories);
            });

        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'parentCategoriesTree' => $categoryTree,
        ]);
    }

    /**
     * Get all descendant IDs of a category (to prevent circular references)
     */
    private function getDescendantIds(Category $category, $allCategories): array
    {
        $ids = [];
        $children = $allCategories->where('parent_id', $category->id);
        
        foreach ($children as $child) {
            $ids[] = $child->id;
            $ids = array_merge($ids, $this->getDescendantIds($child, $allCategories));
        }
        
        return $ids;
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        return redirect()->route('admin.categories.index')
            ->with('success', __('translations.category_updated'));
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->items()->count() > 0) {
            return redirect()->route('admin.categories.index')
                ->with('error', 'Cannot delete category with items');
        }

        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', __('translations.category_deleted'));
    }

    public function updateOrder(Request $request): RedirectResponse
    {
        $request->validate([
            'categories' => ['required', 'array'],
            'categories.*.id' => ['required', 'exists:categories,id'],
            'categories.*.order' => ['required', 'integer'],
        ]);

        foreach ($request->categories as $categoryData) {
            Category::where('id', $categoryData['id'])
                ->update(['order' => $categoryData['order']]);
        }

        return redirect()->route('admin.categories.index')
            ->with('success', 'Category order updated');
    }
}

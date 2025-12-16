<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCustomerRequest;
use App\Http\Requests\Admin\UpdateCustomerRequest;
use App\Models\Customer;
use App\Notifications\CustomerLoginCredentials;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $customers = Customer::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->withCount('constructionProjects')
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Customers/Create');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $password = Str::password(12);
        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $password,
        ]);

        $customer->notify(new CustomerLoginCredentials($password));

        return redirect()->route('admin.customers.index')
            ->with('success', __('translations.customer_created'));
    }

    public function show(Customer $customer): Response
    {
        $customer->load(['constructionProjects' => function ($query) {
            $query->withCount('configurations');
        }]);

        return Inertia::render('Admin/Customers/Show', [
            'customer' => $customer,
        ]);
    }

    public function edit(Customer $customer): Response
    {
        return Inertia::render('Admin/Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        return redirect()->route('admin.customers.index')
            ->with('success', __('translations.customer_updated'));
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->route('admin.customers.index')
            ->with('success', __('translations.customer_deleted'));
    }
}

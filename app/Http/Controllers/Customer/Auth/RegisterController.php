<?php

namespace App\Http\Controllers\Customer\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerRegistrationRequest;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        // If admin is already logged in, redirect to admin dashboard
        if (Auth::guard('web')->check()) {
            return redirect()->route('admin.dashboard')
                ->with('error', __('translations.unauthorized_access'));
        }

        // If customer is already logged in, redirect to projects
        if (Auth::guard('customer')->check()) {
            return redirect()->route('projects.index');
        }

        return Inertia::render('Customer/Auth/Register');
    }

    public function store(StoreCustomerRegistrationRequest $request): RedirectResponse
    {
        // If admin is already logged in, prevent customer registration
        if (Auth::guard('web')->check()) {
            return redirect()->route('admin.dashboard')
                ->with('error', __('translations.unauthorized_access'));
        }

        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Auth::guard('customer')->login($customer);

        $request->session()->regenerate();

        return redirect()->route('projects.index')
            ->with('success', __('translations.registration_successful'));
    }
}

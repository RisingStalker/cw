<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdminRegistrationRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        // If customer is already logged in, redirect to customer projects
        if (Auth::guard('customer')->check()) {
            return redirect()->route('projects.index')
                ->with('error', __('translations.unauthorized_access'));
        }

        // If admin is already logged in, redirect to admin dashboard
        if (Auth::guard('web')->check()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Auth/Register');
    }

    public function store(StoreAdminRegistrationRequest $request): RedirectResponse
    {
        // If customer is already logged in, prevent admin registration
        if (Auth::guard('customer')->check()) {
            return redirect()->route('projects.index')
                ->with('error', __('translations.unauthorized_access'));
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->route('admin.dashboard')
            ->with('success', __('translations.registration_successful'));
    }
}

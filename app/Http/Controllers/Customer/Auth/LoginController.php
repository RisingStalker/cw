<?php

namespace App\Http\Controllers\Customer\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
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

        return Inertia::render('Customer/Auth/Login');
    }

    public function store(Request $request)
    {
        // If admin is already logged in, prevent customer login
        if (Auth::guard('web')->check()) {
            return redirect()->route('admin.dashboard')
                ->with('error', __('translations.unauthorized_access'));
        }

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::guard('customer')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            return redirect()->intended(route('projects.index'));
        }

        return back()->withErrors([
            'email' => __('translations.invalid_credentials'),
        ])->onlyInput('email');
    }

    public function destroy(Request $request)
    {
        Auth::guard('customer')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}

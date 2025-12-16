<?php

namespace App\Http\Controllers\Admin\Auth;

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
        // If customer is already logged in, redirect to customer projects
        if (Auth::guard('customer')->check()) {
            return redirect()->route('projects.index')
                ->with('error', __('translations.unauthorized_access'));
        }

        // If admin is already logged in, redirect to admin dashboard
        if (Auth::guard('web')->check()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Auth/Login');
    }

    public function store(Request $request)
    {
        // If customer is already logged in, prevent admin login
        if (Auth::guard('customer')->check()) {
            return redirect()->route('projects.index')
                ->with('error', __('translations.unauthorized_access'));
        }

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            return redirect()->intended(route('admin.dashboard'));
        }

        return back()->withErrors([
            'email' => __('translations.invalid_credentials'),
        ])->onlyInput('email');
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}

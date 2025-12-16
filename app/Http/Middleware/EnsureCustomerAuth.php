<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerAuth
{
    /**
     * Handle an incoming request.
     *
     * Ensure that only customer users (authenticated via 'customer' guard) can access customer routes.
     * If an admin is logged in, redirect them to admin pages.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if admin is logged in
        if (Auth::guard('web')->check()) {
            return redirect()->route('admin.dashboard')
                ->with('error', __('translations.unauthorized_access'));
        }

        // Check if customer is logged in
        if (! Auth::guard('customer')->check()) {
            return redirect()->route('login')
                ->with('error', __('translations.please_login'));
        }

        return $next($request);
    }
}

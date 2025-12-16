<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminAuth
{
    /**
     * Handle an incoming request.
     *
     * Ensure that only admin users (authenticated via 'web' guard) can access admin routes.
     * If a customer is logged in, redirect them to customer pages.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if customer is logged in
        if (Auth::guard('customer')->check()) {
            return redirect()->route('projects.index')
                ->with('error', __('translations.unauthorized_access'));
        }

        // Check if admin is logged in
        if (! Auth::guard('web')->check()) {
            return redirect()->route('admin.login')
                ->with('error', __('translations.please_login'));
        }

        return $next($request);
    }
}

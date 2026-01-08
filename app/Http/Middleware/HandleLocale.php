<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class HandleLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $defaultLocale = config('app.locale', 'de');
        $locale = $request->cookie('locale', $defaultLocale);
        
        // Validate locale (only allow 'en' or 'de')
        if (!in_array($locale, ['en', 'de'])) {
            $locale = $defaultLocale;
        }
        
        App::setLocale($locale);

        $response = $next($request);
        
        // Set cookie if it doesn't exist or if it's different from the current locale
        if (!$request->hasCookie('locale') || $request->cookie('locale') !== $locale) {
            $response->cookie('locale', $locale, 365 * 24 * 60, '/', null, false, false);
        }

        return $response;
    }
}



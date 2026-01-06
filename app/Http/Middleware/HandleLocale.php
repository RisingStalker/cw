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
        $locale = $request->cookie('locale', config('app.locale', 'en'));
        
        // Validate locale (only allow 'en' or 'de')
        if (!in_array($locale, ['en', 'de'])) {
            $locale = 'en';
        }
        
        App::setLocale($locale);

        return $next($request);
    }
}


<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public landing page
Route::get('/', function () {
    return Inertia::render('Landing');
})->name('home');

// Customer routes (default - no prefix)
// Customer authentication
Route::get('login', [\App\Http\Controllers\Customer\Auth\LoginController::class, 'create'])->name('login');
Route::post('login', [\App\Http\Controllers\Customer\Auth\LoginController::class, 'store']);
Route::get('register', [\App\Http\Controllers\Customer\Auth\RegisterController::class, 'create'])->name('register');
Route::post('register', [\App\Http\Controllers\Customer\Auth\RegisterController::class, 'store']);
Route::post('logout', [\App\Http\Controllers\Customer\Auth\LoginController::class, 'destroy'])->name('logout');
// Customer password reset
Route::get('forgot-password', [\App\Http\Controllers\Customer\Auth\ForgotPasswordController::class, 'create'])->name('password.request');
Route::post('forgot-password', [\App\Http\Controllers\Customer\Auth\ForgotPasswordController::class, 'store'])->name('password.email');
Route::get('reset-password/{token}', [\App\Http\Controllers\Customer\Auth\ResetPasswordController::class, 'create'])->name('password.reset');
Route::post('reset-password', [\App\Http\Controllers\Customer\Auth\ResetPasswordController::class, 'store'])->name('password.update');

// Customer authenticated routes
Route::middleware(['auth:customer', 'customer'])->group(function () {
    Route::get('projects', [\App\Http\Controllers\Customer\ProjectController::class, 'index'])->name('projects.index');

    Route::prefix('projects/{project}')->group(function () {
        Route::get('configurations', [\App\Http\Controllers\Customer\ConfigurationController::class, 'index'])->name('configurations.index');
        Route::get('configurations/create', [\App\Http\Controllers\Customer\ConfigurationController::class, 'create'])->name('configurations.create');
        Route::post('configurations', [\App\Http\Controllers\Customer\ConfigurationController::class, 'store'])->name('configurations.store');

        Route::prefix('configurations/{configuration}')->group(function () {
            Route::get('wizard', [\App\Http\Controllers\Customer\ConfigurationController::class, 'wizard'])->name('configurations.wizard');
            Route::get('show', [\App\Http\Controllers\Customer\ConfigurationController::class, 'show'])->name('configurations.show');
            Route::put('', [\App\Http\Controllers\Customer\ConfigurationController::class, 'update'])->name('configurations.update');
            Route::post('lock', [\App\Http\Controllers\Customer\ConfigurationController::class, 'lock'])->name('configurations.lock');
            Route::post('copy', [\App\Http\Controllers\Customer\ConfigurationController::class, 'copy'])->name('configurations.copy');
            Route::get('export', [\App\Http\Controllers\Customer\ConfigurationExportController::class, 'export'])->name('configurations.export');
            Route::delete('', [\App\Http\Controllers\Customer\ConfigurationController::class, 'destroy'])->name('configurations.destroy');
        });
    });
});

// Admin routes (with /admin prefix)
// Admin authentication
Route::prefix('admin')->group(function () {
    Route::get('login', [\App\Http\Controllers\Admin\Auth\LoginController::class, 'create'])->name('admin.login');
    Route::post('login', [\App\Http\Controllers\Admin\Auth\LoginController::class, 'store']);
    Route::get('register', [\App\Http\Controllers\Admin\Auth\RegisterController::class, 'create'])->name('admin.register');
    Route::post('register', [\App\Http\Controllers\Admin\Auth\RegisterController::class, 'store']);
    Route::post('logout', [\App\Http\Controllers\Admin\Auth\LoginController::class, 'destroy'])->name('admin.logout');
    // Admin password reset
    Route::get('forgot-password', [\App\Http\Controllers\Admin\Auth\ForgotPasswordController::class, 'create'])->name('admin.password.request');
    Route::post('forgot-password', [\App\Http\Controllers\Admin\Auth\ForgotPasswordController::class, 'store'])->name('admin.password.email');
    Route::get('reset-password/{token}', [\App\Http\Controllers\Admin\Auth\ResetPasswordController::class, 'create'])->name('admin.password.reset');
    Route::post('reset-password', [\App\Http\Controllers\Admin\Auth\ResetPasswordController::class, 'store'])->name('admin.password.update');
});

// Password confirmation route (required by password.confirm middleware)
Route::middleware('auth')->group(function () {
    Route::get('user/confirm-password', function () {
        return Inertia::render('auth/confirm-password');
    })->name('password.confirm');
});

// Admin authenticated routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('admin/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('admin.dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('customers', \App\Http\Controllers\Admin\CustomerController::class);
        Route::resource('construction-projects', \App\Http\Controllers\Admin\ConstructionProjectController::class);
        Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class);
        Route::post('categories/update-order', [\App\Http\Controllers\Admin\CategoryController::class, 'updateOrder'])->name('categories.update-order');
        Route::resource('items', \App\Http\Controllers\Admin\ItemController::class);
        Route::delete('items/{item}/images/{image}', [\App\Http\Controllers\Admin\ItemController::class, 'deleteImage'])->name('items.images.destroy');
        Route::resource('price-tables', \App\Http\Controllers\Admin\PriceTableController::class);
    });
});

require __DIR__.'/settings.php';

<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\ConstructionProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $customer = Auth::guard('customer')->user();

        $projects = ConstructionProject::query()
            ->where('customer_id', $customer->id)
            ->withCount(['rooms', 'bathrooms', 'configurations'])
            ->latest()
            ->get();

        return Inertia::render('Customer/Projects/Index', [
            'projects' => $projects,
        ]);
    }
}

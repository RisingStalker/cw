<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Configuration;
use App\Models\ConstructionProject;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class ConfigurationExportController extends Controller
{
    public function export(ConstructionProject $project, Configuration $configuration)
    {
        $customer = Auth::guard('customer')->user();

        if ($project->customer_id !== $customer->id || $configuration->construction_project_id !== $project->id) {
            abort(403);
        }

        $configuration->load([
            'configurationItems.item.category',
            'configurationItems.itemVariation',
            'configurationItems.projectRoom',
            'configurationItems.projectBathroom',
        ]);

        $totalCost = $configuration->calculateTotalCost();

        $pdf = Pdf::loadView('pdf.configuration', [
            'project' => $project,
            'configuration' => $configuration,
            'totalCost' => $totalCost,
        ]);

        return $pdf->download("configuration-{$configuration->name}-{$project->name}.pdf");
    }
}

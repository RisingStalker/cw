<?php

use App\Models\Category;
use App\Models\Configuration;
use App\Models\ConstructionProject;
use App\Models\Customer;
use App\Models\Item;
use App\Models\PriceTable;
use App\Models\ProjectRoom;

test('customer can view their projects', function () {
    $customer = Customer::factory()->create();
    $project = ConstructionProject::factory()->create(['customer_id' => $customer->id]);

    $response = $this->actingAs($customer, 'customer')
        ->get(route('customer.projects.index'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/Projects/Index')
        ->has('projects', 1)
    );
});

test('customer can create a configuration', function () {
    $customer = Customer::factory()->create();
    $project = ConstructionProject::factory()->create(['customer_id' => $customer->id]);

    $response = $this->actingAs($customer, 'customer')
        ->post(route('customer.configurations.store', ['project' => $project->id]), [
            'name' => 'Test Configuration',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('configurations', [
        'construction_project_id' => $project->id,
        'name' => 'Test Configuration',
    ]);
});

test('customer can view configuration wizard', function () {
    $customer = Customer::factory()->create();
    $project = ConstructionProject::factory()->create(['customer_id' => $customer->id]);
    $priceTable = PriceTable::factory()->create(['year' => now()->year, 'is_active' => true]);
    $project->update(['price_table_id' => $priceTable->id]);

    $category = Category::factory()->create(['order' => 1]);
    $item = Item::factory()->create(['category_id' => $category->id]);
    $configuration = Configuration::factory()->create([
        'construction_project_id' => $project->id,
    ]);

    $response = $this->actingAs($customer, 'customer')
        ->get(route('customer.configurations.wizard', [
            'project' => $project->id,
            'configuration' => $configuration->id,
        ]));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('Customer/Configurations/Wizard')
        ->has('categories', 1)
        ->has('project')
    );
});

test('customer can update configuration with items', function () {
    $customer = Customer::factory()->create();
    $project = ConstructionProject::factory()->create(['customer_id' => $customer->id]);
    $room = ProjectRoom::factory()->create([
        'construction_project_id' => $project->id,
        'floor_space' => 25.5,
    ]);
    $category = Category::factory()->create(['order' => 1]);
    $item = Item::factory()->create([
        'category_id' => $category->id,
        'additional_cost' => 50.00,
    ]);
    $configuration = Configuration::factory()->create([
        'construction_project_id' => $project->id,
    ]);

    $response = $this->actingAs($customer, 'customer')
        ->put(route('customer.configurations.update', [
            'project' => $project->id,
            'configuration' => $configuration->id,
        ]), [
            'items' => [
                [
                    'item_id' => $item->id,
                    'project_room_id' => $room->id,
                    'quantity' => null,
                ],
            ],
        ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('configuration_items', [
        'configuration_id' => $configuration->id,
        'item_id' => $item->id,
        'project_room_id' => $room->id,
    ]);
});

test('customer can lock a configuration', function () {
    $customer = Customer::factory()->create();
    $project = ConstructionProject::factory()->create(['customer_id' => $customer->id]);
    $configuration = Configuration::factory()->create([
        'construction_project_id' => $project->id,
        'is_locked' => false,
    ]);

    $response = $this->actingAs($customer, 'customer')
        ->post(route('customer.configurations.lock', [
            'project' => $project->id,
            'configuration' => $configuration->id,
        ]));

    $response->assertRedirect();
    $this->assertDatabaseHas('configurations', [
        'id' => $configuration->id,
        'is_locked' => true,
    ]);
});

test('customer can copy a configuration', function () {
    $customer = Customer::factory()->create();
    $project = ConstructionProject::factory()->create(['customer_id' => $customer->id]);
    $configuration = Configuration::factory()->create([
        'construction_project_id' => $project->id,
        'name' => 'Original Config',
    ]);

    $response = $this->actingAs($customer, 'customer')
        ->post(route('customer.configurations.copy', [
            'project' => $project->id,
            'configuration' => $configuration->id,
        ]));

    $response->assertRedirect();
    $this->assertDatabaseHas('configurations', [
        'construction_project_id' => $project->id,
        'name' => 'Original Config (Copy)',
    ]);
});

test('customer can export configuration to PDF', function () {
    $customer = Customer::factory()->create();
    $project = ConstructionProject::factory()->create(['customer_id' => $customer->id]);
    $configuration = Configuration::factory()->create([
        'construction_project_id' => $project->id,
    ]);

    $response = $this->actingAs($customer, 'customer')
        ->get(route('customer.configurations.export', [
            'project' => $project->id,
            'configuration' => $configuration->id,
        ]));

    $response->assertSuccessful();
    $response->assertHeader('Content-Type', 'application/pdf');
});

test('customer cannot access other customers projects', function () {
    $customer1 = Customer::factory()->create();
    $customer2 = Customer::factory()->create();
    $project = ConstructionProject::factory()->create(['customer_id' => $customer2->id]);

    $response = $this->actingAs($customer1, 'customer')
        ->get(route('customer.configurations.index', ['project' => $project->id]));

    $response->assertForbidden();
});

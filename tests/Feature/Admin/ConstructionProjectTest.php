<?php

use App\Models\ConstructionProject;
use App\Models\Customer;
use App\Models\PriceTable;
use App\Models\User;

test('admin can view construction projects', function () {
    $user = User::factory()->create();
    ConstructionProject::factory()->count(3)->create();

    $response = $this->actingAs($user)->get(route('admin.construction-projects.index'));

    $response->assertSuccessful();
});

test('admin can create a construction project', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $priceTable = PriceTable::factory()->create(['year' => now()->year]);

    $response = $this->actingAs($user)->post(route('admin.construction-projects.store'), [
        'customer_id' => $customer->id,
        'name' => 'Test Project',
        'facade_area' => 100.5,
        'balcony_meters' => 25.0,
        'interior_balustrade_meters' => 50.0,
        'rooms' => [
            ['name' => 'Living Room', 'floor_space' => 30.5, 'prohibited_floors' => []],
        ],
        'bathrooms' => [
            ['room_number' => 1, 'has_toilet' => true, 'has_shower' => true, 'has_bathtub' => false],
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('construction_projects', [
        'customer_id' => $customer->id,
        'name' => 'Test Project',
        'facade_area' => 100.5,
    ]);
    $this->assertDatabaseHas('project_rooms', [
        'name' => 'Living Room',
        'floor_space' => 30.5,
    ]);
    $this->assertDatabaseHas('project_bathrooms', [
        'room_number' => 1,
        'has_toilet' => true,
    ]);
});

test('admin can update a construction project', function () {
    $user = User::factory()->create();
    $project = ConstructionProject::factory()->create();

    $response = $this->actingAs($user)->put(route('admin.construction-projects.update', $project), [
        'customer_id' => $project->customer_id,
        'name' => 'Updated Project Name',
        'facade_area' => $project->facade_area,
        'balcony_meters' => $project->balcony_meters,
        'interior_balustrade_meters' => $project->interior_balustrade_meters,
        'rooms' => [],
        'bathrooms' => [],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('construction_projects', [
        'id' => $project->id,
        'name' => 'Updated Project Name',
    ]);
});

test('admin can delete a construction project', function () {
    $user = User::factory()->create();
    $project = ConstructionProject::factory()->create();

    $response = $this->actingAs($user)->delete(route('admin.construction-projects.destroy', $project));

    $response->assertRedirect();
    $this->assertDatabaseMissing('construction_projects', [
        'id' => $project->id,
    ]);
});

test('construction project gets price table assigned based on creation year', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $priceTable = PriceTable::factory()->create(['year' => now()->year, 'is_active' => true]);

    $response = $this->actingAs($user)->post(route('admin.construction-projects.store'), [
        'customer_id' => $customer->id,
        'name' => 'Test Project',
        'facade_area' => 100.5,
        'balcony_meters' => 25.0,
        'interior_balustrade_meters' => 50.0,
        'rooms' => [],
        'bathrooms' => [],
    ]);

    $response->assertRedirect();
    $project = ConstructionProject::where('name', 'Test Project')->first();
    expect($project->price_table_id)->toBe($priceTable->id);
});

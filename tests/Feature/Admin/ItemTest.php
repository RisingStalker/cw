<?php

use App\Models\Category;
use App\Models\Item;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('admin can view items', function () {
    $user = User::factory()->create();
    Item::factory()->count(3)->create();

    $response = $this->actingAs($user)->get(route('admin.items.index'));

    $response->assertSuccessful();
});

test('admin can create an item', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.items.store'), [
        'category_id' => $category->id,
        'title' => 'Test Item',
        'description' => 'Test Description',
        'additional_cost' => 150.00,
        'requires_quantity' => false,
        'consultation_required' => false,
        'is_standard' => false,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('items', [
        'category_id' => $category->id,
        'title' => 'Test Item',
        'additional_cost' => 150.00,
    ]);
});

test('admin can create an item with image', function () {
    Storage::fake('public');
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $image = UploadedFile::fake()->image('item.jpg');

    $response = $this->actingAs($user)->post(route('admin.items.store'), [
        'category_id' => $category->id,
        'title' => 'Test Item with Image',
        'description' => 'Test Description',
        'additional_cost' => 150.00,
        'requires_quantity' => false,
        'consultation_required' => false,
        'is_standard' => false,
        'images' => [$image],
    ]);

    $response->assertRedirect();
    $item = Item::where('title', 'Test Item with Image')->first();
    expect($item->images)->toHaveCount(1);
});

test('admin can update an item', function () {
    $user = User::factory()->create();
    $item = Item::factory()->create();

    $response = $this->actingAs($user)->put(route('admin.items.update', $item), [
        'category_id' => $item->category_id,
        'title' => 'Updated Item Title',
        'description' => $item->description,
        'additional_cost' => $item->additional_cost,
        'requires_quantity' => $item->requires_quantity,
        'consultation_required' => $item->consultation_required,
        'is_standard' => $item->is_standard,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('items', [
        'id' => $item->id,
        'title' => 'Updated Item Title',
    ]);
});

test('admin can delete an item', function () {
    $user = User::factory()->create();
    $item = Item::factory()->create();

    $response = $this->actingAs($user)->delete(route('admin.items.destroy', $item));

    $response->assertRedirect();
    $this->assertDatabaseMissing('items', [
        'id' => $item->id,
    ]);
});

test('item can be hidden until a future date', function () {
    $user = User::factory()->create();
    $category = Category::factory()->create();
    $futureDate = now()->addMonths(3)->format('Y-m-d');

    $response = $this->actingAs($user)->post(route('admin.items.store'), [
        'category_id' => $category->id,
        'title' => 'Future Item',
        'description' => 'Test Description',
        'additional_cost' => 150.00,
        'requires_quantity' => false,
        'consultation_required' => false,
        'is_standard' => false,
        'hidden_until' => $futureDate,
    ]);

    $response->assertRedirect();
    $item = Item::where('title', 'Future Item')->first();
    expect($item->hidden_until->format('Y-m-d'))->toBe($futureDate);
});

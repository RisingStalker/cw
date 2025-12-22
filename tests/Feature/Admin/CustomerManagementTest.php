<?php

use App\Models\Customer;
use App\Models\User;
use App\Notifications\CustomerLoginCredentials;
use Illuminate\Support\Facades\Notification;

test('admin can create a customer', function () {
    $admin = User::factory()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.customers.store'), [
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

    $response->assertRedirect(route('admin.customers.index'));

    $this->assertDatabaseHas('customers', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);
});

test('sends email notification when customer is created', function () {
    Notification::fake();

    $admin = User::factory()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.customers.store'), [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
        ]);

    $customer = Customer::where('email', 'jane@example.com')->first();

    Notification::assertSentTo(
        $customer,
        CustomerLoginCredentials::class,
        function ($notification) {
            return ! empty($notification->password);
        }
    );
});

test('customer receives password in email notification', function () {
    Notification::fake();

    $admin = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.customers.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $customer = Customer::where('email', 'test@example.com')->first();

    Notification::assertSentTo(
        $customer,
        CustomerLoginCredentials::class,
        function ($notification) use ($customer) {
            $mailData = $notification->toMail($customer);

            return $mailData->subject === __('translations.account_registered')
                && str_contains($mailData->introLines[0], __('translations.account_registered_message'))
                && str_contains($mailData->introLines[1], $customer->email)
                && str_contains($mailData->introLines[2], $notification->password);
        }
    );
});

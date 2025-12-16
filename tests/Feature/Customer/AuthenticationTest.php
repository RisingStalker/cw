<?php

use App\Models\Customer;

test('customer login screen can be rendered', function () {
    $response = $this->get(route('customer.login'));

    $response->assertSuccessful();
});

test('customers can authenticate using the login screen', function () {
    $customer = Customer::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $response = $this->post(route('customer.login'), [
        'email' => $customer->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated('customer');
    $response->assertRedirect(route('customer.projects.index', absolute: false));
});

test('customers can not authenticate with invalid password', function () {
    $customer = Customer::factory()->create([
        'password' => bcrypt('password'),
    ]);

    $this->post(route('customer.login'), [
        'email' => $customer->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest('customer');
});

test('customers can logout', function () {
    $customer = Customer::factory()->create();

    $response = $this->actingAs($customer, 'customer')->post(route('customer.logout'));

    $this->assertGuest('customer');
    $response->assertRedirect(route('customer.login', absolute: false));
});

test('unauthenticated customers cannot access protected routes', function () {
    $response = $this->get(route('customer.projects.index'));

    $response->assertRedirect(route('customer.login', absolute: false));
});

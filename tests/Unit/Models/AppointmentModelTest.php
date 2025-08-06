<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\User;
use App\Models\Service;
use App\Models\Appointment;
use App\Models\ServiceCategory;
use App\Models\ProviderProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AppointmentModelTest extends TestCase
{
    use RefreshDatabase;

    protected $client;
    protected $provider;
    protected $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = User::create([
            'first_name' => 'John',
            'last_name' => 'Client',
            'email' => 'client@example.com',
            'password' => Hash::make('password'),
            'role' => 'client'
        ]);

        $this->provider = User::create([
            'first_name' => 'Jane',
            'last_name' => 'Provider',
            'email' => 'provider@example.com',
            'password' => Hash::make('password'),
            'role' => 'service_provider'
        ]);

        ProviderProfile::create([
            'user_id' => $this->provider->id,
            'business_name' => 'Test Service Business',
            'years_of_experience' => 5,
            'service_area_radius' => 10,
            'verification_status' => 'verified'
        ]);

        $category = ServiceCategory::create([
            'name' => 'Cleaning',
            'description' => 'Cleaning services',
            'icon' => 'fas fa-broom'
        ]);

        $this->service = Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $category->id,
            'title' => 'Home Cleaning',
            'description' => 'Professional home cleaning',
            'pricing_type' => 'hourly',
            'base_price' => 2500.00,
            'duration_hours' => 2,
            'is_active' => true
        ]);
    }

    /** @test */
    public function it_creates_appointment_with_correct_attributes()
    {
        $appointment = Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '14:00:00',
            'duration_hours' => 2,
            'total_price' => 5000.00,
            'status' => 'pending',
            'client_address' => '456 Service Lane, Kandy'
        ]);

        $this->assertInstanceOf(Appointment::class, $appointment);
        $this->assertEquals('pending', $appointment->status);
        $this->assertEquals(5000.00, $appointment->total_price);
        $this->assertEquals(2, $appointment->duration_hours);
    }

    /** @test */
    public function it_correctly_identifies_appointment_status_states()
    {
        $appointment = Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '14:00:00',
            'status' => 'pending'
        ]);
        
        $this->assertTrue($appointment->isPending());
        $this->assertFalse($appointment->isConfirmed());
        $this->assertFalse($appointment->isCompleted());
        $this->assertFalse($appointment->isCancelled());
    }

    /** @test */
    public function it_can_confirm_pending_appointments()
    {
        $appointment = Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '14:00:00',
            'status' => 'pending'
        ]);
        
        $this->assertTrue($appointment->canBeConfirmed());
        
        $appointment->confirm();
        
        $this->assertEquals('confirmed', $appointment->status);
        $this->assertNotNull($appointment->confirmed_at);
        $this->assertTrue($appointment->isConfirmed());
    }

    /** @test */
    public function it_can_cancel_appropriate_appointments()
    {
        $appointment = Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '14:00:00',
            'status' => 'confirmed'
        ]);
        
        $this->assertTrue($appointment->canBeCancelled());
        
        $appointment->cancel('client', 'Change of plans');
        
        $this->assertEquals('cancelled_by_client', $appointment->status);
        $this->assertEquals('Change of plans', $appointment->cancellation_reason);
        $this->assertNotNull($appointment->cancelled_at);
    }

    /** @test */
    public function it_formats_appointment_datetime_correctly()
    {
        $appointment = Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => '2024-12-25',
            'appointment_time' => '14:30:00'
        ]);

        $expectedDateTime = Carbon::parse('2024-12-25 14:30:00');
        $this->assertEquals($expectedDateTime, $appointment->full_appointment_date_time);
    }

    /** @test */
    public function it_marks_appointment_as_expired_correctly()
    {
        $appointment = Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '14:00:00',
            'status' => 'pending'
        ]);
        
        $appointment->markAsExpired('Auto-expired due to provider non-response');
        
        $this->assertEquals('expired', $appointment->status);
        $this->assertTrue($appointment->auto_expired);
        $this->assertEquals('Auto-expired due to provider non-response', $appointment->cancellation_reason);
        $this->assertNotNull($appointment->cancelled_at);
    }

    /** @test */
    public function it_has_correct_relationships()
    {
        $appointment = Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '14:00:00',
            'status' => 'pending'
        ]);

        $this->assertEquals($this->client->id, $appointment->client->id);
        $this->assertEquals($this->provider->id, $appointment->provider->id);
        $this->assertEquals($this->service->id, $appointment->service->id);
    }

    /** @test */
    public function it_calculates_status_text_correctly()
    {
        $appointment = Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '14:00:00',
            'status' => 'pending'
        ]);

        $this->assertEquals('Pending', $appointment->status_text);

        $appointment->update(['status' => 'confirmed']);
        $this->assertEquals('Confirmed', $appointment->fresh()->status_text);
    }
}
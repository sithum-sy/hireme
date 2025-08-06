<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Models\User;
use App\Models\Service;
use App\Models\Appointment;
use App\Models\ServiceCategory;
use App\Models\ProviderProfile;
use App\Services\AppointmentService;
use App\Services\AvailabilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Mockery;

class AppointmentServiceTest extends TestCase
{
    use RefreshDatabase;

    private $appointmentService;
    private $availabilityService;
    private $client;
    private $provider;
    private $service;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->availabilityService = Mockery::mock(AvailabilityService::class);
        $this->appointmentService = new AppointmentService($this->availabilityService);

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
    public function it_creates_direct_appointment_successfully()
    {
        // Mock availability check to return available
        $this->availabilityService
            ->shouldReceive('isAvailableAt')
            ->once()
            ->andReturn(['available' => true]);

        $bookingData = [
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '10:00:00',
            'duration_hours' => 2,
            'client_address' => '123 Test Street',
            'client_notes' => 'Please call before arriving',
            'request_quote' => false
        ];

        $result = $this->appointmentService->createBooking($this->client, $bookingData);

        $this->assertEquals('appointment', $result['type']);
        $this->assertInstanceOf(Appointment::class, $result['data']);
        $this->assertEquals('pending', $result['data']->status);
        $this->assertEquals($this->client->id, $result['data']->client_id);
        $this->assertEquals($this->provider->id, $result['data']->provider_id);
    }

    /** @test */
    public function it_creates_quote_request_instead_of_direct_appointment()
    {
        $bookingData = [
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'requirements' => 'Need custom pricing for bulk service',
            'request_quote' => true
        ];

        $result = $this->appointmentService->createBooking($this->client, $bookingData);

        $this->assertEquals('quote_request', $result['type']);
        $this->assertInstanceOf(\App\Models\Quote::class, $result['data']);
        $this->assertEquals('pending', $result['data']->status);
    }

    /** @test */
    public function it_confirms_pending_appointments()
    {
        $appointment = Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '10:00:00',
            'status' => 'pending'
        ]);

        $result = $this->appointmentService->respondToAppointment(
            $this->provider, 
            $appointment, 
            'confirm',
            ['provider_notes' => 'Looking forward to the service']
        );

        $this->assertEquals('confirmed', $result->status);
        $this->assertEquals('Looking forward to the service', $result->provider_notes);
        $this->assertNotNull($result->confirmed_at);
    }

    /** @test */
    public function it_rejects_pending_appointments()
    {
        $appointment = Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '10:00:00',
            'status' => 'pending'
        ]);

        $result = $this->appointmentService->respondToAppointment(
            $this->provider, 
            $appointment, 
            'reject',
            ['provider_notes' => 'Not available at that time']
        );

        $this->assertEquals('rejected', $result->status);
        $this->assertEquals('Not available at that time', $result->provider_notes);
    }

    /** @test */
    public function it_prevents_unauthorized_appointment_responses()
    {
        $otherProvider = User::create([
            'first_name' => 'Other',
            'last_name' => 'Provider',
            'email' => 'other@example.com',
            'password' => Hash::make('password'),
            'role' => 'service_provider'
        ]);

        $appointment = Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '10:00:00',
            'status' => 'pending'
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('You can only respond to your own appointment requests');

        $this->appointmentService->respondToAppointment(
            $otherProvider, 
            $appointment, 
            'confirm'
        );
    }

    /** @test */
    public function it_filters_appointments_by_status()
    {
        Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '10:00:00',
            'status' => 'pending'
        ]);

        Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDays(2)->format('Y-m-d'),
            'appointment_time' => '14:00:00',
            'status' => 'confirmed'
        ]);

        $pendingQuery = $this->appointmentService->getAppointments($this->provider, ['status' => 'pending']);
        $confirmedQuery = $this->appointmentService->getAppointments($this->provider, ['status' => 'confirmed']);

        $this->assertEquals(1, $pendingQuery->count());
        $this->assertEquals(1, $confirmedQuery->count());
        
        $this->assertEquals('pending', $pendingQuery->first()->status);
        $this->assertEquals('confirmed', $confirmedQuery->first()->status);
    }

    /** @test */
    public function it_filters_appointments_by_date_range()
    {
        $today = now();
        $tomorrow = now()->addDay();
        $nextWeek = now()->addWeek();

        Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => $today->format('Y-m-d'),
            'appointment_time' => '10:00:00',
            'status' => 'confirmed'
        ]);

        Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => $nextWeek->format('Y-m-d'),
            'appointment_time' => '14:00:00',
            'status' => 'confirmed'
        ]);

        $todayQuery = $this->appointmentService->getAppointments($this->provider, [
            'start_date' => $today->format('Y-m-d'),
            'end_date' => $tomorrow->format('Y-m-d')
        ]);

        $this->assertEquals(1, $todayQuery->count());
    }

    /** @test */
    public function it_gets_appointment_statistics()
    {
        // Create appointments with different statuses
        Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->format('Y-m-d'),
            'appointment_time' => '10:00:00',
            'status' => 'pending'
        ]);

        Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'appointment_time' => '14:00:00',
            'status' => 'confirmed'
        ]);

        Appointment::create([
            'client_id' => $this->client->id,
            'provider_id' => $this->provider->id,
            'service_id' => $this->service->id,
            'appointment_date' => now()->subDay()->format('Y-m-d'),
            'appointment_time' => '16:00:00',
            'status' => 'completed',
            'total_price' => 5000.00
        ]);

        $stats = $this->appointmentService->getAppointmentStatistics($this->provider);

        $this->assertEquals(3, $stats['total_appointments']);
        $this->assertEquals(1, $stats['pending_appointments']);
        $this->assertEquals(1, $stats['confirmed_appointments']);
        $this->assertEquals(1, $stats['completed_appointments']);
        $this->assertEquals(5000.00, $stats['total_earnings']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
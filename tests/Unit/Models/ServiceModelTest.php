<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\User;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ProviderProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class ServiceModelTest extends TestCase
{
    use RefreshDatabase;

    protected $provider;
    protected $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->provider = User::create([
            'first_name' => 'Provider',
            'last_name' => 'User',
            'email' => 'provider@example.com',
            'password' => Hash::make('password'),
            'role' => 'service_provider'
        ]);

        ProviderProfile::create([
            'user_id' => $this->provider->id,
            'business_name' => 'Test Business',
            'years_of_experience' => 5,
            'service_area_radius' => 10,
            'verification_status' => 'verified'
        ]);

        $this->category = ServiceCategory::create([
            'name' => 'Cleaning',
            'description' => 'Cleaning services',
            'icon' => 'fas fa-broom'
        ]);
    }

    /** @test */
    public function it_creates_service_with_geographic_data()
    {
        $service = Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Home Cleaning Service',
            'description' => 'Professional home cleaning with eco-friendly products',
            'pricing_type' => 'hourly',
            'base_price' => 2500.00,
            'duration_hours' => 3,
            'latitude' => 6.9271,  // Colombo coordinates
            'longitude' => 79.8612,
            'service_radius' => 15, // 15km radius
            'is_active' => true
        ]);

        $this->assertInstanceOf(Service::class, $service);
        $this->assertEquals('Home Cleaning Service', $service->title);
        $this->assertEquals(2500.00, $service->base_price);
        $this->assertEquals(6.9271, $service->latitude);
        $this->assertEquals(79.8612, $service->longitude);
    }

    /** @test */
    public function it_formats_price_correctly_based_on_pricing_type()
    {
        $hourlyService = Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Hourly Service',
            'pricing_type' => 'hourly',
            'base_price' => 1500.00
        ]);

        $fixedService = Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Fixed Service',
            'pricing_type' => 'fixed',
            'base_price' => 5000.00
        ]);

        $customService = Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Custom Service',
            'pricing_type' => 'custom',
            'base_price' => 0
        ]);

        $this->assertEquals('Rs. 1,500.00/hour', $hourlyService->formatted_price);
        $this->assertEquals('Rs. 5,000.00', $fixedService->formatted_price);
        $this->assertEquals('Custom pricing', $customService->formatted_price);
    }

    /** @test */
    public function it_determines_location_coverage_correctly()
    {
        $service = Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Location Test Service',
            'latitude' => 6.9271,   // Colombo Fort
            'longitude' => 79.8612,
            'service_radius' => 10  // 10km radius
        ]);

        // Location within radius (Colombo 03 - approximately 3km away)
        $withinRadius = $service->coversLocation(6.9147, 79.8744);
        
        // Location outside radius (Kandy - approximately 116km away)
        $outsideRadius = $service->coversLocation(7.2906, 80.6337);

        $this->assertTrue($withinRadius);
        $this->assertFalse($outsideRadius);
    }

    /** @test */
    public function it_increments_view_and_booking_counts()
    {
        $service = Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Counter Test Service',
            'views_count' => 5,
            'bookings_count' => 2
        ]);

        $service->incrementViews();
        $service->incrementBookings();

        $this->assertEquals(6, $service->fresh()->views_count);
        $this->assertEquals(3, $service->fresh()->bookings_count);
    }

    /** @test */
    public function it_handles_service_images_correctly()
    {
        $service = Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Image Test Service',
            'service_images' => ['images/services/service1.jpg', 'images/services/service2.png']
        ]);

        $imageUrls = $service->service_image_urls;

        $this->assertIsArray($imageUrls);
        $this->assertCount(2, $imageUrls);
    }

    /** @test */
    public function it_filters_active_services_correctly()
    {
        Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Active Service 1',
            'is_active' => true
        ]);

        Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Inactive Service',
            'is_active' => false
        ]);

        Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Active Service 2',
            'is_active' => true
        ]);

        $activeServices = Service::active()->get();

        $this->assertCount(2, $activeServices);
        $this->assertTrue($activeServices->every(fn($service) => $service->is_active));
    }

    /** @test */
    public function it_has_correct_relationships()
    {
        $service = Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Relationship Test Service'
        ]);

        $this->assertEquals($this->provider->id, $service->provider->id);
        $this->assertEquals($this->category->id, $service->category->id);
        $this->assertInstanceOf(User::class, $service->provider);
        $this->assertInstanceOf(ServiceCategory::class, $service->category);
    }

    /** @test */
    public function it_syncs_booking_count_with_actual_appointments()
    {
        $service = Service::create([
            'provider_id' => $this->provider->id,
            'category_id' => $this->category->id,
            'title' => 'Sync Test Service',
            'bookings_count' => 5 // Incorrect count
        ]);

        // Simulate having 3 confirmed/completed appointments
        // This would normally be done through the actual appointment relationship
        
        $actualCount = $service->syncBookingCount();
        
        // Since we don't have actual appointments in this test, it should sync to 0
        $this->assertEquals(0, $actualCount);
        $this->assertEquals(0, $service->fresh()->bookings_count);
    }
}
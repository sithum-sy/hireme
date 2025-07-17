<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ProviderProfile;
use App\Models\ServiceCategory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ServiceProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Sri Lankan locations with coordinates
        $locations = [
            'Negombo' => ['lat' => 7.2084, 'lng' => 79.8358],
            'Wennappuwa' => ['lat' => 7.3667, 'lng' => 79.8500],
            'Ja-Ela' => ['lat' => 7.0742, 'lng' => 79.8919],
            'Bambalapitiya' => ['lat' => 6.8905, 'lng' => 79.8565],
            'Wattala' => ['lat' => 6.9897, 'lng' => 79.8664],
            'Seeduwa' => ['lat' => 7.1167, 'lng' => 79.8833],
            'Katunayake' => ['lat' => 7.1697, 'lng' => 79.8847],
            'Kelaniya' => ['lat' => 6.9553, 'lng' => 79.9217],
            'Maharagama' => ['lat' => 6.8467, 'lng' => 79.9269],
            'Mount Lavinia' => ['lat' => 6.8389, 'lng' => 79.8653]
        ];

        // Service providers data
        $providers = [
            // Home Cleaning
            [
                'first_name' => 'Kamala',
                'last_name' => 'Perera',
                'email' => 'kamala.perera@email.com',
                'contact_number' => '+94771234567',
                'address' => 'Main Street, Negombo',
                'location' => 'Negombo',
                'business_name' => 'Kamala\'s Cleaning Services',
                'category' => 'Home Cleaning',
                'bio' => 'Professional house cleaning with 8 years of experience. Specializing in deep cleaning and eco-friendly products.',
                'years_of_experience' => 8,
                'service_area_radius' => 15
            ],
            [
                'first_name' => 'Nimal',
                'last_name' => 'Silva',
                'email' => 'nimal.silva@email.com',
                'contact_number' => '+94771234568',
                'address' => 'Church Road, Wennappuwa',
                'location' => 'Wennappuwa',
                'business_name' => 'Silva Home Care',
                'category' => 'Home Cleaning',
                'bio' => 'Reliable cleaning services for homes and offices. We use safe, non-toxic cleaning products.',
                'years_of_experience' => 5,
                'service_area_radius' => 10
            ],

            // Plumbing Services
            [
                'first_name' => 'Sunil',
                'last_name' => 'Fernando',
                'email' => 'sunil.fernando@email.com',
                'contact_number' => '+94771234569',
                'address' => 'Station Road, Ja-Ela',
                'location' => 'Ja-Ela',
                'business_name' => 'Fernando Plumbing Solutions',
                'category' => 'Plumbing Services',
                'bio' => 'Licensed plumber with 12 years experience. Available for emergency repairs 24/7.',
                'years_of_experience' => 12,
                'service_area_radius' => 20
            ],
            [
                'first_name' => 'Ravi',
                'last_name' => 'Jayasuriya',
                'email' => 'ravi.jayasuriya@email.com',
                'contact_number' => '+94771234570',
                'address' => 'Galle Road, Bambalapitiya',
                'location' => 'Bambalapitiya',
                'business_name' => 'Ravi\'s Pipe Works',
                'category' => 'Plumbing Services',
                'bio' => 'Expert in modern plumbing systems, water heater installations, and pipe repairs.',
                'years_of_experience' => 9,
                'service_area_radius' => 12
            ],

            // Electrical Services
            [
                'first_name' => 'Prasad',
                'last_name' => 'Wickramasinghe',
                'email' => 'prasad.wickrama@email.com',
                'contact_number' => '+94771234571',
                'address' => 'Negombo Road, Wattala',
                'location' => 'Wattala',
                'business_name' => 'Prasad Electrical Works',
                'category' => 'Electrical Services',
                'bio' => 'Certified electrician specializing in house wiring, solar installations, and electrical repairs.',
                'years_of_experience' => 15,
                'service_area_radius' => 18
            ],

            // Gardening & Landscaping
            [
                'first_name' => 'Anura',
                'last_name' => 'Gunasekara',
                'email' => 'anura.gunasekara@email.com',
                'contact_number' => '+94771234572',
                'address' => 'Airport Road, Seeduwa',
                'location' => 'Seeduwa',
                'business_name' => 'Green Thumb Landscaping',
                'category' => 'Gardening & Landscaping',
                'bio' => 'Creating beautiful gardens and maintaining lawns. Expert in tropical plants and irrigation systems.',
                'years_of_experience' => 7,
                'service_area_radius' => 14
            ],

            // Pet Care
            [
                'first_name' => 'Sandya',
                'last_name' => 'Rathnayake',
                'email' => 'sandya.rathnayake@email.com',
                'contact_number' => '+94771234573',
                'address' => 'Temple Road, Kelaniya',
                'location' => 'Kelaniya',
                'business_name' => 'Loving Paws Pet Care',
                'category' => 'Pet Care',
                'bio' => 'Professional pet sitter and dog walker. Certified in pet first aid and animal behavior.',
                'years_of_experience' => 4,
                'service_area_radius' => 8
            ],

            // Handyman Services
            [
                'first_name' => 'Rohan',
                'last_name' => 'Mendis',
                'email' => 'rohan.mendis@email.com',
                'contact_number' => '+94771234574',
                'address' => 'High Level Road, Maharagama',
                'location' => 'Maharagama',
                'business_name' => 'Fix-It-All Services',
                'category' => 'Handyman Services',
                'bio' => 'Skilled handyman for all your home repair needs. Furniture assembly, mounting, and general repairs.',
                'years_of_experience' => 10,
                'service_area_radius' => 16
            ],

            // Moving & Packing
            [
                'first_name' => 'Tilak',
                'last_name' => 'Bandara',
                'email' => 'tilak.bandara@email.com',
                'contact_number' => '+94771234575',
                'address' => 'Dehiwala Road, Mount Lavinia',
                'location' => 'Mount Lavinia',
                'business_name' => 'Swift Move Services',
                'category' => 'Moving & Packing',
                'bio' => 'Professional moving and packing services. Careful handling of household items and furniture.',
                'years_of_experience' => 6,
                'service_area_radius' => 25
            ],

            // Painting & Decorating
            [
                'first_name' => 'Chaminda',
                'last_name' => 'Kumara',
                'email' => 'chaminda.kumara@email.com',
                'contact_number' => '+94771234576',
                'address' => 'Kandy Road, Katunayake',
                'location' => 'Katunayake',
                'business_name' => 'Color Master Painting',
                'category' => 'Painting & Decorating',
                'bio' => 'Interior and exterior painting specialist. Quality workmanship with premium paints and finishes.',
                'years_of_experience' => 11,
                'service_area_radius' => 13
            ],

            // Appliance Repair
            [
                'first_name' => 'Madhuka',
                'last_name' => 'Rajapaksha',
                'email' => 'madhuka.rajapaksha@email.com',
                'contact_number' => '+94771234577',
                'address' => 'Baseline Road, Negombo',
                'location' => 'Negombo',
                'business_name' => 'Home Appliance Doctor',
                'category' => 'Appliance Repair',
                'bio' => 'Certified technician for all major appliance brands. Quick diagnosis and reliable repairs.',
                'years_of_experience' => 8,
                'service_area_radius' => 12
            ],

            // Laundry & Ironing
            [
                'first_name' => 'Mala',
                'last_name' => 'Wijesinghe',
                'email' => 'mala.wijesinghe@email.com',
                'contact_number' => '+94771234578',
                'address' => 'Market Street, Wennappuwa',
                'location' => 'Wennappuwa',
                'business_name' => 'Fresh & Clean Laundry',
                'category' => 'Laundry & Ironing',
                'bio' => 'Professional laundry and ironing services. Pickup and delivery available for busy families.',
                'years_of_experience' => 5,
                'service_area_radius' => 10
            ],

            // Grocery & Errands
            [
                'first_name' => 'Ajith',
                'last_name' => 'Dissanayake',
                'email' => 'ajith.dissanayake@email.com',
                'contact_number' => '+94771234579',
                'address' => 'Commercial Street, Ja-Ela',
                'location' => 'Ja-Ela',
                'business_name' => 'Quick Errands Service',
                'category' => 'Grocery & Errands',
                'bio' => 'Reliable errand running service. Grocery shopping, pharmacy visits, and bill payments.',
                'years_of_experience' => 3,
                'service_area_radius' => 8
            ],

            // Cooking & Meal Prep
            [
                'first_name' => 'Shirani',
                'last_name' => 'Kodithuwakku',
                'email' => 'shirani.kodithuwakku@email.com',
                'contact_number' => '+94771234580',
                'address' => 'Marine Drive, Bambalapitiya',
                'location' => 'Bambalapitiya',
                'business_name' => 'Home Chef Shirani',
                'category' => 'Cooking & Meal Prep',
                'bio' => 'Experienced home chef specializing in Sri Lankan and international cuisine. Meal prep and catering.',
                'years_of_experience' => 12,
                'service_area_radius' => 15
            ],

            // Organization & Decluttering
            [
                'first_name' => 'Priyanka',
                'last_name' => 'Senanayake',
                'email' => 'priyanka.senanayake@email.com',
                'contact_number' => '+94771234581',
                'address' => 'Borella Road, Wattala',
                'location' => 'Wattala',
                'business_name' => 'Organized Living Solutions',
                'category' => 'Organization & Decluttering',
                'bio' => 'Professional organizer helping families create clutter-free, functional living spaces.',
                'years_of_experience' => 4,
                'service_area_radius' => 12
            ],

            // Window & Gutter Cleaning
            [
                'first_name' => 'Jagath',
                'last_name' => 'Seneviratne',
                'email' => 'jagath.seneviratne@email.com',
                'contact_number' => '+94771234582',
                'address' => 'Old Negombo Road, Seeduwa',
                'location' => 'Seeduwa',
                'business_name' => 'Crystal Clear Window Service',
                'category' => 'Window & Gutter Cleaning',
                'bio' => 'Professional window and gutter cleaning for residential and commercial properties.',
                'years_of_experience' => 7,
                'service_area_radius' => 14
            ]
        ];

        foreach ($providers as $providerData) {
            // Create user
            $user = User::create([
                'first_name' => $providerData['first_name'],
                'last_name' => $providerData['last_name'],
                'email' => $providerData['email'],
                'password' => Hash::make('password123'),
                'role' => User::ROLE_SERVICE_PROVIDER,
                'date_of_birth' => fake()->dateTimeBetween('-50 years', '-25 years'),
                'address' => $providerData['address'],
                'contact_number' => $providerData['contact_number'],
                'is_active' => true,
                'email_verified_at' => now(),
                'last_login_at' => fake()->dateTimeBetween('-30 days', 'now'),
            ]);

            // Get location coordinates
            $locationCoords = $locations[$providerData['location']];
            $serviceLocation = json_encode([
                'address' => $providerData['address'],
                'city' => $providerData['location'],
                'latitude' => $locationCoords['lat'],
                'longitude' => $locationCoords['lng']
            ]);

            // Create provider profile
            ProviderProfile::create([
                'user_id' => $user->id,
                'business_name' => $providerData['business_name'],
                'years_of_experience' => $providerData['years_of_experience'],
                'service_area_radius' => $providerData['service_area_radius'],
                'bio' => $providerData['bio'],
                'verification_status' => fake()->randomElement(['verified', 'pending', 'verified', 'verified']), // More verified providers
                'average_rating' => fake()->randomFloat(1, 3.5, 5.0),
                'total_reviews' => fake()->numberBetween(5, 50),
                'total_earnings' => fake()->randomFloat(2, 50000, 500000),
                'is_available' => fake()->boolean(80), // 80% available
                'verified_at' => fake()->dateTimeBetween('-6 months', 'now'),
                'service_location' => $serviceLocation,
                'certifications' => json_encode([
                    'Professional ' . $providerData['category'] . ' Certificate',
                    'Safety Training Completed'
                ]),
            ]);
        }

        $this->command->info('Service providers and their profiles seeded successfully!');
    }
}

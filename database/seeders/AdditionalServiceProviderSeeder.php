<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ProviderProfile;
use Illuminate\Support\Facades\Hash;

class AdditionalServiceProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Negombo area locations
        $negomboLocations = [
            'Negombo City Center' => ['lat' => 7.2084, 'lng' => 79.8358],
            'Negombo Beach Road' => ['lat' => 7.2089, 'lng' => 79.8370],
            'Negombo Lagoon Side' => ['lat' => 7.2150, 'lng' => 79.8400],
            'Negombo Fish Market Area' => ['lat' => 7.2070, 'lng' => 79.8340],
            'Negombo St. Sebastian Road' => ['lat' => 7.2100, 'lng' => 79.8380]
        ];

        // Colombo area locations
        $colomboLocations = [
            'Colombo 3 (Kollupitiya)' => ['lat' => 6.9147, 'lng' => 79.8501],
            'Colombo 4 (Bambalapitiya)' => ['lat' => 6.8905, 'lng' => 79.8565],
            'Colombo 5 (Narahenpita)' => ['lat' => 6.8956, 'lng' => 79.8772],
            'Colombo 6 (Wellawatta)' => ['lat' => 6.8731, 'lng' => 79.8611],
            'Colombo 7 (Cinnamon Gardens)' => ['lat' => 6.9198, 'lng' => 79.8615]
        ];

        // 5 Negombo providers - same categories as existing
        $negomboProviders = [
            [
                'first_name' => 'Saman',
                'last_name' => 'Gunawardana',
                'email' => 'saman.gunawardana@email.com',
                'contact_number' => '+94771234583',
                'address' => 'Beach Road, Negombo',
                'location' => 'Negombo Beach Road',
                'business_name' => 'Saman\'s Home Cleaning Plus',
                'category' => 'Home Cleaning',
                'bio' => 'Premium home cleaning services with 6 years experience. Specializing in post-construction cleanup and move-in/move-out cleaning.',
                'years_of_experience' => 6,
                'service_area_radius' => 12
            ],
            [
                'first_name' => 'Upul',
                'last_name' => 'Ranasinghe',
                'email' => 'upul.ranasinghe@email.com',
                'contact_number' => '+94771234584',
                'address' => 'Lagoon Road, Negombo',
                'location' => 'Negombo Lagoon Side',
                'business_name' => 'Upul Plumbing & Drainage',
                'category' => 'Plumbing Services',
                'bio' => 'Expert plumber specializing in drainage systems and water line installations. 14 years of experience.',
                'years_of_experience' => 14,
                'service_area_radius' => 18
            ],
            [
                'first_name' => 'Dammika',
                'last_name' => 'Jayaweera',
                'email' => 'dammika.jayaweera@email.com',
                'contact_number' => '+94771234585',
                'address' => 'Fish Market Road, Negombo',
                'location' => 'Negombo Fish Market Area',
                'business_name' => 'Dammika Electrical Solutions',
                'category' => 'Electrical Services',
                'bio' => 'Licensed electrical contractor with expertise in smart home installations and electrical panel upgrades.',
                'years_of_experience' => 13,
                'service_area_radius' => 16
            ],
            [
                'first_name' => 'Chandana',
                'last_name' => 'Liyanage',
                'email' => 'chandana.liyanage@email.com',
                'contact_number' => '+94771234586',
                'address' => 'St. Sebastian Road, Negombo',
                'location' => 'Negombo St. Sebastian Road',
                'business_name' => 'Tropical Garden Masters',
                'category' => 'Gardening & Landscaping',
                'bio' => 'Landscape designer and garden maintenance expert. Creating stunning outdoor spaces for 9 years.',
                'years_of_experience' => 9,
                'service_area_radius' => 15
            ],
            [
                'first_name' => 'Indunil',
                'last_name' => 'Perera',
                'email' => 'indunil.perera@email.com',
                'contact_number' => '+94771234587',
                'address' => 'Main Street, Negombo',
                'location' => 'Negombo City Center',
                'business_name' => 'Handy Indunil Services',
                'category' => 'Handyman Services',
                'bio' => 'Reliable handyman for all home repairs, installations, and maintenance. Available for emergency repairs.',
                'years_of_experience' => 8,
                'service_area_radius' => 14
            ]
        ];

        // 5 Colombo providers - different categories
        $colomboProviders = [
            [
                'first_name' => 'Malathi',
                'last_name' => 'Weerasinghe',
                'email' => 'malathi.weerasinghe@email.com',
                'contact_number' => '+94771234588',
                'address' => 'Galle Road, Kollupitiya',
                'location' => 'Colombo 3 (Kollupitiya)',
                'business_name' => 'Tutoring Excellence',
                'category' => 'Tutoring & Education',
                'bio' => 'Experienced educator with M.Ed degree. Specializing in O/L and A/L mathematics and science subjects.',
                'years_of_experience' => 15,
                'service_area_radius' => 20
            ],
            [
                'first_name' => 'Nayomi',
                'last_name' => 'Seneviratne',
                'email' => 'nayomi.seneviratne@email.com',
                'contact_number' => '+94771234589',
                'address' => 'Marine Drive, Bambalapitiya',
                'location' => 'Colombo 4 (Bambalapitiya)',
                'business_name' => 'Caring Hearts Healthcare',
                'category' => 'Healthcare & Caregiving',
                'bio' => 'Registered nurse providing elderly care, medication management, and health monitoring services.',
                'years_of_experience' => 12,
                'service_area_radius' => 18
            ],
            [
                'first_name' => 'Kamal',
                'last_name' => 'Rajapaksha',
                'email' => 'kamal.rajapaksha@email.com',
                'contact_number' => '+94771234590',
                'address' => 'Narahenpita Road, Colombo',
                'location' => 'Colombo 5 (Narahenpita)',
                'business_name' => 'Kamal Tech Support',
                'category' => 'Tech Support',
                'bio' => 'IT professional with 10 years experience. Computer repairs, software installation, and network setup.',
                'years_of_experience' => 10,
                'service_area_radius' => 25
            ],
            [
                'first_name' => 'Amara',
                'last_name' => 'Wickremasinghe',
                'email' => 'amara.wickremasinghe@email.com',
                'contact_number' => '+94771234591',
                'address' => 'Galle Road, Wellawatta',
                'location' => 'Colombo 6 (Wellawatta)',
                'business_name' => 'Amara Beauty & Wellness',
                'category' => 'Beauty & Wellness',
                'bio' => 'Licensed beautician and massage therapist. Offering in-home beauty treatments and wellness services.',
                'years_of_experience' => 7,
                'service_area_radius' => 15
            ],
            [
                'first_name' => 'Dimuthu',
                'last_name' => 'Abeywardana',
                'email' => 'dimuthu.abeywardana@email.com',
                'contact_number' => '+94771234592',
                'address' => 'Independence Avenue, Cinnamon Gardens',
                'location' => 'Colombo 7 (Cinnamon Gardens)',
                'business_name' => 'Elite Event Services',
                'category' => 'Event Services',
                'bio' => 'Professional event planner specializing in weddings, corporate events, and private celebrations.',
                'years_of_experience' => 11,
                'service_area_radius' => 30
            ]
        ];

        // Combine all providers
        $allProviders = array_merge($negomboProviders, $colomboProviders);
        $allLocations = array_merge($negomboLocations, $colomboLocations);

        foreach ($allProviders as $providerData) {
            // Create user
            $user = User::create([
                'first_name' => $providerData['first_name'],
                'last_name' => $providerData['last_name'],
                'email' => $providerData['email'],
                'password' => Hash::make('password123'),
                'role' => User::ROLE_SERVICE_PROVIDER,
                'date_of_birth' => fake()->dateTimeBetween('-55 years', '-23 years'),
                'address' => $providerData['address'],
                'contact_number' => $providerData['contact_number'],
                'is_active' => true,
                'email_verified_at' => now(),
                'last_login_at' => fake()->dateTimeBetween('-15 days', 'now'),
            ]);

            // Get location coordinates
            $locationCoords = $allLocations[$providerData['location']];
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
                'verification_status' => fake()->randomElement(['verified', 'verified', 'pending', 'verified']), // Mostly verified
                'average_rating' => fake()->randomFloat(1, 3.8, 5.0),
                'total_reviews' => fake()->numberBetween(8, 65),
                'total_earnings' => fake()->randomFloat(2, 75000, 750000),
                'is_available' => fake()->boolean(85), // 85% available
                'verified_at' => fake()->dateTimeBetween('-8 months', 'now'),
                'service_location' => $serviceLocation,
                'certifications' => json_encode([
                    'Professional ' . $providerData['category'] . ' Certificate',
                    'Customer Service Excellence',
                    'Safety and Quality Standards'
                ]),
            ]);
        }

        $this->command->info('Additional 10 service providers (5 from Negombo, 5 from Colombo) seeded successfully!');
    }
}

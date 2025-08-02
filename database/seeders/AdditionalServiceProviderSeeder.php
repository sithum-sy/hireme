<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ProviderProfile;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdditionalServiceProviderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Colombo area locations with coordinates
        $colomboLocations = [
            ['area' => 'Colombo 01 - Fort', 'lat' => 6.9344, 'lng' => 79.8428, 'addresses' => ['World Trade Center Area', 'Bank of Ceylon Mawatha', 'Chatham Street']],
            ['area' => 'Colombo 02 - Slave Island', 'lat' => 6.9147, 'lng' => 79.8560, 'addresses' => ['Beira Lake Road', 'Sir Chittampalam Gardiner Mawatha', 'Kompanna Veediya']],
            ['area' => 'Colombo 03 - Kollupitiya', 'lat' => 6.9147, 'lng' => 79.8560, 'addresses' => ['Galle Road', 'Dharmapala Mawatha', 'Kollupitiya Road']],
            ['area' => 'Colombo 04 - Bambalapitiya', 'lat' => 6.8905, 'lng' => 79.8565, 'addresses' => ['Galle Road', 'Bauddhaloka Mawatha', 'Lauries Road']],
            ['area' => 'Colombo 05 - Narahenpita', 'lat' => 6.8884, 'lng' => 79.8742, 'addresses' => ['Narahenpita Road', 'Wijerama Mawatha', 'Thimbirigasyaya Road']],
            ['area' => 'Colombo 06 - Wellawatta', 'lat' => 6.8684, 'lng' => 79.8625, 'addresses' => ['Galle Road', 'Wellawatta Road', 'High Level Road']],
            ['area' => 'Colombo 07 - Cinnamon Gardens', 'lat' => 6.9147, 'lng' => 79.8742, 'addresses' => ['Independence Avenue', 'Horton Place', 'Gregory Road']],
            ['area' => 'Colombo 08 - Borella', 'lat' => 6.9147, 'lng' => 79.8878, 'addresses' => ['Borella Road', 'General Hospital Road', 'Deans Road']],
            ['area' => 'Colombo 09 - Dematagoda', 'lat' => 6.9344, 'lng' => 79.8878, 'addresses' => ['Baseline Road', 'Dematagoda Road', 'Station Road']],
            ['area' => 'Colombo 10 - Maradana', 'lat' => 6.9269, 'lng' => 79.8612, 'addresses' => ['Maradana Road', 'Olcott Mawatha', 'Panchikawatte Road']],
            ['area' => 'Colombo 11 - Pettah', 'lat' => 6.9395, 'lng' => 79.8578, 'addresses' => ['Main Street', 'Sea Street', 'Prince Street']],
            ['area' => 'Colombo 12 - Hulftsdorp', 'lat' => 6.9344, 'lng' => 79.8497, 'addresses' => ['Hulftsdorp Street', 'Court Road', 'Princes Street']],
            ['area' => 'Colombo 13 - Kotahena', 'lat' => 6.9500, 'lng' => 79.8500, 'addresses' => ['Kotahena Street', 'Church Street', 'Reclamation Road']],
            ['area' => 'Colombo 14 - Grandpass', 'lat' => 6.9500, 'lng' => 79.8600, 'addresses' => ['Grandpass Road', 'Baseline Road', 'St. Sebastian Road']],
            ['area' => 'Colombo 15 - Mutwal', 'lat' => 6.9600, 'lng' => 79.8500, 'addresses' => ['Mutwal Road', 'Harbour Road', 'Station Road']],
        ];

        // Negombo area locations with coordinates
        $negomboLocations = [
            ['area' => 'Negombo', 'lat' => 7.2084, 'lng' => 79.8358, 'addresses' => ['Main Street', 'Lewis Place', 'Poruthota Road', 'St. Joseph Street', 'Beach Road']],
            ['area' => 'Wennappuwa', 'lat' => 7.3667, 'lng' => 79.8500, 'addresses' => ['Kurunegala Road', 'Church Road', 'Market Street', 'Station Road']],
            ['area' => 'Ja-Ela', 'lat' => 7.0742, 'lng' => 79.8919, 'addresses' => ['Station Road', 'Gampaha Road', 'Commercial Street', 'Church Street']],
            ['area' => 'Wattala', 'lat' => 6.9897, 'lng' => 79.8664, 'addresses' => ['Negombo Road', 'Hendala Road', 'Mabola Road', 'Station Road']],
            ['area' => 'Seeduwa', 'lat' => 7.1167, 'lng' => 79.8833, 'addresses' => ['Airport Road', 'Old Negombo Road', 'Temple Road', 'Market Street']],
            ['area' => 'Katunayake', 'lat' => 7.1697, 'lng' => 79.8847, 'addresses' => ['Kandy Road', 'Airport Road', 'Church Road', 'Station Road']],
            ['area' => 'Kelaniya', 'lat' => 6.9553, 'lng' => 79.9217, 'addresses' => ['Temple Road', 'Kandy Road', 'Station Road', 'Market Street']],
            ['area' => 'Peliyagoda', 'lat' => 6.9667, 'lng' => 79.8833, 'addresses' => ['Kandy Road', 'Station Road', 'Market Street', 'Church Road']],
            ['area' => 'Kiribathgoda', 'lat' => 6.9833, 'lng' => 79.9167, 'addresses' => ['Kandy Road', 'Station Road', 'Temple Road', 'Market Street']],
            ['area' => 'Ragama', 'lat' => 7.0167, 'lng' => 79.9167, 'addresses' => ['Station Road', 'Kandy Road', 'Church Street', 'Market Street']],
        ];

        // Business name components
        $businessPrefixes = ['Elite', 'Pro', 'Quality', 'Expert', 'Premium', 'Reliable', 'Swift', 'Perfect', 'Smart', 'Quick'];
        $businessTypes = ['Services', 'Solutions', 'Care', 'Works', 'Hub', 'Center', 'Group', 'Company', 'Specialists', 'Professionals'];

        // Sri Lankan names
        $maleFirstNames = [
            'Amila',
            'Buddika',
            'Chathura',
            'Danushka',
            'Eshan',
            'Gayan',
            'Harsha',
            'Isuru',
            'Janaka',
            'Kavinda',
            'Lahiru',
            'Manjula',
            'Nirmal',
            'Osanda',
            'Pradeep',
            'Rajitha',
            'Samitha',
            'Tharindu',
            'Udara',
            'Viraj',
            'Waruna',
            'Yasitha',
            'Charith',
            'Dilan',
            'Eranda',
            'Geeth',
            'Hasitha',
            'Ireshan',
            'Jaliya',
            'Kasun',
            'Lakshan',
            'Maduka',
            'Nalin',
            'Oshan',
            'Piyal',
            'Ranil',
            'Sarath',
            'Thilak',
            'Upul',
            'Vindana'
        ];

        $femaleFirstNames = [
            'Amaya',
            'Binara',
            'Chathurika',
            'Dilani',
            'Esandi',
            'Gayani',
            'Hiruni',
            'Ishara',
            'Jayani',
            'Kavitha',
            'Lakmini',
            'Madhavi',
            'Nayani',
            'Oshadhi',
            'Priyanka',
            'Rashmi',
            'Sanduni',
            'Tharushi',
            'Udari',
            'Vindya',
            'Waruni',
            'Yashodha',
            'Chathuri',
            'Dinusha',
            'Erandi',
            'Geetha',
            'Hasani',
            'Iresha',
            'Janani',
            'Kaushalya',
            'Lakshika',
            'Manisha',
            'Neluni',
            'Oshadi',
            'Piyumi',
            'Ransi',
            'Sachini',
            'Thisuri',
            'Upeksha',
            'Vindana'
        ];

        $lastNames = [
            'Abeysinghe',
            'Balasooriya',
            'Chandrasekara',
            'Dassanayake',
            'Edirisinghe',
            'Fonseka',
            'Gunathilake',
            'Hettiarachchi',
            'Ilangakoon',
            'Jayatilaka',
            'Karunaratne',
            'Liyanage',
            'Munasinghe',
            'Nanayakkara',
            'Obeysekera',
            'Peiris',
            'Rajakaruna',
            'Samarakoon',
            'Tennakoon',
            'Udayakantha',
            'Vithanage',
            'Weerakoon',
            'Amaratunga',
            'Batuwitage',
            'Cooray',
            'Dayaratne',
            'Ekanayake',
            'Galappatti',
            'Hewage',
            'Iddamalgoda',
            'Jayasinghe',
            'Kulatilaka',
            'Lokuhettige',
            'Marapana',
            'Nugawela',
            'Opatha',
            'Panditharatne',
            'Ranaweera',
            'Siriwardena',
            'Thalagala'
        ];

        // Professional bios
        $bioPrefixes = [
            'Experienced professional with',
            'Dedicated service provider offering',
            'Skilled expert specializing in',
            'Reliable professional providing',
            'Quality-focused provider with',
            'Customer-oriented specialist in',
            'Professional service provider with',
            'Experienced technician offering',
            'Trusted professional specializing in',
            'Committed service provider with'
        ];

        $bioSuffixes = [
            'high-quality service and customer satisfaction.',
            'reliable and professional solutions.',
            'excellent results and timely delivery.',
            'personalized service and attention to detail.',
            'affordable rates and quality workmanship.',
            'prompt response and professional service.',
            'comprehensive solutions for all your needs.',
            'exceptional service and competitive pricing.',
            'trusted expertise and reliable service.',
            'professional standards and customer care.'
        ];

        $providers = [];

        // Generate 30 Colombo providers
        for ($i = 0; $i < 30; $i++) {
            $isGender = rand(0, 1);
            $firstName = $isGender ? $femaleFirstNames[array_rand($femaleFirstNames)] : $maleFirstNames[array_rand($maleFirstNames)];
            $lastName = $lastNames[array_rand($lastNames)];

            $locationData = $colomboLocations[array_rand($colomboLocations)];
            $address = $locationData['addresses'][array_rand($locationData['addresses'])] . ', ' . $locationData['area'];

            // Generate business name
            $businessName = $businessPrefixes[array_rand($businessPrefixes)] . ' ' . $businessTypes[array_rand($businessTypes)];

            $email = strtolower($firstName . '.' . $lastName . '@email.com');

            $providers[] = [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'address' => $address,
                'business_name' => $businessName,
                'location_data' => $locationData,
                'area_type' => 'colombo'
            ];
        }

        // Generate 30 Negombo providers
        for ($i = 0; $i < 30; $i++) {
            $isGender = rand(0, 1);
            $firstName = $isGender ? $femaleFirstNames[array_rand($femaleFirstNames)] : $maleFirstNames[array_rand($maleFirstNames)];
            $lastName = $lastNames[array_rand($lastNames)];

            $locationData = $negomboLocations[array_rand($negomboLocations)];
            $address = $locationData['addresses'][array_rand($locationData['addresses'])] . ', ' . $locationData['area'];

            // Generate business name
            $businessName = $businessPrefixes[array_rand($businessPrefixes)] . ' ' . $businessTypes[array_rand($businessTypes)];

            $email = strtolower($firstName . '.' . $lastName . '@email.com');

            $providers[] = [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'address' => $address,
                'business_name' => $businessName,
                'location_data' => $locationData,
                'area_type' => 'negombo'
            ];
        }

        // Ensure unique emails
        $usedEmails = [];
        foreach ($providers as &$provider) {
            $originalEmail = $provider['email'];
            $counter = 1;
            while (in_array($provider['email'], $usedEmails)) {
                $provider['email'] = str_replace('@email.com', $counter . '@email.com', $originalEmail);
                $counter++;
            }
            $usedEmails[] = $provider['email'];
        }

        // Registration period: July 1st to August 2nd
        $registrationStart = Carbon::create(2025, 7, 1, 0, 0, 0);
        $registrationEnd = Carbon::create(2025, 8, 2, 23, 59, 59);

        foreach ($providers as $providerData) {
            // Random registration date within the period
            $registrationDate = Carbon::createFromTimestamp(
                rand($registrationStart->timestamp, $registrationEnd->timestamp)
            );

            // Email verification: 1-24 hours after registration
            $emailVerifiedAt = $registrationDate->copy()->addHours(rand(1, 24));

            // Last login: between email verification and now
            $lastLoginStart = $emailVerifiedAt->copy();
            $lastLoginEnd = min(now(), $registrationDate->copy()->addDays(30));
            $lastLoginAt = Carbon::createFromTimestamp(
                rand($lastLoginStart->timestamp, $lastLoginEnd->timestamp)
            );

            // Generate contact number
            $contactNumber = '+9477' . rand(1000000, 9999999);

            // Generate random date of birth (25-60 years old)
            $dateOfBirth = Carbon::now()->subYears(rand(25, 60))->subDays(rand(0, 365));

            // Create user
            $user = User::create([
                'first_name' => $providerData['first_name'],
                'last_name' => $providerData['last_name'],
                'email' => $providerData['email'],
                'password' => Hash::make($providerData['email']), // Password is their email
                'role' => User::ROLE_SERVICE_PROVIDER,
                'date_of_birth' => $dateOfBirth,
                'address' => $providerData['address'],
                'contact_number' => $contactNumber,
                'profile_picture' => null,
                'is_active' => true,
                'email_verified_at' => $emailVerifiedAt,
                'last_login_at' => $lastLoginAt,
                'email_notifications_enabled' => true,
                'app_notifications_enabled' => true,
                'created_at' => $registrationDate,
                'updated_at' => $lastLoginAt,
            ]);

            // Create service location JSON
            $serviceLocation = json_encode([
                'address' => $providerData['address'],
                'city' => $providerData['location_data']['area'],
                'latitude' => $providerData['location_data']['lat'],
                'longitude' => $providerData['location_data']['lng']
            ]);

            // Generate professional bio
            $bio = $bioPrefixes[array_rand($bioPrefixes)] . ' ' . rand(2, 15) . ' years of experience providing ' . $bioSuffixes[array_rand($bioSuffixes)];

            // Create provider profile
            ProviderProfile::create([
                'user_id' => $user->id,
                'business_name' => $providerData['business_name'],
                'years_of_experience' => rand(2, 15),
                'service_area_radius' => rand(0, 1) ? 5 : 10, // Either 5km or 10km
                'bio' => $bio,
                'verification_status' => 'verified', // All verified
                'total_earnings' => 0.00, // Set to 0.00 as requested
                'is_available' => rand(0, 4) ? true : false, // 80% available
                'verified_at' => $emailVerifiedAt->copy()->addDays(rand(1, 5)),
                'service_location' => $serviceLocation,
                'certifications' => json_encode([
                    'Professional Service Certification',
                    'Safety and Quality Standards Training',
                    'Customer Service Excellence Certificate'
                ]),
            ]);
        }

        $this->command->info('Successfully created 60 additional service providers!');
        $this->command->info('30 from Colombo areas, 30 from Negombo areas');
        $this->command->info('All providers are verified with 5km or 10km service radius');
        $this->command->info('Total earnings set to 0.00 for all new providers');
    }
}

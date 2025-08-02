<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Colombo area locations (35 clients)
        $colomboAreas = [
            ['area' => 'Colombo 01 - Fort', 'addresses' => ['World Trade Center Area', 'Bank of Ceylon Mawatha', 'Chatham Street']],
            ['area' => 'Colombo 02 - Slave Island', 'addresses' => ['Beira Lake Road', 'Sir Chittampalam Gardiner Mawatha', 'Kompanna Veediya']],
            ['area' => 'Colombo 03 - Kollupitiya', 'addresses' => ['Galle Road', 'Dharmapala Mawatha', 'Kollupitiya Road']],
            ['area' => 'Colombo 04 - Bambalapitiya', 'addresses' => ['Galle Road', 'Bauddhaloka Mawatha', 'Lauries Road']],
            ['area' => 'Colombo 05 - Narahenpita', 'addresses' => ['Narahenpita Road', 'Wijerama Mawatha', 'Thimbirigasyaya Road']],
            ['area' => 'Colombo 06 - Wellawatta', 'addresses' => ['Galle Road', 'Wellawatta Road', 'High Level Road']],
            ['area' => 'Colombo 07 - Cinnamon Gardens', 'addresses' => ['Independence Avenue', 'Horton Place', 'Gregory Road']],
            ['area' => 'Colombo 08 - Borella', 'addresses' => ['Borella Road', 'General Hospital Road', 'Deans Road']],
            ['area' => 'Colombo 09 - Dematagoda', 'addresses' => ['Baseline Road', 'Dematagoda Road', 'Station Road']],
            ['area' => 'Colombo 10 - Maradana', 'addresses' => ['Maradana Road', 'Olcott Mawatha', 'Panchikawatte Road']],
            ['area' => 'Colombo 11 - Pettah', 'addresses' => ['Main Street', 'Sea Street', 'Prince Street']],
            ['area' => 'Colombo 12 - Hulftsdorp', 'addresses' => ['Hulftsdorp Street', 'Court Road', 'Princes Street']],
            ['area' => 'Colombo 13 - Kotahena', 'addresses' => ['Kotahena Street', 'Church Street', 'Reclamation Road']],
            ['area' => 'Colombo 14 - Grandpass', 'addresses' => ['Grandpass Road', 'Baseline Road', 'St. Sebastian Road']],
            ['area' => 'Colombo 15 - Mutwal', 'addresses' => ['Mutwal Road', 'Harbour Road', 'Station Road']],
        ];

        // Negombo area locations (15 clients)
        $negomboAreas = [
            ['area' => 'Negombo', 'addresses' => ['Main Street', 'Lewis Place', 'Poruthota Road', 'St. Joseph Street', 'Beach Road']],
            ['area' => 'Wennappuwa', 'addresses' => ['Kurunegala Road', 'Church Road', 'Market Street', 'Station Road']],
            ['area' => 'Ja-Ela', 'addresses' => ['Station Road', 'Gampaha Road', 'Commercial Street', 'Church Street']],
            ['area' => 'Wattala', 'addresses' => ['Negombo Road', 'Hendala Road', 'Mabola Road', 'Station Road']],
            ['area' => 'Seeduwa', 'addresses' => ['Airport Road', 'Old Negombo Road', 'Temple Road', 'Market Street']],
            ['area' => 'Katunayake', 'addresses' => ['Kandy Road', 'Airport Road', 'Church Road', 'Station Road']],
        ];

        // Sri Lankan first names and last names
        $maleFirstNames = [
            'Nuwan', 'Kasun', 'Chamara', 'Ruwan', 'Saman', 'Nimal', 'Sunil', 'Ajith', 'Rohan', 'Prasad',
            'Asanka', 'Thilina', 'Dinesh', 'Chathura', 'Lakmal', 'Sampath', 'Indika', 'Dhanushka', 'Shanaka', 'Mahesh'
        ];

        $femaleFirstNames = [
            'Chamari', 'Sachini', 'Nayomi', 'Dilini', 'Thilini', 'Sandya', 'Kamani', 'Shirani', 'Mala', 'Priyanka',
            'Sanduni', 'Sewwandi', 'Chathurika', 'Hashini', 'Amaya', 'Rashini', 'Thanuja', 'Madhavi', 'Piyumi', 'Hiruni'
        ];

        $lastNames = [
            'Perera', 'Silva', 'Fernando', 'Jayasuriya', 'Wickramasinghe', 'Gunasekara', 'Rathnayake', 'Mendis',
            'Bandara', 'Kumara', 'Rajapaksha', 'Wijesinghe', 'Dissanayake', 'Kodithuwakku', 'Senanayake',
            'Seneviratne', 'Weerasinghe', 'Gunawardena', 'Amarasinghe', 'Karunaratne', 'Wickremaratne', 'Jayawardena',
            'Liyanage', 'Herath', 'Madushanka', 'Pathirana', 'Samaraweera', 'Wijesekara', 'Ranasinghe', 'Gamage'
        ];

        $clients = [];

        // Generate 35 Colombo area clients
        for ($i = 0; $i < 35; $i++) {
            $isGender = rand(0, 1); // 0 = male, 1 = female
            $firstName = $isGender ? $femaleFirstNames[array_rand($femaleFirstNames)] : $maleFirstNames[array_rand($maleFirstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            
            $areaData = $colomboAreas[array_rand($colomboAreas)];
            $address = $areaData['addresses'][array_rand($areaData['addresses'])] . ', ' . $areaData['area'];
            
            $email = strtolower($firstName . '.' . $lastName . '@email.com');
            
            // Ensure unique email
            $counter = 1;
            $originalEmail = $email;
            while (in_array($email, array_column($clients, 'email'))) {
                $email = str_replace('@email.com', $counter . '@email.com', $originalEmail);
                $counter++;
            }

            $clients[] = [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'address' => $address,
                'area_type' => 'colombo'
            ];
        }

        // Generate 15 Negombo area clients
        for ($i = 0; $i < 15; $i++) {
            $isGender = rand(0, 1); // 0 = male, 1 = female
            $firstName = $isGender ? $femaleFirstNames[array_rand($femaleFirstNames)] : $maleFirstNames[array_rand($maleFirstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            
            $areaData = $negomboAreas[array_rand($negomboAreas)];
            $address = $areaData['addresses'][array_rand($areaData['addresses'])] . ', ' . $areaData['area'];
            
            $email = strtolower($firstName . '.' . $lastName . '@email.com');
            
            // Ensure unique email
            $counter = 1;
            $originalEmail = $email;
            while (in_array($email, array_column($clients, 'email'))) {
                $email = str_replace('@email.com', $counter . '@email.com', $originalEmail);
                $counter++;
            }

            $clients[] = [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'address' => $address,
                'area_type' => 'negombo'
            ];
        }

        // Registration period: July 1st to August 2nd
        $registrationStart = Carbon::create(2025, 7, 1, 0, 0, 0);
        $registrationEnd = Carbon::create(2025, 8, 2, 23, 59, 59);

        foreach ($clients as $clientData) {
            // Random registration date within the period
            $registrationDate = Carbon::createFromTimestamp(
                rand($registrationStart->timestamp, $registrationEnd->timestamp)
            );

            // Email verification: 1-24 hours after registration
            $emailVerifiedAt = $registrationDate->copy()->addHours(rand(1, 24));

            // Last login: between email verification and now, but not more recent than registration + 1 day
            $lastLoginStart = $emailVerifiedAt->copy();
            $lastLoginEnd = min(now(), $registrationDate->copy()->addDays(30));
            $lastLoginAt = Carbon::createFromTimestamp(
                rand($lastLoginStart->timestamp, $lastLoginEnd->timestamp)
            );

            // Generate contact number
            $contactNumber = '+9477' . rand(1000000, 9999999);

            // Generate random date of birth (25-65 years old)
            $dateOfBirth = Carbon::now()->subYears(rand(25, 65))->subDays(rand(0, 365));

            User::create([
                'first_name' => $clientData['first_name'],
                'last_name' => $clientData['last_name'],
                'email' => $clientData['email'],
                'password' => Hash::make($clientData['email']), // Password is their email
                'role' => User::ROLE_CLIENT,
                'date_of_birth' => $dateOfBirth,
                'address' => $clientData['address'],
                'contact_number' => $contactNumber,
                'profile_picture' => null,
                'is_active' => true, // Set to 1 (active)
                'email_verified_at' => $emailVerifiedAt,
                'last_login_at' => $lastLoginAt,
                'email_notifications_enabled' => true, // Set to 1
                'app_notifications_enabled' => true,   // Set to 1
                'created_at' => $registrationDate,
                'updated_at' => $lastLoginAt, // Last update when they logged in
            ]);
        }

        $this->command->info('Successfully created 50 client users (35 from Colombo areas, 15 from Negombo areas)!');
        $this->command->info('Registration period: July 1st - August 2nd, 2025');
        $this->command->info('All clients are active with email/app notifications enabled');
    }
}
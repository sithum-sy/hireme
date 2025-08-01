<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Appointment;
use App\Models\Payment;
use App\Models\Quote;
use App\Models\Review;
use GuzzleHttp\Client;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        // Run in order due to foreign key constraints
        $this->call([
            // ServiceCategorySeeder::class,
            // AdditionalServiceProviderSeeder::class,
            // ClientSeeder::class,
            // ComprehensiveServicesSeeder::class,
            // AppointmentsSeeder::class,
            InvoicesSeeder::class,
            // PaymentsSeeder::class,
            // QuotesSeeder::class,
            // ReviewsSeeder::class,
            // Add more seeders here as needed
        ]);
    }
}

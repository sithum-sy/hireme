<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Appointment;
use App\Models\User;
use App\Models\Service;
use App\Models\Quote;
use Carbon\Carbon;

class AppointmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Get all clients and providers
        $clients = User::where('role', 'client')->get();
        $providers = User::where('role', 'service_provider')->whereHas('providerProfile')->with('providerProfile')->get();
        $services = Service::with(['provider.providerProfile', 'category'])->get();

        if ($clients->isEmpty()) {
            $this->command->warn('No clients found. Please run the client seeder first.');
            return;
        }

        if ($providers->isEmpty()) {
            $this->command->warn('No service providers found. Please run the provider seeder first.');
            return;
        }

        if ($services->isEmpty()) {
            $this->command->warn('No services found. Please run the services seeder first.');
            return;
        }

        // Colombo and Negombo areas for location assignment
        $colomboAreas = [
            'Colombo 1',
            'Colombo 2',
            'Colombo 3',
            'Colombo 4',
            'Colombo 5',
            'Colombo 6',
            'Colombo 7',
            'Colombo 8',
            'Colombo 9',
            'Colombo 10',
            'Mount Lavinia',
            'Dehiwala',
            'Maharagama',
            'Kotte',
            'Rajagiriya',
            'Nugegoda',
            'Boralesgamuwa',
            'Kesbewa',
            'Moratuwa',
            'Panadura'
        ];

        $negomboAreas = [
            'Negombo',
            'Katunayake',
            'Seeduwa',
            'Ja-Ela',
            'Ekala',
            'Wattala',
            'Hendala',
            'Liyanagemulla',
            'Minuwangoda',
            'Gampaha',
            'Kiribathgoda',
            'Kelaniya'
        ];

        // Sri Lankan phone number prefixes
        $phonePrefix = ['070', '071', '072', '074', '075', '076', '077', '078'];

        // Realistic Sri Lankan street addresses
        $streetAddresses = [
            'No. 15, Galle Road', 'No. 234, Kandy Road', 'No. 67, Colombo Road', 'No. 89, Main Street',
            'No. 156, High Level Road', 'No. 23, Station Road', 'No. 445, Negombo Road', 'No. 78, Temple Road',
            'No. 12, School Lane', 'No. 567, Old Kesbewa Road', 'No. 34, New Road', 'No. 123, Beach Road',
            'No. 789, Maradana Road', 'No. 45, Hospital Road', 'No. 98, Church Street', 'No. 167, Market Road',
            'No. 56, Railway Avenue', 'No. 234, Garden Road', 'No. 345, Hill Street', 'No. 678, Lake Road',
            'No. 90, Park Avenue', 'No. 123, Bridge Street', 'No. 456, River Road', 'No. 789, Valley Road',
            'No. 12, Mount Road', 'No. 345, Sea View Road', 'No. 67, Forest Lane', 'No. 890, Green Road'
        ];

        // Realistic client notes
        $clientNotesArray = [
            null, // No notes
            'Please call before arriving',
            'Building has security - please call from main gate',
            'Apartment is on the 3rd floor',
            'Please bring all necessary equipment',
            'Parking available in front of house',
            'Dog on premises - please knock loudly',
            'Work needs to be completed before 5 PM',
            'Please use side entrance',
            'Available throughout the day',
            'Please remove shoes when entering',
            'Cash payment preferred',
            'Flexible with timing',
            'Please be punctual',
            'Will provide refreshments'
        ];

        // Provider notes for completed appointments
        $providerNotesArray = [
            'Work completed as requested',
            'Additional materials were required',
            'Client was very satisfied with the service',
            'Some follow-up work may be needed',
            'Excellent working conditions',
            'Minor issues resolved during service',
            'Client provided good cooperation',
            'Work completed ahead of schedule',
            'Additional services were discussed',
            'Client requested maintenance tips',
            'Payment received on completion',
            'Professional working environment',
            'Clear instructions provided by client',
            'Quality materials were used',
            'Service warranty explained to client'
        ];

        // Cancellation reasons
        $clientCancellationReasons = [
            'Client emergency came up',
            'Client needs to reschedule',
            'Client found alternative service',
            'Client budget constraints',
            'Client travel plans changed',
            'Family emergency',
            'Work commitment conflict',
            'Health issue in family',
            'House not ready for service',
            'Changed service requirements'
        ];

        $providerCancellationReasons = [
            'Provider equipment malfunction',
            'Provider schedule conflict',
            'Provider illness',
            'Weather conditions',
            'Service area restrictions',
            'Vehicle breakdown',
            'Emergency at previous job',
            'Material shortage',
            'Technical issue with equipment',
            'Family emergency'
        ];

        // Realistic email domains used in Sri Lanka
        $emailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'sltnet.lk', 'dialog.lk'];

        // Common Sri Lankan postal codes
        $postalCodes = [
            '00100', '00200', '00300', '00400', '00500', // Colombo
            '10100', '10120', '10230', '10250', '10350', // Mount Lavinia, Dehiwala
            '10600', '10620', '10650', '10710', '10750', // Nugegoda, Maharagama
            '11500', '11510', '11540', '11550', '11560', // Negombo area
            '11000', '11010', '11020', '11030', '11040'  // Gampaha area
        ];

        // Appointment time slots (business hours)
        $timeSlots = [
            '08:00:00',
            '09:00:00',
            '10:00:00',
            '11:00:00',
            '12:00:00',
            '13:00:00',
            '14:00:00',
            '15:00:00',
            '16:00:00',
            '17:00:00'
        ];

        // Contact preferences and payment methods
        $contactPreferences = ['phone', 'message'];
        $paymentMethods = ['cash', 'card', 'bank_transfer'];
        $locationTypes = ['client_address', 'provider_location', 'custom_location'];

        // Status distribution for realistic appointment lifecycle
        $statusDistribution = [
            Appointment::STATUS_COMPLETED => 25,      // 50% completed (past appointments)
            Appointment::STATUS_PAID => 8,            // 16% paid
            Appointment::STATUS_REVIEWED => 5,        // 10% reviewed
            Appointment::STATUS_CLOSED => 2,          // 4% closed
            Appointment::STATUS_CONFIRMED => 6,       // 12% confirmed (upcoming)
            Appointment::STATUS_PENDING => 2,         // 4% pending
            Appointment::STATUS_CANCELLED_BY_CLIENT => 1,   // 2% cancelled by client
            Appointment::STATUS_CANCELLED_BY_PROVIDER => 1  // 2% cancelled by provider
        ];

        $createdAppointments = 0;
        $startDate = Carbon::create(2025, 7, 2); // July 2nd, 2025
        $endDate = Carbon::today();

        // Create appointments for each status
        foreach ($statusDistribution as $status => $count) {
            for ($i = 0; $i < $count; $i++) {
                // Select random client, service, and get the provider from service
                $client = $clients->random();
                $service = $services->random();
                $provider = $service->provider;
                $providerProfile = $provider->providerProfile;

                if (!$providerProfile) {
                    continue; // Skip if provider profile doesn't exist
                }

                // Determine location based on provider's service location
                $serviceLocation = json_decode($providerProfile->service_location, true);
                $isColomboBased = str_contains($serviceLocation['city'] ?? '', 'Colombo');

                // 70% Colombo, 30% Negombo as requested
                $useColomboProbability = $isColomboBased ? 0.8 : 0.6;
                $isCoolomboAppointment = rand(1, 100) <= ($useColomboProbability * 100);

                $clientCity = $isCoolomboAppointment
                    ? $colomboAreas[array_rand($colomboAreas)]
                    : $negomboAreas[array_rand($negomboAreas)];

                // Generate appointment date based on status
                if (in_array($status, [
                    Appointment::STATUS_COMPLETED,
                    Appointment::STATUS_PAID,
                    Appointment::STATUS_REVIEWED,
                    Appointment::STATUS_CLOSED,
                    Appointment::STATUS_CANCELLED_BY_CLIENT,
                    Appointment::STATUS_CANCELLED_BY_PROVIDER
                ])) {
                    // Past appointments (July 2nd to today)
                    $appointmentDate = Carbon::createFromTimestamp(rand($startDate->timestamp, $endDate->timestamp));
                } else {
                    // Future appointments (today to next 30 days)
                    $futureDate = Carbon::now()->addDays(30);
                    $appointmentDate = Carbon::createFromTimestamp(rand(Carbon::now()->timestamp, $futureDate->timestamp));
                }

                $appointmentTime = $timeSlots[array_rand($timeSlots)];

                // Calculate pricing
                $basePrice = $service->base_price;
                $travelFee = rand(0, 200000) / 100; // 0 to 2000 LKR travel fee
                $totalPrice = $basePrice + $travelFee;

                // Generate realistic client contact details
                $clientPhone = $phonePrefix[array_rand($phonePrefix)] . '-' . rand(10, 99) . '-' . rand(10000, 99999);
                $clientEmail = rand(1, 100) <= 80 ? $client->email : null; // 80% have email

                // Location details
                $locationType = $locationTypes[array_rand($locationTypes)];
                $clientAddress = null;
                if ($locationType !== 'provider_location') {
                    $clientAddress = $streetAddresses[array_rand($streetAddresses)] . ', ' . $clientCity;
                }

                // Client notes (realistic Sri Lankan context)
                $clientNotes = rand(1, 100) <= 60 ? $clientNotesArray[array_rand($clientNotesArray)] : null;

                // Provider notes for completed appointments
                $providerNotes = null;
                if (in_array($status, [Appointment::STATUS_COMPLETED, Appointment::STATUS_PAID, Appointment::STATUS_REVIEWED, Appointment::STATUS_CLOSED])) {
                    $providerNotes = rand(1, 100) <= 70 ? $providerNotesArray[array_rand($providerNotesArray)] : null;
                }

                // Cancellation reasons
                $cancellationReason = null;
                if (in_array($status, [Appointment::STATUS_CANCELLED_BY_CLIENT, Appointment::STATUS_CANCELLED_BY_PROVIDER])) {
                    if ($status === Appointment::STATUS_CANCELLED_BY_CLIENT) {
                        $cancellationReason = $clientCancellationReasons[array_rand($clientCancellationReasons)];
                    } else {
                        $cancellationReason = $providerCancellationReasons[array_rand($providerCancellationReasons)];
                    }
                }

                // Create timestamps based on status
                $confirmedAt = null;
                $startedAt = null;
                $completedAt = null;
                $cancelledAt = null;
                $invoiceSentAt = null;
                $paymentReceivedAt = null;
                $reviewsCompletedAt = null;

                $createdAt = $appointmentDate->copy()->subDays(rand(1, 7)); // Created 1-7 days before appointment

                if (!in_array($status, [Appointment::STATUS_PENDING, Appointment::STATUS_CANCELLED_BY_CLIENT, Appointment::STATUS_CANCELLED_BY_PROVIDER])) {
                    $confirmedAt = $createdAt->copy()->addHours(rand(2, 24)); // Confirmed 2-24 hours after creation
                }

                if (in_array($status, [Appointment::STATUS_CANCELLED_BY_CLIENT, Appointment::STATUS_CANCELLED_BY_PROVIDER])) {
                    $cancelledAt = $createdAt->copy()->addHours(rand(1, 48));
                }

                if (in_array($status, [Appointment::STATUS_COMPLETED, Appointment::STATUS_PAID, Appointment::STATUS_REVIEWED, Appointment::STATUS_CLOSED])) {
                    $startedAt = $appointmentDate->copy()->addMinutes(rand(-15, 30)); // Started around appointment time
                    $completedAt = $startedAt->copy()->addHours($service->duration_hours)->addMinutes(rand(-30, 60));
                    $invoiceSentAt = $completedAt->copy()->addHours(rand(1, 24));
                }

                if (in_array($status, [Appointment::STATUS_PAID, Appointment::STATUS_REVIEWED, Appointment::STATUS_CLOSED])) {
                    $paymentReceivedAt = $invoiceSentAt->copy()->addDays(rand(1, 7));
                }

                if (in_array($status, [Appointment::STATUS_REVIEWED, Appointment::STATUS_CLOSED])) {
                    $reviewsCompletedAt = $paymentReceivedAt->copy()->addDays(rand(1, 5));
                }

                // Create the appointment
                $appointment = Appointment::create([
                    'client_id' => $client->id,
                    'provider_id' => $provider->id,
                    'service_id' => $service->id,
                    'quote_id' => null, // Most appointments are direct bookings
                    'appointment_date' => $appointmentDate->toDateString(),
                    'appointment_time' => $appointmentTime,
                    'duration_hours' => $service->duration_hours,
                    'total_price' => round($totalPrice, 2),
                    'base_price' => $basePrice,
                    'travel_fee' => round($travelFee, 2),
                    'location_type' => $locationType,
                    'client_address' => $clientAddress,
                    'client_city' => $clientCity,
                    'client_postal_code' => rand(1, 100) <= 50 ? $postalCodes[array_rand($postalCodes)] : null,
                    'location_instructions' => rand(1, 100) <= 30 ? 'Please call when you arrive at the location' : null,
                    'client_phone' => $clientPhone,
                    'client_email' => $clientEmail,
                    'contact_preference' => $contactPreferences[array_rand($contactPreferences)],
                    'client_notes' => $clientNotes,
                    'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                    'status' => $status,
                    'booking_source' => 'web_app',
                    'cancellation_reason' => $cancellationReason,
                    'provider_notes' => $providerNotes,
                    'confirmed_at' => $confirmedAt,
                    'started_at' => $startedAt,
                    'completed_at' => $completedAt,
                    'cancelled_at' => $cancelledAt,
                    'invoice_sent_at' => $invoiceSentAt,
                    'payment_received_at' => $paymentReceivedAt,
                    'reviews_completed_at' => $reviewsCompletedAt,
                    'expires_at' => null,
                    'auto_expired' => false,
                    'reminder_24h_sent_at' => null,
                    'created_at' => $createdAt,
                    'updated_at' => $completedAt ?? $cancelledAt ?? $confirmedAt ?? $createdAt
                ]);

                $createdAppointments++;
            }
        }

        // Final statistics
        $colomboAppointments = Appointment::where('client_city', 'LIKE', '%Colombo%')
            ->orWhere('client_city', 'LIKE', '%Mount Lavinia%')
            ->orWhere('client_city', 'LIKE', '%Dehiwala%')
            ->orWhere('client_city', 'LIKE', '%Maharagama%')
            ->orWhere('client_city', 'LIKE', '%Kotte%')
            ->orWhere('client_city', 'LIKE', '%Nugegoda%')
            ->orWhere('client_city', 'LIKE', '%Moratuwa%')
            ->count();

        $negomboAppointments = Appointment::where('client_city', 'LIKE', '%Negombo%')
            ->orWhere('client_city', 'LIKE', '%Katunayake%')
            ->orWhere('client_city', 'LIKE', '%Gampaha%')
            ->orWhere('client_city', 'LIKE', '%Wattala%')
            ->count();

        $this->command->info("Successfully created {$createdAppointments} appointments!");
        $this->command->info("📅 Date range: July 2nd, 2025 to " . Carbon::today()->format('M j, Y'));
        $this->command->info("🏙️ Colombo area appointments: {$colomboAppointments}");
        $this->command->info("🌊 Negombo area appointments: {$negomboAppointments}");
        $this->command->info("\n📊 Status breakdown:");

        // Show status breakdown
        foreach ($statusDistribution as $status => $count) {
            $actualCount = Appointment::where('status', $status)->count();
            $statusText = ucfirst(str_replace('_', ' ', $status));
            $this->command->info("   • {$statusText}: {$actualCount} appointments");
        }

        $this->command->info("\n💰 Price range: LKR " . number_format(Appointment::min('total_price'), 2) .
            " - LKR " . number_format(Appointment::max('total_price'), 2));
        $this->command->info("🌴 All appointments include realistic Sri Lankan context and locations");
    }
}

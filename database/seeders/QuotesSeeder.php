<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Quote;
use App\Models\User;
use App\Models\Service;
use Carbon\Carbon;

class QuotesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all clients and providers with services
        $clients = User::where('role', 'client')->get();
        $services = Service::with(['provider', 'category'])->get();

        if ($clients->isEmpty()) {
            $this->command->warn('No clients found. Please run the client seeder first.');
            return;
        }

        if ($services->isEmpty()) {
            $this->command->warn('No services found. Please run the services seeder first.');
            return;
        }

        // Colombo and Negombo areas
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

        // Contact preferences
        $contactPreferences = ['phone', 'message'];
        $locationTypes = ['client_address', 'provider_location', 'custom_location'];
        $urgencyLevels = ['low', 'normal', 'high', 'urgent'];

        // Status distribution for realistic quote lifecycle
        $statusDistribution = [
            Quote::STATUS_PENDING => 8,      // 25% pending provider response
            Quote::STATUS_QUOTED => 10,      // 31% awaiting client response
            Quote::STATUS_ACCEPTED => 6,     // 19% accepted by client
            Quote::STATUS_CONVERTED => 4,    // 12% converted to appointments
            Quote::STATUS_REJECTED => 3,     // 9% rejected by client
            Quote::STATUS_EXPIRED => 1,      // 3% expired
        ];

        // Realistic client requirements by service category
        $clientRequirements = [
            'Plumbing Services' => [
                'Kitchen sink is completely blocked and water is backing up',
                'Bathroom shower has very low water pressure',
                'Water heater not heating properly, only lukewarm water',
                'Toilet keeps running and wasting water',
                'Main water pipe has a leak near the street',
                'Need to install new bathroom fixtures in master bedroom',
                'Water tank overflow issue during heavy rain',
                'Kitchen tap dripping constantly even when turned off'
            ],
            'Home Cleaning' => [
                'Need deep cleaning after home renovation work',
                'Regular monthly cleaning for 3-bedroom house',
                'Post-party cleanup with focus on kitchen and living room',
                'Move-out cleaning for apartment handover',
                'Pre-Avurudu cleaning including all rooms and windows',
                'Carpet and upholstery cleaning for living room set',
                'Kitchen deep clean including oven and refrigerator',
                'Bathroom deep cleaning and sanitization'
            ],
            'Moving & Packing' => [
                'Moving from Colombo apartment to Gampaha house',
                'Office relocation with computers and sensitive equipment',
                'Need help packing and moving within same building',
                'International move preparation and packing',
                'Student accommodation move with minimal furniture',
                'Senior citizen move requiring extra care and patience',
                'Piano and heavy furniture moving between floors',
                'Emergency move due to lease termination'
            ],
            'Electrical Work' => [
                'Frequent power trips in main electrical panel',
                'Need additional power outlets for home office setup',
                'Ceiling fan installation in three bedrooms',
                'Air conditioning electrical points for new AC units',
                'Outdoor lighting installation for garden area',
                'Electrical safety inspection before house sale',
                'Generator connection and automatic transfer switch',
                'Smart home electrical setup with WiFi switches'
            ],
            'Gardening & Landscaping' => [
                'Front garden complete makeover with low-maintenance plants',
                'Monthly garden maintenance for large compound',
                'Vegetable garden setup with organic growing methods',
                'Tree pruning and removal of overgrown branches',
                'Lawn installation and irrigation system setup',
                'Rooftop garden design for apartment terrace',
                'Plant disease treatment and garden recovery',
                'Monsoon preparation and drainage improvement'
            ],
            'Auto & Vehicle Services' => [
                'Weekly car wash service for two vehicles',
                'Pre-trip vehicle inspection and maintenance',
                'Car detailing for wedding ceremony',
                'Monthly vehicle maintenance package',
                'Tire replacement and wheel alignment service',
                'Battery replacement for car that won\'t start',
                'Brake service and safety inspection',
                'Air conditioning service for summer season'
            ]
        ];

        // Provider response templates by category
        $providerResponses = [
            'Plumbing Services' => [
                'I can fix this issue same day. Will bring all necessary parts and equipment. Includes 6-month warranty on repair work.',
                'Available this weekend. Will assess the problem first and provide detailed cost breakdown before starting work.',
                'This requires specialized equipment. Can complete within 2 days including procurement of quality fittings.',
                'Emergency service available. Can start work immediately and ensure proper functioning before leaving premises.'
            ],
            'Home Cleaning' => [
                'Can provide eco-friendly deep cleaning service. All equipment and materials included. Flexible timing available.',
                'Professional team of 3 cleaners with full insurance coverage. Can complete in single day with minimal disruption.',
                'Specialized in post-construction cleanup. Will bring industrial equipment and ensure dust-free environment.',
                'Regular cleaning service available with monthly discount. All supplies included in quoted price.'
            ],
            'Moving & Packing' => [
                'Professional movers with 10+ years experience. Full insurance coverage and careful handling of valuables.',
                'Can provide packing materials and storage boxes. Flexible scheduling including weekend availability.',
                'Specialized in office relocations with IT equipment expertise. Minimal business disruption guaranteed.',
                'Door-to-door service with unpacking and furniture arrangement. Transparent pricing with no hidden charges.'
            ],
            'Electrical Work' => [
                'CEB-certified electrician with safety compliance guarantee. All materials included in quoted price.',
                'Can complete installation within 2 days. Includes safety testing and certificate of completion.',
                'Emergency electrical service available 24/7. Quick response time with professional equipment.',
                'Smart home installation specialist. Includes configuration and user training for all devices.'
            ],
            'Gardening & Landscaping' => [
                'Landscape designer with native plant expertise. Includes soil preparation and initial plant care.',
                'Regular maintenance service with organic methods. Monsoon-resistant plant selection available.',
                'Complete garden transformation using drought-resistant varieties. Includes irrigation setup.',
                'Tree surgery specialist with proper equipment. Includes cleanup and waste disposal service.'
            ],
            'Auto & Vehicle Services' => [
                'Mobile service available at your location. All genuine parts with manufacturer warranty.',
                'Experienced mechanic with 15+ years in automobile service. Free diagnostic and transparent pricing.',
                'Professional detailing service with premium products. Interior and exterior complete makeover.',
                'Preventive maintenance specialist. Includes vehicle health report and service recommendations.'
            ]
        ];

        $createdQuotes = 0;
        $startDate = Carbon::create(2025, 7, 2); // July 2nd, 2025
        $endDate = Carbon::today();

        // Create quotes for each status
        foreach ($statusDistribution as $status => $count) {
            for ($i = 0; $i < $count; $i++) {
                // Select random client and service
                $client = $clients->random();
                $service = $services->random();
                $provider = $service->provider;
                $categoryName = $service->category->name ?? 'General';

                // Determine location (70% Colombo, 30% Negombo)
                $isColomboBased = rand(1, 100) <= 70;
                $clientCity = $isColomboBased
                    ? $colomboAreas[array_rand($colomboAreas)]
                    : $negomboAreas[array_rand($negomboAreas)];

                // Generate realistic client requirements
                $categoryRequirements = $clientRequirements[$categoryName] ?? [
                    'Need professional service for ' . strtolower($categoryName),
                    'Looking for reliable and experienced service provider',
                    'Quality work required with reasonable pricing',
                    'Flexible timing preferred for service delivery'
                ];
                $clientRequirement = $categoryRequirements[array_rand($categoryRequirements)];

                // Generate contact details
                $clientPhone = $phonePrefix[array_rand($phonePrefix)] . '-' . rand(10, 99) . '-' . rand(10000, 99999);
                $clientEmail = rand(1, 100) <= 80 ? $client->email : null; // 80% provide email

                // Create quote request data
                $locationType = $locationTypes[array_rand($locationTypes)];
                $address = $locationType !== 'provider_location' ?
                    'No. ' . rand(1, 999) . ', ' . $clientCity : null;

                // Generate dates based on status
                if (in_array($status, [Quote::STATUS_PENDING])) {
                    // Recent quotes awaiting response
                    $createdAt = Carbon::now()->subDays(rand(1, 7));
                    $requestedDate = Carbon::now()->addDays(rand(1, 14))->toDateString();
                } else {
                    // Historical quotes
                    $createdAt = Carbon::createFromTimestamp(rand($startDate->timestamp, $endDate->timestamp));
                    $requestedDate = $createdAt->copy()->addDays(rand(1, 21))->toDateString();
                }

                $quoteRequestData = [
                    'requested_date' => $requestedDate,
                    'requested_time' => ['09:00', '10:00', '14:00', '15:00'][array_rand(['09:00', '10:00', '14:00', '15:00'])],
                    'location_type' => $locationType,
                    'address' => $address,
                    'city' => $clientCity,
                    'phone' => $clientPhone,
                    'email' => $clientEmail,
                    'contact_preference' => $contactPreferences[array_rand($contactPreferences)],
                    'special_requirements' => rand(1, 100) <= 30 ? 'Please call before arriving' : null,
                    'urgency' => $urgencyLevels[array_rand($urgencyLevels)],
                    'quote_type' => 'standard'
                ];

                // Provider response data (if quote has been responded to)
                $quotedPrice = null;
                $durationHours = null;
                $quoteDetails = null;
                $validUntil = null;
                $respondedAt = null;
                $travelFee = 0.00;

                if (!in_array($status, [Quote::STATUS_PENDING])) {
                    // Calculate realistic pricing
                    $basePrice = $service->base_price;
                    $priceVariation = rand(-20, 30) / 100; // -20% to +30% variation
                    $quotedPrice = round($basePrice * (1 + $priceVariation), 2);
                    $durationHours = $service->duration_hours;
                    $travelFee = $isColomboBased ? rand(500, 2000) : rand(300, 1500);

                    // Provider response
                    $categoryResponses = $providerResponses[$categoryName] ?? [
                        'Professional service available. Can discuss requirements and provide detailed solution.',
                        'Experienced in this type of work. Quality service guaranteed with reasonable pricing.',
                        'Available for consultation. Will provide comprehensive service as per your requirements.'
                    ];
                    $quoteDetails = $categoryResponses[array_rand($categoryResponses)];

                    $respondedAt = $createdAt->copy()->addHours(rand(2, 48));
                    $validUntil = $respondedAt->copy()->addDays(7); // 7 days validity
                }

                // Client response data
                $clientNotes = null;
                $clientRespondedAt = null;

                if (in_array($status, [Quote::STATUS_ACCEPTED, Quote::STATUS_REJECTED, Quote::STATUS_CONVERTED])) {
                    $clientRespondedAt = $respondedAt->copy()->addHours(rand(1, 168)); // Respond within a week

                    if ($status === Quote::STATUS_ACCEPTED || $status === Quote::STATUS_CONVERTED) {
                        $acceptanceNotes = [
                            'Looks good. When can we start?',
                            'Price is reasonable. Please confirm the date.',
                            'Acceptable. Will be available at the requested time.',
                            'Thank you for the detailed quote. Let\'s proceed.'
                        ];
                        $clientNotes = $acceptanceNotes[array_rand($acceptanceNotes)];
                    } else {
                        $rejectionNotes = [
                            'Price is higher than expected. Thank you anyway.',
                            'Found another provider. Thanks for the quote.',
                            'Timeline doesn\'t work for us. Maybe next time.',
                            'Changed our mind about the service. Thank you.'
                        ];
                        $clientNotes = $rejectionNotes[array_rand($rejectionNotes)];
                    }
                }

                // Create the quote
                $quote = Quote::create([
                    'client_id' => $client->id,
                    'provider_id' => $provider->id,
                    'service_id' => $service->id,
                    'title' => 'Quote Request for ' . $service->title,
                    'description' => $clientRequirement,
                    'quote_request_data' => $quoteRequestData,
                    'client_requirements' => $clientRequirement,
                    'quoted_price' => $quotedPrice,
                    'duration_hours' => $durationHours,
                    'travel_fee' => $travelFee,
                    'quote_details' => $quoteDetails,
                    'terms_and_conditions' => 'Standard terms apply. Payment due upon completion.',
                    'pricing_breakdown' => $quotedPrice ? [
                        'base_price' => $quotedPrice - ($travelFee ?? 0),
                        'travel_fee' => $travelFee ?? 0,
                        'total' => $quotedPrice
                    ] : null,
                    'status' => $status,
                    'valid_until' => $validUntil,
                    'client_notes' => $clientNotes,
                    'provider_notes' => null,
                    'responded_at' => $respondedAt,
                    'client_responded_at' => $clientRespondedAt,
                    'appointment_id' => null, // Will be updated if converted
                    'created_at' => $createdAt,
                    'updated_at' => $clientRespondedAt ?? $respondedAt ?? $createdAt
                ]);

                $createdQuotes++;
            }
        }

        // Statistics
        $colomboQuotes = Quote::whereJsonContains('quote_request_data->city', $colomboAreas)->count();
        $negomboQuotes = Quote::whereJsonContains('quote_request_data->city', $negomboAreas)->count();

        $this->command->info("Successfully created {$createdQuotes} quotes!");
        $this->command->info("📅 Date range: July 2nd, 2025 to " . Carbon::today()->format('M j, Y'));
        $this->command->info("🏙️ Colombo area quotes: {$colomboQuotes}");
        $this->command->info("🌊 Negombo area quotes: {$negomboQuotes}");
        $this->command->info("\n📊 Status breakdown:");

        // Show status breakdown
        foreach ($statusDistribution as $status => $count) {
            $actualCount = Quote::where('status', $status)->count();
            $statusText = ucfirst(str_replace('_', ' ', $status));
            $this->command->info("   • {$statusText}: {$actualCount} quotes");
        }

        $this->command->info("\n💰 Price range: LKR " . number_format(Quote::whereNotNull('quoted_price')->min('quoted_price'), 2) .
            " - LKR " . number_format(Quote::whereNotNull('quoted_price')->max('quoted_price'), 2));
        $this->command->info("🌴 All quotes include realistic Sri Lankan context and requirements");
    }
}

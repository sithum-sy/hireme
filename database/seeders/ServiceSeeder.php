<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all service providers
        $providers = User::where('role', 'service_provider')->get();
        
        if ($providers->isEmpty()) {
            $this->command->warn('No service providers found. Please run ServiceProviderSeeder first.');
            return;
        }

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

        // Service templates by category
        $serviceTemplates = [
            'Home Cleaning' => [
                [
                    'title' => 'Deep House Cleaning',
                    'description' => 'Complete deep cleaning service including all rooms, kitchen, bathrooms, and common areas. We use eco-friendly products and professional equipment.',
                    'pricing_type' => 'fixed',
                    'base_price' => 8500.00,
                    'duration_hours' => 4.00,
                    'requirements' => 'Access to all areas, power supply, basic cleaning supplies if preferred',
                    'includes' => 'All cleaning supplies, vacuum cleaning, mopping, dusting, bathroom sanitization',
                    'service_areas' => ['Living Room', 'Bedrooms', 'Kitchen', 'Bathrooms', 'Balcony']
                ],
                [
                    'title' => 'Regular House Cleaning',
                    'description' => 'Weekly or bi-weekly house cleaning to maintain your home. Perfect for busy families and professionals.',
                    'pricing_type' => 'hourly',
                    'base_price' => 1200.00,
                    'duration_hours' => 3.00,
                    'requirements' => 'Regular access to property, storage space for supplies',
                    'includes' => 'Dusting, vacuuming, mopping, bathroom cleaning, kitchen cleaning',
                    'service_areas' => ['All Rooms', 'Kitchen', 'Bathrooms']
                ],
                [
                    'title' => 'Office Cleaning Service',
                    'description' => 'Professional office cleaning for small to medium businesses. Daily, weekly or monthly packages available.',
                    'pricing_type' => 'fixed',
                    'base_price' => 6000.00,
                    'duration_hours' => 2.50,
                    'requirements' => 'After hours access preferred, waste disposal area',
                    'includes' => 'Desk cleaning, floor cleaning, restroom sanitization, trash removal',
                    'service_areas' => ['Workstations', 'Meeting Rooms', 'Restrooms', 'Reception']
                ]
            ],
            'Plumbing Services' => [
                [
                    'title' => 'Emergency Plumbing Repair',
                    'description' => '24/7 emergency plumbing services for leaks, blockages, and urgent repairs. Quick response time guaranteed.',
                    'pricing_type' => 'hourly',
                    'base_price' => 2500.00,
                    'duration_hours' => 1.00,
                    'requirements' => 'Access to water mains, description of problem',
                    'includes' => 'Diagnosis, basic tools, minor parts replacement',
                    'service_areas' => ['Bathrooms', 'Kitchen', 'Utility Areas']
                ],
                [
                    'title' => 'Bathroom Plumbing Installation',
                    'description' => 'Complete bathroom plumbing installation including fixtures, pipes, and water connections.',
                    'pricing_type' => 'fixed',
                    'base_price' => 25000.00,
                    'duration_hours' => 8.00,
                    'requirements' => 'Fixtures provided by client, clear access to work area',
                    'includes' => 'All plumbing work, pipe fitting, fixture installation, testing',
                    'service_areas' => ['Bathroom']
                ],
                [
                    'title' => 'Water Heater Service',
                    'description' => 'Water heater installation, repair, and maintenance services for all major brands.',
                    'pricing_type' => 'fixed',
                    'base_price' => 5500.00,
                    'duration_hours' => 2.00,
                    'requirements' => 'Existing electrical/gas connections, water heater unit if replacement',
                    'includes' => 'Installation/repair, testing, warranty on workmanship',
                    'service_areas' => ['Utility Room', 'Bathroom']
                ]
            ],
            'Electrical Services' => [
                [
                    'title' => 'House Wiring & Rewiring',
                    'description' => 'Complete electrical wiring services for new homes or rewiring of existing properties. Licensed and insured.',
                    'pricing_type' => 'custom',
                    'base_price' => 15000.00,
                    'duration_hours' => 6.00,
                    'requirements' => 'Building plans, electrical permit, clear access to walls',
                    'includes' => 'All wiring materials, switches, outlets, electrical panel work',
                    'service_areas' => ['Entire House']
                ],
                [
                    'title' => 'Fan & Light Installation',
                    'description' => 'Professional installation of ceiling fans, light fixtures, and electrical appliances.',
                    'pricing_type' => 'fixed',
                    'base_price' => 3500.00,
                    'duration_hours' => 2.00,
                    'requirements' => 'Fixtures provided by client, power supply available',
                    'includes' => 'Installation, wiring, testing, cleanup',
                    'service_areas' => ['Any Room']
                ],
                [
                    'title' => 'Electrical Troubleshooting',
                    'description' => 'Diagnose and fix electrical problems, power outages, faulty outlets, and circuit issues.',
                    'pricing_type' => 'hourly',
                    'base_price' => 2000.00,
                    'duration_hours' => 1.50,
                    'requirements' => 'Access to electrical panel, description of issues',
                    'includes' => 'Problem diagnosis, basic repairs, safety inspection',
                    'service_areas' => ['Entire Property']
                ]
            ],
            'Gardening & Landscaping' => [
                [
                    'title' => 'Garden Design & Setup',
                    'description' => 'Complete garden design and landscaping services including plant selection and layout planning.',
                    'pricing_type' => 'custom',
                    'base_price' => 20000.00,
                    'duration_hours' => 8.00,
                    'requirements' => 'Site measurements, preferred plant types, water access',
                    'includes' => 'Design consultation, soil preparation, plant installation, initial care guide',
                    'service_areas' => ['Front Garden', 'Back Garden', 'Balcony Gardens']
                ],
                [
                    'title' => 'Lawn Maintenance',
                    'description' => 'Regular lawn care including grass cutting, edging, fertilizing, and seasonal maintenance.',
                    'pricing_type' => 'fixed',
                    'base_price' => 4500.00,
                    'duration_hours' => 2.00,
                    'requirements' => 'Access to garden, water supply for tools',
                    'includes' => 'Mowing, edging, leaf collection, basic fertilizing',
                    'service_areas' => ['Lawn Areas', 'Garden Borders']
                ],
                [
                    'title' => 'Tree Pruning & Care',
                    'description' => 'Professional tree pruning, trimming, and health assessment for garden trees and shrubs.',
                    'pricing_type' => 'hourly',
                    'base_price' => 1800.00,
                    'duration_hours' => 3.00,
                    'requirements' => 'Access to trees, disposal area for trimmings',
                    'includes' => 'Pruning, health assessment, cleanup, care recommendations',
                    'service_areas' => ['Garden', 'Front Yard', 'Compound']
                ]
            ],
            'Pet Care' => [
                [
                    'title' => 'Dog Walking Service',
                    'description' => 'Daily dog walking services for busy pet owners. Individual or group walks available.',
                    'pricing_type' => 'hourly',
                    'base_price' => 1500.00,
                    'duration_hours' => 1.00,
                    'requirements' => 'Dog leash and collar, vaccination records, emergency contact',
                    'includes' => 'Exercise, waste cleanup, fresh water, basic health monitoring',
                    'service_areas' => ['Neighborhood Parks', 'Streets', 'Walking Areas']
                ],
                [
                    'title' => 'Pet Sitting at Home',
                    'description' => 'In-home pet care while you\'re away. Feeding, playing, and companionship for your pets.',
                    'pricing_type' => 'hourly',
                    'base_price' => 1200.00,
                    'duration_hours' => 2.00,
                    'requirements' => 'Pet food and supplies, emergency vet contact, house keys',
                    'includes' => 'Feeding, exercise, companionship, litter box cleaning, updates',
                    'service_areas' => ['Client\'s Home']
                ],
                [
                    'title' => 'Pet Grooming Service',
                    'description' => 'Professional pet grooming including bathing, brushing, nail trimming, and basic health checks.',
                    'pricing_type' => 'fixed',
                    'base_price' => 4500.00,
                    'duration_hours' => 2.50,
                    'requirements' => 'Pet health records, grooming preferences, towels',
                    'includes' => 'Bathing, brushing, nail trim, ear cleaning, basic health check',
                    'service_areas' => ['Client\'s Home', 'Outdoor Area']
                ]
            ],
            'Handyman Services' => [
                [
                    'title' => 'Furniture Assembly',
                    'description' => 'Professional assembly of furniture from major retailers. Fast and reliable service with tools provided.',
                    'pricing_type' => 'fixed',
                    'base_price' => 3000.00,
                    'duration_hours' => 2.00,
                    'requirements' => 'Furniture boxes with all parts, assembly instructions, clear workspace',
                    'includes' => 'Complete assembly, hardware check, positioning, cleanup',
                    'service_areas' => ['Any Room']
                ],
                [
                    'title' => 'Wall Mounting & Hanging',
                    'description' => 'TV mounting, picture hanging, shelf installation, and wall-mounted furniture setup.',
                    'pricing_type' => 'hourly',
                    'base_price' => 2200.00,
                    'duration_hours' => 1.50,
                    'requirements' => 'Items to be mounted, preferred locations, wall type information',
                    'includes' => 'Mounting hardware, level installation, cable management, cleanup',
                    'service_areas' => ['Living Room', 'Bedroom', 'Office']
                ],
                [
                    'title' => 'General Home Repairs',
                    'description' => 'Small to medium home repairs including door fixes, cabinet repairs, and minor maintenance.',
                    'pricing_type' => 'hourly',
                    'base_price' => 2000.00,
                    'duration_hours' => 2.00,
                    'requirements' => 'List of repair items, access to areas needing work',
                    'includes' => 'Basic tools, minor hardware, repair work, testing',
                    'service_areas' => ['Entire House']
                ]
            ],
            'Moving & Packing' => [
                [
                    'title' => 'House Moving Service',
                    'description' => 'Complete house moving service with professional packers and movers. Safe transport guaranteed.',
                    'pricing_type' => 'custom',
                    'base_price' => 35000.00,
                    'duration_hours' => 8.00,
                    'requirements' => 'Inventory list, moving date, both addresses, parking access',
                    'includes' => 'Packing materials, loading, transport, unloading, furniture assembly',
                    'service_areas' => ['Entire House']
                ],
                [
                    'title' => 'Packing Service Only',
                    'description' => 'Professional packing service for households and offices. All materials provided.',
                    'pricing_type' => 'hourly',
                    'base_price' => 1800.00,
                    'duration_hours' => 4.00,
                    'requirements' => 'Items to be packed, preferred packing timeline',
                    'includes' => 'All packing materials, careful packing, labeling, inventory list',
                    'service_areas' => ['Any Room', 'Entire House']
                ],
                [
                    'title' => 'Furniture Moving',
                    'description' => 'Heavy furniture and appliance moving service. Local moves and rearrangement.',
                    'pricing_type' => 'fixed',
                    'base_price' => 8500.00,
                    'duration_hours' => 3.00,
                    'requirements' => 'List of items, floor plans, access routes clear',
                    'includes' => 'Professional movers, equipment, floor protection, placement',
                    'service_areas' => ['Within Property', 'Local Area']
                ]
            ],
            'Painting & Decorating' => [
                [
                    'title' => 'Interior House Painting',
                    'description' => 'Complete interior painting service including wall preparation, priming, and finishing.',
                    'pricing_type' => 'custom',
                    'base_price' => 18000.00,
                    'duration_hours' => 12.00,
                    'requirements' => 'Paint colors selected, furniture moved, room measurements',
                    'includes' => 'Wall preparation, primer, paint, brushes, cleanup, touch-ups',
                    'service_areas' => ['Bedrooms', 'Living Areas', 'Kitchen']
                ],
                [
                    'title' => 'Exterior Wall Painting',
                    'description' => 'Weather-resistant exterior painting for houses and commercial buildings.',
                    'pricing_type' => 'custom',
                    'base_price' => 25000.00,
                    'duration_hours' => 16.00,
                    'requirements' => 'Surface cleaning completed, paint type approved, weather permitting',
                    'includes' => 'Surface preparation, weather-resistant paint, equipment, cleanup',
                    'service_areas' => ['Exterior Walls', 'Gates', 'Boundary Walls']
                ],
                [
                    'title' => 'Room Accent Painting',
                    'description' => 'Feature wall painting and decorative finishes for single rooms or accent areas.',
                    'pricing_type' => 'fixed',
                    'base_price' => 6500.00,
                    'duration_hours' => 4.00,
                    'requirements' => 'Design preferences, color selection, room prepared',
                    'includes' => 'Design consultation, premium paints, artistic finish, cleanup',
                    'service_areas' => ['Feature Walls', 'Single Rooms']
                ]
            ],
            'Appliance Repair' => [
                [
                    'title' => 'Washing Machine Repair',
                    'description' => 'Expert repair service for all washing machine brands. Quick diagnosis and reliable fixes.',
                    'pricing_type' => 'fixed',
                    'base_price' => 4500.00,
                    'duration_hours' => 2.00,
                    'requirements' => 'Machine model details, description of problem, power access',
                    'includes' => 'Diagnosis, basic parts, repair work, testing, warranty',
                    'service_areas' => ['Utility Room', 'Bathroom']
                ],
                [
                    'title' => 'Refrigerator Service',
                    'description' => 'Refrigerator repair and maintenance including cooling issues, compressor problems.',
                    'pricing_type' => 'hourly',
                    'base_price' => 2800.00,
                    'duration_hours' => 1.50,
                    'requirements' => 'Machine accessible, problem description, power supply',
                    'includes' => 'Complete diagnosis, gas refilling if needed, parts replacement',
                    'service_areas' => ['Kitchen', 'Pantry']
                ],
                [
                    'title' => 'Air Conditioner Service',
                    'description' => 'AC repair, cleaning, and maintenance service for all types of air conditioning units.',
                    'pricing_type' => 'fixed',
                    'base_price' => 5500.00,
                    'duration_hours' => 2.50,
                    'requirements' => 'Unit access, power supply, ladder access if needed',
                    'includes' => 'Cleaning, gas check, electrical inspection, performance testing',
                    'service_areas' => ['Bedrooms', 'Living Room', 'Office']
                ]
            ],
            'Laundry & Ironing' => [
                [
                    'title' => 'Pickup & Delivery Laundry',
                    'description' => 'Complete laundry service with pickup and delivery. Professional washing and folding.',
                    'pricing_type' => 'fixed',
                    'base_price' => 2500.00,
                    'duration_hours' => 1.00,
                    'requirements' => 'Laundry sorted, special instructions noted, pickup schedule',
                    'includes' => 'Pickup, washing, drying, folding, delivery, eco-friendly detergents',
                    'service_areas' => ['Client Location']
                ],
                [
                    'title' => 'Ironing Service',
                    'description' => 'Professional ironing service for shirts, formal wear, and household linens.',
                    'pricing_type' => 'hourly',
                    'base_price' => 1200.00,
                    'duration_hours' => 2.00,
                    'requirements' => 'Clean clothes ready for ironing, hangers provided',
                    'includes' => 'Professional ironing, hanging, minor repairs, stain treatment',
                    'service_areas' => ['Client\'s Home']
                ],
                [
                    'title' => 'Dry Cleaning Service',
                    'description' => 'Specialized dry cleaning for delicate fabrics, suits, and formal wear.',
                    'pricing_type' => 'fixed',
                    'base_price' => 1800.00,
                    'duration_hours' => 0.50,
                    'requirements' => 'Items tagged, special care instructions, pickup arranged',
                    'includes' => 'Professional dry cleaning, pressing, plastic covering, delivery',
                    'service_areas' => ['Pickup Locations']
                ]
            ],
            'Grocery & Errands' => [
                [
                    'title' => 'Grocery Shopping Service',
                    'description' => 'Personal grocery shopping service. Fresh produce selection and household essentials.',
                    'pricing_type' => 'hourly',
                    'base_price' => 1500.00,
                    'duration_hours' => 2.00,
                    'requirements' => 'Shopping list, preferred stores, payment method, delivery address',
                    'includes' => 'Shopping, selection of fresh items, receipt tracking, delivery',
                    'service_areas' => ['Supermarkets', 'Local Markets']
                ],
                [
                    'title' => 'Pharmacy & Medical Errands',
                    'description' => 'Prescription pickup, medical supply purchases, and healthcare-related errands.',
                    'pricing_type' => 'fixed',
                    'base_price' => 1200.00,
                    'duration_hours' => 1.00,
                    'requirements' => 'Prescription details, ID if required, exact instructions',
                    'includes' => 'Prescription pickup, medical supply purchase, secure delivery',
                    'service_areas' => ['Pharmacies', 'Medical Centers']
                ],
                [
                    'title' => 'Bill Payment & Banking',
                    'description' => 'Utility bill payments, bank visits, and official document submission services.',
                    'pricing_type' => 'hourly',
                    'base_price' => 1800.00,
                    'duration_hours' => 1.50,
                    'requirements' => 'Bills and documents, payment details, authorization letters',
                    'includes' => 'Queue waiting, payments processing, receipt collection, updates',
                    'service_areas' => ['Banks', 'Government Offices', 'Utility Companies']
                ]
            ],
            'Cooking & Meal Prep' => [
                [
                    'title' => 'Daily Meal Preparation',
                    'description' => 'Home-cooked Sri Lankan meals prepared in your kitchen. Healthy and delicious options.',
                    'pricing_type' => 'hourly',
                    'base_price' => 2200.00,
                    'duration_hours' => 3.00,
                    'requirements' => 'Groceries provided, kitchen access, meal preferences discussed',
                    'includes' => 'Meal planning, cooking, cleanup, food storage instructions',
                    'service_areas' => ['Client\'s Kitchen']
                ],
                [
                    'title' => 'Special Event Catering',
                    'description' => 'Home catering for small gatherings, parties, and special occasions.',
                    'pricing_type' => 'custom',
                    'base_price' => 15000.00,
                    'duration_hours' => 6.00,
                    'requirements' => 'Guest count, menu preferences, kitchen facilities, serving requirements',
                    'includes' => 'Menu planning, shopping, cooking, presentation, cleanup',
                    'service_areas' => ['Client\'s Home', 'Event Venue']
                ],
                [
                    'title' => 'Weekly Meal Prep',
                    'description' => 'Batch cooking and meal prep service for busy professionals and families.',
                    'pricing_type' => 'fixed',
                    'base_price' => 8500.00,
                    'duration_hours' => 4.00,
                    'requirements' => 'Storage containers, ingredient preferences, dietary restrictions',
                    'includes' => 'Menu planning, batch cooking, portioning, labeling, storage',
                    'service_areas' => ['Client\'s Kitchen']
                ]
            ],
            'Organization & Decluttering' => [
                [
                    'title' => 'Closet Organization',
                    'description' => 'Complete closet makeover with sorting, organizing, and storage solutions.',
                    'pricing_type' => 'fixed',
                    'base_price' => 6500.00,
                    'duration_hours' => 4.00,
                    'requirements' => 'Closet access, donation bags, organizational preferences',
                    'includes' => 'Sorting, categorizing, storage solutions, labeling system',
                    'service_areas' => ['Bedrooms', 'Walk-in Closets']
                ],
                [
                    'title' => 'Home Office Organization',
                    'description' => 'Organize home office space for maximum productivity and efficiency.',
                    'pricing_type' => 'hourly',
                    'base_price' => 2000.00,
                    'duration_hours' => 3.00,
                    'requirements' => 'Office equipment list, workflow preferences, filing needs',
                    'includes' => 'Desk organization, filing system, cable management, workflow optimization',
                    'service_areas' => ['Home Office', 'Study Room']
                ],
                [
                    'title' => 'Whole House Decluttering',
                    'description' => 'Complete home decluttering and organization service for fresh living spaces.',
                    'pricing_type' => 'custom',
                    'base_price' => 12000.00,
                    'duration_hours' => 8.00,
                    'requirements' => 'Full house access, decluttering goals, donation preferences',
                    'includes' => 'Room-by-room sorting, organization systems, donation coordination',
                    'service_areas' => ['Entire House']
                ]
            ],
            'Window & Gutter Cleaning' => [
                [
                    'title' => 'Window Cleaning Service',
                    'description' => 'Professional window cleaning for residential properties. Interior and exterior cleaning.',
                    'pricing_type' => 'fixed',
                    'base_price' => 4500.00,
                    'duration_hours' => 3.00,
                    'requirements' => 'Window access, ladder access for upper floors, water supply',
                    'includes' => 'Interior and exterior cleaning, sill cleaning, streak-free finish',
                    'service_areas' => ['All Windows', 'Glass Doors', 'Skylights']
                ],
                [
                    'title' => 'Gutter Cleaning & Maintenance',
                    'description' => 'Complete gutter cleaning and minor repair service to prevent water damage.',
                    'pricing_type' => 'fixed',
                    'base_price' => 7500.00,
                    'duration_hours' => 4.00,
                    'requirements' => 'Roof access, ladder placement area, debris disposal',
                    'includes' => 'Debris removal, downspout cleaning, minor repairs, inspection',
                    'service_areas' => ['Roof Gutters', 'Downspouts']
                ],
                [
                    'title' => 'Pressure Washing Service',
                    'description' => 'High-pressure cleaning for driveways, patios, walls, and outdoor surfaces.',
                    'pricing_type' => 'hourly',
                    'base_price' => 2500.00,
                    'duration_hours' => 2.50,
                    'requirements' => 'Water supply, electrical access, area preparation',
                    'includes' => 'Pressure washing equipment, cleaning solutions, surface protection',
                    'service_areas' => ['Driveways', 'Patios', 'Exterior Walls', 'Walkways']
                ]
            ]
        ];

        $createdServices = 0;

        foreach ($providers as $provider) {
            $providerProfile = $provider->providerProfile;
            if (!$providerProfile) continue;

            // Extract location from service_location JSON
            $serviceLocation = json_decode($providerProfile->service_location, true);
            $latitude = $serviceLocation['latitude'] ?? null;
            $longitude = $serviceLocation['longitude'] ?? null;
            $city = $serviceLocation['city'] ?? 'Negombo';

            // Find matching category for this provider's business
            $businessName = $providerProfile->business_name;
            $categoryName = null;

            // Match business category based on business name patterns
            foreach ($serviceTemplates as $category => $templates) {
                if (stripos($businessName, 'clean') !== false && $category === 'Home Cleaning') {
                    $categoryName = $category;
                    break;
                } elseif (stripos($businessName, 'plumb') !== false && $category === 'Plumbing Services') {
                    $categoryName = $category;
                    break;
                } elseif (stripos($businessName, 'electric') !== false && $category === 'Electrical Services') {
                    $categoryName = $category;
                    break;
                } elseif (stripos($businessName, 'garden') !== false || stripos($businessName, 'green') !== false || stripos($businessName, 'thumb') !== false) {
                    $categoryName = 'Gardening & Landscaping';
                    break;
                } elseif (stripos($businessName, 'paw') !== false || stripos($businessName, 'pet') !== false) {
                    $categoryName = 'Pet Care';
                    break;
                } elseif (stripos($businessName, 'fix') !== false || stripos($businessName, 'handyman') !== false) {
                    $categoryName = 'Handyman Services';
                    break;
                } elseif (stripos($businessName, 'move') !== false || stripos($businessName, 'swift') !== false) {
                    $categoryName = 'Moving & Packing';
                    break;
                } elseif (stripos($businessName, 'paint') !== false || stripos($businessName, 'color') !== false) {
                    $categoryName = 'Painting & Decorating';
                    break;
                } elseif (stripos($businessName, 'appliance') !== false || stripos($businessName, 'doctor') !== false) {
                    $categoryName = 'Appliance Repair';
                    break;
                } elseif (stripos($businessName, 'laundry') !== false || stripos($businessName, 'fresh') !== false) {
                    $categoryName = 'Laundry & Ironing';
                    break;
                } elseif (stripos($businessName, 'errand') !== false || stripos($businessName, 'quick') !== false) {
                    $categoryName = 'Grocery & Errands';
                    break;
                } elseif (stripos($businessName, 'chef') !== false || stripos($businessName, 'cook') !== false) {
                    $categoryName = 'Cooking & Meal Prep';
                    break;
                } elseif (stripos($businessName, 'organiz') !== false || stripos($businessName, 'living') !== false) {
                    $categoryName = 'Organization & Decluttering';
                    break;
                } elseif (stripos($businessName, 'window') !== false || stripos($businessName, 'crystal') !== false) {
                    $categoryName = 'Window & Gutter Cleaning';
                    break;
                }
            }

            if (!$categoryName) continue;

            // Get the category ID
            $category = ServiceCategory::where('name', $categoryName)->first();
            if (!$category) continue;

            $templates = $serviceTemplates[$categoryName];

            // Create 2-3 services per provider
            $numServices = rand(2, 3);
            $selectedTemplates = array_slice($templates, 0, $numServices);

            foreach ($selectedTemplates as $template) {
                // Add some randomization to prices
                $priceVariation = rand(-20, 20) / 100; // -20% to +20%
                $adjustedPrice = $template['base_price'] * (1 + $priceVariation);

                $service = Service::create([
                    'provider_id' => $provider->id,
                    'category_id' => $category->id,
                    'title' => $template['title'],
                    'description' => $template['description'],
                    'pricing_type' => $template['pricing_type'],
                    'base_price' => round($adjustedPrice, 2),
                    'duration_hours' => $template['duration_hours'],
                    'requirements' => $template['requirements'],
                    'includes' => $template['includes'],
                    'service_areas' => json_encode($template['service_areas']),
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'location_address' => $serviceLocation['address'] ?? null,
                    'location_city' => $city,
                    'location_neighborhood' => null,
                    'service_radius' => $providerProfile->service_area_radius,
                    'is_active' => fake()->boolean(90), // 90% active
                    'views_count' => fake()->numberBetween(10, 500),
                    'bookings_count' => fake()->numberBetween(1, 50),
                    'average_rating' => fake()->randomFloat(1, 3.5, 5.0),
                    'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
                    'updated_at' => fake()->dateTimeBetween('-1 month', 'now'),
                ]);

                $createdServices++;
            }
        }

        $this->command->info("Created {$createdServices} services successfully!");
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Review;
use App\Models\Appointment;
use Carbon\Carbon;

class ReviewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get paid/completed appointments that can have reviews
        $reviewableAppointments = Appointment::whereIn('status', [
            Appointment::STATUS_PAID,
            Appointment::STATUS_REVIEWED,
            Appointment::STATUS_CLOSED
        ])->with(['client', 'provider', 'service'])->get();

        if ($reviewableAppointments->isEmpty()) {
            $this->command->warn('No reviewable appointments found. Please run the appointments seeder first.');
            return;
        }

        $createdReviews = 0;

        // Review distribution (not all appointments get reviews)
        $reviewProbability = 0.7; // 70% of eligible appointments get client reviews
        $providerReviewProbability = 0.4; // 40% get provider reviews back

        // Realistic review comments for different service categories
        $reviewComments = [
            'Plumbing Services' => [
                'positive' => [
                    'Excellent plumber! Fixed my kitchen sink blockage quickly and professionally. Very neat work and cleaned up after the job.',
                    'Highly recommend this service. Came on time, diagnosed the water heater problem correctly, and fixed it with quality parts.',
                    'Professional and skilled plumber. Resolved the bathroom drainage issue permanently. Fair pricing and good communication.',
                    'Outstanding service! Emergency plumbing repair was done efficiently. Very satisfied with the workmanship and reliability.',
                    'Great experience! Plumber was knowledgeable, explained the problem clearly, and provided long-lasting solution.'
                ],
                'average' => [
                    'Good service overall. Plumber was experienced but took longer than expected. Problem was fixed properly though.',
                    'Decent work quality. Price was reasonable for the plumbing repair. Would consider using again for future needs.',
                    'Satisfactory service. Fixed the leak as promised. Communication could have been better but work was done well.'
                ],
                'negative' => [
                    'Service was okay but plumber arrived quite late. Work quality was acceptable but not impressed with punctuality.',
                    'Fixed the immediate problem but had to call back for a minor issue. Overall acceptable but room for improvement.'
                ]
            ],
            'Home Cleaning' => [
                'positive' => [
                    'Fantastic cleaning service! House looks spotless and fresh. Team was professional, efficient, and used eco-friendly products.',
                    'Exceptional deep cleaning! Every corner was thoroughly cleaned. Very impressed with attention to detail and care.',
                    'Outstanding job! Post-renovation cleaning was perfect. Team worked hard and house is now move-in ready.',
                    'Excellent service! Regular cleaning team is reliable, thorough, and trustworthy. Highly recommend for anyone.',
                    'Amazing results! Bathroom and kitchen deep cleaning exceeded expectations. Professional team with quality equipment.'
                ],
                'average' => [
                    'Good cleaning service. Most areas were done well but a few spots needed touch-up. Overall satisfied with results.',
                    'Decent cleaning job. Team was friendly and completed work on time. Some minor areas could have been better.',
                    'Satisfactory service. House is much cleaner now. Would prefer more attention to detail in certain areas.'
                ],
                'negative' => [
                    'Cleaning was basic. Expected more thorough work for the price paid. Some areas were missed during cleaning.',
                    'Service was okay but not exceptional. Team rushed through some areas. Would look for alternatives next time.'
                ]
            ],
            'Moving & Packing' => [
                'positive' => [
                    'Excellent moving service! Team handled our furniture with great care. Professional, efficient, and no damage to items.',
                    'Outstanding movers! Made our house relocation stress-free. Packed everything securely and unpacked at new location.',
                    'Highly professional service! Office move was completed smoothly with minimal business disruption. Great teamwork.',
                    'Fantastic experience! Movers were punctual, careful, and hardworking. Fair pricing for quality service provided.',
                    'Exceptional service! Piano and heavy furniture moved safely between floors. Team was skilled and experienced.'
                ],
                'average' => [
                    'Good moving service overall. Few minor scratches on furniture but most items were handled well. Reasonable pricing.',
                    'Decent movers. Completed job on time but could have been more careful with delicate items. Acceptable service.',
                    'Satisfactory moving service. Team worked hard but organization could have been better. Items arrived safely.'
                ],
                'negative' => [
                    'Moving service was basic. Some damage to furniture during transport. Team worked hard but lacked experience.',
                    'Service was okay but below expectations. Moving took longer than quoted and some items were mishandled.'
                ]
            ],
            'Electrical Work' => [
                'positive' => [
                    'Excellent electrician! Fixed all power trip issues safely and professionally. CEB-certified work with proper documentation.',
                    'Outstanding electrical service! New outlet installation was done perfectly. Clean work and tested everything thoroughly.',
                    'Highly skilled electrician! Ceiling fan installation in all rooms completed efficiently. Great workmanship and cleanup.',
                    'Professional service! Air conditioning electrical points installed properly. Knowledgeable about electrical codes and safety.',
                    'Exceptional work! Smart home electrical setup exceeded expectations. Patient with explanations and user training.'
                ],
                'average' => [
                    'Good electrical work. Problem was fixed but took longer than expected. Final result was satisfactory and safe.',
                    'Decent electrician. Completed the electrical repairs properly but communication could have been clearer about costs.',
                    'Satisfactory service. Electrical installation works well but some minor cleanup was needed after completion.'
                ],
                'negative' => [
                    'Electrical work was basic. Fixed immediate problem but explanations were unclear. Would prefer more professional approach.',
                    'Service was okay but not impressive. Electrical repair works but took multiple visits to complete properly.'
                ]
            ],
            'Auto & Vehicle Services' => [
                'positive' => [
                    'Excellent car service! Detailed cleaning inside and out. Vehicle looks brand new. Professional and reliable team.',
                    'Outstanding mobile car wash! Convenient service at home with quality results. Car is spotless and well-maintained.',
                    'Fantastic vehicle maintenance! Pre-trip inspection was thorough and honest. Trustworthy service with fair pricing.',
                    'Exceptional car detailing! Wedding car looked perfect for ceremony. Attention to detail was remarkable.',
                    'Professional auto service! Monthly maintenance package provides great value. Knowledgeable mechanics with quality work.'
                ],
                'average' => [
                    'Good car service overall. Vehicle cleaning was done well but some areas needed touch-up. Reasonable pricing.',
                    'Decent mobile car wash. Convenient service but results were average. Would use again for regular maintenance.',
                    'Satisfactory vehicle service. Maintenance work completed properly but took longer than expected to finish.'
                ],
                'negative' => [
                    'Car service was basic. Cleaning was superficial and some areas were missed. Expected better quality for price.',
                    'Service was okay but not thorough. Vehicle maintenance addressed immediate needs but lacked comprehensive approach.'
                ]
            ]
        ];

        // Provider response templates
        $providerResponses = [
            'Thank you for the excellent review! It was a pleasure working with you. We appreciate your business.',
            'Thanks for choosing our service! We\'re glad you\'re satisfied with the work quality. Look forward to serving you again.',
            'Really appreciate your feedback! Customer satisfaction is our priority. Thank you for trusting us with your service needs.',
            'Thank you for the positive review! We always strive to provide professional service. Happy to have met your expectations.',
            'Thanks for the kind words! It\'s great to know you\'re pleased with our work. We value your business and recommendation.'
        ];

        foreach ($reviewableAppointments as $appointment) {
            // Determine if this appointment gets reviews
            if (rand(1, 100) / 100 > $reviewProbability) {
                continue; // Skip this appointment
            }

            // Get service category for appropriate comments
            $categoryName = $appointment->service->category->name ?? 'General';
            $categoryComments = $reviewComments[$categoryName] ?? $reviewComments['Home Cleaning'];

            // Generate realistic ratings based on service quality distribution
            // 70% positive (4-5 stars), 25% average (3 stars), 5% negative (1-2 stars)
            $ratingDistribution = rand(1, 100);
            if ($ratingDistribution <= 70) {
                // Positive reviews (4-5 stars)
                $overallRating = rand(8, 10) / 2; // 4.0 to 5.0
                $commentType = 'positive';
            } elseif ($ratingDistribution <= 95) {
                // Average reviews (3 stars)
                $overallRating = 3.0;
                $commentType = 'average';
            } else {
                // Negative reviews (1-2 stars)
                $overallRating = rand(2, 4) / 2; // 1.0 to 2.0
                $commentType = 'negative';
            }

            // Generate individual ratings (slight variation from overall)
            $qualityRating = max(1, min(5, $overallRating + (rand(-2, 2) / 4)));
            $punctualityRating = max(1, min(5, $overallRating + (rand(-2, 2) / 4)));
            $communicationRating = max(1, min(5, $overallRating + (rand(-2, 2) / 4)));
            $valueRating = max(1, min(5, $overallRating + (rand(-2, 2) / 4)));

            // Select appropriate comment
            $comments = $categoryComments[$commentType];
            $reviewComment = $comments[array_rand($comments)];

            // Determine if client would recommend (based on rating)
            $wouldRecommend = $overallRating >= 3.5;

            // Review date (1-7 days after appointment completion)
            $reviewDate = $appointment->completed_at->copy()->addDays(rand(1, 7));

            // Create client-to-provider review
            $clientReview = Review::create([
                'appointment_id' => $appointment->id,
                'reviewer_id' => $appointment->client_id,
                'reviewee_id' => $appointment->provider_id,
                'service_id' => $appointment->service_id,
                'review_type' => Review::TYPE_CLIENT_TO_PROVIDER,
                'rating' => round($overallRating, 1),
                'comment' => $reviewComment,
                'quality_rating' => round($qualityRating, 1),
                'punctuality_rating' => round($punctualityRating, 1),
                'communication_rating' => round($communicationRating, 1),
                'value_rating' => round($valueRating, 1),
                'would_recommend' => $wouldRecommend,
                'review_images' => null, // No images for seeded reviews
                'is_verified' => true, // Verified since it's from completed appointment
                'is_featured' => $overallRating >= 4.5 && rand(1, 100) <= 20, // 20% of 4.5+ reviews are featured
                'is_hidden' => false,
                'status' => Review::STATUS_PUBLISHED,
                'provider_response' => null, // Will be added separately
                'provider_responded_at' => null,
                'helpful_count' => rand(0, 8), // Random helpful votes
                'flagged_at' => null,
                'moderation_notes' => null,
                'created_at' => $reviewDate,
                'updated_at' => $reviewDate
            ]);

            $createdReviews++;

            // Add provider response (60% of positive reviews get responses)
            if ($overallRating >= 4.0 && rand(1, 100) <= 60) {
                $responseDate = $reviewDate->copy()->addDays(rand(1, 3));
                $response = $providerResponses[array_rand($providerResponses)];
                
                $clientReview->update([
                    'provider_response' => $response,
                    'provider_responded_at' => $responseDate,
                    'updated_at' => $responseDate
                ]);
            }

            // Create provider-to-client review (less common)
            if (rand(1, 100) / 100 <= $providerReviewProbability) {
                $providerComments = [
                    'Excellent client! Clear communication and easy to work with. Payment was prompt and professional.',
                    'Great client! Was available during service time and provided good cooperation. Highly recommend.',
                    'Professional client! Clear instructions and requirements. Made the job easier with good preparation.',
                    'Wonderful client! Respectful and understanding. Pleasant working environment and timely payment.',
                    'Outstanding client! Well-organized and communicative. Easy access and clear expectations.'
                ];

                // Providers usually give higher ratings to clients
                $providerRating = rand(8, 10) / 2; // 4.0 to 5.0

                $providerReviewDate = $reviewDate->copy()->addDays(rand(0, 2));

                Review::create([
                    'appointment_id' => $appointment->id,
                    'reviewer_id' => $appointment->provider_id,
                    'reviewee_id' => $appointment->client_id,
                    'service_id' => $appointment->service_id,
                    'review_type' => Review::TYPE_PROVIDER_TO_CLIENT,
                    'rating' => round($providerRating, 1),
                    'comment' => $providerComments[array_rand($providerComments)],
                    'quality_rating' => null, // Providers don't rate detailed aspects
                    'punctuality_rating' => null,
                    'communication_rating' => round($providerRating, 1),
                    'value_rating' => null,
                    'would_recommend' => true,
                    'review_images' => null,
                    'is_verified' => true,
                    'is_featured' => false, // Provider reviews are rarely featured
                    'is_hidden' => false,
                    'status' => Review::STATUS_PUBLISHED,
                    'provider_response' => null,
                    'provider_responded_at' => null,
                    'helpful_count' => rand(0, 3),
                    'flagged_at' => null,
                    'moderation_notes' => null,
                    'created_at' => $providerReviewDate,
                    'updated_at' => $providerReviewDate
                ]);

                $createdReviews++;
            }
        }

        // Statistics
        $totalReviews = Review::count();
        $clientReviews = Review::clientToProvider()->count();
        $providerReviews = Review::providerToClient()->count();
        $publishedReviews = Review::published()->count();
        $featuredReviews = Review::where('is_featured', true)->count();
        $reviewsWithResponses = Review::whereNotNull('provider_response')->count();

        $avgRating = Review::clientToProvider()->avg('rating');
        $fiveStarReviews = Review::clientToProvider()->where('rating', '>=', 4.5)->count();
        $recommendedCount = Review::clientToProvider()->where('would_recommend', true)->count();

        $this->command->info("Successfully created {$createdReviews} reviews!");
        
        $this->command->info("\n📊 Review Summary:");
        $this->command->info("   • Total Reviews: {$totalReviews}");
        $this->command->info("   • Client Reviews: {$clientReviews}");
        $this->command->info("   • Provider Reviews: {$providerReviews}");
        $this->command->info("   • Published Reviews: {$publishedReviews}");
        $this->command->info("   • Featured Reviews: {$featuredReviews}");
        $this->command->info("   • Reviews with Responses: {$reviewsWithResponses}");

        $this->command->info("\n⭐ Rating Analysis:");
        $this->command->info("   • Average Rating: " . round($avgRating, 2) . "/5.0");
        $this->command->info("   • 4.5+ Star Reviews: {$fiveStarReviews}");
        $this->command->info("   • Would Recommend: {$recommendedCount}");

        $this->command->info("\n🌴 Realistic Sri Lankan service review patterns:");
        $this->command->info("   • 70% positive reviews (4-5 stars)");
        $this->command->info("   • 25% average reviews (3 stars)");
        $this->command->info("   • 5% negative reviews (1-2 stars)");
        $this->command->info("   • Multi-dimensional ratings for service quality");
        $this->command->info("   • Provider responses to positive reviews");
        $this->command->info("   • Bidirectional review system included");
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ServiceCategory;

class ServiceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $categories = [
            // [
            //     'name' => 'Home Cleaning',
            //     'description' => 'Professional house cleaning services including deep cleaning, regular maintenance, and specialized cleaning tasks.',
            //     'icon' => 'fas fa-broom',
            //     'color' => 'primary',
            //     'sort_order' => 1
            // ],
            // [
            //     'name' => 'Plumbing Services',
            //     'description' => 'Expert plumbing services for repairs, installations, and maintenance of pipes, fixtures, and water systems.',
            //     'icon' => 'fas fa-tools',
            //     'color' => 'info',
            //     'sort_order' => 2
            // ],
            // [
            //     'name' => 'Electrical Services',
            //     'description' => 'Licensed electricians for wiring, repairs, installations, and electrical system maintenance.',
            //     'icon' => 'fas fa-bolt',
            //     'color' => 'warning',
            //     'sort_order' => 3
            // ],
            // [
            //     'name' => 'Tutoring & Education',
            //     'description' => 'Professional tutors and educators for all subjects and grade levels, including test preparation.',
            //     'icon' => 'fas fa-graduation-cap',
            //     'color' => 'success',
            //     'sort_order' => 4
            // ],
            // [
            //     'name' => 'Healthcare & Caregiving',
            //     'description' => 'Certified caregivers, nurses, and healthcare professionals for elderly care and medical assistance.',
            //     'icon' => 'fas fa-heart',
            //     'color' => 'danger',
            //     'sort_order' => 5
            // ],
            // [
            //     'name' => 'Pet Care',
            //     'description' => 'Professional pet sitting, dog walking, grooming, and veterinary care services.',
            //     'icon' => 'fas fa-paw',
            //     'color' => 'secondary',
            //     'sort_order' => 6
            // ],
            // [
            //     'name' => 'Gardening & Landscaping',
            //     'description' => 'Garden maintenance, landscaping design, lawn care, and outdoor space beautification.',
            //     'icon' => 'fas fa-seedling',
            //     'color' => 'success',
            //     'sort_order' => 7
            // ],
            // [
            //     'name' => 'Transportation',
            //     'description' => 'Personal transportation services, delivery, and moving assistance.',
            //     'icon' => 'fas fa-car',
            //     'color' => 'dark',
            //     'sort_order' => 8
            // ],
            // [
            //     'name' => 'Tech Support',
            //     'description' => 'Computer repair, software installation, IT support, and technology troubleshooting.',
            //     'icon' => 'fas fa-laptop-code',
            //     'color' => 'info',
            //     'sort_order' => 9
            // ],
            // [
            //     'name' => 'Handyman Services',
            //     'description' => 'General repairs, furniture assembly, mounting, and home improvement tasks.',
            //     'icon' => 'fas fa-hammer',
            //     'color' => 'warning',
            //     'sort_order' => 10
            // ],
            // [
            //     'name' => 'Beauty & Wellness',
            //     'description' => 'Hair styling, makeup, massage therapy, and personal wellness services.',
            //     'icon' => 'fas fa-spa',
            //     'color' => 'danger',
            //     'sort_order' => 11
            // ],
            // [
            //     'name' => 'Event Services',
            //     'description' => 'Event planning, catering, photography, and entertainment for special occasions.',
            //     'icon' => 'fas fa-calendar-alt',
            //     'color' => 'primary',
            //     'sort_order' => 12
            // ]
            [
                'name' => 'Moving & Packing',
                'description' => 'Professional movers, packing services, furniture arrangement, and relocation assistance.',
                'icon' => 'fas fa-truck-moving',
                'color' => 'primary',
                'sort_order' => 13
            ],
            [
                'name' => 'Painting & Decorating',
                'description' => 'Interior and exterior painting, wallpaper installation, and home decoration services.',
                'icon' => 'fas fa-paint-roller',
                'color' => 'info',
                'sort_order' => 14
            ],
            [
                'name' => 'Appliance Repair',
                'description' => 'Repair and maintenance of household appliances including washing machines, refrigerators, and ovens.',
                'icon' => 'fas fa-wrench',
                'color' => 'warning',
                'sort_order' => 15
            ],
            [
                'name' => 'Laundry & Ironing',
                'description' => 'Professional laundry services, dry cleaning pickup, and ironing for busy households.',
                'icon' => 'fas fa-tshirt',
                'color' => 'secondary',
                'sort_order' => 16
            ],
            [
                'name' => 'Grocery & Errands',
                'description' => 'Grocery shopping, pharmacy runs, and personal errand services for household needs.',
                'icon' => 'fas fa-shopping-basket',
                'color' => 'success',
                'sort_order' => 17
            ],
            [
                'name' => 'Cooking & Meal Prep',
                'description' => 'Personal chefs, meal preparation, and cooking services for daily household meals.',
                'icon' => 'fas fa-chef-hat',
                'color' => 'danger',
                'sort_order' => 18
            ],
            [
                'name' => 'Organization & Decluttering',
                'description' => 'Professional organizers for closets, storage spaces, and home decluttering services.',
                'icon' => 'fas fa-boxes',
                'color' => 'info',
                'sort_order' => 19
            ],
            [
                'name' => 'Window & Gutter Cleaning',
                'description' => 'Professional window washing, gutter cleaning, and exterior home maintenance services.',
                'icon' => 'fas fa-spray-can',
                'color' => 'primary',
                'sort_order' => 20
            ]
        ];

        foreach ($categories as $category) {
            ServiceCategory::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($category['name'])],
                $category
            );
        }

        $this->command->info('Service categories seeded successfully!');
    }
}

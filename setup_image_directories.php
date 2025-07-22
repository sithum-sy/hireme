<?php

// Directory structure creation script for image storage

$directories = [
    'public/images/profile_pictures',
    'public/images/provider_documents/business_licenses', 
    'public/images/provider_documents/certifications',
    'public/images/provider_documents/portfolio',
    'public/images/provider_documents/portfolio/thumbnails',
    'public/images/service_images',
    'public/images/temp_uploads'
];

foreach ($directories as $dir) {
    $fullPath = base_path($dir);
    
    if (!file_exists($fullPath)) {
        mkdir($fullPath, 0755, true);
        echo "Created directory: {$dir}\n";
    } else {
        echo "Directory already exists: {$dir}\n";
    }
}

// Create .gitkeep files to ensure directories are tracked in git
foreach ($directories as $dir) {
    $gitkeepPath = base_path($dir . '/.gitkeep');
    if (!file_exists($gitkeepPath)) {
        file_put_contents($gitkeepPath, '');
        echo "Created .gitkeep for: {$dir}\n";
    }
}

echo "\nImage directory structure setup complete!\n";
echo "All images will now be stored in public/images/ with proper organization.\n";

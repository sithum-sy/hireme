import { useMemo } from 'react';

/**
 * Helper function to construct proper image URL for service images
 * Service images are stored in public/images/services/ folder
 */
const constructServiceImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL (starts with http/https), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // Remove any "storage/" prefix from the path as we're using public/images now
    if (imagePath.includes('storage/')) {
        imagePath = imagePath.replace(/.*storage\//, '');
    }
    
    // If it already starts with /images/services/, return as is
    if (imagePath.startsWith('/images/services/')) {
        return imagePath;
    }
    
    // If it starts with images/services/, add leading slash
    if (imagePath.startsWith('images/services/')) {
        return '/' + imagePath;
    }
    
    // If it already starts with /images/, keep as is
    if (imagePath.startsWith('/images/')) {
        return imagePath;
    }
    
    // If it starts with images/, add leading slash
    if (imagePath.startsWith('images/')) {
        return '/' + imagePath;
    }
    
    // If it's just a filename, construct the full path to services folder
    if (!imagePath.includes('/')) {
        return `/images/services/${imagePath}`;
    }
    
    // For any other case, assume it needs the services path prefix
    return `/images/services/${imagePath.replace(/^\/+/, '')}`;
};

/**
 * Helper function to construct proper URL for profile images
 * Profile images are stored in public/images/profile_pictures/ folder
 */
const constructProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL (starts with http/https), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    
    // Remove any "storage/" prefix from the path as we're using public/images now
    if (imagePath.includes('storage/')) {
        imagePath = imagePath.replace(/.*storage\//, '');
    }
    
    // If it already starts with /images/profile_pictures/, return as is
    if (imagePath.startsWith('/images/profile_pictures/')) {
        return imagePath;
    }
    
    // If it starts with images/profile_pictures/, add leading slash
    if (imagePath.startsWith('images/profile_pictures/')) {
        return '/' + imagePath;
    }
    
    // If it already starts with /images/, keep as is (might be in another subfolder)
    if (imagePath.startsWith('/images/')) {
        return imagePath;
    }
    
    // If it starts with images/, add leading slash
    if (imagePath.startsWith('images/')) {
        return '/' + imagePath;
    }
    
    // If it's just a filename, construct the full path to profile_pictures folder
    if (!imagePath.includes('/')) {
        return `/images/profile_pictures/${imagePath}`;
    }
    
    // For any other case, assume it needs the profile_pictures path prefix
    return `/images/profile_pictures/${imagePath.replace(/^\/+/, '')}`;
};

/**
 * Hook to normalize and extract images from service data
 * Handles various possible image field structures from the API
 * Ensures all URLs point to the correct public/images/services/ location
 */
export const useServiceImages = (service) => {
    return useMemo(() => {
        if (!service) return [];

        // Try to extract images from various possible fields
        const possibleImageFields = [
            service.images,
            service.service_images,
            service.existing_images,
            service.service_image_urls,
            service.image_urls
        ];

        // Find the first non-empty field
        for (const field of possibleImageFields) {
            if (field && Array.isArray(field) && field.length > 0) {
                // Handle different array formats
                return field.map((item, index) => {
                    let imagePath = null;
                    
                    if (typeof item === 'string') {
                        imagePath = item;
                    } else if (item && typeof item === 'object') {
                        imagePath = item.url || item.path || item.src || item.filename || null;
                    }
                    
                    return constructServiceImageUrl(imagePath);
                }).filter(Boolean);
            }
        }

        // Try single image fields as fallback
        const singleImageFields = [
            service.first_image_url,
            service.image_url,
            service.thumbnail_url,
            service.main_image
        ];

        for (const field of singleImageFields) {
            if (field && typeof field === 'string') {
                const url = constructServiceImageUrl(field);
                if (url) return [url];
            }
        }

        return [];
    }, [service]);
};

/**
 * Hook to get the primary image for a service
 */
export const useServicePrimaryImage = (service) => {
    const images = useServiceImages(service);
    return images.length > 0 ? images[0] : null;
};

/**
 * Hook to check if service has multiple images
 */
export const useServiceHasMultipleImages = (service) => {
    const images = useServiceImages(service);
    return images.length > 1;
};

/**
 * Export the URL constructors for use in other components
 */
export { constructServiceImageUrl, constructProfileImageUrl };

export default useServiceImages;
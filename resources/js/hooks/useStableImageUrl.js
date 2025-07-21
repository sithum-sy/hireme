import { useMemo, useRef, useState, useCallback, useEffect } from 'react';

/**
 * Hook to stabilize image URLs and prevent flickering
 * This hook ensures that the same image URL is returned for the same image data
 * and helps prevent unnecessary image re-renders
 */
export const useStableImageUrl = (imageUrl, fallbackUrl = '/images/default-avatar.png') => {
    const previousUrl = useRef(null);
    const stableUrl = useRef(null);

    return useMemo(() => {
        // If imageUrl is empty/null, return fallback
        if (!imageUrl) {
            stableUrl.current = fallbackUrl;
            return stableUrl.current;
        }

        // Normalize URL by removing potential cache busters or timestamps
        let normalizedUrl = imageUrl;
        try {
            const url = new URL(imageUrl, window.location.origin);
            // Remove common cache busting parameters
            url.searchParams.delete('t');
            url.searchParams.delete('timestamp');
            url.searchParams.delete('v');
            url.searchParams.delete('cache');
            url.searchParams.delete('_');
            normalizedUrl = url.toString();
        } catch (e) {
            // If URL parsing fails, use original
            normalizedUrl = imageUrl;
        }

        // If URL is the same as previous, return the stable reference
        if (normalizedUrl === previousUrl.current && stableUrl.current) {
            return stableUrl.current;
        }

        // Update references for new URL
        previousUrl.current = normalizedUrl;
        stableUrl.current = normalizedUrl;
        
        return stableUrl.current;
    }, [imageUrl, fallbackUrl]);
};

/**
 * Hook to provide image loading state and error handling
 */
export const useImageLoadState = (imageUrl) => {
    const [loadState, setLoadState] = useState({
        isLoading: false,
        hasError: false,
        isLoaded: false
    });

    const handleImageLoad = useCallback(() => {
        setLoadState({
            isLoading: false,
            hasError: false,
            isLoaded: true
        });
    }, []);

    const handleImageError = useCallback(() => {
        setLoadState({
            isLoading: false,
            hasError: true,
            isLoaded: false
        });
    }, []);

    const handleImageLoadStart = useCallback(() => {
        setLoadState({
            isLoading: true,
            hasError: false,
            isLoaded: false
        });
    }, []);

    // Reset state when URL changes
    useEffect(() => {
        if (imageUrl) {
            setLoadState({
                isLoading: true,
                hasError: false,
                isLoaded: false
            });
        }
    }, [imageUrl]);

    return {
        ...loadState,
        handleImageLoad,
        handleImageError,
        handleImageLoadStart
    };
};

/**
 * Enhanced hook that combines stable URLs with caching
 */
export const useStableProfileImage = (userId, imageUrl, fallbackUrl = '/images/default-avatar.png') => {
    const cacheKey = `profile_image_${userId}`;
    const [cachedUrl, setCachedUrl] = useState(() => {
        try {
            return localStorage.getItem(cacheKey);
        } catch (e) {
            return null;
        }
    });

    const stableUrl = useStableImageUrl(imageUrl, fallbackUrl);

    // Update cache when stable URL changes
    useEffect(() => {
        if (stableUrl && stableUrl !== fallbackUrl) {
            try {
                localStorage.setItem(cacheKey, stableUrl);
                setCachedUrl(stableUrl);
            } catch (e) {
                // Ignore localStorage errors
            }
        }
    }, [stableUrl, cacheKey, fallbackUrl]);

    // Return cached URL if available and current URL is loading
    return useMemo(() => {
        // If we have a current stable URL, use it
        if (stableUrl && stableUrl !== fallbackUrl) {
            return stableUrl;
        }
        
        // Otherwise, use cached URL if available
        if (cachedUrl && cachedUrl !== fallbackUrl) {
            return cachedUrl;
        }
        
        // Fallback
        return fallbackUrl;
    }, [stableUrl, cachedUrl, fallbackUrl]);
};

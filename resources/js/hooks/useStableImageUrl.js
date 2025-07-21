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

        // If URL is the same as previous, return the stable reference
        if (imageUrl === previousUrl.current && stableUrl.current) {
            return stableUrl.current;
        }

        // Update references for new URL
        previousUrl.current = imageUrl;
        stableUrl.current = imageUrl;
        
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

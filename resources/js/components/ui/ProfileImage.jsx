import React, { memo, useState, useCallback } from "react";
import { useStableImageUrl } from "../../hooks/useStableImageUrl.js";
import { constructProfileImageUrl } from "../../hooks/useServiceImages";

/**
 * Optimized profile image component that prevents flickering
 * by stabilizing image URLs and minimizing re-renders
 */
const ProfileImage = memo(
    ({
        src,
        alt = "Profile",
        size = 120,
        className = "",
        fallbackSrc = "/images/default-avatar.png",
        onError,
        ...props
    }) => {
        const [hasError, setHasError] = useState(false);
        // First construct the proper URL using our profile image constructor
        const properImageUrl = constructProfileImageUrl(src);
        const stableImageUrl = useStableImageUrl(properImageUrl, fallbackSrc);

        const handleError = useCallback(
            (e) => {
                if (!hasError) {
                    setHasError(true);
                    e.target.src = fallbackSrc;
                }
                onError?.(e);
            },
            [hasError, fallbackSrc, onError]
        );

        const handleLoad = useCallback(() => {
            setHasError(false);
        }, []);

        // Reset error state when image URL changes
        React.useEffect(() => {
            setHasError(false);
        }, [stableImageUrl, properImageUrl]);

        return (
            <img
                key={stableImageUrl} // Key ensures React creates new element when URL actually changes
                src={hasError ? fallbackSrc : stableImageUrl}
                alt={alt}
                width={size}
                height={size}
                className={`profile-image ${className}`}
                onError={handleError}
                onLoad={handleLoad}
                loading="lazy"
                style={{
                    objectFit: "cover",
                    borderRadius: "50%",
                    display: "block",
                    backgroundColor: "#f3f4f6",
                    ...props.style,
                }}
                {...props}
            />
        );
    }
);

ProfileImage.displayName = "ProfileImage";

export default ProfileImage;

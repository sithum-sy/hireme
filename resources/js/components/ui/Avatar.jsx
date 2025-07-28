import React from "react";
import ProfileImage from "./ProfileImage";

/**
 * Avatar component that handles both profile images and initials fallback
 * Provides a consistent avatar display across the application
 */
const Avatar = ({
    src,
    firstName = "",
    lastName = "",
    size = 40,
    className = "",
    variant = "primary", // primary, warning, success, info, etc.
    showImageFirst = true,
    ...props
}) => {
    // Generate initials
    const getInitials = () => {
        const first = firstName?.charAt(0)?.toUpperCase() || "";
        const last = lastName?.charAt(0)?.toUpperCase() || "";
        return first + last || "U"; // Default to "U" for User
    };

    // If we have an image URL and should show image first, use ProfileImage
    if (showImageFirst && src) {
        return (
            <ProfileImage
                src={src}
                alt={`${firstName} ${lastName}`.trim() || "User"}
                size={size}
                className={`border border-${variant} border-opacity-25 ${className}`}
                fallbackSrc={null} // Don't use default avatar, fall back to initials instead
                onError={() => {
                    // When image fails, we'll show initials instead
                    // This is handled by the parent component re-rendering with showImageFirst=false
                }}
                {...props}
            />
        );
    }

    // Show initials avatar when no image or when image failed
    return (
        <div
            className={`bg-${variant} bg-opacity-10 text-${variant} rounded-circle d-flex align-items-center justify-content-center ${className}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                fontSize: `${Math.max(12, size * 0.4)}px`,
                fontWeight: "600",
                flexShrink: 0,
                ...props.style,
            }}
            {...props}
        >
            {getInitials()}
        </div>
    );
};

export default Avatar;
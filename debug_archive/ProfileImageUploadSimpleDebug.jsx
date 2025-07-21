import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useProfile } from "../../../context/ProfileContext";
import { validateFile } from "../../../utils/validationUtils";
import {
    formatFileSize,
    isImageFile,
    createThumbnail,
} from "../../../utils/fileUtils";
import { getFileUploadConfig } from "../../../../config/profileConfig.js";
import { useStableImageUrl } from "../../../hooks/useStableImageUrl";

const ProfileImageUploadSimpleDebug = React.memo(({
    currentImage,
    onImageChange,
    size = "large",
    className = "",
}) => {
    const { uploadImage, deleteImage, saving } = useProfile();
    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);
    const renderCount = useRef(0);
    const lastLoggedImage = useRef(null);

    // Increment render count and log detailed render info
    renderCount.current += 1;
    
    console.group(`🖼️ ProfileImageUpload Render #${renderCount.current}`);
    console.log('📊 Props:', {
        currentImage,
        size,
        className,
        onImageChange: !!onImageChange
    });
    console.log('🔄 Context State:', {
        saving,
        uploadImage: !!uploadImage,
        deleteImage: !!deleteImage
    });
    console.log('📱 Local State:', {
        preview,
        dragOver,
        error
    });

    // Memoize the file config to prevent recalculation
    const fileConfig = useMemo(() => {
        console.log('🔧 Recalculating fileConfig');
        return getFileUploadConfig("profileImage") || {
            maxSize: 2048, // 2MB fallback
            allowedTypes: ["jpg", "jpeg", "png", "gif"] // fallback types
        };
    }, []);

    const handleFileSelect = useCallback(async (file) => {
        console.log('📁 handleFileSelect called with:', file?.name);
        setError("");

        if (!file) return;

        // Validate file
        const validationErrors = validateFile(file, {
            validation: {
                fileSize: fileConfig.maxSize,
                fileType: fileConfig.allowedTypes,
            },
        });

        if (validationErrors.length > 0) {
            setError(validationErrors[0]);
            return;
        }

        // Create preview
        try {
            const previewUrl = URL.createObjectURL(file);
            console.log('👁️ Setting preview URL:', previewUrl);
            setPreview(previewUrl);

            // Upload file
            const result = await uploadImage(file);

            if (result.success) {
                console.log('✅ Upload successful, new imageUrl:', result.imageUrl);
                onImageChange?.(result.imageUrl);
                setPreview(null);
                console.log('🧹 Cleared preview');
            } else {
                console.error('❌ Upload failed:', result.message);
                setError(result.message);
                setPreview(null);
            }
        } catch (err) {
            console.error('💥 Upload error:', err);
            setError("Failed to process image");
            setPreview(null);
        }
    }, [uploadImage, onImageChange, fileConfig]);

    const handleFileInput = useCallback((e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    }, [handleFileSelect]);

    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // Use stable image URL to prevent flickering with enhanced normalization
    const stableCurrentImage = useStableImageUrl(currentImage);
    const stablePreviewImage = useStableImageUrl(preview);
    
    // Log URL changes
    useEffect(() => {
        console.log('🔄 URL Changes Detected:');
        console.log('  currentImage:', currentImage);
        console.log('  stableCurrentImage:', stableCurrentImage);
        console.log('  preview:', preview);
        console.log('  stablePreviewImage:', stablePreviewImage);
        
        if (currentImage !== lastLoggedImage.current) {
            console.log('🚨 CURRENT IMAGE CHANGED!');
            console.log('  From:', lastLoggedImage.current);
            console.log('  To:', currentImage);
            lastLoggedImage.current = currentImage;
        }
    }, [currentImage, stableCurrentImage, preview, stablePreviewImage]);
    
    // Memoize the display image to prevent unnecessary re-renders
    const displayImage = useMemo(() => {
        const result = stablePreviewImage || stableCurrentImage;
        console.log('🖼️ displayImage recalculated:', {
            stablePreviewImage,
            stableCurrentImage,
            result
        });
        return result;
    }, [stablePreviewImage, stableCurrentImage]);

    // Log component lifecycle
    useEffect(() => {
        console.log('🔄 ProfileImageUpload mounted/updated');
        return () => {
            console.log('🗑️ ProfileImageUpload cleanup');
        };
    });

    console.log('🎯 Final render values:', {
        displayImage,
        hasImage: !!displayImage,
        imageKey: displayImage
    });
    console.groupEnd();

    // Simple styling without styled-jsx to avoid any conflicts
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        border: '2px dashed #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
    };

    const imageStyle = {
        width: size === 'large' ? '160px' : size === 'medium' ? '120px' : '80px',
        height: size === 'large' ? '160px' : size === 'medium' ? '120px' : '80px',
        objectFit: 'cover',
        borderRadius: '8px',
        border: '2px solid #ddd'
    };

    const placeholderStyle = {
        ...imageStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        color: '#666'
    };

    return (
        <div style={containerStyle} className={className}>
            <div className="debug-info" style={{ 
                background: '#fff3cd', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                width: '100%',
                textAlign: 'center'
            }}>
                <div><strong>Render #{renderCount.current}</strong></div>
                <div>Current: {(currentImage || 'null').substring(0, 50)}...</div>
                <div>Stable: {(stableCurrentImage || 'null').substring(0, 50)}...</div>
                <div>Display: {(displayImage || 'null').substring(0, 50)}...</div>
                <div>Saving: {saving.toString()}</div>
                <div style={{color: 'red', fontWeight: 'bold'}}>⚠️ Check console for GD extension error</div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={fileConfig.allowedTypes.map(type => `.${type}`).join(',')}
                onChange={handleFileInput}
                style={{ display: 'none' }}
                disabled={saving}
            />

            {/* Image display */}
            {displayImage ? (
                <img
                    key={displayImage} // Force re-render only when URL actually changes
                    src={displayImage}
                    alt="Profile"
                    style={imageStyle}
                    onError={(e) => {
                        console.error('🚨 Image error for URL:', e.target.src);
                        e.target.src = "/images/default-avatar.png";
                    }}
                    onLoad={(e) => {
                        console.log('✅ Image loaded successfully:', e.target.src);
                    }}
                />
            ) : (
                <div style={placeholderStyle}>
                    <span>No Image</span>
                </div>
            )}

            {/* Upload button */}
            <button 
                onClick={triggerFileInput}
                disabled={saving}
                style={{
                    padding: '8px 16px',
                    backgroundColor: saving ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: saving ? 'not-allowed' : 'pointer'
                }}
            >
                {saving ? 'Uploading...' : (displayImage ? 'Change Image' : 'Upload Image')}
            </button>

            {/* Error display */}
            {error && (
                <div style={{
                    color: 'red',
                    fontSize: '14px',
                    textAlign: 'center',
                    padding: '8px',
                    backgroundColor: '#ffe6e6',
                    borderRadius: '4px',
                    width: '100%'
                }}>
                    {error}
                </div>
            )}

            {/* File info */}
            <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                Accepted: {fileConfig.allowedTypes.join(", ").toUpperCase()}<br />
                Max size: {Math.round(fileConfig.maxSize / 1024)}MB
            </div>
        </div>
    );
});

ProfileImageUploadSimpleDebug.displayName = 'ProfileImageUploadSimpleDebug';

export default ProfileImageUploadSimpleDebug;

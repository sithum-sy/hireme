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

const ProfileImageUpload = React.memo(
    ({ currentImage, onImageChange, size = "large", className = "" }) => {
        const { uploadImage, deleteImage, saving } = useProfile();
        const [dragOver, setDragOver] = useState(false);
        const [preview, setPreview] = useState(null);
        const [error, setError] = useState("");
        const fileInputRef = useRef(null);
            
            // Clear preview on mount and when currentImage changes
            useEffect(() => {
                setPreview(null);
                setError("");
            }, [currentImage]);

        // Memoize the file config to prevent recalculation
        const fileConfig = useMemo(() => {
            return (
                getFileUploadConfig("profileImage") || {
                    maxSize: 2048, // 2MB fallback
                    allowedTypes: ["jpg", "jpeg", "png", "gif"], // fallback types
                }
            );
        }, []);
        
        const sizeClasses = {
            small: "size-small",
            medium: "size-medium",
            large: "size-large",
        };

        const handleFileSelect = useCallback(
            async (file) => {
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
                    setPreview(previewUrl);

                    // Upload file
                    const result = await uploadImage(file);

                    if (result.success) {
                        onImageChange?.(result.imageUrl);
                        setPreview(null); // Clear preview
                    } else {
                        setError(result.message);
                        setPreview(null); // Clear preview on error too
                    }
                } catch (err) {
                    setError("Failed to process image");
                    setPreview(null);
                }
            },
            [uploadImage, onImageChange, fileConfig]
        );

        const handleFileInput = useCallback(
            (e) => {
                const file = e.target.files[0];
                handleFileSelect(file);
            },
            [handleFileSelect]
        );

        const handleDrop = useCallback(
            (e) => {
                e.preventDefault();
                setDragOver(false);

                const file = e.dataTransfer.files[0];
                if (file && isImageFile(file)) {
                    handleFileSelect(file);
                } else {
                    setError("Please select a valid image file");
                }
            },
            [handleFileSelect]
        );

        const handleDragOver = useCallback((e) => {
            e.preventDefault();
            setDragOver(true);
        }, []);

        const handleDragLeave = useCallback((e) => {
            e.preventDefault();
            setDragOver(false);
        }, []);

        const handleDeleteImage = useCallback(async (e) => {
            e.stopPropagation(); // Prevent triggering file input
            if (
                window.confirm(
                    "Are you sure you want to delete your profile picture?"
                )
            ) {
                const result = await deleteImage();
                if (result.success) {
                    onImageChange?.(null);
                } else {
                    setError(result.message);
                }
            }
        }, [deleteImage, onImageChange]);

        const triggerFileInput = useCallback((e) => {
            e.stopPropagation(); // Prevent event bubbling
            fileInputRef.current?.click();
        }, []);

        // Use stable image URL to prevent flickering with enhanced normalization
        const stableCurrentImage = useStableImageUrl(currentImage);
        // Don't use useStableImageUrl for preview - it's a temporary blob URL
        
        // Memoize the display image to prevent unnecessary re-renders
        const displayImage = useMemo(() => {
            // If we have a preview (during upload), use it
            if (preview) {
                return preview;
            }
            // Otherwise use the stable current image
            return stableCurrentImage;
        }, [preview, stableCurrentImage]);

        return (
            <div
                className={`profile-image-upload ${sizeClasses[size]} ${className}`}
            >
                <div
                    className={`upload-area ${dragOver ? "drag-over" : ""} ${
                        saving ? "uploading" : ""
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={fileConfig.allowedTypes
                            .map((type) => `.${type}`)
                            .join(",")}
                        onChange={handleFileInput}
                        className="file-input"
                        disabled={saving}
                    />

                    {/* Image display */}
                    <div className="image-container">
                        {displayImage ? (
                            <>
                                <img
                                    key={displayImage}
                                    src={displayImage}
                                    alt="Profile"
                                    className="profile-preview"
                                    onError={useCallback((e) => {
                                        e.target.src = "/images/default-avatar.png";
                                    }, [])}
                                />
                                
                                {/* Action buttons for existing image */}
                                <div className="image-actions">
                                    <button
                                        type="button"
                                        className="action-btn edit-btn"
                                        onClick={triggerFileInput}
                                        disabled={saving}
                                        title="Change Picture"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        type="button"
                                        className="action-btn delete-btn"
                                        onClick={handleDeleteImage}
                                        disabled={saving}
                                        title="Delete Picture"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                                
                                {/* Upload overlay - only show on hover */}
                                <div className="upload-overlay" onClick={triggerFileInput}>
                                    {saving ? (
                                        <div className="uploading-indicator">
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <span>Uploading...</span>
                                        </div>
                                    ) : (
                                        <div className="upload-icon">
                                            <i className="fas fa-camera fa-2x"></i>
                                            <div className="upload-text">
                                                <span className="upload-main">Change Picture</span>
                                                <span className="upload-hint">Click to upload</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Placeholder for no image - clickable to upload */
                            <div className="placeholder" onClick={triggerFileInput}>
                                <i className="fas fa-user fa-3x"></i>
                                <div className="upload-text">
                                    <span className="upload-main">Upload Picture</span>
                                    <span className="upload-hint">Click or drag to upload</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error display */}
                {error && (
                    <div className="upload-error">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* File info */}
                <div className="upload-info">
                    <small>
                        Accepted formats:{" "}
                        {fileConfig.allowedTypes.join(", ").toUpperCase()}
                        <br />
                        Maximum size: {Math.round(fileConfig.maxSize / 1024)}MB
                    </small>
                </div>

                <style jsx>{`
                    .profile-image-upload {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: var(--space-3);
                    }

                    .upload-area {
                        position: relative;
                        transition: var(--transition);
                        border-radius: var(--border-radius-lg);
                        overflow: hidden;
                    }

                    .upload-area.drag-over {
                        transform: scale(1.02);
                        box-shadow: var(--shadow-lg);
                    }

                    .upload-area.uploading {
                        pointer-events: none;
                        opacity: 0.7;
                    }

                    .file-input {
                        position: absolute;
                        opacity: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                    }

                    .image-container {
                        position: relative;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        border-radius: var(--border-radius-lg);
                        border: 3px solid var(--border-color);
                        transition: var(--transition);
                    }

                    .size-small .image-container {
                        width: 80px;
                        height: 80px;
                    }

                    .size-medium .image-container {
                        width: 120px;
                        height: 120px;
                    }

                    .size-large .image-container {
                        width: 160px;
                        height: 160px;
                    }

                    .upload-area:hover .image-container {
                        border-color: var(--current-role-primary);
                    }

                    .profile-preview {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }

                    .placeholder {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                        background: var(--bg-light);
                        color: var(--text-muted);
                        cursor: pointer;
                        transition: var(--transition);
                    }
                    
                    .placeholder:hover {
                        background: var(--bg-hover);
                        color: var(--current-role-primary);
                    }

                    .upload-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.7);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        transition: var(--transition);
                        cursor: pointer;
                    }

                    .upload-area:hover .upload-overlay {
                        opacity: 1;
                    }

                    .uploading-indicator {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: var(--space-2);
                        color: white;
                    }

                    .uploading-indicator i {
                        font-size: var(--text-xl);
                    }

                    .upload-icon {
                        color: white;
                        text-align: center;
                    }

                    .upload-text {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        color: white;
                        text-align: center;
                        margin-top: var(--space-2);
                    }

                    .placeholder .upload-text {
                        color: inherit;
                        margin-top: var(--space-2);
                    }

                    .upload-main {
                        font-weight: var(--font-semibold);
                        font-size: var(--text-sm);
                        margin-bottom: var(--space-1);
                    }

                    .upload-hint {
                        font-size: var(--text-xs);
                        opacity: 0.8;
                    }

                    .image-actions {
                        position: absolute;
                        top: var(--space-2);
                        right: var(--space-2);
                        display: flex;
                        gap: var(--space-1);
                        z-index: 10;
                    }

                    .action-btn {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        border: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: var(--transition);
                        font-size: var(--text-sm);
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }

                    .edit-btn {
                        background: var(--current-role-primary);
                        color: white;
                    }

                    .edit-btn:hover:not(:disabled) {
                        background: var(--current-role-secondary);
                        transform: scale(1.1);
                    }

                    .delete-btn {
                        background: var(--danger-color);
                        color: white;
                    }

                    .delete-btn:hover:not(:disabled) {
                        background: #dc2626;
                        transform: scale(1.1);
                    }

                    .action-btn:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                        transform: none;
                    }

                    .upload-error {
                        display: flex;
                        align-items: center;
                        gap: var(--space-2);
                        padding: var(--space-2) var(--space-3);
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid var(--danger-color);
                        border-radius: var(--border-radius);
                        color: var(--danger-color);
                        font-size: var(--text-sm);
                    }

                    .upload-info {
                        text-align: center;
                        color: var(--text-muted);
                        line-height: 1.4;
                    }

                    /* Mobile responsive */
                    @media (max-width: 768px) {
                        .size-large .image-container {
                            width: 120px;
                            height: 120px;
                        }

                        .size-medium .image-container {
                            width: 100px;
                            height: 100px;
                        }

                        .size-small .image-container {
                            width: 80px;
                            height: 80px;
                        }
                        
                        .action-btn {
                            width: 28px;
                            height: 28px;
                            font-size: 12px;
                        }
                    }
                `}</style>
            </div>
        );
    }
);

ProfileImageUpload.displayName = "ProfileImageUpload";

export default ProfileImageUpload;

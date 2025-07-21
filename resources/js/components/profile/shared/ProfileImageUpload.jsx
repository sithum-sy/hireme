import React, { useState, useRef, useMemo, useCallback } from "react";
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
                        setPreview(null);
                    } else {
                        setError(result.message);
                        setPreview(null);
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

        const handleDeleteImage = useCallback(async () => {
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

        const triggerFileInput = useCallback(() => {
            fileInputRef.current?.click();
        }, []);

        // Use stable image URL to prevent flickering
        const stableCurrentImage = useStableImageUrl(currentImage);
        const stablePreviewImage = useStableImageUrl(preview);

        // Memoize the display image to prevent unnecessary re-renders
        const displayImage = useMemo(() => {
            return stablePreviewImage || stableCurrentImage;
        }, [stablePreviewImage, stableCurrentImage]);

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
                    onClick={triggerFileInput}
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
                            <img
                                key={displayImage} // Force re-render only when URL actually changes
                                src={displayImage}
                                alt="Profile"
                                className="profile-preview"
                                onError={useCallback((e) => {
                                    e.target.src = "/images/default-avatar.png";
                                }, [])}
                            />
                        ) : (
                            <div className="placeholder">
                                <i className="fas fa-user fa-3x"></i>
                            </div>
                        )}

                        {/* Upload overlay */}
                        <div className="upload-overlay">
                            {saving ? (
                                <div className="uploading-indicator">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Uploading...</span>
                                </div>
                            ) : (
                                <div className="upload-icon">
                                    <i className="fas fa-camera fa-2x"></i>
                                </div>
                            )}

                            <div className="upload-text">
                                <span className="upload-main">
                                    {displayImage
                                        ? "Change Picture"
                                        : "Upload Picture"}
                                </span>
                                <span className="upload-hint">
                                    Click or drag to upload
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        {displayImage && (
                            <div className="image-actions">
                                <button
                                    type="button"
                                    className="action-btn edit-btn"
                                    onClick={triggerFileInput}
                                    disabled={saving}
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button
                                    type="button"
                                    className="action-btn delete-btn"
                                    onClick={handleDeleteImage}
                                    disabled={saving}
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
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
                        cursor: pointer;
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
                        cursor: pointer;
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
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                        background: var(--bg-light);
                        color: var(--text-muted);
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
                        margin-bottom: var(--space-2);
                    }

                    .upload-text {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        color: white;
                        text-align: center;
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
                        opacity: 0;
                        transition: var(--transition);
                    }

                    .upload-area:hover .image-actions {
                        opacity: 1;
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
                    }

                    .edit-btn {
                        background: var(--current-role-primary);
                        color: white;
                    }

                    .edit-btn:hover {
                        background: var(--current-role-secondary);
                        transform: scale(1.1);
                    }

                    .delete-btn {
                        background: var(--danger-color);
                        color: white;
                    }

                    .delete-btn:hover {
                        background: #dc2626;
                        transform: scale(1.1);
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
                    }
                `}</style>
            </div>
        );
        // };
    }
);

ProfileImageUpload.displayName = "ProfileImageUpload";

export default ProfileImageUpload;

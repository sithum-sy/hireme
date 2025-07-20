import React, { useState, useEffect } from "react";
import { useProfile } from "../../../context/ProfileContext";
import { getSectionFields } from "../../../../config/profileConfig";
import { validateFiles, validateFile } from "../../../utils/validationUtils";
import FileUpload from "../../forms/FileUpload";
import DocumentPreview from "../../forms/DocumentPreview";
import Button from "../../ui/Button";

const DocumentsForm = ({ onSubmit }) => {
    const { profile, updateProviderProfile, deleteProviderDocument, saving } =
        useProfile();
    const [files, setFiles] = useState({
        business_license: null,
        certifications: [],
        portfolio_images: [],
    });
    const [errors, setErrors] = useState({});
    const [uploading, setUploading] = useState({});

    const userRole = profile?.user?.role;
    const fields = getSectionFields(userRole, "documents");
    const providerProfile = profile?.provider_profile;

    // Clear errors when files change
    useEffect(() => {
        Object.keys(files).forEach((fieldName) => {
            if (files[fieldName] && errors[fieldName]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
                    return newErrors;
                });
            }
        });
    }, [files, errors]);

    const handleFileSelect = (selectedFiles, fieldName) => {
        const fieldConfig = fields[fieldName];

        if (!fieldConfig) return;

        let validationErrors = [];

        if (fieldConfig.multiple) {
            validationErrors = validateFiles(selectedFiles, fieldConfig);
        } else {
            validationErrors = validateFile(selectedFiles[0], fieldConfig);
        }

        if (validationErrors.length > 0) {
            setErrors((prev) => ({
                ...prev,
                [fieldName]: validationErrors,
            }));
            return;
        }

        setFiles((prev) => ({
            ...prev,
            [fieldName]: fieldConfig.multiple
                ? selectedFiles
                : selectedFiles[0],
        }));

        // Clear errors for this field
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    const handleDocumentDelete = async (documentType, index = null) => {
        try {
            const result = await deleteProviderDocument(documentType, index);
            if (result.success) {
                // Refresh the profile data or handle UI update
            } else {
                setErrors((prev) => ({
                    ...prev,
                    [documentType]: [result.message],
                }));
            }
        } catch (error) {
            setErrors((prev) => ({
                ...prev,
                [documentType]: ["Failed to delete document"],
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Only submit files that have been selected
        const filesToUpload = {};
        Object.keys(files).forEach((key) => {
            if (
                files[key] &&
                (Array.isArray(files[key]) ? files[key].length > 0 : files[key])
            ) {
                filesToUpload[key] = files[key];
            }
        });

        if (Object.keys(filesToUpload).length === 0) {
            setErrors({
                general: "Please select at least one document to upload",
            });
            return;
        }

        try {
            const result = await updateProviderProfile(filesToUpload);

            if (result.success) {
                setFiles({
                    business_license: null,
                    certifications: [],
                    portfolio_images: [],
                });
                setErrors({});

                if (onSubmit) {
                    onSubmit(result);
                }
            } else {
                setErrors(result.errors || { general: result.message });
            }
        } catch (error) {
            setErrors({
                general: "Failed to upload documents. Please try again.",
            });
        }
    };

    const hasFilesToUpload = Object.values(files).some(
        (file) => file && (Array.isArray(file) ? file.length > 0 : file)
    );

    return (
        <div className="documents-form">
            {/* Current Documents Display */}
            {providerProfile && (
                <div className="current-documents">
                    <h4>Current Documents</h4>

                    {/* Business License */}
                    {providerProfile.business_license_url && (
                        <div className="document-section">
                            <h6>Business License</h6>
                            <div className="document-item">
                                <div className="document-info">
                                    <i className="fas fa-file-pdf text-danger"></i>
                                    <span>Business License</span>
                                </div>
                                <div className="document-actions">
                                    <a
                                        href={
                                            providerProfile.business_license_url
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-primary"
                                    >
                                        <i className="fas fa-eye"></i>
                                        View
                                    </a>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() =>
                                            handleDocumentDelete(
                                                "business_license"
                                            )
                                        }
                                    >
                                        <i className="fas fa-trash"></i>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {providerProfile.certification_urls &&
                        providerProfile.certification_urls.length > 0 && (
                            <div className="document-section">
                                <h6>Certifications</h6>
                                {providerProfile.certification_urls.map(
                                    (url, index) => (
                                        <div
                                            key={index}
                                            className="document-item"
                                        >
                                            <div className="document-info">
                                                <i className="fas fa-certificate text-warning"></i>
                                                <span>
                                                    Certification {index + 1}
                                                </span>
                                            </div>
                                            <div className="document-actions">
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                    View
                                                </a>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        handleDocumentDelete(
                                                            "certification",
                                                            index
                                                        )
                                                    }
                                                >
                                                    <i className="fas fa-trash"></i>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                    {/* Portfolio Images */}
                    {providerProfile.portfolio_image_urls &&
                        providerProfile.portfolio_image_urls.length > 0 && (
                            <div className="document-section">
                                <h6>Portfolio Images</h6>
                                <div className="portfolio-grid">
                                    {providerProfile.portfolio_image_urls.map(
                                        (url, index) => (
                                            <div
                                                key={index}
                                                className="portfolio-item"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Portfolio ${
                                                        index + 1
                                                    }`}
                                                    className="portfolio-image"
                                                />
                                                <div className="portfolio-overlay">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() =>
                                                            handleDocumentDelete(
                                                                "portfolio_image",
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            )}

            {/* Upload New Documents */}
            <div className="upload-section">
                <h4>Upload New Documents</h4>

                {/* General Error */}
                {errors.general && (
                    <div className="form-error-banner">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>{errors.general}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="documents-upload-form">
                    {Object.entries(fields).map(([fieldName, fieldConfig]) => (
                        <div key={fieldName} className="upload-field">
                            <FileUpload
                                label={fieldConfig.label}
                                name={fieldName}
                                accept={fieldConfig.accept}
                                multiple={fieldConfig.multiple}
                                maxSize={fieldConfig.validation?.fileSize}
                                onFileSelect={(selectedFiles) =>
                                    handleFileSelect(selectedFiles, fieldName)
                                }
                                error={
                                    errors[fieldName]
                                        ? errors[fieldName].join(", ")
                                        : ""
                                }
                                helpText={fieldConfig.helpText}
                            />

                            {/* Preview selected files */}
                            {files[fieldName] && (
                                <DocumentPreview
                                    documents={
                                        Array.isArray(files[fieldName])
                                            ? files[fieldName].map(
                                                  (f) => f.name
                                              )
                                            : [files[fieldName].name]
                                    }
                                    type={fieldName}
                                    onRemove={(index) => {
                                        if (fieldConfig.multiple) {
                                            const newFiles = [
                                                ...files[fieldName],
                                            ];
                                            newFiles.splice(index, 1);
                                            setFiles((prev) => ({
                                                ...prev,
                                                [fieldName]: newFiles,
                                            }));
                                        } else {
                                            setFiles((prev) => ({
                                                ...prev,
                                                [fieldName]: null,
                                            }));
                                        }
                                    }}
                                />
                            )}
                        </div>
                    ))}

                    {/* Form Actions */}
                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                setFiles({
                                    business_license: null,
                                    certifications: [],
                                    portfolio_images: [],
                                })
                            }
                            disabled={!hasFilesToUpload || saving}
                        >
                            Clear All
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            loading={saving}
                            disabled={!hasFilesToUpload || saving}
                        >
                            Upload Documents
                        </Button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .documents-form {
                    width: 100%;
                }

                .current-documents {
                    margin-bottom: var(--space-6);
                    padding-bottom: var(--space-6);
                    border-bottom: 1px solid var(--border-color);
                }

                .current-documents h4,
                .upload-section h4 {
                    margin: 0 0 var(--space-4) 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .document-section {
                    margin-bottom: var(--space-4);
                }

                .document-section h6 {
                    margin: 0 0 var(--space-2) 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .document-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-3);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    margin-bottom: var(--space-2);
                }

                .document-info {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }

                .document-actions {
                    display: flex;
                    gap: var(--space-2);
                }

                .portfolio-grid {
                    display: grid;
                    grid-template-columns: repeat(
                        auto-fill,
                        minmax(120px, 1fr)
                    );
                    gap: var(--space-3);
                }

                .portfolio-item {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: var(--border-radius);
                    overflow: hidden;
                }

                .portfolio-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .portfolio-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: var(--transition);
                }

                .portfolio-item:hover .portfolio-overlay {
                    opacity: 1;
                }

                .form-error-banner {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid var(--danger-color);
                    border-radius: var(--border-radius);
                    padding: var(--space-3) var(--space-4);
                    margin-bottom: var(--space-4);
                    color: var(--danger-color);
                }

                .documents-upload-form {
                    width: 100%;
                }

                .upload-field {
                    margin-bottom: var(--space-4);
                }

                .form-actions {
                    display: flex;
                    gap: var(--space-3);
                    justify-content: flex-end;
                    padding-top: var(--space-4);
                    border-top: 1px solid var(--border-color);
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .document-item {
                        flex-direction: column;
                        gap: var(--space-2);
                        align-items: stretch;
                    }

                    .document-actions {
                        justify-content: center;
                    }

                    .portfolio-grid {
                        grid-template-columns: repeat(
                            auto-fill,
                            minmax(100px, 1fr)
                        );
                        gap: var(--space-2);
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .form-actions :global(.btn) {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default DocumentsForm;

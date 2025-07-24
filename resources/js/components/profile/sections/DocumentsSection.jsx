import React, { useState, useCallback, useMemo } from "react";
import { useProfile } from "../../../context/ProfileContext";
import ProfileSection from "../shared/ProfileSection";
import DocumentsForm from "../forms/DocumentsForm";
import Button from "../../ui/Button";

const DocumentsSection = ({ onSuccess, onError }) => {
    const { profile, config } = useProfile();
    const [uploadMode, setUploadMode] = useState(false);

    const providerProfile = profile?.provider_profile;
    const canUploadDocuments = config?.permissions?.canEdit?.some((field) =>
        ["business_license", "certifications", "portfolio_images"].includes(
            field
        )
    );

    const handleFormSuccess = useCallback((result) => {
        setUploadMode(false);
        if (onSuccess) {
            onSuccess(result.message || "Documents uploaded successfully!");
        }
    }, [onSuccess]);

    const handleFormError = useCallback((error) => {
        if (onError) {
            onError(error.message || "Failed to upload documents");
        }
    }, [onError]);

    const getDocumentStatus = () => {
        const hasLicense = !!providerProfile?.business_license_url;
        const hasCertifications =
            providerProfile?.certification_urls?.length > 0;
        const hasPortfolio = providerProfile?.portfolio_image_urls?.length > 0;

        const completedDocs = [
            hasLicense,
            hasCertifications,
            hasPortfolio,
        ].filter(Boolean).length;
        const totalDocs = 3;

        return {
            completedDocs,
            totalDocs,
            percentage: Math.round((completedDocs / totalDocs) * 100),
            hasLicense,
            hasCertifications,
            hasPortfolio,
        };
    };

    const status = useMemo(() => getDocumentStatus(), [providerProfile?.business_license_url, providerProfile?.certification_urls?.length, providerProfile?.portfolio_image_urls?.length]);

    const renderViewMode = () => (
        <div className="documents-view-mode">
            {/* Document Status Overview */}
            <div className="documents-overview">
                <div className="overview-header">
                    <div className="completion-info">
                        <h4>Document Verification</h4>
                        <p>
                            Complete your profile by uploading required
                            documents
                        </p>
                    </div>
                    <div className="completion-status">
                        <div className="completion-circle">
                            <div
                                className="completion-fill"
                                style={{
                                    "--completion": `${status.percentage}%`,
                                }}
                            ></div>
                            <div className="completion-text">
                                <span className="percentage">
                                    {status.percentage}%
                                </span>
                                <span className="label">Complete</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="completion-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${status.percentage}%` }}
                        ></div>
                    </div>
                    <span className="progress-text">
                        {status.completedDocs} of {status.totalDocs} documents
                        uploaded
                    </span>
                </div>
            </div>

            {/* Document Categories */}
            <div className="document-categories">
                {/* Business License */}
                <div
                    className={`document-category ${
                        status.hasLicense ? "completed" : "pending"
                    }`}
                >
                    <div className="category-header">
                        <div className="category-icon">
                            <i
                                className={`fas fa-${
                                    status.hasLicense
                                        ? "file-check"
                                        : "file-times"
                                }`}
                            ></i>
                        </div>
                        <div className="category-info">
                            <h5>Business License</h5>
                            <p>Official business registration or license</p>
                        </div>
                        <div className="category-status">
                            {status.hasLicense ? (
                                <span className="status-badge completed">
                                    <i className="fas fa-check"></i>
                                    Uploaded
                                </span>
                            ) : (
                                <span className="status-badge pending">
                                    <i className="fas fa-clock"></i>
                                    Required
                                </span>
                            )}
                        </div>
                    </div>

                    {status.hasLicense && (
                        <div className="document-preview">
                            <div className="preview-item">
                                <div className="preview-icon">
                                    <i className="fas fa-file-pdf text-danger"></i>
                                </div>
                                <div className="preview-info">
                                    <span>Business License Document</span>
                                    <div className="preview-actions">
                                        <a
                                            href={
                                                providerProfile.business_license_url
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-link"
                                        >
                                            <i className="fas fa-eye"></i>
                                            View
                                        </a>
                                        <a
                                            href={
                                                providerProfile.business_license_url
                                            }
                                            download
                                            className="action-link"
                                        >
                                            <i className="fas fa-download"></i>
                                            Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Certifications */}
                <div
                    className={`document-category ${
                        status.hasCertifications ? "completed" : "pending"
                    }`}
                >
                    <div className="category-header">
                        <div className="category-icon">
                            <i
                                className={`fas fa-${
                                    status.hasCertifications
                                        ? "certificate"
                                        : "times-circle"
                                }`}
                            ></i>
                        </div>
                        <div className="category-info">
                            <h5>Professional Certifications</h5>
                            <p>Relevant certifications and qualifications</p>
                        </div>
                        <div className="category-status">
                            {status.hasCertifications ? (
                                <span className="status-badge completed">
                                    <i className="fas fa-check"></i>
                                    {
                                        providerProfile.certification_urls
                                            .length
                                    }{" "}
                                    Uploaded
                                </span>
                            ) : (
                                <span className="status-badge optional">
                                    <i className="fas fa-info-circle"></i>
                                    Optional
                                </span>
                            )}
                        </div>
                    </div>

                    {status.hasCertifications && (
                        <div className="document-preview">
                            {providerProfile.certification_urls.map(
                                (url, index) => (
                                    <div key={index} className="preview-item">
                                        <div className="preview-icon">
                                            <i className="fas fa-certificate text-warning"></i>
                                        </div>
                                        <div className="preview-info">
                                            <span>
                                                Certification {index + 1}
                                            </span>
                                            <div className="preview-actions">
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="action-link"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                    View
                                                </a>
                                                <a
                                                    href={url}
                                                    download
                                                    className="action-link"
                                                >
                                                    <i className="fas fa-download"></i>
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Portfolio Images */}
                <div
                    className={`document-category ${
                        status.hasPortfolio ? "completed" : "pending"
                    }`}
                >
                    <div className="category-header">
                        <div className="category-icon">
                            <i
                                className={`fas fa-${
                                    status.hasPortfolio
                                        ? "images"
                                        : "times-circle"
                                }`}
                            ></i>
                        </div>
                        <div className="category-info">
                            <h5>Portfolio Images</h5>
                            <p>Showcase your work with before/after photos</p>
                        </div>
                        <div className="category-status">
                            {status.hasPortfolio ? (
                                <span className="status-badge completed">
                                    <i className="fas fa-check"></i>
                                    {
                                        providerProfile.portfolio_image_urls
                                            .length
                                    }{" "}
                                    Images
                                </span>
                            ) : (
                                <span className="status-badge recommended">
                                    <i className="fas fa-star"></i>
                                    Recommended
                                </span>
                            )}
                        </div>
                    </div>

                    {status.hasPortfolio && (
                        <div className="portfolio-gallery">
                            {providerProfile.portfolio_image_urls.map(
                                (url, index) => (
                                    <div key={index} className="portfolio-item">
                                        <img
                                            src={url}
                                            alt={`Portfolio ${index + 1}`}
                                            className="portfolio-image"
                                        />
                                        <div className="portfolio-overlay">
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="portfolio-action"
                                            >
                                                <i className="fas fa-expand"></i>
                                            </a>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Verification Notes */}
            {providerProfile?.verification_notes && (
                <div className="verification-notes">
                    <div className="notes-header">
                        <i className="fas fa-info-circle"></i>
                        <h5>Verification Notes</h5>
                    </div>
                    <p>{providerProfile.verification_notes}</p>
                </div>
            )}
        </div>
    );

    const renderUploadMode = () => (
        <div className="documents-upload-mode">
            <DocumentsForm
                onSubmit={handleFormSuccess}
                onError={handleFormError}
            />
        </div>
    );

    return (
        <ProfileSection
            title="Documents & Verification"
            subtitle="Upload and manage your business documents"
            icon="fas fa-file-alt"
            actions={
                canUploadDocuments && (
                    <div className="section-actions">
                        {!uploadMode ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setUploadMode(true)}
                            >
                                <i className="fas fa-upload"></i>
                                Upload Documents
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setUploadMode(false)}
                            >
                                <i className="fas fa-times"></i>
                                Cancel
                            </Button>
                        )}
                    </div>
                )
            }
        >
            {uploadMode ? renderUploadMode() : renderViewMode()}

            <style jsx>{`
                .documents-view-mode {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-6);
                }

                .documents-overview {
                    background: var(--current-role-light);
                    border: 1px solid var(--current-role-primary);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-5);
                }

                .overview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-4);
                }

                .completion-info h4 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--current-role-primary);
                    font-size: var(--text-xl);
                    font-weight: var(--font-bold);
                }

                .completion-info p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .completion-status {
                    display: flex;
                    align-items: center;
                }

                .completion-circle {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: conic-gradient(
                        var(--current-role-primary) var(--completion, 0%),
                        var(--border-color) var(--completion, 0%)
                    );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .completion-circle::before {
                    content: "";
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: var(--bg-white);
                }

                .completion-text {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 1;
                }

                .percentage {
                    font-size: var(--text-lg);
                    font-weight: var(--font-bold);
                    color: var(--current-role-primary);
                }

                .label {
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                }

                .completion-progress {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: var(--border-color);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: var(--current-role-primary);
                    border-radius: 4px;
                    transition: var(--transition);
                }

                .progress-text {
                    font-size: var(--text-sm);
                    color: var(--text-secondary);
                    text-align: center;
                }

                .document-categories {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }

                .document-category {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                    transition: var(--transition);
                }

                .document-category.completed {
                    border-color: var(--success-color);
                    background: rgba(5, 150, 105, 0.02);
                }

                .document-category.pending {
                    border-color: var(--warning-color);
                    background: rgba(245, 158, 11, 0.02);
                }

                .category-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    margin-bottom: var(--space-3);
                }

                .category-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-xl);
                    flex-shrink: 0;
                }

                .document-category.completed .category-icon {
                    background: var(--success-color);
                    color: white;
                }

                .document-category.pending .category-icon {
                    background: var(--warning-color);
                    color: white;
                }

                .category-info {
                    flex: 1;
                }

                .category-info h5 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                }

                .category-info p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .category-status {
                    flex-shrink: 0;
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                    padding: var(--space-1) var(--space-2);
                    border-radius: var(--border-radius);
                    font-size: var(--text-xs);
                    font-weight: var(--font-semibold);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .status-badge.completed {
                    background: var(--success-color);
                    color: white;
                }

                .status-badge.pending {
                    background: var(--warning-color);
                    color: white;
                }

                .status-badge.optional {
                    background: var(--info-color);
                    color: white;
                }

                .status-badge.recommended {
                    background: var(--current-role-primary);
                    color: white;
                }

                .document-preview {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                    padding-top: var(--space-3);
                    border-top: 1px solid var(--border-color);
                }

                .preview-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-2) var(--space-3);
                    background: var(--bg-light);
                    border-radius: var(--border-radius);
                }

                .preview-icon {
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .preview-info {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .preview-info span {
                    font-size: var(--text-sm);
                    font-weight: var(--font-medium);
                    color: var(--text-primary);
                }

                .preview-actions {
                    display: flex;
                    gap: var(--space-2);
                }

                .action-link {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                    padding: var(--space-1) var(--space-2);
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    text-decoration: none;
                    border-radius: var(--border-radius);
                    font-size: var(--text-xs);
                    transition: var(--transition);
                }

                .action-link:hover {
                    background: var(--current-role-primary);
                    color: white;
                }

                .portfolio-gallery {
                    display: grid;
                    grid-template-columns: repeat(
                        auto-fill,
                        minmax(120px, 1fr)
                    );
                    gap: var(--space-3);
                    padding-top: var(--space-3);
                    border-top: 1px solid var(--border-color);
                }

                .portfolio-item {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: var(--border-radius);
                    overflow: hidden;
                    cursor: pointer;
                }

                .portfolio-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: var(--transition);
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

                .portfolio-item:hover .portfolio-image {
                    transform: scale(1.05);
                }

                .portfolio-action {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--current-role-primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    font-size: var(--text-lg);
                    transition: var(--transition);
                }

                .portfolio-action:hover {
                    background: var(--current-role-secondary);
                    transform: scale(1.1);
                }

                .verification-notes {
                    background: var(--info-color);
                    color: white;
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                }

                .notes-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    margin-bottom: var(--space-3);
                }

                .notes-header h5 {
                    margin: 0;
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                }

                .verification-notes p {
                    margin: 0;
                    font-size: var(--text-sm);
                    line-height: 1.5;
                    opacity: 0.9;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .overview-header {
                        flex-direction: column;
                        gap: var(--space-3);
                        text-align: center;
                    }

                    .category-header {
                        flex-direction: column;
                        text-align: center;
                        gap: var(--space-2);
                    }

                    .preview-info {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: var(--space-2);
                    }

                    .portfolio-gallery {
                        grid-template-columns: repeat(
                            auto-fill,
                            minmax(100px, 1fr)
                        );
                        gap: var(--space-2);
                    }
                }
            `}</style>
        </ProfileSection>
    );
};

export default DocumentsSection;

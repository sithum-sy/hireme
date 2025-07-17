import React from "react";
import FormField from "../../forms/FormField";
import FileUpload from "../../forms/FileUpload";
import DocumentPreview from "../../forms/DocumentPreview";

const ContactAndProfessional = ({
    formData,
    onChange,
    errors,
    onFileChange,
    onDocumentUpload,
    onRemoveDocument,
    previewImage,
    onRemoveImage,
    documentPreviews,
}) => {
    const isProvider = formData.role === "service_provider";

    return (
        <div className="contact-professional">
            <div className="step-header">
                <h2 className="step-title">
                    {isProvider
                        ? "Contact & Professional Info"
                        : "Contact Details"}
                </h2>
                <p className="step-subtitle">
                    {isProvider
                        ? "Tell us about your business"
                        : "Complete your profile"}
                </p>
            </div>

            <div className="form-sections">
                {/* Contact Information */}
                <div className="contact-section">
                    <FormField
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={onChange}
                        error={errors.address}
                        placeholder="Your full address"
                        required
                    >
                        <textarea
                            name="address"
                            rows="3"
                            className={`form-input ${
                                errors.address ? "is-invalid" : ""
                            }`}
                            value={formData.address}
                            onChange={onChange}
                            placeholder="Your full address"
                        />
                    </FormField>

                    <div className="form-row">
                        <FormField
                            label="Contact Number"
                            name="contact_number"
                            type="tel"
                            value={formData.contact_number}
                            onChange={onChange}
                            error={errors.contact_number}
                            placeholder="+1234567890"
                            required
                            className="half-width"
                        />

                        <div className="profile-picture-section half-width">
                            <FileUpload
                                label="Profile Picture (Optional)"
                                name="profile_picture"
                                accept="image/*"
                                onFileSelect={(files) => onFileChange(files[0])}
                                helpText="Max 2MB, JPEG/PNG only"
                                error={errors.profile_picture}
                            />

                            {previewImage && (
                                <div className="image-preview-container">
                                    <div className="image-preview">
                                        <img
                                            src={previewImage}
                                            alt="Profile Preview"
                                            className="preview-img"
                                        />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={onRemoveImage}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Provider Professional Information */}
                {isProvider && (
                    <div className="provider-section">
                        <div className="section-header">
                            <h3 className="section-title">
                                <i className="fas fa-briefcase me-2"></i>
                                Professional Information
                            </h3>
                        </div>

                        <div className="form-row">
                            <FormField
                                label="Business Name"
                                name="business_name"
                                value={formData.business_name}
                                onChange={onChange}
                                placeholder="Your business name (optional)"
                                className="half-width"
                            />

                            <FormField
                                label="Years of Experience"
                                name="years_of_experience"
                                value={formData.years_of_experience}
                                onChange={onChange}
                                error={errors.years_of_experience}
                                required
                                className="half-width"
                            >
                                <select
                                    name="years_of_experience"
                                    className={`form-input ${
                                        errors.years_of_experience
                                            ? "is-invalid"
                                            : ""
                                    }`}
                                    value={formData.years_of_experience}
                                    onChange={onChange}
                                >
                                    <option value="">Select experience</option>
                                    <option value="0">Less than 1 year</option>
                                    <option value="1">1-2 years</option>
                                    <option value="3">3-5 years</option>
                                    <option value="6">6-10 years</option>
                                    <option value="11">10+ years</option>
                                </select>
                            </FormField>
                        </div>

                        <FormField
                            label="Professional Bio"
                            name="bio"
                            value={formData.bio}
                            onChange={onChange}
                            error={errors.bio}
                            placeholder="Describe your experience and skills (minimum 50 characters)"
                            required
                        >
                            <textarea
                                name="bio"
                                rows="4"
                                className={`form-input ${
                                    errors.bio ? "is-invalid" : ""
                                }`}
                                value={formData.bio}
                                onChange={onChange}
                                placeholder="Describe your experience and skills (minimum 50 characters)"
                            />
                            <div className="char-counter">
                                {formData.bio.length}/50 minimum
                            </div>
                        </FormField>

                        {/* Info Alert */}
                        <div className="info-alert">
                            <i className="fas fa-info-circle me-2"></i>
                            <strong>Note:</strong> You can add your services,
                            service areas, and pricing after registration from
                            your dashboard.
                        </div>

                        {/* Documents Section */}
                        <div className="documents-section">
                            <h4 className="documents-title">
                                <i className="fas fa-upload me-2"></i>
                                Documents & Portfolio (Optional)
                            </h4>

                            <div className="form-row">
                                <div className="half-width">
                                    <FileUpload
                                        label="Business License"
                                        name="business_license"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onFileSelect={(files) =>
                                            onDocumentUpload(
                                                files,
                                                "business_license"
                                            )
                                        }
                                        helpText="PDF, DOC, or Image (Max 5MB)"
                                        error={errors.business_license}
                                    />
                                    <DocumentPreview
                                        documents={
                                            documentPreviews.business_license
                                                ? [
                                                      documentPreviews.business_license,
                                                  ]
                                                : []
                                        }
                                        type="business_license"
                                        onRemove={() =>
                                            onRemoveDocument("business_license")
                                        }
                                    />
                                </div>

                                <div className="half-width">
                                    <FileUpload
                                        label="Certifications"
                                        name="certifications"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        multiple
                                        onFileSelect={(files) =>
                                            onDocumentUpload(
                                                files,
                                                "certifications"
                                            )
                                        }
                                        helpText="Multiple files allowed (Max 5MB each)"
                                        error={errors.certifications}
                                    />
                                    <DocumentPreview
                                        documents={
                                            documentPreviews.certifications
                                        }
                                        type="certifications"
                                        onRemove={(index) =>
                                            onRemoveDocument(
                                                "certifications",
                                                index
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <FileUpload
                                label="Portfolio Images"
                                name="portfolio_images"
                                accept="image/*"
                                multiple
                                onFileSelect={(files) =>
                                    onDocumentUpload(files, "portfolio_images")
                                }
                                helpText="Showcase your work (Max 10 images, 2MB each)"
                                error={errors.portfolio_images}
                            />
                            <DocumentPreview
                                documents={documentPreviews.portfolio_images}
                                type="portfolio_images"
                                onRemove={(index) =>
                                    onRemoveDocument("portfolio_images", index)
                                }
                            />
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .contact-professional {
                    animation: fadeInUp 0.6s ease-out;
                }

                .step-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .step-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 0.5rem;
                }

                .step-subtitle {
                    color: #6b7280;
                    font-size: 1rem;
                    margin: 0;
                }

                .form-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .half-width {
                    /* This class is used for grid layout */
                }

                .image-preview-container {
                    margin-top: 1rem;
                    text-align: center;
                }

                .image-preview {
                    position: relative;
                    display: inline-block;
                }

                .preview-img {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #e5e7eb;
                }

                .remove-image-btn {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #ef4444;
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    transition: all 0.2s ease;
                }

                .remove-image-btn:hover {
                    background: #dc2626;
                    transform: scale(1.1);
                }

                .provider-section {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border-left: 4px solid #10b981;
                }

                .section-header {
                    margin-bottom: 1.5rem;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #10b981;
                    margin: 0;
                }

                .char-counter {
                    font-size: 0.8rem;
                    color: #6b7280;
                    margin-top: 0.25rem;
                }

                .info-alert {
                    background: #dbeafe;
                    border: 1px solid #93c5fd;
                    color: #1e40af;
                    padding: 1rem;
                    border-radius: 8px;
                    margin: 1.5rem 0;
                    font-size: 0.9rem;
                }

                .documents-section {
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e5e7eb;
                }

                .documents-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #6b7280;
                    margin-bottom: 1.5rem;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 0.5rem;
                    }

                    .provider-section {
                        padding: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default ContactAndProfessional;

import React from "react";
import { PROFILE_SECTIONS } from "../../../../config/profileConfig.js";
import BasicInfoForm from "../forms/BasicInfoForm";
import ContactInfoForm from "../forms/ContactInfoForm";
import BusinessInfoForm from "../forms/BusinessInfoForm";
import DocumentsForm from "../forms/DocumentsForm";
import SecurityForm from "../forms/SecurityForm";

const ProfileFormSection = ({ section, onSubmit, onSuccess }) => {
    const handleFormSubmit = (result) => {
        if (onSubmit) {
            onSubmit(result);
        }

        if (result.success && onSuccess) {
            onSuccess(result.message || "Changes saved successfully!");
        }
    };

    const renderForm = () => {
        switch (section) {
            case PROFILE_SECTIONS.PERSONAL:
                return <BasicInfoForm onSubmit={handleFormSubmit} />;

            case PROFILE_SECTIONS.CONTACT:
                return <ContactInfoForm onSubmit={handleFormSubmit} />;

            case PROFILE_SECTIONS.BUSINESS:
                return <BusinessInfoForm onSubmit={handleFormSubmit} />;

            case PROFILE_SECTIONS.DOCUMENTS:
                return <DocumentsForm onSubmit={handleFormSubmit} />;

            case PROFILE_SECTIONS.SECURITY:
                return <SecurityForm onSubmit={handleFormSubmit} />;

            default:
                return (
                    <div className="no-form-available">
                        <i className="fas fa-exclamation-triangle"></i>
                        <p>This section is not yet available.</p>
                    </div>
                );
        }
    };

    return (
        <div className="profile-form-section">
            {renderForm()}

            <style jsx>{`
                .profile-form-section {
                    width: 100%;
                }

                .no-form-available {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-8);
                    color: var(--text-muted);
                    text-align: center;
                }

                .no-form-available i {
                    font-size: var(--text-3xl);
                    margin-bottom: var(--space-3);
                    color: var(--warning-color);
                }

                .no-form-available p {
                    margin: 0;
                    font-size: var(--text-base);
                }
            `}</style>
        </div>
    );
};

export default ProfileFormSection;

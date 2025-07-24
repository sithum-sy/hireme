import React, { useState, useMemo } from "react";
import { useProfile } from "../../../context/ProfileContext";
import ProfileSection from "../shared/ProfileSection";
import ContactInfoForm from "../forms/ContactInfoForm";
import Button from "../../ui/Button";

const ContactSection = ({ onSuccess, onError }) => {
    const { profile, config } = useProfile();
    const [editMode, setEditMode] = useState(false);

    const userData = profile?.user;
    const canEditContact = config?.permissions?.canEdit?.some((field) =>
        ["contact_number", "address"].includes(field)
    );
    
    // Memoize empty initialData to prevent re-renders
    const emptyInitialData = useMemo(() => ({}), []);

    const handleFormSuccess = (result) => {
        setEditMode(false);
        if (onSuccess) {
            onSuccess(
                result.message || "Contact information updated successfully!"
            );
        }
    };

    const handleFormError = (error) => {
        if (onError) {
            onError(error.message || "Failed to update contact information");
        }
    };

    const renderViewMode = () => (
        <div className="contact-view-mode">
            <div className="contact-details">
                <div className="contact-grid">
                    <div className="contact-item">
                        <div className="contact-header">
                            <div className="contact-icon">
                                <i className="fas fa-phone"></i>
                            </div>
                            <div>
                                <h6>Phone Number</h6>
                                <p>Primary contact number</p>
                            </div>
                        </div>
                        <div className="contact-value">
                            {userData?.contact_number ? (
                                <div className="value-content">
                                    <span className="value-text">
                                        {userData.contact_number}
                                    </span>
                                    {/* <div className="value-actions">
                                        <a
                                            href={`tel:${userData.contact_number}`}
                                            className="action-btn"
                                            title="Call"
                                        >
                                            <i className="fas fa-phone"></i>
                                        </a>
                                        <a
                                            href={`sms:${userData.contact_number}`}
                                            className="action-btn"
                                            title="SMS"
                                        >
                                            <i className="fas fa-sms"></i>
                                        </a>
                                    </div> */}
                                </div>
                            ) : (
                                <span className="no-value">Not provided</span>
                            )}
                        </div>
                    </div>

                    <div className="contact-item">
                        <div className="contact-header">
                            <div className="contact-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div>
                                <h6>Email Address</h6>
                                <p>Primary email for communications</p>
                            </div>
                        </div>
                        <div className="contact-value">
                            {userData?.email ? (
                                <div className="value-content">
                                    <span className="value-text">
                                        {userData.email}
                                    </span>
                                    {/* <div className="value-actions">
                                        <a
                                            href={`mailto:${userData.email}`}
                                            className="action-btn"
                                            title="Send Email"
                                        >
                                            <i className="fas fa-envelope"></i>
                                        </a>
                                    </div> */}
                                </div>
                            ) : (
                                <span className="no-value">Not provided</span>
                            )}
                        </div>
                    </div>

                    {config?.permissions?.canView?.includes("address") && (
                        <div className="contact-item address-item">
                            <div className="contact-header">
                                <div className="contact-icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div>
                                    <h6>Address</h6>
                                    <p>Primary residential address</p>
                                </div>
                            </div>
                            <div className="contact-value">
                                {userData?.address ? (
                                    <div className="value-content">
                                        <div className="address-text">
                                            {userData.address}
                                        </div>
                                        {/* <div className="value-actions">
                                            <a
                                                href={`https://maps.google.com?q=${encodeURIComponent(
                                                    userData.address
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="action-btn"
                                                title="View on Map"
                                            >
                                                <i className="fas fa-map"></i>
                                            </a>
                                        </div> */}
                                    </div>
                                ) : (
                                    <span className="no-value">
                                        Not provided
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Communication Preferences */}
            <div className="communication-preferences">
                <div className="preferences-header">
                    <h5>Communication Preferences</h5>
                    <p>How you prefer to be contacted</p>
                </div>

                <div className="preferences-grid">
                    <div className="preference-item">
                        <div className="preference-icon">
                            <i className="fas fa-envelope"></i>
                        </div>
                        <div className="preference-content">
                            <h6>Email Notifications</h6>
                            <p>Receive updates via email</p>
                            <span className="preference-status enabled">
                                Enabled
                            </span>
                        </div>
                    </div>

                    <div className="preference-item">
                        <div className="preference-icon">
                            <i className="fas fa-bell"></i>
                        </div>
                        <div className="preference-content">
                            <h6>Push Notifications</h6>
                            <p>Browser and app notifications</p>
                            <span className="preference-status enabled">
                                Enabled
                            </span>
                        </div>
                    </div>

                    {/* <div className="preference-item">
                        <div className="preference-icon">
                            <i className="fas fa-sms"></i>
                        </div>
                        <div className="preference-content">
                            <h6>SMS Notifications</h6>
                            <p>Important updates via SMS</p>
                            <span className="preference-status disabled">
                                Disabled
                            </span>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );

    const renderEditMode = () => (
        <div className="contact-edit-mode">
            <ContactInfoForm
                onSubmit={handleFormSuccess}
                onError={handleFormError}
                initialData={emptyInitialData}
            />
        </div>
    );

    return (
        <ProfileSection
            title="Contact Information"
            subtitle="Manage your contact details and communication preferences"
            icon="fas fa-phone"
            actions={
                canEditContact && (
                    <div className="section-actions">
                        {!editMode ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setEditMode(true)}
                            >
                                <i className="fas fa-edit"></i>
                                Edit Contact Info
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setEditMode(false)}
                            >
                                <i className="fas fa-times"></i>
                                Cancel
                            </Button>
                        )}
                    </div>
                )
            }
        >
            {editMode ? renderEditMode() : renderViewMode()}

            <style jsx>{`
                .contact-view-mode {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-6);
                }

                .contact-details {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                }

                .contact-grid {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-4);
                }

                .contact-item {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                    padding: var(--space-4);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    transition: var(--transition);
                }

                .contact-item:hover {
                    border-color: var(--current-role-primary);
                    box-shadow: var(--shadow-sm);
                }

                .contact-item.address-item {
                    grid-column: 1 / -1;
                }

                .contact-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                }

                .contact-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .contact-header h6 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                }

                .contact-header p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .contact-value {
                    margin-left: 55px;
                }

                .value-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--space-3);
                }

                .value-text {
                    color: var(--text-primary);
                    font-size: var(--text-base);
                    font-weight: var(--font-medium);
                }

                .address-text {
                    color: var(--text-primary);
                    font-size: var(--text-base);
                    font-weight: var(--font-medium);
                    line-height: 1.5;
                    white-space: pre-line;
                }

                .value-actions {
                    display: flex;
                    gap: var(--space-2);
                }

                .action-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-decoration: none;
                    font-size: var(--text-sm);
                    transition: var(--transition);
                }

                .action-btn:hover {
                    background: var(--current-role-primary);
                    color: white;
                    transform: scale(1.1);
                }

                .no-value {
                    color: var(--text-muted);
                    font-style: italic;
                    font-size: var(--text-sm);
                }

                .communication-preferences {
                    background: var(--bg-light);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                }

                .preferences-header {
                    margin-bottom: var(--space-4);
                    padding-bottom: var(--space-3);
                    border-bottom: 1px solid var(--border-color);
                }

                .preferences-header h5 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .preferences-header p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .preferences-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: var(--space-3);
                }

                .preference-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    background: var(--bg-white);
                    padding: var(--space-3);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--border-color);
                }

                .preference-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-base);
                    flex-shrink: 0;
                }

                .preference-content h6 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                }

                .preference-content p {
                    margin: 0 0 var(--space-2) 0;
                    color: var(--text-secondary);
                    font-size: var(--text-xs);
                }

                .preference-status {
                    padding: var(--space-1) var(--space-2);
                    border-radius: var(--border-radius);
                    font-size: var(--text-xs);
                    font-weight: var(--font-semibold);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .preference-status.enabled {
                    background: var(--success-color);
                    color: white;
                }

                .preference-status.disabled {
                    background: var(--text-muted);
                    color: white;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .contact-value {
                        margin-left: 0;
                        margin-top: var(--space-2);
                    }

                    .value-content {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: var(--space-2);
                    }

                    .preferences-grid {
                        grid-template-columns: 1fr;
                    }

                    .preference-item {
                        flex-direction: column;
                        text-align: center;
                        gap: var(--space-2);
                    }
                }
            `}</style>
        </ProfileSection>
    );
};

export default ContactSection;

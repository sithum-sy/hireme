/**
 * PDF Template Generation Utilities
 * Provides role-specific templates for appointment PDF generation
 */

import { constructProfileImageUrl } from "../../../hooks/useServiceImages";

export const formatDateTime = (date, time) => {
    if (!date || !time) {
        return {
            fullDate: "Date not available",
            time: "Time not available",
            shortDate: "N/A",
        };
    }

    try {
        let dateObj;
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === "string" && date.includes("-")) {
            const [year, month, day] = date.split("-");
            dateObj = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day)
            );
        } else {
            dateObj = new Date(date);
        }

        if (isNaN(dateObj.getTime())) {
            throw new Error("Invalid date");
        }

        let formattedTime = "Time not available";
        if (time) {
            try {
                const timeParts = time.toString().split(":");
                if (timeParts.length >= 2) {
                    const hours = parseInt(timeParts[0]);
                    const minutes = timeParts[1];
                    const ampm = hours >= 12 ? "PM" : "AM";
                    const displayHour = hours % 12 || 12;
                    formattedTime = `${displayHour}:${minutes} ${ampm}`;
                }
            } catch (timeError) {
                formattedTime = time.toString();
            }
        }

        return {
            fullDate: dateObj.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            time: formattedTime,
            shortDate: dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
        };
    } catch (error) {
        console.warn("Date formatting error:", error, { date, time });
        return {
            fullDate: date ? date.toString() : "Invalid date",
            time: time ? time.toString() : "Invalid time",
            shortDate: "Invalid",
        };
    }
};

export const getLocationDisplay = (appointment) => {
    const address =
        appointment.custom_address || appointment.client_address || "";
    const city = appointment.custom_city || appointment.client_city || "";
    const fullAddress = address + (city ? ", " + city : "");

    const locationTypes = {
        client_address: "At your location",
        provider_location: "At provider location",
        custom_location: "Custom location",
    };

    const locationType =
        locationTypes[appointment.location_type] ||
        "Location not specified";

    return {
        type: locationType,
        address: fullAddress,
    };
};

export const generatePDFHeader = (appointment, role, config = {}) => {
    const { companyName = 'HireMe' } = config;
    const roleLabels = {
        client: 'Client',
        provider: 'Provider',
        admin: 'Admin',
        staff: 'Staff'
    };

    return `
        <div class="header">
            <h1>Appointment Details</h1>
            <div>
                Booking ID: #${appointment.id}
                <span class="role-badge">${roleLabels[role]} View</span>
            </div>
        </div>
        
        <div class="meta">
            Generated on: ${new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })} | ${companyName}
        </div>
    `;
};

export const generateAppointmentInfoSection = (appointment, role) => {
    const dateTime = formatDateTime(
        appointment.appointment_date,
        appointment.appointment_time
    );

    return `
        <div class="section">
            <h3>Appointment Information</h3>
            <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${dateTime.fullDate}</span>
            </div>
            <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${dateTime.time}</span>
            </div>
            <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">${appointment.duration_hours} hour${appointment.duration_hours > 1 ? 's' : ''}</span>
            </div>
            <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value">
                    <span class="status ${appointment.status}">${appointment.status.replace(/_/g, ' ').toUpperCase()}</span>
                </span>
            </div>
            ${role === 'admin' || role === 'staff' ? `
            <div class="detail-row">
                <span class="label">Created:</span>
                <span class="value">${new Date(appointment.created_at || Date.now()).toLocaleDateString()}</span>
            </div>
            ` : ''}
        </div>
    `;
};

export const generateServiceDetailsSection = (appointment) => {
    return `
        <div class="section">
            <h3>Service Details</h3>
            <div class="detail-row">
                <span class="label">Service:</span>
                <span class="value">${appointment.service?.title || 'Service'}</span>
            </div>
            ${appointment.service?.category ? `
            <div class="detail-row">
                <span class="label">Category:</span>
                <span class="value">${appointment.service.category.name}</span>
            </div>
            ` : ''}
            ${appointment.service?.description ? `
            <div class="compact-text" style="margin-top: 6px;">
                <strong>Description:</strong><br>
                ${appointment.service.description.length > 100 ? appointment.service.description.substring(0, 100) + '...' : appointment.service.description}
            </div>
            ` : ''}
        </div>
    `;
};

export const generateProviderDetailsSection = (appointment, role) => {
    const showContactInfo = role === 'client' || role === 'admin' || role === 'staff';
    
    return `
        <div class="section">
            <h3>Provider Details</h3>
            <div class="provider-info">
                ${(() => {
                    const profileImageUrl = constructProfileImageUrl(appointment.provider?.profile_picture);
                    return profileImageUrl ? 
                        `<img src="${profileImageUrl}" alt="Provider" class="provider-avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="provider-fallback" style="display: none;">
                            👤
                        </div>` :
                        `<div class="provider-fallback">
                            👤
                        </div>`;
                })()}
                <div>
                    <div style="font-weight: bold; margin-bottom: 1px; font-size: 11px;">
                        ${appointment.provider?.first_name || ''} ${appointment.provider?.last_name || ''}
                    </div>
                    ${appointment.provider?.provider_profile?.business_name ? `
                    <div style="color: #666; font-size: 9px; margin-bottom: 1px;">
                        ${appointment.provider.provider_profile.business_name}
                    </div>
                    ` : ''}
                    <div style="color: #666; font-size: 9px;">
                        ⭐ ${appointment.provider?.provider_profile?.average_rating || 0} 
                        (${appointment.provider?.provider_profile?.total_reviews || 0})
                    </div>
                </div>
            </div>
            ${showContactInfo && appointment.provider?.contact_number ? `
            <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${appointment.provider.contact_number}</span>
            </div>
            ` : ''}
            ${showContactInfo && appointment.provider?.email ? `
            <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${appointment.provider.email}</span>
            </div>
            ` : ''}
        </div>
    `;
};

export const generateClientDetailsSection = (appointment, role) => {
    if (role === 'provider' || role === 'admin' || role === 'staff') {
        return `
            <div class="section">
                <h3>Client Details</h3>
                <div class="client-info">
                    <div class="client-fallback">
                        👤
                    </div>
                    <div>
                        <div style="font-weight: bold; margin-bottom: 1px; font-size: 11px;">
                            ${appointment.client?.first_name || ''} ${appointment.client?.last_name || ''}
                        </div>
                        <div style="color: #666; font-size: 9px;">
                            Client since: ${appointment.client?.created_at ? new Date(appointment.client.created_at).getFullYear() : 'N/A'}
                        </div>
                    </div>
                </div>
                ${appointment.client_phone ? `
                <div class="detail-row">
                    <span class="label">Phone:</span>
                    <span class="value">${appointment.client_phone}</span>
                </div>
                ` : ''}
                ${appointment.client_email ? `
                <div class="detail-row">
                    <span class="label">Email:</span>
                    <span class="value">${appointment.client_email}</span>
                </div>
                ` : ''}
            </div>
        `;
    }
    return '';
};

export const generateLocationDetailsSection = (appointment) => {
    const location = getLocationDisplay(appointment);
    
    return `
        <div class="section">
            <h3>Location Details</h3>
            <div class="detail-row">
                <span class="label">Location Type:</span>
                <span class="value">${location.type}</span>
            </div>
            ${location.address ? `
            <div class="compact-text" style="margin-top: 4px;">
                <strong>Address:</strong><br>
                ${location.address.length > 80 ? location.address.substring(0, 80) + '...' : location.address}
            </div>
            ` : ''}
            ${appointment.location_instructions ? `
            <div class="compact-text" style="margin-top: 4px;">
                <strong>Instructions:</strong><br>
                ${appointment.location_instructions.length > 60 ? appointment.location_instructions.substring(0, 60) + '...' : appointment.location_instructions}
            </div>
            ` : ''}
        </div>
    `;
};

export const generatePaymentSection = (appointment, role) => {
    const dateTime = formatDateTime(appointment.appointment_date, appointment.appointment_time);
    const showDetailedPayment = role === 'client' || role === 'admin' || role === 'staff';
    
    return `
        <div class="section full-width">
            <h3>Payment Information</h3>
            <div class="payment-grid">
                ${showDetailedPayment ? `
                <div class="payment-column">
                    <div class="payment-header">Service Charges</div>
                    <div class="payment-item">
                        <span>Base Service Fee</span>
                        <span>Rs. ${appointment.base_price || appointment.total_price}</span>
                    </div>
                    ${appointment.duration_hours && appointment.service?.pricing_type !== 'fixed' ? `
                    <div class="payment-item">
                        <span>Duration</span>
                        <span>${appointment.duration_hours} hour${appointment.duration_hours > 1 ? 's' : ''}</span>
                    </div>
                    ` : ''}
                    ${appointment.travel_fee > 0 ? `
                    <div class="payment-item">
                        <span>Travel Fee</span>
                        <span>Rs. ${appointment.travel_fee}</span>
                    </div>
                    ` : ''}
                    ${appointment.additional_charges > 0 ? `
                    <div class="payment-item">
                        <span>Additional Charges</span>
                        <span>Rs. ${appointment.additional_charges}</span>
                    </div>
                    ` : ''}
                    ${appointment.tax_amount > 0 ? `
                    <div class="payment-item">
                        <span>Tax (${appointment.tax_rate}%)</span>
                        <span>Rs. ${appointment.tax_amount}</span>
                    </div>
                    ` : ''}
                    ${appointment.discount_amount > 0 ? `
                    <div class="payment-item">
                        <span>Discount</span>
                        <span style="color: green;">-Rs. ${appointment.discount_amount}</span>
                    </div>
                    ` : ''}
                    <div class="payment-item total">
                        <span>Total Amount</span>
                        <span>Rs. ${appointment.total_price}</span>
                    </div>
                </div>
                ` : `
                <div class="payment-column">
                    <div class="payment-header">Payment Summary</div>
                    <div class="payment-item total">
                        <span>Total Amount</span>
                        <span>Rs. ${appointment.total_price}</span>
                    </div>
                </div>
                `}
                
                <div class="payment-column">
                    <div class="payment-header">Payment Details</div>
                    <div class="payment-item">
                        <span>Payment Method</span>
                        <span>${appointment.payment_method === "cash" ? "Cash Payment" : (appointment.payment_method?.charAt(0).toUpperCase() + appointment.payment_method?.slice(1))}</span>
                    </div>
                    ${appointment.invoice ? `
                    <div class="payment-item">
                        <span>Payment Status</span>
                        <span>${appointment.invoice.payment_status?.charAt(0).toUpperCase() + appointment.invoice.payment_status?.slice(1)}</span>
                    </div>
                    ${appointment.invoice.due_date ? `
                    <div class="payment-item">
                        <span>Due Date</span>
                        <span>${new Date(appointment.invoice.due_date).toLocaleDateString()}</span>
                    </div>
                    ` : ''}
                    ` : ''}
                    <div class="payment-item">
                        <span>Booking Date</span>
                        <span>${new Date(appointment.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div class="payment-item">
                        <span>Service Date</span>
                        <span>${dateTime.shortDate}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export const generateNotesSection = (appointment, role) => {
    const sections = [];
    
    if (appointment.client_notes) {
        sections.push(`
            <div class="section">
                <h3>Special Instructions</h3>
                <div class="compact-text">
                    ${appointment.client_notes.length > 150 ? appointment.client_notes.substring(0, 150) + '...' : appointment.client_notes}
                </div>
            </div>
        `);
    }

    if ((role === 'provider' || role === 'admin' || role === 'staff') && appointment.provider_notes) {
        sections.push(`
            <div class="section">
                <h3>Provider Notes</h3>
                <div class="compact-text">
                    ${appointment.provider_notes.length > 150 ? appointment.provider_notes.substring(0, 150) + '...' : appointment.provider_notes}
                </div>
            </div>
        `);
    }

    if ((role === 'admin' || role === 'staff') && appointment.admin_notes) {
        sections.push(`
            <div class="section">
                <h3>Administrative Notes</h3>
                <div class="compact-text">
                    ${appointment.admin_notes.length > 150 ? appointment.admin_notes.substring(0, 150) + '...' : appointment.admin_notes}
                </div>
            </div>
        `);
    }

    return sections.length > 0 ? `
        <div class="content-grid">
            ${sections.join('')}
        </div>
    ` : '';
};

export const generateContactSection = (appointment, role) => {
    if (role === 'client' && (appointment.client_phone || appointment.client_email)) {
        return `
            <div class="section">
                <h3>Your Contact Information</h3>
                ${appointment.client_phone ? `
                <div class="detail-row">
                    <span class="label">Phone:</span>
                    <span class="value">${appointment.client_phone}</span>
                </div>
                ` : ''}
                ${appointment.client_email ? `
                <div class="detail-row">
                    <span class="label">Email:</span>
                    <span class="value">${appointment.client_email}</span>
                </div>
                ` : ''}
            </div>
        `;
    }
    return '';
};

export const generatePrintButtons = () => {
    return `
        <div class="no-print" style="margin-top: 10px; text-align: center; padding-top: 8px; border-top: 1px solid #ddd;">
            <button onclick="window.print()" style="padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 6px; font-size: 10px;">Print PDF</button>
            <button onclick="window.close()" style="padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">Close</button>
        </div>
    `;
};
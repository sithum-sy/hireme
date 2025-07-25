import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import AppointmentHeader from "../../../components/client/appointments/AppointmentHeader";
import ServiceDetailsCard from "../../../components/client/appointments/ServiceDetailsCard";
import ProviderDetailsCard from "../../../components/client/appointments/ProviderDetailsCard";
import AppointmentSummaryCard from "../../../components/client/appointments/AppointmentSummaryCard";
import ImportantInfoCard from "../../../components/client/appointments/ImportantInfoCard";
import CancelAppointmentModal from "../../../components/client/appointments/CancelAppointmentModal";
import AppointmentUpdateModal from "../../../components/client/appointments/AppointmentUpdateModal";
import ReviewModal from "../../../components/client/appointments/ReviewModal";
import PaymentModal from "../../../components/client/appointments/PaymentModal";
import InvoiceSection from "../../../components/client/appointments/InvoiceSection";
import ContactProvider from "../../../components/client/appointments/ContactProvider";
import clientAppointmentService from "../../../services/clientAppointmentService";
import { constructProfileImageUrl } from "../../../hooks/useServiceImages";

const AppointmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State management
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal states
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateMode, setUpdateMode] = useState("auto");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showContactPanel, setShowContactPanel] = useState(false);

    // Load appointment details on component mount
    useEffect(() => {
        loadAppointmentDetail();
    }, [id]);

    const loadAppointmentDetail = async () => {
        setLoading(true);
        setError(null);

        try {
            // Try enhanced service first
            const result = await clientAppointmentService.getAppointment(id);

            if (result.success) {
                setAppointment(result.data);
            } else {
                setError(
                    result.message || "Failed to load appointment details"
                );
            }
        } catch (error) {
            console.error(
                "Enhanced service failed, falling back to original API:",
                error
            );

            // Fallback to your existing API
            try {
                const response = await fetch(`/api/client/bookings/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAppointment(data.data);
                } else if (response.status === 404) {
                    setError("Appointment not found");
                } else {
                    setError("Failed to load appointment details");
                }
            } catch (fallbackError) {
                console.error("Fallback API also failed:", fallbackError);
                setError("Failed to load appointment. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Check if appointment can be paid
    const canBePaid = () => {
        return (
            appointment.invoice &&
            appointment.invoice.payment_status === "pending" &&
            ["completed", "invoice_sent", "payment_pending"].includes(
                appointment.status
            )
        );
    };

    // Check if appointment can be reviewed
    const canBeReviewed = () => {
        return appointment.status === "paid" && !appointment.client_review;
    };

    // Check if appointment can be cancelled (24 hours before appointment)
    const canBeCancelled = () => {
        if (!["pending", "confirmed"].includes(appointment.status))
            return false;
        if (!appointment.appointment_date || !appointment.appointment_time)
            return false;

        try {
            let dateObj;
            const dateStr = appointment.appointment_date;
            const timeStr = appointment.appointment_time;

            if (dateStr.includes("-")) {
                const [year, month, day] = dateStr.split("-");
                const [hours, minutes] = timeStr.split(":");
                dateObj = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    parseInt(hours),
                    parseInt(minutes)
                );
            } else {
                dateObj = new Date(`${dateStr}T${timeStr}`);
            }

            if (isNaN(dateObj.getTime())) {
                return false;
            }

            const now = new Date();
            const hoursUntilAppointment = (dateObj - now) / (1000 * 60 * 60);
            return hoursUntilAppointment > 24;
        } catch (error) {
            console.warn("Error checking cancellation policy:", error);
            return false;
        }
    };


    // Format date and time for display (your existing function)
    const formatDateTime = (date, time) => {
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

    // Success handlers
    const handlePaymentSuccess = (updatedAppointment) => {
        setAppointment(updatedAppointment);
        setShowPaymentModal(false);
    };

    const handleReviewSuccess = (updatedAppointment) => {
        setAppointment(updatedAppointment);
        setShowReviewModal(false);
    };

    const handleCancellationSuccess = (updatedAppointment) => {
        setAppointment(updatedAppointment);
        setShowCancelModal(false);
    };

    const handleUpdateSuccess = (updatedAppointment) => {
        setAppointment(updatedAppointment);
        setShowUpdateModal(false);
    };

    // Download appointment details as PDF
    const downloadAppointmentPDF = () => {
        if (!appointment) return;

        const dateTime = formatDateTime(
            appointment.appointment_date,
            appointment.appointment_time
        );

        const getLocationDisplay = () => {
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

        const location = getLocationDisplay();

        const printWindow = window.open("", "_blank");
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Appointment Details - ${appointment.id}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 0.5in;
                    }
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0;
                        padding: 20px;
                        line-height: 1.3; 
                        color: #333;
                        font-size: 12px;
                        max-width: 210mm;
                        border: 2px solid #007bff;
                        border-radius: 8px;
                        box-sizing: border-box;
                        width: fit-content;
                        height: fit-content;
                        min-height: auto;
                    }
                    .pdf-container {
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        min-height: auto;
                        height: auto;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 2px solid #007bff; 
                        padding-bottom: 8px; 
                        margin-bottom: 12px;
                    }
                    .header h1 { 
                        color: #007bff; 
                        margin: 0;
                        font-size: 20px;
                    }
                    .meta { 
                        text-align: center; 
                        color: #666; 
                        margin-bottom: 12px; 
                        font-size: 10px;
                    }
                    .content-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                        margin-bottom: 8px;
                    }
                    .content-grid:last-of-type {
                        margin-bottom: 0;
                    }
                    .full-width {
                        grid-column: 1 / -1;
                        margin-bottom: 8px;
                    }
                    .full-width:last-child {
                        margin-bottom: 0;
                    }
                    .section { 
                        margin-bottom: 8px; 
                        padding: 8px; 
                        border: 1px solid #ddd; 
                        border-radius: 4px;
                        background: #fafafa;
                        page-break-inside: avoid;
                    }
                    .section:last-child {
                        margin-bottom: 0;
                    }
                    .section h3 { 
                        color: #007bff; 
                        margin: 0 0 6px 0; 
                        border-bottom: 1px solid #ddd; 
                        padding-bottom: 3px;
                        font-size: 14px;
                    }
                    .detail-row { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 3px; 
                        padding: 1px 0;
                        font-size: 11px;
                    }
                    .label { 
                        font-weight: bold; 
                        color: #555;
                        flex: 0 0 45%;
                    }
                    .value { 
                        color: #333;
                        flex: 1;
                        text-align: right;
                    }
                    .status { 
                        display: inline-block; 
                        padding: 2px 6px; 
                        border-radius: 10px; 
                        font-size: 9px; 
                        font-weight: bold; 
                        text-transform: uppercase;
                    }
                    .status.confirmed { background: #d4edda; color: #155724; }
                    .status.pending { background: #fff3cd; color: #856404; }
                    .status.completed { background: #d1ecf1; color: #0c5460; }
                    .status.cancelled { background: #f8d7da; color: #721c24; }
                    .payment-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin-top: 6px;
                    }
                    .payment-column {
                        border: 1px solid #ddd;
                        border-radius: 3px;
                        overflow: hidden;
                        background: white;
                    }
                    .payment-header {
                        background: #f0f0f0;
                        padding: 5px 8px;
                        font-weight: bold;
                        border-bottom: 1px solid #ddd;
                        font-size: 11px;
                    }
                    .payment-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 4px 8px;
                        border-bottom: 1px solid #eee;
                        font-size: 10px;
                    }
                    .payment-item:last-child {
                        border-bottom: none;
                    }
                    .payment-item.total {
                        background: #e9ecef;
                        font-weight: bold;
                        font-size: 11px;
                    }
                    .provider-info {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 8px;
                    }
                    .provider-avatar {
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 1px solid #ddd;
                    }
                    .provider-fallback {
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        background: #f8f9fa;
                        border: 1px solid #ddd;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        color: #666;
                    }
                    .compact-text {
                        font-size: 10px;
                        line-height: 1.2;
                        margin-bottom: 2px;
                    }
                    .main-content {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                    }
                    @media print {
                        body { 
                            margin: 0; 
                            padding: 15px;
                            font-size: 10px;
                            border-width: 1px;
                            height: auto !important;
                            min-height: auto !important;
                        }
                        .pdf-container {
                            height: auto !important;
                            min-height: auto !important;
                        }
                        .no-print { display: none; }
                        .section { margin-bottom: 6px; padding: 6px; }
                        .section:last-child { margin-bottom: 0; }
                        .header { margin-bottom: 6px; padding-bottom: 6px; }
                        .meta { margin-bottom: 6px; }
                        .content-grid { gap: 8px; margin-bottom: 6px; }
                        .content-grid:last-of-type { margin-bottom: 0; }
                        .payment-grid { gap: 6px; }
                        .full-width { margin-bottom: 6px; }
                        .full-width:last-child { margin-bottom: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="pdf-container">
                    <div class="header">
                        <h1>Appointment Details</h1>
                        <div>Booking ID: #${appointment.id}</div>
                    </div>
                    
                    <div class="meta">
                        Generated on: ${new Date().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </div>

                    <div class="main-content">
                        <div class="content-grid">
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
                        </div>

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
                            ${appointment.provider?.contact_number ? `
                            <div class="detail-row">
                                <span class="label">Phone:</span>
                                <span class="value">${appointment.provider.contact_number}</span>
                            </div>
                            ` : ''}
                            ${appointment.provider?.email ? `
                            <div class="detail-row">
                                <span class="label">Email:</span>
                                <span class="value">${appointment.provider.email}</span>
                            </div>
                            ` : ''}
                        </div>

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
                    </div>

                    <div class="section full-width">
                        <h3>Payment Information</h3>
                        <div class="payment-grid">
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

                    ${appointment.client_notes || appointment.client_phone || appointment.client_email ? `
                    <div class="content-grid">
                        ${appointment.client_notes ? `
                        <div class="section">
                            <h3>Special Instructions</h3>
                            <div class="compact-text">
                                ${appointment.client_notes.length > 150 ? appointment.client_notes.substring(0, 150) + '...' : appointment.client_notes}
                            </div>
                        </div>
                        ` : ''}

                        ${appointment.client_phone || appointment.client_email ? `
                        <div class="section">
                            <h3>Contact Information</h3>
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
                        ` : ''}
                    </div>
                    ` : ''}
                    </div>

                    <div class="no-print" style="margin-top: 10px; text-align: center; padding-top: 8px; border-top: 1px solid #ddd;">
                        <button onclick="window.print()" style="padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 6px; font-size: 10px;">Print PDF</button>
                        <button onclick="window.close()" style="padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 10px;">Close</button>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
    };

    // Loading state
    if (loading) {
        return (
            <ClientLayout>
                <LoadingSpinner message="Loading appointment details..." />
            </ClientLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <ClientLayout>
                <div className="error-state text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h4 className="text-danger">{error}</h4>
                    <p className="text-muted">
                        Please check the appointment ID and try again.
                    </p>
                    <Link to="/client/appointments" className="btn btn-primary">
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Appointments
                    </Link>
                </div>
            </ClientLayout>
        );
    }

    const canCancel = canBeCancelled();

    return (
        <ClientLayout>
            <div className="appointment-detail-page">
                {/* Header with breadcrumb and actions */}
                <AppointmentHeader
                    appointment={appointment}
                    canBePaid={canBePaid}
                    canBeReviewed={canBeReviewed}
                    canBeCancelled={canCancel}
                    actionLoading={actionLoading}
                    onPaymentClick={() => setShowPaymentModal(true)}
                    onReviewClick={() => setShowReviewModal(true)}
                    onEditClick={() => {
                        setUpdateMode("edit");
                        setShowUpdateModal(true);
                    }}
                    onRescheduleClick={() => {
                        setUpdateMode("reschedule");
                        setShowUpdateModal(true);
                    }}
                    onCancelClick={() => setShowCancelModal(true)}
                    onContactToggle={() => setShowContactPanel(!showContactPanel)}
                    showContactPanel={showContactPanel}
                    onPrintClick={downloadAppointmentPDF}
                />

                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Service Details Card */}
                        <ServiceDetailsCard appointment={appointment} />

                        {/* Provider Details Card */}
                        <ProviderDetailsCard appointment={appointment} />

                        {/* Important Information - Show on larger screens (lg and up) */}
                        <div className="d-none d-lg-block">
                            <ImportantInfoCard 
                                appointment={appointment} 
                                canCancel={canCancel}
                            />
                        </div>

                        {/* NEW: Invoice Section */}
                        {appointment.invoice && (
                            <InvoiceSection
                                appointment={appointment}
                                onPaymentClick={() => setShowPaymentModal(true)}
                                canBePaid={canBePaid()}
                            />
                        )}

                        {/* NEW: Review Section */}
                        {canBeReviewed() && (
                            <div className="review-section card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-star me-2 text-warning"></i>
                                        Rate Your Experience
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <p className="text-muted mb-3">
                                        How was your experience with this
                                        service? Your feedback helps other
                                        clients make informed decisions.
                                    </p>
                                    <button
                                        className="btn btn-warning"
                                        onClick={() => setShowReviewModal(true)}
                                        disabled={actionLoading}
                                    >
                                        <i className="fas fa-star me-2"></i>
                                        Write Review
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* NEW: Completed Review Section */}
                        {appointment.client_review && (
                            <div className="completed-review-section card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-check-circle me-2 text-success"></i>
                                        Your Review
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="rating-display mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <i
                                                key={i}
                                                className={`fas fa-star me-1 ${
                                                    i <
                                                    appointment.client_review
                                                        .rating
                                                        ? "text-warning"
                                                        : "text-muted"
                                                }`}
                                            ></i>
                                        ))}
                                        <span className="ms-2 fw-semibold">
                                            {appointment.client_review.rating}{" "}
                                            stars
                                        </span>
                                    </div>
                                    {appointment.client_review.comment && (
                                        <p className="text-muted mb-2">
                                            "{appointment.client_review.comment}
                                            "
                                        </p>
                                    )}
                                    <small className="text-muted">
                                        Reviewed on{" "}
                                        {new Date(
                                            appointment.client_review.created_at
                                        ).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                        )}

                        {/* Client Notes - Your existing code */}
                        {appointment.client_notes && (
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-sticky-note me-2 text-primary"></i>
                                        Special Instructions
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <p className="text-muted mb-0">
                                        {appointment.client_notes}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Quote Origin - Your existing code */}
                        {appointment.quote_id && (
                            <div className="card border-0 shadow-sm mb-4 border-info">
                                <div className="card-header bg-info bg-opacity-10 border-bottom border-info">
                                    <h5 className="fw-bold mb-0 text-info">
                                        <i className="fas fa-quote-left me-2"></i>
                                        Quote Information
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <p className="mb-2">
                                        This appointment was created from Quote
                                        #{appointment.quote_id}
                                    </p>
                                    <Link
                                        to={`/client/quotes/${appointment.quote_id}`}
                                        className="btn btn-outline-info btn-sm"
                                    >
                                        <i className="fas fa-external-link-alt me-2"></i>
                                        View Original Quote
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Appointment Summary - Enhanced with better context */}
                        <AppointmentSummaryCard 
                            appointment={appointment} 
                            formatDateTime={formatDateTime}
                        />

                        {/* Important Information - Show on smaller screens (below lg) */}
                        <div className="d-lg-none">
                            <ImportantInfoCard 
                                appointment={appointment} 
                                canCancel={canCancel}
                            />
                        </div>

                    </div>
                </div>

                {/* Contact Provider Panel */}
                {showContactPanel && appointment.status === "confirmed" && (
                    <div className="contact-provider-section mt-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-comments me-2 text-primary"></i>
                                    Contact Provider
                                </h6>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setShowContactPanel(false)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="card-body">
                                <ContactProvider
                                    appointment={appointment}
                                    onClose={() => setShowContactPanel(false)}
                                    onMessageSent={(messageData) => {
                                        console.log("Message sent:", messageData);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div className="mt-4 text-center">
                    <Link
                        to="/client/appointments"
                        className="btn btn-outline-secondary"
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to All Appointments
                    </Link>
                </div>
            </div>

            {/* Modals */}
            <CancelAppointmentModal
                show={showCancelModal}
                onHide={() => setShowCancelModal(false)}
                appointment={appointment}
                onCancellationSuccess={handleCancellationSuccess}
            />

            <AppointmentUpdateModal
                show={showUpdateModal}
                onHide={() => setShowUpdateModal(false)}
                appointment={appointment}
                mode={updateMode}
                onUpdateSuccess={handleUpdateSuccess}
            />

            <ReviewModal
                show={showReviewModal}
                onHide={() => setShowReviewModal(false)}
                appointment={appointment}
                onReviewSuccess={handleReviewSuccess}
            />

            <PaymentModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                appointment={appointment}
                onPaymentSuccess={handlePaymentSuccess}
            />

            {/* Print Styles */}
            <style>{`
               @media print {
                   .action-buttons { display: none !important; }
                   .card { border: 1px solid #ddd !important; }
                   .contact-provider-section { display: none !important; }
               }
           `}</style>
        </ClientLayout>
    );
};

export default AppointmentDetail;

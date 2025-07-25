import React, { useState, useEffect } from "react";
import {
    Link,
    useSearchParams,
    useLocation,
    useNavigate,
} from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import TodaysSchedule from "../../../components/client/appointments/TodaysSchedule";
import QuickFilterTabs from "../../../components/client/appointments/QuickFilterTabs";
import AppointmentsTable from "../../../components/client/appointments/AppointmentsTable";
import CancelAppointmentModal from "../../../components/client/appointments/CancelAppointmentModal";
// import RescheduleModal from "../../../components/client/appointments/RescheduleModal";
import ReviewModal from "../../../components/client/appointments/ReviewModal";
import PaymentModal from "../../../components/client/appointments/PaymentModal";
import clientAppointmentService from "../../../services/clientAppointmentService";

const AppointmentsList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    // State management
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState(
        searchParams.get("filter") || "today"
    );
    const [sortField, setSortField] = useState("appointment_date");
    const [sortDirection, setSortDirection] = useState("asc");
    const [appointmentCounts, setAppointmentCounts] = useState({});
    const [filters, setFilters] = useState({
        status: searchParams.get("status") || "all",
        date_from: searchParams.get("date_from") || "",
        date_to: searchParams.get("date_to") || "",
        service_type: searchParams.get("service_type") || "",
        category: searchParams.get("category") || "all",
    });
    const [pendingFilters, setPendingFilters] = useState({ ...filters });
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
    });

    // Modal states
    const [showCancelModal, setShowCancelModal] = useState(false);
    // const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Load appointments on component mount and filter changes
    useEffect(() => {
        loadAppointments();
    }, [filters, pagination.current_page]);

    // Load categories for filter dropdown
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            // Try multiple endpoints to find categories
            const endpoints = [
                "/api/service-categories",
                "/api/client/service-categories",
                "/api/categories",
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                            "Content-Type": "application/json",
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const categoryData = data.success
                            ? data.data
                            : data.data || data;
                        if (
                            categoryData &&
                            Array.isArray(categoryData) &&
                            categoryData.length > 0
                        ) {
                            setCategories(categoryData);
                            console.log("Categories loaded from:", endpoint);
                            return; // Success, exit the loop
                        }
                    }
                } catch (err) {
                    console.log(`Endpoint ${endpoint} failed:`, err.message);
                    continue; // Try next endpoint
                }
            }

            // If all endpoints fail, extract categories from existing appointments
            extractCategoriesFromAppointments();
        } catch (error) {
            console.error("Failed to load categories:", error);
            extractCategoriesFromAppointments();
        }
    };

    // Fallback: Extract unique categories from current appointments
    const extractCategoriesFromAppointments = () => {
        const uniqueCategories = [];
        const seenCategories = new Set();

        appointments.forEach((appointment) => {
            const category = appointment.service?.category;
            if (category && category.id && !seenCategories.has(category.id)) {
                seenCategories.add(category.id);
                uniqueCategories.push({
                    id: category.id,
                    name: category.name || "Unknown Category",
                });
            }
        });

        if (uniqueCategories.length > 0) {
            setCategories(uniqueCategories);
            console.log(
                "Categories extracted from appointments:",
                uniqueCategories.length
            );
        } else {
            console.log("No categories found in appointments");
        }
    };

    // Show success message if navigated from booking completion
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (location.state?.message && location.state?.fromBooking) {
            setSuccessMessage({
                message: location.state.message,
                type: location.state.type || "success",
                appointment: location.state.appointment,
            });

            // Clear the success message after 10 seconds
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [location.state]);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            // Use enhanced appointment service with payment data
            const params = {
                status: filters.status !== "all" ? filters.status : undefined,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
                service_type: filters.service_type || undefined,
                category:
                    filters.category !== "all" ? filters.category : undefined,
                per_page: pagination.per_page,
                page: pagination.current_page,
            };

            const result = await clientAppointmentService.getAppointments(
                params
            );

            if (result.success) {
                const responseData = result.data;
                setAppointments(responseData.data || responseData);

                // Update pagination info
                if (responseData.data) {
                    setPagination((prev) => ({
                        ...prev,
                        current_page: responseData.current_page,
                        last_page: responseData.last_page,
                        total: responseData.total,
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to load appointments:", error);
            // Fallback to your existing API if new service fails
            await loadAppointmentsFallback();
        } finally {
            setLoading(false);
        }
    };

    // Fallback to your existing API method
    const loadAppointmentsFallback = async () => {
        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (filters.status !== "all")
                params.append("status", filters.status);
            if (filters.date_from)
                params.append("date_from", filters.date_from);
            if (filters.date_to) params.append("date_to", filters.date_to);
            if (filters.service_type)
                params.append("service_type", filters.service_type);
            if (filters.category !== "all")
                params.append("category", filters.category);
            params.append("page", pagination.current_page);

            const response = await fetch(`/api/client/bookings?${params}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAppointments(data.data?.data || data.data || []);

                if (data.data?.meta) {
                    setPagination((prev) => ({
                        ...prev,
                        current_page: data.data.meta.current_page,
                        last_page: data.data.meta.last_page,
                        total: data.data.meta.total,
                    }));
                }
            }
        } catch (error) {
            console.error("Fallback API also failed:", error);
        }
    };

    // Handle filter changes for quick tabs
    const handleQuickFilterChange = (filterType) => {
        setActiveFilter(filterType);

        // Update URL parameters
        const newParams = new URLSearchParams(searchParams);
        newParams.set("filter", filterType);
        setSearchParams(newParams);

        // Update filters based on quick filter type
        const today = new Date().toISOString().split("T")[0];
        let newFilters = { ...filters };

        switch (filterType) {
            case "today":
                newFilters = {
                    ...filters,
                    date_from: today,
                    date_to: today,
                    status: "all",
                };
                break;
            case "upcoming":
                newFilters = {
                    ...filters,
                    date_from: today,
                    date_to: "",
                    status: "confirmed",
                };
                break;
            case "completed":
                newFilters = {
                    ...filters,
                    status: "completed",
                    date_from: "",
                    date_to: "",
                };
                break;
            case "cancelled":
                newFilters = {
                    ...filters,
                    status: "cancelled_by_client",
                    date_from: "",
                    date_to: "",
                };
                break;
            case "all":
            default:
                newFilters = {
                    status: "all",
                    date_from: "",
                    date_to: "",
                    service_type: "",
                    category: "all",
                };
                break;
        }

        setFilters(newFilters);
        setPendingFilters(newFilters);
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    // Handle pending filter changes (don't apply immediately)
    const handlePendingFilterChange = (key, value) => {
        setPendingFilters((prev) => ({ ...prev, [key]: value }));
    };

    // Apply filters when Apply button is clicked
    const applyFilters = () => {
        setFilters(pendingFilters);

        // Update URL parameters
        const newParams = new URLSearchParams();
        Object.entries(pendingFilters).forEach(([k, v]) => {
            if (v && v !== "all") newParams.set(k, v);
        });
        setSearchParams(newParams);

        // Reset to first page when filters change
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    // Reset pending filters to match current filters
    const resetPendingFilters = () => {
        setPendingFilters({ ...filters });
    };

    // Handle filter changes and update URL (for quick filters)
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        setPendingFilters(newFilters);

        // Update URL parameters
        const newParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== "all") newParams.set(k, v);
        });
        setSearchParams(newParams);

        // Reset to first page when filters change
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    // Handle table sorting
    const handleSort = (field) => {
        const newDirection =
            sortField === field && sortDirection === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortDirection(newDirection);
    };

    // Calculate appointment counts for quick filter tabs
    const calculateAppointmentCounts = () => {
        const today = new Date().toISOString().split("T")[0];
        const counts = {
            today: appointments.filter((apt) => apt.appointment_date === today)
                .length,
            upcoming: appointments.filter(
                (apt) =>
                    apt.appointment_date >= today &&
                    ["pending", "confirmed"].includes(apt.status)
            ).length,
            completed: appointments.filter((apt) => apt.status === "completed")
                .length,
            cancelled: appointments.filter((apt) =>
                ["cancelled_by_client", "cancelled_by_provider"].includes(
                    apt.status
                )
            ).length,
            total: appointments.length,
        };
        setAppointmentCounts(counts);
        return counts;
    };

    // Update appointment counts when appointments change
    useEffect(() => {
        calculateAppointmentCounts();
        // Also update categories from appointments if we don't have any
        if (categories.length === 0 && appointments.length > 0) {
            extractCategoriesFromAppointments();
        }
    }, [appointments]);

    // Handle appointment actions from table components
    const handleAppointmentAction = (action, appointment) => {
        setSelectedAppointment(appointment);

        switch (action) {
            case "view":
                navigate(`/client/appointments/${appointment.id}`);
                break;
            case "cancel":
                setShowCancelModal(true);
                break;
            case "reschedule":
                // Handle reschedule - uncomment when modal is ready
                // setShowRescheduleModal(true);
                break;
            case "review":
                setShowReviewModal(true);
                break;
            case "pay":
                setShowPaymentModal(true);
                break;
            default:
                break;
        }
    };

    // Download appointments as PDF
    const downloadAppointmentsPDF = () => {
        const doc = {
            content: [
                {
                    text: "My Appointments",
                    style: "header",
                    margin: [0, 0, 0, 20],
                },
                {
                    text: `Generated on: ${new Date().toLocaleDateString(
                        "en-US",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        }
                    )}`,
                    style: "subheader",
                    margin: [0, 0, 0, 20],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ["15%", "20%", "20%", "15%", "15%", "15%"],
                        body: [
                            [
                                "Date",
                                "Service",
                                "Provider",
                                "Status",
                                "Price",
                                "Location",
                            ],
                            ...appointments.map((appointment) => [
                                new Date(
                                    appointment.appointment_date
                                ).toLocaleDateString(),
                                appointment.service?.name ||
                                    appointment.service?.title ||
                                    "Service",
                                appointment.provider?.full_name ||
                                    `${
                                        appointment.provider?.first_name || ""
                                    } ${
                                        appointment.provider?.last_name || ""
                                    }`.trim() ||
                                    appointment.provider?.name ||
                                    "Provider",
                                appointment.status
                                    .replace(/_/g, " ")
                                    .toUpperCase(),
                                `Rs. ${appointment.total_price || 0}`,
                                (() => {
                                    const getLocationDisplay = () => {
                                        // For all location types, try to show the actual address if available
                                        const address =
                                            appointment.custom_address ||
                                            appointment.client_address ||
                                            "";
                                        const city =
                                            appointment.custom_city ||
                                            appointment.client_city ||
                                            "";
                                        const fullAddress =
                                            address + (city ? ", " + city : "");

                                        if (
                                            appointment.location_type ===
                                            "client_address"
                                        ) {
                                            return (
                                                fullAddress || "Your Location"
                                            );
                                        } else if (
                                            appointment.location_type ===
                                            "provider_location"
                                        ) {
                                            return "Provider Location";
                                        } else if (
                                            appointment.location_type ===
                                            "custom_location"
                                        ) {
                                            return (
                                                fullAddress || "Custom Location"
                                            );
                                        } else {
                                            return (
                                                fullAddress ||
                                                "Location not set"
                                            );
                                        }
                                    };
                                    return getLocationDisplay();
                                })(),
                            ]),
                        ],
                    },
                    layout: {
                        fillColor: function (rowIndex, node, columnIndex) {
                            return rowIndex === 0 ? "#f2f2f2" : null;
                        },
                    },
                },
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: "center",
                },
                subheader: {
                    fontSize: 12,
                    alignment: "center",
                    color: "#666",
                },
            },
            defaultStyle: {
                fontSize: 10,
            },
        };

        // Simple PDF generation using browser's print functionality
        const printWindow = window.open("", "_blank");
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>My Appointments</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; color: #333; }
                    .meta { text-align: center; color: #666; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .status { text-transform: capitalize; }
                    .price { text-align: right; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>My Appointments</h1>
                <div class="meta">
                    Generated on: ${new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                    <br/>Total Appointments: ${appointments.length}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Service</th>
                            <th>Provider</th>
                            <th>Status</th>
                            <th>Price</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${appointments
                            .map(
                                (appointment) => `
                            <tr>
                                <td>${new Date(
                                    appointment.appointment_date
                                ).toLocaleDateString()} ${
                                    appointment.appointment_time || ""
                                }</td>
                                <td>${
                                    appointment.service?.name ||
                                    appointment.service?.title ||
                                    "Service"
                                }</td>
                                <td>${
                                    appointment.provider?.full_name ||
                                    `${
                                        appointment.provider?.first_name || ""
                                    } ${
                                        appointment.provider?.last_name || ""
                                    }`.trim() ||
                                    appointment.provider?.name ||
                                    "Provider"
                                }</td>
                                <td class="status">${appointment.status.replace(
                                    /_/g,
                                    " "
                                )}</td>
                                <td class="price">Rs. ${
                                    appointment.total_price || 0
                                }</td>
                                <td>${(() => {
                                    const address =
                                        appointment.custom_address ||
                                        appointment.client_address ||
                                        "";
                                    const city =
                                        appointment.custom_city ||
                                        appointment.client_city ||
                                        "";
                                    const fullAddress =
                                        address + (city ? ", " + city : "");

                                    if (
                                        appointment.location_type ===
                                        "client_address"
                                    ) {
                                        return fullAddress || "Your Location";
                                    } else if (
                                        appointment.location_type ===
                                        "provider_location"
                                    ) {
                                        return "Provider Location";
                                    } else if (
                                        appointment.location_type ===
                                        "custom_location"
                                    ) {
                                        return fullAddress || "Custom Location";
                                    } else {
                                        return (
                                            fullAddress || "Location not set"
                                        );
                                    }
                                })()}</td>
                            </tr>
                        `
                            )
                            .join("")}
                    </tbody>
                </table>
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Print PDF</button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Close</button>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
    };

    // Check if appointment can be cancelled (24 hour policy)
    const canCancelAppointment = (appointmentDate, appointmentTime, status) => {
        if (!["pending", "confirmed"].includes(status)) return false;
        if (!appointmentDate || !appointmentTime) return false;

        try {
            let dateObj;
            if (appointmentDate.includes("-")) {
                const [year, month, day] = appointmentDate.split("-");
                const [hours, minutes] = appointmentTime.split(":");
                dateObj = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    parseInt(hours),
                    parseInt(minutes)
                );
            } else {
                dateObj = new Date(`${appointmentDate}T${appointmentTime}`);
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

    // Check if appointment can be paid
    const canBePaid = (appointment) => {
        return (
            appointment.invoice &&
            appointment.invoice.payment_status === "pending" &&
            ["completed", "invoice_sent", "payment_pending"].includes(
                appointment.status
            )
        );
    };

    // Check if appointment can be reviewed
    const canBeReviewed = (appointment) => {
        return appointment.status === "paid" && !appointment.client_review;
    };

    // Get status badge styling - Enhanced with payment statuses
    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-warning text-dark",
            confirmed: "bg-success text-white",
            in_progress: "bg-primary text-white",
            completed: "bg-info text-white",
            invoice_sent: "bg-info text-white",
            payment_pending: "bg-warning text-dark",
            paid: "bg-success text-white",
            reviewed: "bg-success text-white",
            closed: "bg-secondary text-white",
            cancelled_by_client: "bg-danger text-white",
            cancelled_by_provider: "bg-danger text-white",
            no_show: "bg-secondary text-white",
        };
        return badges[status] || "bg-secondary text-white";
    };

    // Get status text for display - Enhanced with payment statuses
    const getStatusText = (status) => {
        const statusTexts = {
            pending: "Awaiting Confirmation",
            confirmed: "Confirmed",
            in_progress: "In Progress",
            completed: "Completed",
            invoice_sent: "Invoice Sent",
            payment_pending: "Payment Pending",
            paid: "Paid",
            reviewed: "Reviewed",
            closed: "Closed",
            cancelled_by_client: "Cancelled by You",
            cancelled_by_provider: "Cancelled by Provider",
            no_show: "No Show",
        };
        return statusTexts[status] || status.replace("_", " ");
    };

    // Format appointment date/time (your existing function)
    const formatDateTime = (date, time) => {
        if (!date || !time) {
            return { date: "Date not set", time: "Time not set" };
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

            let formattedTime = "Time not set";
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
                date: dateObj.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                }),
                time: formattedTime,
            };
        } catch (error) {
            console.warn("Date formatting error:", error, { date, time });
            return {
                date: date ? date.toString() : "Invalid date",
                time: time ? time.toString() : "Invalid time",
            };
        }
    };

    // Modal handlers
    const handleCancelClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelModal(true);
    };

    // const handleRescheduleClick = (appointment) => {
    //     setSelectedAppointment(appointment);
    //     setShowRescheduleModal(true);
    // };

    const handleReviewClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowReviewModal(true);
    };

    const handlePaymentClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowPaymentModal(true);
    };

    // Success handlers
    const handleCancellationSuccess = (updatedAppointment) => {
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
            )
        );
        setShowCancelModal(false);
        setSelectedAppointment(null);
    };

    const handleReviewSuccess = (updatedAppointment) => {
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
            )
        );
        setShowReviewModal(false);
        setSelectedAppointment(null);
    };

    const handlePaymentSuccess = (updatedAppointment) => {
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
            )
        );
        setShowPaymentModal(false);
        setSelectedAppointment(null);
    };

    return (
        <ClientLayout>
            <div className="page-content">
                {/* Success Message Banner */}
                {successMessage && (
                    <div
                        className="alert alert-success alert-dismissible fade show mb-4"
                        role="alert"
                    >
                        <div className="d-flex align-items-center">
                            <i className="fas fa-check-circle fa-lg me-3 text-success"></i>
                            <div className="flex-grow-1">
                                <h6 className="alert-heading mb-1 fw-semibold">
                                    Booking Successful!
                                </h6>
                                <p className="mb-0">{successMessage.message}</p>
                                {successMessage.appointment && (
                                    <small className="text-muted">
                                        Booking ID: #
                                        {successMessage.appointment.id} |
                                        {/* Confirmation Code: {successMessage.appointment.confirmation_code} */}
                                    </small>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSuccessMessage(null)}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                {/* Page Header */}
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">My Appointments</h1>
                        <p className="page-subtitle">
                            Manage and track your service appointments
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-success btn-responsive"
                            onClick={downloadAppointmentsPDF}
                            disabled={loading || appointments.length === 0}
                        >
                            <i className="fas fa-download me-2"></i>
                            Download PDF
                        </button>
                        <Link
                            to="/client/services"
                            className="btn btn-primary btn-responsive"
                        >
                            <i className="fas fa-plus me-2"></i>
                            Book New Service
                        </Link>
                    </div>
                </div>

                {/* Today's Schedule Priority Section */}
                {activeFilter === "today" && (
                    <TodaysSchedule
                        onAppointmentAction={handleAppointmentAction}
                    />
                )}

                {/* Quick Filter Tabs */}
                <QuickFilterTabs
                    activeFilter={activeFilter}
                    onFilterChange={handleQuickFilterChange}
                    appointmentCounts={appointmentCounts}
                />

                {/* Advanced Filters Section - Collapsible */}
                <div className="filters-section mb-6">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Advanced Filters</h5>
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#advancedFilters"
                            aria-expanded="false"
                            aria-controls="advancedFilters"
                        >
                            <i className="fas fa-filter me-2"></i>
                            More Filters
                        </button>
                    </div>

                    <div className="collapse" id="advancedFilters">
                        <div className="row g-3 align-items-end">
                            <div className="col-12">
                                <div className="alert alert-info small">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Multi-Filter Support:</strong> You
                                    can combine multiple filters (status, dates,
                                    and service type) to narrow down your
                                    search. Make changes and click "Apply
                                    Filters" to update the results.
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    Status
                                </label>
                                <select
                                    className="form-select"
                                    value={pendingFilters.status}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "status",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in_progress">
                                        In Progress
                                    </option>
                                    <option value="completed">Completed</option>
                                    <option value="invoice_sent">
                                        Invoice Sent
                                    </option>
                                    <option value="payment_pending">
                                        Payment Pending
                                    </option>
                                    <option value="paid">Paid</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="cancelled_by_client">
                                        Cancelled
                                    </option>
                                </select>
                            </div>

                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={pendingFilters.date_from}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "date_from",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={pendingFilters.date_to}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "date_to",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    Service Type
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by service name..."
                                    value={pendingFilters.service_type}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "service_type",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    Category
                                </label>
                                <select
                                    className="form-select"
                                    value={pendingFilters.category}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "category",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 mt-3">
                                <div className="d-flex gap-2 justify-content-center">
                                    <button
                                        className="btn btn-primary btn-responsive"
                                        onClick={applyFilters}
                                        disabled={
                                            JSON.stringify(filters) ===
                                            JSON.stringify(pendingFilters)
                                        }
                                    >
                                        <i className="fas fa-check me-2"></i>
                                        Apply Filters
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary btn-responsive"
                                        onClick={() => {
                                            const clearedFilters = {
                                                status: "all",
                                                date_from: "",
                                                date_to: "",
                                                service_type: "",
                                                category: "all",
                                            };
                                            setFilters(clearedFilters);
                                            setPendingFilters(clearedFilters);
                                            setActiveFilter("all");
                                            setSearchParams({});
                                        }}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Clear All
                                    </button>
                                    <button
                                        className="btn btn-outline-info btn-responsive"
                                        onClick={resetPendingFilters}
                                        disabled={
                                            JSON.stringify(filters) ===
                                            JSON.stringify(pendingFilters)
                                        }
                                    >
                                        <i className="fas fa-undo me-2"></i>
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments Table */}
                <AppointmentsTable
                    appointments={appointments}
                    loading={loading}
                    onSort={handleSort}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onAppointmentAction={handleAppointmentAction}
                />

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="pagination-wrapper d-flex justify-content-center mt-4">
                        <nav>
                            <ul className="pagination">
                                <li
                                    className={`page-item ${
                                        pagination.current_page === 1
                                            ? "disabled"
                                            : ""
                                    }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setPagination((prev) => ({
                                                ...prev,
                                                current_page:
                                                    prev.current_page - 1,
                                            }))
                                        }
                                        disabled={pagination.current_page === 1}
                                    >
                                        Previous
                                    </button>
                                </li>

                                {Array.from(
                                    {
                                        length: Math.min(
                                            5,
                                            pagination.last_page
                                        ),
                                    },
                                    (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <li
                                                key={page}
                                                className={`page-item ${
                                                    pagination.current_page ===
                                                    page
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        setPagination(
                                                            (prev) => ({
                                                                ...prev,
                                                                current_page:
                                                                    page,
                                                            })
                                                        )
                                                    }
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        );
                                    }
                                )}

                                <li
                                    className={`page-item ${
                                        pagination.current_page ===
                                        pagination.last_page
                                            ? "disabled"
                                            : ""
                                    }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setPagination((prev) => ({
                                                ...prev,
                                                current_page:
                                                    prev.current_page + 1,
                                            }))
                                        }
                                        disabled={
                                            pagination.current_page ===
                                            pagination.last_page
                                        }
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}

                {/* Quick Actions Footer - Your existing code */}
                <div className="quick-actions mt-5 p-4 bg-light rounded-4">
                    <div className="row text-center">
                        <div className="col-md-3">
                            <Link
                                to="/client/services"
                                className="text-decoration-none"
                            >
                                <i className="fas fa-plus-circle fa-2x text-primary mb-2 d-block"></i>
                                <span className="small fw-semibold">
                                    Book New Service
                                </span>
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link
                                to="/client/quotes"
                                className="text-decoration-none"
                            >
                                <i className="fas fa-quote-left fa-2x text-info mb-2 d-block"></i>
                                <span className="small fw-semibold">
                                    Request Quote
                                </span>
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link
                                to="/client/providers"
                                className="text-decoration-none"
                            >
                                <i className="fas fa-users fa-2x text-success mb-2 d-block"></i>
                                <span className="small fw-semibold">
                                    Find Providers
                                </span>
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link
                                to="/client/support"
                                className="text-decoration-none"
                            >
                                <i className="fas fa-headset fa-2x text-warning mb-2 d-block"></i>
                                <span className="small fw-semibold">
                                    Get Help
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Modals */}
            {selectedAppointment && (
                <>
                    <CancelAppointmentModal
                        show={showCancelModal}
                        onHide={() => {
                            setShowCancelModal(false);
                            setSelectedAppointment(null);
                        }}
                        appointment={selectedAppointment}
                        onCancellationSuccess={handleCancellationSuccess}
                    />

                    <ReviewModal
                        show={showReviewModal}
                        onHide={() => {
                            setShowReviewModal(false);
                            setSelectedAppointment(null);
                        }}
                        appointment={selectedAppointment}
                        onReviewSuccess={handleReviewSuccess}
                    />

                    <PaymentModal
                        show={showPaymentModal}
                        onHide={() => {
                            setShowPaymentModal(false);
                            setSelectedAppointment(null);
                        }}
                        appointment={selectedAppointment}
                        onPaymentSuccess={handlePaymentSuccess}
                    />
                </>
            )}

            {/* Custom Styles */}
            <style>{`
               /* Using CSS variables for consistent theming */
               .appointment-card {
                   transition: transform 0.2s ease, box-shadow 0.2s ease;
               }
               .appointment-card:hover {
                   transform: translateY(-2px);
                   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
               }
               .text-sm {
                   font-size: 0.875rem;
               }
               .pagination .page-link {
                   color: var(--current-role-primary);
               }
               .pagination .page-item.active .page-link {
                   background-color: var(--current-role-primary);
                   border-color: var(--current-role-primary);
               }
               .status-badges .badge {
                   font-size: 0.75rem;
               }
           `}</style>
        </ClientLayout>
    );
};

export default AppointmentsList;

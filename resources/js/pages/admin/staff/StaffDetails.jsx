import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAdmin } from "../../../context/AdminContext";
import AdminLayout from "../../../components/layouts/AdminLayout";

const StaffDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const {
        getStaffById,
        deleteStaff,
        toggleStaffStatus,
        isProcessing,
        errors,
    } = useAdmin();

    const [staffMember, setStaffMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        loadStaffData();
    }, [id]);

    const loadStaffData = async () => {
        try {
            setLoading(true);
            const staff = await getStaffById(id);
            setStaffMember(staff);
        } catch (error) {
            console.error("Failed to load staff data:", error);
            navigate("/admin/staff");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            await toggleStaffStatus(staffMember.id);
            // Reload staff data to get updated status
            await loadStaffData();
        } catch (error) {
            console.error("Failed to toggle staff status:", error);
        }
    };

    const handleDeleteStaff = async () => {
        try {
            await deleteStaff(staffMember.id);
            navigate("/admin/staff", {
                state: {
                    message: `Staff member "${staffMember.full_name}" has been deleted successfully.`,
                },
            });
        } catch (error) {
            console.error("Failed to delete staff:", error);
            setShowDeleteModal(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not provided";
        return new Date(dateString).toLocaleDateString([], {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <AdminLayout>
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: "400px" }}
                >
                    <div className="text-center">
                        <div
                            className="spinner-border text-primary mb-3"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h5>Loading staff details...</h5>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!staffMember) {
        return (
            <AdminLayout>
                <div className="text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h4>Staff Member Not Found</h4>
                    <p className="text-muted">
                        The staff member you're looking for doesn't exist.
                    </p>
                    <Link to="/admin/staff" className="btn btn-primary">
                        Back to Staff List
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Success Message */}
            {location.state?.message && (
                <div
                    className="alert alert-success alert-dismissible fade show"
                    role="alert"
                >
                    <i className="fas fa-check-circle me-2"></i>
                    {location.state.message}
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="alert"
                    ></button>
                </div>
            )}

            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="d-flex align-items-center">
                    <div className="me-3">
                        {staffMember.profile_picture ? (
                            <img
                                src={staffMember.profile_picture}
                                alt={staffMember.full_name}
                                className="rounded-circle"
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <div
                                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "60px", height: "60px" }}
                            >
                                <i className="fas fa-user fa-2x text-primary"></i>
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="h3 mb-1">{staffMember.full_name}</h1>
                        <div className="d-flex align-items-center gap-3">
                            <span
                                className={`badge ${
                                    staffMember.is_active
                                        ? "bg-success"
                                        : "bg-secondary"
                                }`}
                            >
                                {staffMember.is_active ? "Active" : "Inactive"}
                            </span>
                            <small className="text-muted">
                                {staffMember.email}
                            </small>
                            {staffMember.has_recent_activity && (
                                <span className="badge bg-info">
                                    Recently Active
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className={`btn btn-outline-${
                            staffMember.is_active ? "warning" : "success"
                        }`}
                        onClick={handleToggleStatus}
                        disabled={isProcessing}
                    >
                        <i
                            className={`fas ${
                                staffMember.is_active ? "fa-ban" : "fa-check"
                            } me-2`}
                        ></i>
                        {staffMember.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <Link
                        to={`/admin/staff/${id}/edit`}
                        className="btn btn-primary"
                    >
                        <i className="fas fa-edit me-2"></i>
                        Edit
                    </Link>
                    <div className="dropdown">
                        <button
                            className="btn btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                        >
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <Link
                                    to="/admin/staff"
                                    className="dropdown-item"
                                >
                                    <i className="fas fa-list me-2"></i>
                                    Back to Staff List
                                </Link>
                            </li>
                            <li>
                                <button
                                    className="dropdown-item"
                                    onClick={() => window.print()}
                                >
                                    <i className="fas fa-print me-2"></i>
                                    Print Details
                                </button>
                            </li>
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            <li>
                                <button
                                    className="dropdown-item text-danger"
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    <i className="fas fa-trash me-2"></i>
                                    Delete Staff
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "overview" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("overview")}
                            >
                                <i className="fas fa-user me-2"></i>
                                Overview
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "details" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("details")}
                            >
                                <i className="fas fa-info-circle me-2"></i>
                                Details
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "activity" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("activity")}
                            >
                                <i className="fas fa-history me-2"></i>
                                Activity
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="card-body">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="row">
                            <div className="col-lg-8">
                                {/* Quick Info Cards */}
                                <div className="row mb-4">
                                    <div className="col-md-4">
                                        <div className="card bg-primary bg-opacity-10 border-0 h-100">
                                            <div className="card-body text-center">
                                                <i className="fas fa-calendar-alt fa-2x text-primary mb-2"></i>
                                                <h6>Member Since</h6>
                                                <p className="mb-0">
                                                    {formatDate(
                                                        staffMember.created_at
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card bg-success bg-opacity-10 border-0 h-100">
                                            <div className="card-body text-center">
                                                <i className="fas fa-clock fa-2x text-success mb-2"></i>
                                                <h6>Last Login</h6>
                                                <p className="mb-0">
                                                    {
                                                        staffMember.last_login_human
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card bg-info bg-opacity-10 border-0 h-100">
                                            <div className="card-body text-center">
                                                <i className="fas fa-user-shield fa-2x text-info mb-2"></i>
                                                <h6>Account Status</h6>
                                                <p className="mb-0">
                                                    <span
                                                        className={`badge ${
                                                            staffMember.is_active
                                                                ? "bg-success"
                                                                : "bg-secondary"
                                                        }`}
                                                    >
                                                        {staffMember.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white border-bottom">
                                        <h6 className="card-title mb-0">
                                            Contact Information
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label text-muted">
                                                        Email Address
                                                    </label>
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-envelope text-muted me-2"></i>
                                                        <span>
                                                            {staffMember.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label text-muted">
                                                        Contact Number
                                                    </label>
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-phone text-muted me-2"></i>
                                                        <span>
                                                            {staffMember.contact_number ||
                                                                "Not provided"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="mb-3">
                                                    <label className="form-label text-muted">
                                                        Address
                                                    </label>
                                                    <div className="d-flex align-items-start">
                                                        <i className="fas fa-map-marker-alt text-muted me-2 mt-1"></i>
                                                        <span>
                                                            {staffMember.address ||
                                                                "Not provided"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4">
                                {/* Profile Summary */}
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white border-bottom">
                                        <h6 className="card-title mb-0">
                                            Profile Summary
                                        </h6>
                                    </div>
                                    <div className="card-body text-center">
                                        <div className="mb-3">
                                            {staffMember.profile_picture ? (
                                                <img
                                                    src={
                                                        staffMember.profile_picture
                                                    }
                                                    alt={staffMember.full_name}
                                                    className="rounded-circle"
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                    }}
                                                >
                                                    <i className="fas fa-user fa-3x text-primary"></i>
                                                </div>
                                            )}
                                        </div>
                                        <h5 className="mb-1">
                                            {staffMember.full_name}
                                        </h5>
                                        <p className="text-muted mb-3">
                                            Staff Member
                                        </p>

                                        <div className="row g-2">
                                            <div className="col-6">
                                                <small className="text-muted d-block">
                                                    Staff ID
                                                </small>
                                                <strong>
                                                    #{staffMember.id}
                                                </strong>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">
                                                    Status
                                                </small>
                                                <span
                                                    className={`badge ${
                                                        staffMember.is_active
                                                            ? "bg-success"
                                                            : "bg-secondary"
                                                    }`}
                                                >
                                                    {staffMember.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Creation Info */}
                                {staffMember.creator_name && (
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-bottom">
                                            <h6 className="card-title mb-0">
                                                Creation Info
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-2">
                                                <small className="text-muted d-block">
                                                    Created By
                                                </small>
                                                <strong>
                                                    {staffMember.creator_name}
                                                </strong>
                                            </div>
                                            <div>
                                                <small className="text-muted d-block">
                                                    Created On
                                                </small>
                                                <strong>
                                                    {formatDateTime(
                                                        staffMember.created_at
                                                    )}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Details Tab */}
                    {activeTab === "details" && (
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white border-bottom">
                                        <h6 className="card-title mb-0">
                                            Personal Information
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-borderless">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted">
                                                        First Name:
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {
                                                                staffMember.first_name
                                                            }
                                                        </strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Last Name:
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {
                                                                staffMember.last_name
                                                            }
                                                        </strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Email:
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {staffMember.email}
                                                        </strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Contact:
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {staffMember.contact_number ||
                                                                "Not provided"}
                                                        </strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Date of Birth:
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {formatDate(
                                                                staffMember.date_of_birth
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Address:
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {staffMember.address ||
                                                                "Not provided"}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white border-bottom">
                                        <h6 className="card-title mb-0">
                                            Account Information
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <table className="table table-borderless">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted">
                                                        Staff ID:
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            #{staffMember.id}
                                                        </strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Role:
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-primary">
                                                            Staff Member
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Status:
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                staffMember.is_active
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {staffMember.is_active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Email Verified:
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                staffMember.email_verified_at
                                                                    ? "bg-success"
                                                                    : "bg-warning"
                                                            }`}
                                                        >
                                                            {staffMember.email_verified_at
                                                                ? "Verified"
                                                                : "Pending"}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Created:
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {formatDateTime(
                                                                staffMember.created_at
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Last Updated:
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {formatDateTime(
                                                                staffMember.updated_at
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-muted">
                                                        Last Login:
                                                    </td>
                                                    <td>
                                                        <strong>
                                                            {staffMember.last_login_at
                                                                ? formatDateTime(
                                                                      staffMember.last_login_at
                                                                  )
                                                                : "Never"}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Tab */}
                    {activeTab === "activity" && (
                        <div className="row">
                            <div className="col-lg-8">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white border-bottom">
                                        <h6 className="card-title mb-0">
                                            Activity Timeline
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="timeline">
                                            {/* Account Creation */}
                                            <div className="timeline-item">
                                                <div className="timeline-marker bg-success">
                                                    <i className="fas fa-user-plus text-white"></i>
                                                </div>
                                                <div className="timeline-content">
                                                    <h6 className="mb-1">
                                                        Account Created
                                                    </h6>
                                                    <p className="text-muted mb-1">
                                                        Staff account was
                                                        created
                                                        {staffMember.creator_name &&
                                                            ` by ${staffMember.creator_name}`}
                                                    </p>
                                                    <small className="text-muted">
                                                        {formatDateTime(
                                                            staffMember.created_at
                                                        )}
                                                    </small>
                                                </div>
                                            </div>

                                            {/* Email Verification */}
                                            {staffMember.email_verified_at && (
                                                <div className="timeline-item">
                                                    <div className="timeline-marker bg-info">
                                                        <i className="fas fa-envelope-check text-white"></i>
                                                    </div>
                                                    <div className="timeline-content">
                                                        <h6 className="mb-1">
                                                            Email Verified
                                                        </h6>
                                                        <p className="text-muted mb-1">
                                                            Email address was
                                                            verified
                                                        </p>
                                                        <small className="text-muted">
                                                            {formatDateTime(
                                                                staffMember.email_verified_at
                                                            )}
                                                        </small>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Last Login */}
                                            {staffMember.last_login_at && (
                                                <div className="timeline-item">
                                                    <div className="timeline-marker bg-primary">
                                                        <i className="fas fa-sign-in-alt text-white"></i>
                                                    </div>
                                                    <div className="timeline-content">
                                                        <h6 className="mb-1">
                                                            Last Login
                                                        </h6>
                                                        <p className="text-muted mb-1">
                                                            Last accessed the
                                                            system
                                                        </p>
                                                        <small className="text-muted">
                                                            {formatDateTime(
                                                                staffMember.last_login_at
                                                            )}
                                                        </small>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Profile Updates */}
                                            {staffMember.updated_at !==
                                                staffMember.created_at && (
                                                <div className="timeline-item">
                                                    <div className="timeline-marker bg-warning">
                                                        <i className="fas fa-edit text-white"></i>
                                                    </div>
                                                    <div className="timeline-content">
                                                        <h6 className="mb-1">
                                                            Profile Updated
                                                        </h6>
                                                        <p className="text-muted mb-1">
                                                            Profile information
                                                            was modified
                                                        </p>
                                                        <small className="text-muted">
                                                            {formatDateTime(
                                                                staffMember.updated_at
                                                            )}
                                                        </small>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* No activity message */}
                                        {!staffMember.last_login_at &&
                                            staffMember.updated_at ===
                                                staffMember.created_at && (
                                                <div className="text-center py-4">
                                                    <i className="fas fa-history fa-3x text-muted mb-3"></i>
                                                    <h5 className="text-muted">
                                                        Limited Activity
                                                    </h5>
                                                    <p className="text-muted">
                                                        This staff member hasn't
                                                        logged in yet.
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4">
                                {/* Activity Summary */}
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white border-bottom">
                                        <h6 className="card-title mb-0">
                                            Activity Summary
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <div className="text-center">
                                                    <div
                                                        className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                                                        style={{
                                                            width: "50px",
                                                            height: "50px",
                                                        }}
                                                    >
                                                        <i className="fas fa-calendar text-primary"></i>
                                                    </div>
                                                    <h6 className="mb-1">
                                                        Days Active
                                                    </h6>
                                                    <small className="text-muted">
                                                        {Math.floor(
                                                            (new Date() -
                                                                new Date(
                                                                    staffMember.created_at
                                                                )) /
                                                                (1000 *
                                                                    60 *
                                                                    60 *
                                                                    24)
                                                        )}{" "}
                                                        days
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="text-center">
                                                    <div
                                                        className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                                                        style={{
                                                            width: "50px",
                                                            height: "50px",
                                                        }}
                                                    >
                                                        <i className="fas fa-check text-success"></i>
                                                    </div>
                                                    <h6 className="mb-1">
                                                        Status
                                                    </h6>
                                                    <small
                                                        className={`badge ${
                                                            staffMember.is_active
                                                                ? "bg-success"
                                                                : "bg-secondary"
                                                        }`}
                                                    >
                                                        {staffMember.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="text-center">
                                                    <div
                                                        className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                                                        style={{
                                                            width: "50px",
                                                            height: "50px",
                                                        }}
                                                    >
                                                        <i className="fas fa-clock text-info"></i>
                                                    </div>
                                                    <h6 className="mb-1">
                                                        Recent Activity
                                                    </h6>
                                                    <small className="text-muted">
                                                        {staffMember.has_recent_activity
                                                            ? "Recently active"
                                                            : "No recent activity"}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white border-bottom">
                                        <h6 className="card-title mb-0">
                                            Quick Actions
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-grid gap-2">
                                            <Link
                                                to={`/admin/staff/${id}/edit`}
                                                className="btn btn-primary"
                                            >
                                                <i className="fas fa-edit me-2"></i>
                                                Edit Profile
                                            </Link>
                                            <button
                                                className={`btn btn-outline-${
                                                    staffMember.is_active
                                                        ? "warning"
                                                        : "success"
                                                }`}
                                                onClick={handleToggleStatus}
                                                disabled={isProcessing}
                                            >
                                                <i
                                                    className={`fas ${
                                                        staffMember.is_active
                                                            ? "fa-ban"
                                                            : "fa-check"
                                                    } me-2`}
                                                ></i>
                                                {staffMember.is_active
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </button>
                                            <button
                                                className="btn btn-outline-info"
                                                onClick={() => window.print()}
                                            >
                                                <i className="fas fa-print me-2"></i>
                                                Print Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Confirm Deletion
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center">
                                    <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                                    <h5>Delete Staff Member?</h5>
                                    <p className="text-muted">
                                        Are you sure you want to delete{" "}
                                        <strong>{staffMember.full_name}</strong>
                                        ? This action cannot be undone and will
                                        permanently remove:
                                    </p>
                                    <ul className="list-unstyled text-start">
                                        <li>
                                            <i className="fas fa-check text-danger me-2"></i>
                                            Staff account and profile
                                        </li>
                                        <li>
                                            <i className="fas fa-check text-danger me-2"></i>
                                            Login credentials
                                        </li>
                                        <li>
                                            <i className="fas fa-check text-danger me-2"></i>
                                            Activity history
                                        </li>
                                        <li>
                                            <i className="fas fa-check text-danger me-2"></i>
                                            Associated permissions
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDeleteStaff}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-trash me-2"></i>
                                            Delete Staff Member
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS for Timeline */}
            <style jsx>{`
                .timeline {
                    position: relative;
                    padding-left: 30px;
                }

                .timeline::before {
                    content: "";
                    position: absolute;
                    left: 15px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: #e9ecef;
                }

                .timeline-item {
                    position: relative;
                    margin-bottom: 30px;
                }

                .timeline-marker {
                    position: absolute;
                    left: -23px;
                    top: 0;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }

                .timeline-content {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 3px solid #007bff;
                }

                .timeline-content h6 {
                    color: #495057;
                    margin-bottom: 5px;
                }
            `}</style>
        </AdminLayout>
    );
};

export default StaffDetails;

import React, { useState } from "react";
import { Link } from "react-router-dom";

const StaffCard = ({
    staff,
    onToggleStatus = null,
    onDelete = null,
    onSelect = null,
    isSelected = false,
    showActions = true,
    showSelection = false,
    className = "",
}) => {
    const [processing, setProcessing] = useState(false);

    const handleToggleStatus = async () => {
        if (!onToggleStatus) return;

        setProcessing(true);
        try {
            await onToggleStatus(staff);
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className={`card border-0 shadow-sm h-100 ${className}`}>
            {/* Card Header with Selection */}
            {showSelection && (
                <div className="card-header bg-white border-bottom py-2">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onSelect && onSelect(staff.id)}
                        />
                        <label className="form-check-label">
                            Select staff member
                        </label>
                    </div>
                </div>
            )}

            <div className="card-body">
                {/* Profile Section */}
                <div className="text-center mb-3">
                    <div className="position-relative d-inline-block">
                        {staff.profile_picture ? (
                            <img
                                src={staff.profile_picture}
                                alt={staff.full_name}
                                className="rounded-circle mb-2"
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <div
                                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-2 mx-auto"
                                style={{ width: "80px", height: "80px" }}
                            >
                                <i className="fas fa-user fa-2x text-primary"></i>
                            </div>
                        )}

                        {/* Status Badge */}
                        <span
                            className={`position-absolute badge rounded-pill ${
                                staff.is_active ? "bg-success" : "bg-secondary"
                            }`}
                            style={{ top: "0", right: "0" }}
                        >
                            {staff.is_active ? "Active" : "Inactive"}
                        </span>

                        {/* Recent Activity Indicator */}
                        {staff.has_recent_activity && (
                            <span
                                className="position-absolute badge bg-info rounded-pill"
                                style={{ top: "10px", right: "0" }}
                                title="Recently active"
                            >
                                <i
                                    className="fas fa-circle"
                                    style={{ fontSize: "6px" }}
                                ></i>
                            </span>
                        )}
                    </div>

                    <h6 className="card-title mb-1">
                        <Link
                            to={`/admin/staff/${staff.id}`}
                            className="text-decoration-none"
                        >
                            {staff.full_name}
                        </Link>
                    </h6>
                    <p className="text-muted small mb-2">{staff.email}</p>
                </div>

                {/* Staff Details */}
                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <div className="text-center p-2 bg-light rounded">
                            <small className="text-muted d-block">
                                Staff ID
                            </small>
                            <strong>#{staff.id}</strong>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="text-center p-2 bg-light rounded">
                            <small className="text-muted d-block">
                                Last Login
                            </small>
                            <strong className="small">
                                {staff.last_login_human || "Never"}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-phone text-muted me-2"></i>
                        <small className="text-truncate">
                            {staff.contact_number ? (
                                <a
                                    href={`tel:${staff.contact_number}`}
                                    className="text-decoration-none"
                                >
                                    {staff.contact_number}
                                </a>
                            ) : (
                                <span className="text-muted">Not provided</span>
                            )}
                        </small>
                    </div>

                    {staff.address && (
                        <div className="d-flex align-items-start">
                            <i className="fas fa-map-marker-alt text-muted me-2 mt-1"></i>
                            <small
                                className="text-muted text-truncate"
                                title={staff.address}
                            >
                                {staff.address.length > 50
                                    ? `${staff.address.substring(0, 50)}...`
                                    : staff.address}
                            </small>
                        </div>
                    )}
                </div>

                {/* Creation Info */}
                <div className="border-top pt-3">
                    <div className="row">
                        <div className="col-6">
                            <small className="text-muted d-block">
                                Created
                            </small>
                            <small className="fw-semibold">
                                {formatDate(staff.created_at)}
                            </small>
                        </div>
                        {staff.creator_name && (
                            <div className="col-6">
                                <small className="text-muted d-block">
                                    Created By
                                </small>
                                <small
                                    className="fw-semibold text-truncate"
                                    title={staff.creator_name}
                                >
                                    {staff.creator_name.length > 15
                                        ? `${staff.creator_name.substring(
                                              0,
                                              15
                                          )}...`
                                        : staff.creator_name}
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            {showActions && (
                <div className="card-footer bg-white border-top">
                    <div className="row g-1">
                        <div className="col-4">
                            <Link
                                to={`/admin/staff/${staff.id}`}
                                className="btn btn-sm btn-outline-info w-100"
                                title="View Details"
                            >
                                <i className="fas fa-eye"></i>
                            </Link>
                        </div>
                        <div className="col-4">
                            <Link
                                to={`/admin/staff/${staff.id}/edit`}
                                className="btn btn-sm btn-outline-primary w-100"
                                title="Edit Staff"
                            >
                                <i className="fas fa-edit"></i>
                            </Link>
                        </div>
                        <div className="col-4">
                            <div className="dropdown">
                                <button
                                    className="btn btn-sm btn-outline-secondary dropdown-toggle w-100"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    ) : (
                                        <i className="fas fa-ellipsis-v"></i>
                                    )}
                                </button>
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link
                                            to={`/admin/staff/${staff.id}`}
                                            className="dropdown-item"
                                        >
                                            <i className="fas fa-eye me-2"></i>
                                            View Details
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to={`/admin/staff/${staff.id}/edit`}
                                            className="dropdown-item"
                                        >
                                            <i className="fas fa-edit me-2"></i>
                                            Edit Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={handleToggleStatus}
                                            disabled={processing}
                                        >
                                            <i
                                                className={`fas ${
                                                    staff.is_active
                                                        ? "fa-ban"
                                                        : "fa-check"
                                                } me-2`}
                                            ></i>
                                            {staff.is_active
                                                ? "Deactivate"
                                                : "Activate"}
                                        </button>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item text-danger"
                                            onClick={() =>
                                                onDelete && onDelete(staff)
                                            }
                                            disabled={processing}
                                        >
                                            <i className="fas fa-trash me-2"></i>
                                            Delete Staff
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Quick Toggle Button */}
                    <div className="mt-2">
                        <button
                            className={`btn btn-sm w-100 ${
                                staff.is_active
                                    ? "btn-outline-warning"
                                    : "btn-outline-success"
                            }`}
                            onClick={handleToggleStatus}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <i
                                        className={`fas ${
                                            staff.is_active
                                                ? "fa-ban"
                                                : "fa-check"
                                        } me-2`}
                                    ></i>
                                    {staff.is_active
                                        ? "Deactivate"
                                        : "Activate"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Grid wrapper component for multiple staff cards
export const StaffGrid = ({
    staff = [],
    loading = false,
    selectedStaff = [],
    onSelectStaff = null,
    onSelectAll = null,
    onToggleStatus = null,
    onDeleteStaff = null,
    showActions = true,
    showSelection = false,
    columns = 3,
    className = "",
}) => {
    const getColumnClass = () => {
        switch (columns) {
            case 1:
                return "col-12";
            case 2:
                return "col-lg-6";
            case 3:
                return "col-lg-4 col-md-6";
            case 4:
                return "col-xl-3 col-lg-4 col-md-6";
            default:
                return "col-lg-4 col-md-6";
        }
    };

    const StaffCardSkeleton = () => (
        <div className={getColumnClass()}>
            <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                    <div className="text-center mb-3">
                        <div className="placeholder-glow">
                            <div
                                className="placeholder rounded-circle mb-2 mx-auto"
                                style={{ width: "80px", height: "80px" }}
                            ></div>
                            <h6>
                                <span className="placeholder col-8"></span>
                            </h6>
                            <p>
                                <span className="placeholder col-10"></span>
                            </p>
                        </div>
                    </div>
                    <div className="placeholder-glow">
                        <span className="placeholder col-12 mb-2"></span>
                        <span className="placeholder col-8 mb-2"></span>
                        <span className="placeholder col-6"></span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className={`row g-3 ${className}`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <StaffCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (staff.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="fas fa-users-cog fa-4x text-muted mb-3"></i>
                <h4 className="text-muted">No Staff Members Found</h4>
                <p className="text-muted">
                    No staff members match your current criteria.
                </p>
            </div>
        );
    }

    return (
        <div className={`row g-3 ${className}`}>
            {/* Select All Card (if selection is enabled) */}
            {showSelection && (
                <div className={getColumnClass()}>
                    <div className="card border-2 border-primary h-100">
                        <div className="card-body d-flex flex-column justify-content-center align-items-center">
                            <div className="form-check mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={
                                        selectedStaff.length === staff.length &&
                                        staff.length > 0
                                    }
                                    onChange={onSelectAll}
                                />
                                <label className="form-check-label fw-bold">
                                    Select All
                                </label>
                            </div>
                            <small className="text-muted text-center">
                                {selectedStaff.length} of {staff.length} staff
                                selected
                            </small>
                        </div>
                    </div>
                </div>
            )}

            {/* Staff Cards */}
            {staff.map((staffMember) => (
                <div key={staffMember.id} className={getColumnClass()}>
                    <StaffCard
                        staff={staffMember}
                        onToggleStatus={onToggleStatus}
                        onDelete={onDeleteStaff}
                        onSelect={onSelectStaff}
                        isSelected={selectedStaff.includes(staffMember.id)}
                        showActions={showActions}
                        showSelection={showSelection}
                    />
                </div>
            ))}
        </div>
    );
};

export default StaffCard;

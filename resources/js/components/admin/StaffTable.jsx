import React, { useState } from "react";
import { Link } from "react-router-dom";

const StaffTable = ({
    staff = [],
    loading = false,
    pagination = {},
    selectedStaff = [],
    onSelectStaff = null,
    onSelectAll = null,
    onToggleStatus = null,
    onDeleteStaff = null,
    onPageChange = null,
    onRefresh = null,
    showActions = true,
    showSelection = true,
    className = "",
}) => {
    const [processingStaff, setProcessingStaff] = useState([]);

    const handleToggleStatus = async (staffMember) => {
        if (!onToggleStatus) return;

        setProcessingStaff((prev) => [...prev, staffMember.id]);
        try {
            await onToggleStatus(staffMember);
        } finally {
            setProcessingStaff((prev) =>
                prev.filter((id) => id !== staffMember.id)
            );
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const StaffTableSkeleton = () => (
        <>
            {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                    {showSelection && (
                        <td>
                            <div className="placeholder-glow">
                                <span className="placeholder col-12"></span>
                            </div>
                        </td>
                    )}
                    <td>
                        <div className="placeholder-glow">
                            <span className="placeholder col-8"></span>
                        </div>
                    </td>
                    <td>
                        <div className="placeholder-glow">
                            <span className="placeholder col-10"></span>
                        </div>
                    </td>
                    <td>
                        <div className="placeholder-glow">
                            <span className="placeholder col-6"></span>
                        </div>
                    </td>
                    <td>
                        <div className="placeholder-glow">
                            <span className="placeholder col-8"></span>
                        </div>
                    </td>
                    <td>
                        <div className="placeholder-glow">
                            <span className="placeholder col-4"></span>
                        </div>
                    </td>
                    <td>
                        <div className="placeholder-glow">
                            <span className="placeholder col-6"></span>
                        </div>
                    </td>
                    {showActions && (
                        <td>
                            <div className="placeholder-glow">
                                <span className="placeholder col-12"></span>
                            </div>
                        </td>
                    )}
                </tr>
            ))}
        </>
    );

    const EmptyState = () => (
        <tr>
            <td
                colSpan={
                    showSelection && showActions
                        ? "8"
                        : showSelection || showActions
                        ? "7"
                        : "6"
                }
                className="text-center py-5"
            >
                <div className="text-muted">
                    <i className="fas fa-users-cog fa-3x mb-3"></i>
                    <h5>No Staff Members Found</h5>
                    <p>No staff members match your current criteria.</p>
                </div>
            </td>
        </tr>
    );

    return (
        <div className={`card border-0 shadow-sm ${className}`}>
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="fas fa-users-cog text-primary me-2"></i>
                        Staff Members
                    </h5>
                    <div className="d-flex align-items-center gap-3">
                        {pagination.total > 0 && (
                            <small className="text-muted">
                                Showing {pagination.from}-{pagination.to} of{" "}
                                {pagination.total} staff
                            </small>
                        )}
                        {onRefresh && (
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={onRefresh}
                                disabled={loading}
                            >
                                <i
                                    className={`fas fa-sync-alt ${
                                        loading ? "fa-spin" : ""
                                    } me-1`}
                                ></i>
                                Refresh
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="bg-light">
                            <tr>
                                {showSelection && (
                                    <th width="50">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={
                                                    selectedStaff.length ===
                                                        staff.length &&
                                                    staff.length > 0
                                                }
                                                onChange={onSelectAll}
                                            />
                                        </div>
                                    </th>
                                )}
                                <th>Staff Member</th>
                                <th>Email</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Created</th>
                                {showActions && <th width="120">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <StaffTableSkeleton />
                            ) : staff.length > 0 ? (
                                staff.map((staffMember) => (
                                    <tr key={staffMember.id}>
                                        {showSelection && (
                                            <td>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={selectedStaff.includes(
                                                            staffMember.id
                                                        )}
                                                        onChange={() =>
                                                            onSelectStaff &&
                                                            onSelectStaff(
                                                                staffMember.id
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    {staffMember.profile_picture ? (
                                                        <img
                                                            src={
                                                                staffMember.profile_picture
                                                            }
                                                            alt={
                                                                staffMember.full_name
                                                            }
                                                            className="rounded-circle"
                                                            style={{
                                                                width: "40px",
                                                                height: "40px",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: "40px",
                                                                height: "40px",
                                                            }}
                                                        >
                                                            <i className="fas fa-user text-primary"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">
                                                        <Link
                                                            to={`/admin/staff/${staffMember.id}`}
                                                            className="text-decoration-none"
                                                        >
                                                            {
                                                                staffMember.full_name
                                                            }
                                                        </Link>
                                                    </div>
                                                    {staffMember.creator_name && (
                                                        <small className="text-muted">
                                                            Created by:{" "}
                                                            {
                                                                staffMember.creator_name
                                                            }
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div
                                                className="text-truncate"
                                                style={{ maxWidth: "200px" }}
                                            >
                                                <a
                                                    href={`mailto:${staffMember.email}`}
                                                    className="text-decoration-none"
                                                >
                                                    {staffMember.email}
                                                </a>
                                            </div>
                                        </td>
                                        <td>
                                            {staffMember.contact_number ? (
                                                <a
                                                    href={`tel:${staffMember.contact_number}`}
                                                    className="text-decoration-none"
                                                >
                                                    {staffMember.contact_number}
                                                </a>
                                            ) : (
                                                <span className="text-muted">
                                                    Not provided
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
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
                                                {staffMember.has_recent_activity && (
                                                    <i
                                                        className="fas fa-circle text-success"
                                                        style={{
                                                            fontSize: "8px",
                                                        }}
                                                        title="Recently active"
                                                    ></i>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {staffMember.last_login_human ||
                                                    "Never"}
                                            </small>
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {formatDate(
                                                    staffMember.created_at
                                                )}
                                            </small>
                                        </td>
                                        {showActions && (
                                            <td>
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                        disabled={processingStaff.includes(
                                                            staffMember.id
                                                        )}
                                                    >
                                                        {processingStaff.includes(
                                                            staffMember.id
                                                        ) ? (
                                                            <span className="spinner-border spinner-border-sm"></span>
                                                        ) : (
                                                            "Actions"
                                                        )}
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li>
                                                            <Link
                                                                to={`/admin/staff/${staffMember.id}`}
                                                                className="dropdown-item"
                                                            >
                                                                <i className="fas fa-eye me-2"></i>
                                                                View Details
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link
                                                                to={`/admin/staff/${staffMember.id}/edit`}
                                                                className="dropdown-item"
                                                            >
                                                                <i className="fas fa-edit me-2"></i>
                                                                Edit
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                onClick={() =>
                                                                    handleToggleStatus(
                                                                        staffMember
                                                                    )
                                                                }
                                                                disabled={processingStaff.includes(
                                                                    staffMember.id
                                                                )}
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
                                                        </li>
                                                        <li>
                                                            <hr className="dropdown-divider" />
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item text-danger"
                                                                onClick={() =>
                                                                    onDeleteStaff &&
                                                                    onDeleteStaff(
                                                                        staffMember
                                                                    )
                                                                }
                                                                disabled={processingStaff.includes(
                                                                    staffMember.id
                                                                )}
                                                            >
                                                                <i className="fas fa-trash me-2"></i>
                                                                Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <EmptyState />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && onPageChange && (
                <div className="card-footer bg-white border-top">
                    <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Showing {pagination.from} to {pagination.to} of{" "}
                            {pagination.total} entries
                        </small>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
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
                                            onPageChange(
                                                pagination.current_page - 1
                                            )
                                        }
                                        disabled={
                                            pagination.current_page === 1 ||
                                            loading
                                        }
                                    >
                                        Previous
                                    </button>
                                </li>

                                {[
                                    ...Array(Math.min(5, pagination.last_page)),
                                ].map((_, index) => {
                                    let page;
                                    if (pagination.last_page <= 5) {
                                        page = index + 1;
                                    } else {
                                        const start = Math.max(
                                            1,
                                            pagination.current_page - 2
                                        );
                                        page = start + index;
                                        if (page > pagination.last_page)
                                            return null;
                                    }

                                    return (
                                        <li
                                            key={page}
                                            className={`page-item ${
                                                pagination.current_page === page
                                                    ? "active"
                                                    : ""
                                            }`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() =>
                                                    onPageChange(page)
                                                }
                                                disabled={loading}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    );
                                })}

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
                                            onPageChange(
                                                pagination.current_page + 1
                                            )
                                        }
                                        disabled={
                                            pagination.current_page ===
                                                pagination.last_page || loading
                                        }
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffTable;

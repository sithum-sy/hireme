import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../../../context/AdminContext";
import AdminLayout from "../../../components/layouts/AdminLayout";

const StaffList = () => {
    const {
        staff,
        staffLoading,
        staffPagination,
        staffFilters,
        fetchStaff,
        deleteStaff,
        toggleStaffStatus,
        updateStaffFilters,
        errors,
        successMessage,
        isProcessing,
    } = useAdmin();

    const navigate = useNavigate();
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [showBulkActions, setShowBulkActions] = useState(false);

    // Local filter state
    const [localFilters, setLocalFilters] = useState(staffFilters);

    useEffect(() => {
        loadStaffData();
    }, []);

    const loadStaffData = async (page = 1) => {
        try {
            await fetchStaff(localFilters, page);
        } catch (error) {
            console.error("Failed to load staff:", error);
        }
    };

    const handleFilterChange = (filterName, value) => {
        const newFilters = { ...localFilters, [filterName]: value };
        setLocalFilters(newFilters);
        updateStaffFilters(newFilters);
    };

    const handleSearch = () => {
        loadStaffData(1);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            search: "",
            status: null,
            per_page: 15,
        };
        setLocalFilters(clearedFilters);
        updateStaffFilters(clearedFilters);
        loadStaffData(1);
    };

    const handlePageChange = (page) => {
        loadStaffData(page);
    };

    const handleSelectStaff = (staffId) => {
        setSelectedStaff((prev) =>
            prev.includes(staffId)
                ? prev.filter((id) => id !== staffId)
                : [...prev, staffId]
        );
    };

    const handleSelectAll = () => {
        if (selectedStaff.length === staff.length) {
            setSelectedStaff([]);
        } else {
            setSelectedStaff(staff.map((s) => s.id));
        }
    };

    const handleDeleteStaff = async (staffMember) => {
        setStaffToDelete(staffMember);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!staffToDelete) return;

        try {
            await deleteStaff(staffToDelete.id);
            setShowDeleteModal(false);
            setStaffToDelete(null);
            loadStaffData(staffPagination.current_page);
        } catch (error) {
            console.error("Failed to delete staff:", error);
        }
    };

    const handleToggleStatus = async (staffMember) => {
        try {
            await toggleStaffStatus(staffMember.id);
        } catch (error) {
            console.error("Failed to toggle staff status:", error);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedStaff.length === 0) return;

        try {
            switch (action) {
                case "activate":
                    // Implement bulk activate
                    break;
                case "deactivate":
                    // Implement bulk deactivate
                    break;
                case "delete":
                    // Implement bulk delete
                    break;
                default:
                    break;
            }
            setSelectedStaff([]);
            setShowBulkActions(false);
        } catch (error) {
            console.error("Bulk action failed:", error);
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
                    <td>
                        <div className="placeholder-glow">
                            <span className="placeholder col-12"></span>
                        </div>
                    </td>
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
                </tr>
            ))}
        </>
    );

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6">
                <div className="mb-3 mb-md-0">
                    <h1 className="page-title">Staff Management</h1>
                    <p className="page-subtitle">
                        Manage staff members and their permissions
                    </p>
                </div>
                <div className="d-flex flex-column flex-sm-row gap-2">
                    {selectedStaff.length > 0 && (
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-primary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                            >
                                <i className="fas fa-list me-2"></i>
                                Bulk Actions ({selectedStaff.length})
                            </button>
                            <ul className="dropdown-menu">
                                <li>
                                    <button
                                        className="dropdown-item"
                                        onClick={() =>
                                            handleBulkAction("activate")
                                        }
                                    >
                                        <i className="fas fa-check me-2"></i>
                                        Activate Selected
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item"
                                        onClick={() =>
                                            handleBulkAction("deactivate")
                                        }
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Deactivate Selected
                                    </button>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item text-danger"
                                        onClick={() =>
                                            handleBulkAction("delete")
                                        }
                                    >
                                        <i className="fas fa-trash me-2"></i>
                                        Delete Selected
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                    <Link to="/admin/staff/create" className="btn btn-primary btn-responsive">
                        <i className="fas fa-plus me-2"></i>
                        Create Staff
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section mb-6">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">Search Staff</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name or email..."
                                    value={localFilters.search}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "search",
                                            e.target.value
                                        )
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && handleSearch()
                                    }
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={handleSearch}
                                >
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={localFilters.status || ""}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "status",
                                        e.target.value || null
                                    )
                                }
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Per Page</label>
                            <select
                                className="form-select"
                                value={localFilters.per_page}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "per_page",
                                        parseInt(e.target.value)
                                    )
                                }
                            >
                                <option value="10">10</option>
                                <option value="15">15</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">&nbsp;</label>
                            <div className="d-flex flex-column flex-sm-row gap-2">
                                <button
                                    className="btn btn-primary flex-fill"
                                    onClick={handleSearch}
                                    disabled={staffLoading}
                                >
                                    <i className="fas fa-search me-2"></i>
                                    Search
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={handleClearFilters}
                                    disabled={staffLoading}
                                    title="Clear filters"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff Table */}
            <div className="card">
                <div className="card-header">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                        <h5 className="card-title mb-0">
                            <i className="fas fa-users-cog text-primary me-2"></i>
                            Staff Members
                        </h5>
                        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
                            {staffPagination.total > 0 && (
                                <small className="text-muted">
                                    Showing {staffPagination.from}-
                                    {staffPagination.to} of{" "}
                                    {staffPagination.total} staff
                                </small>
                            )}
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() =>
                                    loadStaffData(staffPagination.current_page)
                                }
                                disabled={staffLoading}
                            >
                                <i
                                    className={`fas fa-sync-alt ${
                                        staffLoading ? "fa-spin" : ""
                                    } me-1`}
                                ></i>
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body p-0">
                    <div className="table-responsive table-mobile-cards">
                        <table className="table table-hover mb-0">
                            <thead className="bg-light">
                                <tr>
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
                                                onChange={handleSelectAll}
                                            />
                                        </div>
                                    </th>
                                    <th>Staff Member</th>
                                    <th>Email</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                    <th>Created</th>
                                    <th width="120">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffLoading ? (
                                    <StaffTableSkeleton />
                                ) : staff.length > 0 ? (
                                    staff.map((staffMember) => (
                                        <tr key={staffMember.id}>
                                            <td>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={selectedStaff.includes(
                                                            staffMember.id
                                                        )}
                                                        onChange={() =>
                                                            handleSelectStaff(
                                                                staffMember.id
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </td>
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
                                                            {
                                                                staffMember.full_name
                                                            }
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
                                                    style={{
                                                        maxWidth: "200px",
                                                    }}
                                                >
                                                    {staffMember.email}
                                                </div>
                                            </td>
                                            <td>
                                                {staffMember.contact_number || (
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
                                            <td>
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                        type="button"
                                                        data-bs-toggle="dropdown"
                                                    >
                                                        Actions
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
                                                                disabled={
                                                                    isProcessing
                                                                }
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
                                                                    handleDeleteStaff(
                                                                        staffMember
                                                                    )
                                                                }
                                                                disabled={
                                                                    isProcessing
                                                                }
                                                            >
                                                                <i className="fas fa-trash me-2"></i>
                                                                Delete
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="text-center py-5"
                                        >
                                            <div className="text-muted">
                                                <i className="fas fa-users-cog fa-3x mb-3"></i>
                                                <h5>No Staff Members Found</h5>
                                                <p>
                                                    {localFilters.search ||
                                                    localFilters.status
                                                        ? "No staff members match your search criteria."
                                                        : "No staff members have been created yet."}
                                                </p>
                                                {!localFilters.search &&
                                                    !localFilters.status && (
                                                        <Link
                                                            to="/admin/staff/create"
                                                            className="btn btn-primary"
                                                        >
                                                            <i className="fas fa-plus me-2"></i>
                                                            Create First Staff
                                                            Member
                                                        </Link>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {staffPagination.last_page > 1 && (
                    <div className="card-footer bg-white border-top">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                Showing {staffPagination.from} to{" "}
                                {staffPagination.to} of {staffPagination.total}{" "}
                                entries
                            </small>
                            <nav>
                                <ul className="pagination pagination-sm mb-0">
                                    <li
                                        className={`page-item ${
                                            staffPagination.current_page === 1
                                                ? "disabled"
                                                : ""
                                        }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() =>
                                                handlePageChange(
                                                    staffPagination.current_page -
                                                        1
                                                )
                                            }
                                            disabled={
                                                staffPagination.current_page ===
                                                    1 || staffLoading
                                            }
                                        >
                                            Previous
                                        </button>
                                    </li>

                                    {[
                                        ...Array(
                                            Math.min(
                                                5,
                                                staffPagination.last_page
                                            )
                                        ),
                                    ].map((_, index) => {
                                        const page = index + 1;
                                        return (
                                            <li
                                                key={page}
                                                className={`page-item ${
                                                    staffPagination.current_page ===
                                                    page
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        handlePageChange(page)
                                                    }
                                                    disabled={staffLoading}
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        );
                                    })}

                                    <li
                                        className={`page-item ${
                                            staffPagination.current_page ===
                                            staffPagination.last_page
                                                ? "disabled"
                                                : ""
                                        }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() =>
                                                handlePageChange(
                                                    staffPagination.current_page +
                                                        1
                                                )
                                            }
                                            disabled={
                                                staffPagination.current_page ===
                                                    staffPagination.last_page ||
                                                staffLoading
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center">
                                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                                    <h5>Are you sure?</h5>
                                    <p className="text-muted">
                                        You are about to delete{" "}
                                        <strong>
                                            {staffToDelete?.full_name}
                                        </strong>
                                        . This action cannot be undone.
                                    </p>
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
                                    onClick={confirmDelete}
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
                                            Delete Staff
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default StaffList;

import React, { useState, useEffect } from "react";
import BlockTimeModal from "./BlockTimeModal";
import availabilityService from "../../../services/availabilityService";
import { toast } from "react-toastify";

const BlockedTimesList = ({ className = "", onUpdate = null }) => {
    const [blockedTimes, setBlockedTimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTime, setEditingTime] = useState(null);
    const [filter, setFilter] = useState("upcoming"); // 'all', 'upcoming', 'past'
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("date_asc"); // 'date_asc', 'date_desc', 'reason'

    useEffect(() => {
        loadBlockedTimes();
    }, []);

    const loadBlockedTimes = async () => {
        setLoading(true);
        try {
            const result = await availabilityService.getBlockedTimes();

            if (result.success) {
                setBlockedTimes(result.data || []);
            } else {
                console.error("Failed to load blocked times:", result.message);
                toast.error(result.message || "Failed to load blocked times");
            }
        } catch (error) {
            console.error("Error loading blocked times:", error);
            toast.error("Failed to load blocked times");
        } finally {
            setLoading(false);
        }
    };

    const handleAddNewTime = () => {
        setEditingTime(null);
        setShowModal(true);
    };

    const handleEditTime = (blockedTime) => {
        setEditingTime(blockedTime);
        setShowModal(true);
    };

    const handleDeleteTime = async (blockedTimeId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this blocked time?"
            )
        ) {
            return;
        }

        try {
            const result = await availabilityService.deleteBlockedTime(
                blockedTimeId
            );

            if (result.success) {
                toast.success(
                    result.message || "Blocked time deleted successfully"
                );
                setBlockedTimes((prev) =>
                    prev.filter((time) => time.id !== blockedTimeId)
                );

                if (onUpdate) {
                    onUpdate();
                }
            } else {
                toast.error(result.message || "Failed to delete blocked time");
            }
        } catch (error) {
            console.error("Error deleting blocked time:", error);
            toast.error("Failed to delete blocked time");
        }
    };

    const handleModalSave = (newBlockedTime) => {
        // Refresh the list
        loadBlockedTimes();

        if (onUpdate) {
            onUpdate();
        }
    };

    const getFilteredAndSortedTimes = () => {
        let filtered = [...blockedTimes];
        const now = new Date();
        const today = now.toISOString().split("T")[0];

        // Apply filter
        switch (filter) {
            case "upcoming":
                filtered = filtered.filter((time) => time.end_date >= today);
                break;
            case "past":
                filtered = filtered.filter((time) => time.end_date < today);
                break;
            case "all":
            default:
                // No filtering
                break;
        }

        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(
                (time) =>
                    (time.reason &&
                        time.reason
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())) ||
                    time.formatted_date_range
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        // Apply sorting
        switch (sortBy) {
            case "date_desc":
                filtered.sort(
                    (a, b) => new Date(b.start_date) - new Date(a.start_date)
                );
                break;
            case "reason":
                filtered.sort((a, b) =>
                    (a.reason || "").localeCompare(b.reason || "")
                );
                break;
            case "date_asc":
            default:
                filtered.sort(
                    (a, b) => new Date(a.start_date) - new Date(b.start_date)
                );
                break;
        }

        return filtered;
    };

    const getStatusBadge = (blockedTime) => {
        const now = new Date();
        const startDate = new Date(blockedTime.start_date);
        const endDate = new Date(blockedTime.end_date);

        if (endDate < now) {
            return <span className="badge bg-secondary">Past</span>;
        } else if (startDate <= now && endDate >= now) {
            return <span className="badge bg-danger">Active</span>;
        } else {
            return <span className="badge bg-warning text-dark">Upcoming</span>;
        }
    };

    const filteredTimes = getFilteredAndSortedTimes();

    return (
        <div className={`blocked-times-list ${className}`}>
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h5 className="fw-bold mb-0">
                                <i className="fas fa-ban text-danger me-2"></i>
                                Blocked Times
                            </h5>
                            <small className="text-muted">
                                Manage your unavailable periods
                            </small>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleAddNewTime}
                                disabled={loading}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Block Time
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    {/* Filters and Search */}
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search blocked times..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select form-select-sm"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="past">Past</option>
                                <option value="all">All</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select form-select-sm"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="date_asc">
                                    Date (Oldest First)
                                </option>
                                <option value="date_desc">
                                    Date (Newest First)
                                </option>
                                <option value="reason">Reason</option>
                            </select>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-4">
                            <div
                                className="spinner-border text-primary mb-3"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>
                            <p className="text-muted">
                                Loading blocked times...
                            </p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && filteredTimes.length === 0 && (
                        <div className="text-center py-5">
                            <div className="mb-4">
                                <i className="fas fa-calendar-check fa-4x text-muted mb-3"></i>
                                <h6 className="text-muted mb-2">
                                    {blockedTimes.length === 0
                                        ? "No blocked times yet"
                                        : "No blocked times match your filters"}
                                </h6>
                                <p className="text-muted small">
                                    {blockedTimes.length === 0
                                        ? "Block specific dates and times when you're not available"
                                        : "Try adjusting your search or filter criteria"}
                                </p>
                            </div>
                            {blockedTimes.length === 0 && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddNewTime}
                                >
                                    <i className="fas fa-plus me-2"></i>
                                    Block Your First Time Period
                                </button>
                            )}
                        </div>
                    )}

                    {/* Blocked Times List */}
                    {!loading && filteredTimes.length > 0 && (
                        <div className="blocked-times-grid">
                            {filteredTimes.map((blockedTime) => (
                                <div
                                    key={blockedTime.id}
                                    className="blocked-time-card border rounded-3 p-3 mb-3 position-relative"
                                >
                                    <div className="row align-items-center">
                                        <div className="col-md-8">
                                            <div className="d-flex align-items-start">
                                                <div className="me-3">
                                                    <div
                                                        className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: "45px",
                                                            height: "45px",
                                                        }}
                                                    >
                                                        <i className="fas fa-ban"></i>
                                                    </div>
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-1">
                                                        <h6 className="fw-bold mb-0 me-2">
                                                            {
                                                                blockedTime.formatted_date_range
                                                            }
                                                        </h6>
                                                        {getStatusBadge(
                                                            blockedTime
                                                        )}
                                                    </div>
                                                    <p className="text-muted mb-1">
                                                        <i className="fas fa-clock me-2"></i>
                                                        {
                                                            blockedTime.formatted_time_range
                                                        }
                                                    </p>
                                                    {blockedTime.reason && (
                                                        <p className="text-muted small mb-0">
                                                            <i className="fas fa-comment me-2"></i>
                                                            {blockedTime.reason}
                                                        </p>
                                                    )}
                                                    <small className="text-muted">
                                                        Created:{" "}
                                                        {new Date(
                                                            blockedTime.created_at
                                                        ).toLocaleDateString()}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 text-md-end">
                                            <div
                                                className="btn-group btn-group-sm"
                                                role="group"
                                            >
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() =>
                                                        handleEditTime(
                                                            blockedTime
                                                        )
                                                    }
                                                    title="Edit"
                                                    disabled={
                                                        !blockedTime.is_active
                                                    }
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={() =>
                                                        handleDeleteTime(
                                                            blockedTime.id
                                                        )
                                                    }
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status indicator stripe */}
                                    <div
                                        className="position-absolute top-0 start-0 h-100 rounded-start"
                                        style={{
                                            width: "4px",
                                            backgroundColor:
                                                blockedTime.is_active
                                                    ? "#dc3545"
                                                    : "#6c757d",
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Summary */}
                    {!loading && blockedTimes.length > 0 && (
                        <div className="blocked-times-summary mt-4 p-3 bg-light rounded">
                            <div className="row text-center">
                                <div className="col-md-3 col-6 mb-2">
                                    <div className="fw-bold text-primary">
                                        {
                                            blockedTimes.filter(
                                                (t) => t.is_active
                                            ).length
                                        }
                                    </div>
                                    <small className="text-muted">
                                        Active Blocks
                                    </small>
                                </div>
                                <div className="col-md-3 col-6 mb-2">
                                    <div className="fw-bold text-warning">
                                        {
                                            blockedTimes.filter(
                                                (t) =>
                                                    new Date(t.start_date) >
                                                    new Date()
                                            ).length
                                        }
                                    </div>
                                    <small className="text-muted">
                                        Upcoming
                                    </small>
                                </div>
                                <div className="col-md-3 col-6 mb-2">
                                    <div className="fw-bold text-secondary">
                                        {
                                            blockedTimes.filter(
                                                (t) =>
                                                    new Date(t.end_date) <
                                                    new Date()
                                            ).length
                                        }
                                    </div>
                                    <small className="text-muted">Past</small>
                                </div>
                                <div className="col-md-3 col-6 mb-2">
                                    <div className="fw-bold text-info">
                                        {blockedTimes.length}
                                    </div>
                                    <small className="text-muted">Total</small>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Block Time Modal */}
            <BlockTimeModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSave={handleModalSave}
                editingTime={editingTime}
            />

            {/* Custom Styles */}
            <style>{`
                .blocked-time-card {
                    transition: all 0.2s ease;
                    border: 1px solid #e9ecef !important;
                }

                .blocked-time-card:hover {
                    box-shadow: var(--shadow-lg);
                    border-color: var(--current-role-primary) !important;
                    transform: translateY(-2px);
                }

                .btn-group-sm .btn {
                    padding: 0.25rem 0.5rem;
                }

                .blocked-times-summary {
                    background: linear-gradient(
                        135deg,
                        #f8f9fa 0%,
                        #e9ecef 100%
                    );
                    border: 1px solid #dee2e6;
                }

                /* Removed orange-specific styles - using design system colors */

                @media (max-width: 768px) {
                    .blocked-time-card .row {
                        flex-direction: column;
                    }

                    .blocked-time-card .col-md-4 {
                        text-align: left !important;
                        margin-top: 1rem;
                    }

                    .btn-group {
                        width: 100%;
                        justify-content: space-between;
                    }
                }
            `}</style>
        </div>
    );
};

export default BlockedTimesList;

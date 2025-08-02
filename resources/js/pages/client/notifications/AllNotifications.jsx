import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import { notificationAPI } from "../../../services/api";

const AllNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all"); // all, unread, read
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });

    // Helper function to format time ago
    const formatTimeAgo = useCallback((dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} min ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }
        
        return date.toLocaleDateString();
    }, []);

    const loadNotifications = useCallback(async (page = 1, filterType = "all") => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                per_page: 10,
            };
            
            if (filterType === "unread") {
                params.unread_only = true;
            } else if (filterType === "read") {
                params.read_only = true;
            }

            const response = await notificationAPI.getAll(params);
            
            if (response.data.success) {
                let apiNotifications = response.data.data.data || response.data.data || [];
                
                // Transform API notifications to match UI format
                const transformedNotifications = apiNotifications.map(notification => ({
                    id: notification.id,
                    type: notification.category,
                    title: notification.title,
                    message: notification.message,
                    time: formatTimeAgo(notification.created_at),
                    read: notification.is_read,
                    actionUrl: notification.action_url,
                    priority: notification.priority || 'normal',
                    created_at: notification.created_at
                }));

                setNotifications(transformedNotifications);
                
                // Handle pagination data - check multiple possible structures
                const paginationData = response.data.data;
                setCurrentPage(paginationData.current_page || 1);
                setTotalPages(paginationData.last_page || 1);
                
                // Use stats from backend meta or calculate from current page
                const meta = response.data.meta || {};
                setStats({
                    total: meta.total_count || paginationData.total || 0,
                    unread: meta.unread_count || 0,
                    read: meta.read_count || 0
                });
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            setError('Failed to load notifications. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [formatTimeAgo]);

    useEffect(() => {
        loadNotifications(1, filter);
    }, [filter, loadNotifications]);

    const handleNotificationClick = async (notification) => {
        try {
            // Mark notification as read if it's unread
            if (!notification.read) {
                await notificationAPI.markAsRead(notification.id);
                
                // Update local state
                setNotifications(prev => 
                    prev.map(n => 
                        n.id === notification.id 
                            ? { ...n, read: true }
                            : n
                    )
                );
                setStats(prev => ({
                    ...prev,
                    unread: Math.max(0, prev.unread - 1),
                    read: prev.read + 1
                }));
            }

            // Navigate to action URL if available
            if (notification.actionUrl) {
                window.location.href = notification.actionUrl;
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Still navigate even if marking as read fails
            if (notification.actionUrl) {
                window.location.href = notification.actionUrl;
            }
        }
    };

    const markAllAsRead = async () => {
        try {
            setLoading(true);
            await notificationAPI.markAllAsRead();
            
            // Update local state
            setNotifications(prev => 
                prev.map(n => ({ ...n, read: true }))
            );
            setStats(prev => ({
                ...prev,
                unread: 0,
                read: prev.total
            }));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            setError('Failed to mark all notifications as read. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            alert: "fas fa-exclamation-triangle text-warning",
            user: "fas fa-user-plus text-primary",
            payment: "fas fa-dollar-sign text-success",
            approval: "fas fa-check-circle text-info",
            inquiry: "fas fa-question-circle text-info",
            update: "fas fa-edit text-secondary",
            booking: "fas fa-calendar-check text-success",
            appointment: "fas fa-calendar-check text-success",
            message: "fas fa-envelope text-primary",
            reminder: "fas fa-bell text-warning",
            request: "fas fa-hand-paper text-primary",
            review: "fas fa-star text-warning",
            service: "fas fa-concierge-bell text-info",
            system: "fas fa-cog text-secondary",
            general: "fas fa-info-circle text-info",
        };
        return icons[type] || "fas fa-bell text-info";
    };

    const getPriorityClass = (priority) => {
        const classes = {
            high: "border-danger",
            medium: "border-warning",
            normal: "border-light"
        };
        return classes[priority] || "border-light";
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            loadNotifications(page, filter);
        }
    };

    return (
        <ClientLayout>
            <div className="notifications-page">
                {/* Header */}
                <div className="page-header mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-1">
                                <i className="fas fa-bell text-primary me-2"></i>
                                All Notifications
                            </h4>
                            <p className="text-muted mb-0">
                                Stay updated with your appointments, services, and account activity
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            {stats.unread > 0 && (
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                >
                                    <i className="fas fa-check-double me-1"></i>
                                    Mark All Read
                                </button>
                            )}
                            <Link
                                to="/client/dashboard"
                                className="btn btn-outline-secondary btn-sm"
                            >
                                <i className="fas fa-arrow-left me-1"></i>
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 bg-primary text-white">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <h6 className="card-title mb-0">Total Notifications</h6>
                                        <h3 className="mb-0">{stats.total}</h3>
                                    </div>
                                    <div className="ms-3">
                                        <i className="fas fa-bell fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 bg-warning text-white">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <h6 className="card-title mb-0">Unread</h6>
                                        <h3 className="mb-0">{stats.unread}</h3>
                                    </div>
                                    <div className="ms-3">
                                        <i className="fas fa-bell-slash fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 bg-success text-white">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <h6 className="card-title mb-0">Read</h6>
                                        <h3 className="mb-0">{stats.read}</h3>
                                    </div>
                                    <div className="ms-3">
                                        <i className="fas fa-check-circle fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom">
                        <ul className="nav nav-tabs card-header-tabs">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${filter === "all" ? "active" : ""}`}
                                    onClick={() => setFilter("all")}
                                >
                                    All ({stats.total})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${filter === "unread" ? "active" : ""}`}
                                    onClick={() => setFilter("unread")}
                                >
                                    Unread ({stats.unread})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${filter === "read" ? "active" : ""}`}
                                    onClick={() => setFilter("read")}
                                >
                                    Read ({stats.read})
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="text-muted mt-2">Loading notifications...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-5">
                                <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                                <h5 className="text-muted mb-3">Error Loading Notifications</h5>
                                <p className="text-muted mb-4">{error}</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => loadNotifications(currentPage, filter)}
                                >
                                    <i className="fas fa-refresh me-1"></i>
                                    Try Again
                                </button>
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="notifications-list">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`notification-item p-3 border-start border-3 ${getPriorityClass(notification.priority)} ${
                                            !notification.read ? "bg-light-subtle" : ""
                                        } ${notification.actionUrl ? "cursor-pointer" : ""}`}
                                        onClick={() => handleNotificationClick(notification)}
                                        style={{ cursor: notification.actionUrl ? 'pointer' : 'default' }}
                                    >
                                        <div className="d-flex align-items-start">
                                            <div className="notification-icon me-3">
                                                <div className="icon-wrapper bg-light rounded-circle p-2">
                                                    <i className={getNotificationIcon(notification.type)}></i>
                                                </div>
                                            </div>
                                            <div className="notification-content flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h6 className={`notification-title mb-0 ${!notification.read ? "fw-bold" : ""}`}>
                                                        {notification.title}
                                                    </h6>
                                                    <div className="d-flex align-items-center">
                                                        <small className="text-muted me-2">{notification.time}</small>
                                                        {!notification.read && (
                                                            <span className="badge bg-primary rounded-pill">New</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="notification-message text-muted mb-0">
                                                    {notification.message}
                                                </p>
                                                {notification.actionUrl && (
                                                    <small className="text-primary">
                                                        <i className="fas fa-external-link-alt me-1"></i>
                                                        Click to view details
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted mb-3">No Notifications</h5>
                                <p className="text-muted">
                                    {filter === "all" 
                                        ? "You don't have any notifications yet."
                                        : `You don't have any ${filter} notifications.`
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && notifications.length > 0 && totalPages > 1 && (
                        <div className="card-footer bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                    Page {currentPage} of {totalPages}
                                </small>
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <i className="fas fa-chevron-left"></i>
                                            </button>
                                        </li>
                                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                            const pageNum = Math.max(1, currentPage - 2) + index;
                                            if (pageNum <= totalPages) {
                                                return (
                                                    <li
                                                        key={pageNum}
                                                        className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                                                    >
                                                        <button
                                                            className="page-link"
                                                            onClick={() => handlePageChange(pageNum)}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    </li>
                                                );
                                            }
                                            return null;
                                        })}
                                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
};

export default AllNotifications;
import React, { useState, useEffect } from "react";

const StaffDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Mock data - replace with actual API calls
    const mockDashboardData = {
        stats: {
            users: {
                overview: {
                    total: 1234,
                    active: 1100,
                    inactive: 134,
                    new_today: 15,
                },
                clients: { total: 890, active: 820, new_today: 12 },
                providers: {
                    total: 344,
                    active: 280,
                    pending: 5,
                    new_today: 3,
                },
            },
            services: {
                overview: {
                    total: 567,
                    active: 523,
                    inactive: 44,
                    new_this_week: 23,
                },
            },
            categories: {
                overview: { total: 12, active: 10, inactive: 2 },
            },
            appointments: {
                overview: { total: 89, today: 12, this_week: 45 },
                by_status: {
                    pending: 15,
                    confirmed: 35,
                    completed: 30,
                    cancelled: 9,
                },
            },
        },
        tasks: {
            high_priority: [
                {
                    id: "approve_providers",
                    title: "Approve 5 pending providers",
                    description:
                        "New service providers waiting for verification",
                    icon: "fas fa-user-check",
                    color: "danger",
                    count: 5,
                },
            ],
            medium_priority: [
                {
                    id: "review_categories",
                    title: "Review 2 inactive categories",
                    description:
                        "Service categories that are currently disabled",
                    icon: "fas fa-folder-open",
                    color: "warning",
                    count: 2,
                },
                {
                    id: "welcome_users",
                    title: "Welcome 15 new users",
                    description: "New users who registered today",
                    icon: "fas fa-user-plus",
                    color: "success",
                    count: 15,
                },
            ],
            low_priority: [
                {
                    id: "weekly_report",
                    title: "Generate weekly report",
                    description: "Create weekly platform performance report",
                    icon: "fas fa-chart-bar",
                    color: "info",
                    count: 1,
                },
            ],
        },
        activities: [
            {
                id: 1,
                description: "John Doe registered as a client",
                icon: "fas fa-user",
                color: "success",
                formatted_time: "2 minutes ago",
            },
            {
                id: 2,
                description: 'Service category "Home Cleaning" updated',
                icon: "fas fa-folder-plus",
                color: "primary",
                formatted_time: "15 minutes ago",
            },
            {
                id: 3,
                description: 'New service "Deep Cleaning" created',
                icon: "fas fa-cog",
                color: "warning",
                formatted_time: "1 hour ago",
            },
        ],
        quick_actions: [
            {
                id: "create_category",
                title: "Create Category",
                description: "Add a new service category",
                icon: "fas fa-plus-circle",
                color: "primary",
            },
            {
                id: "manage_users",
                title: "Manage Users",
                description: "View and manage all users",
                icon: "fas fa-users",
                color: "info",
            },
            {
                id: "view_reports",
                title: "View Reports",
                description: "Access platform analytics",
                icon: "fas fa-chart-line",
                color: "success",
            },
            {
                id: "handle_disputes",
                title: "Handle Disputes",
                description: "Manage user disputes",
                icon: "fas fa-balance-scale",
                color: "warning",
            },
        ],
        welcome_message: {
            greeting: "Good morning, John!",
            message:
                "Welcome to the HireMe Staff Dashboard. Here's what's happening on the platform today.",
            last_login: "2 hours ago",
        },
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock API call - replace with actual API
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setDashboardData(mockDashboardData);
        } catch (err) {
            setError("Failed to load dashboard data");
            console.error("Dashboard loading error:", err);
        } finally {
            setLoading(false);
        }
    };

    const refreshDashboard = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return <DashboardError error={error} onRetry={loadDashboardData} />;
    }

    return (
        <div className="container-fluid">
            {/* Welcome Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="h3 mb-1">
                                {dashboardData.welcome_message.greeting}
                            </h1>
                            <p className="text-muted mb-0">
                                {dashboardData.welcome_message.message}
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-primary"
                                onClick={refreshDashboard}
                                disabled={refreshing}
                            >
                                <i
                                    className={`fas fa-sync-alt ${
                                        refreshing ? "fa-spin" : ""
                                    } me-2`}
                                ></i>
                                Refresh
                            </button>
                            <button className="btn btn-primary">
                                <i className="fas fa-download me-2"></i>
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <StatsCard
                        title="Total Users"
                        value={dashboardData.stats.users.overview.total}
                        change={`+${dashboardData.stats.users.overview.new_today} today`}
                        icon="fas fa-users"
                        color="primary"
                        trend="up"
                    />
                </div>
                <div className="col-md-3 mb-3">
                    <StatsCard
                        title="Active Services"
                        value={dashboardData.stats.services.overview.active}
                        change={`${dashboardData.stats.services.overview.total} total`}
                        icon="fas fa-cog"
                        color="success"
                        trend="stable"
                    />
                </div>
                <div className="col-md-3 mb-3">
                    <StatsCard
                        title="Categories"
                        value={dashboardData.stats.categories.overview.active}
                        change={`${dashboardData.stats.categories.overview.total} total`}
                        icon="fas fa-folder-open"
                        color="warning"
                        trend="stable"
                    />
                </div>
                <div className="col-md-3 mb-3">
                    <StatsCard
                        title="Today's Appointments"
                        value={dashboardData.stats.appointments.overview.today}
                        change={`${dashboardData.stats.appointments.overview.total} total`}
                        icon="fas fa-calendar-alt"
                        color="info"
                        trend="up"
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="row">
                {/* Today's Tasks */}
                <div className="col-lg-8 mb-4">
                    <TasksPanel tasks={dashboardData.tasks} />
                </div>

                {/* Recent Activities */}
                <div className="col-lg-4 mb-4">
                    <ActivitiesPanel activities={dashboardData.activities} />
                </div>

                {/* Quick Actions */}
                <div className="col-12">
                    <QuickActionsPanel actions={dashboardData.quick_actions} />
                </div>
            </div>
        </div>
    );
};

// Stats Card Component
const StatsCard = ({ title, value, change, icon, color, trend }) => {
    const getTrendIcon = () => {
        switch (trend) {
            case "up":
                return "fas fa-arrow-up text-success";
            case "down":
                return "fas fa-arrow-down text-danger";
            default:
                return "fas fa-minus text-muted";
        }
    };

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h6 className="card-title text-muted mb-0">{title}</h6>
                        <h2 className="mb-0 mt-1">{value.toLocaleString()}</h2>
                    </div>
                    <div
                        className={`bg-${color} bg-opacity-10 rounded-circle p-3`}
                    >
                        <i className={`${icon} text-${color} fs-4`}></i>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <i
                        className={`${getTrendIcon()} me-2`}
                        style={{ fontSize: "12px" }}
                    ></i>
                    <span className="text-muted small">{change}</span>
                </div>
            </div>
        </div>
    );
};

// Tasks Panel Component
const TasksPanel = ({ tasks }) => {
    const [activeTab, setActiveTab] = useState("high_priority");

    const getTabColor = (priority) => {
        switch (priority) {
            case "high_priority":
                return "danger";
            case "medium_priority":
                return "warning";
            case "low_priority":
                return "info";
            default:
                return "secondary";
        }
    };

    const getTabLabel = (priority) => {
        switch (priority) {
            case "high_priority":
                return "High Priority";
            case "medium_priority":
                return "Medium Priority";
            case "low_priority":
                return "Low Priority";
            default:
                return "Tasks";
        }
    };

    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="fas fa-tasks text-primary me-2"></i>
                        Today's Tasks
                    </h5>
                    <div className="d-flex gap-2">
                        {Object.keys(tasks).map((priority) => (
                            <button
                                key={priority}
                                className={`btn btn-sm ${
                                    activeTab === priority
                                        ? `btn-${getTabColor(priority)}`
                                        : "btn-outline-secondary"
                                }`}
                                onClick={() => setActiveTab(priority)}
                            >
                                {getTabLabel(priority)}
                                {tasks[priority].length > 0 && (
                                    <span className="badge bg-white text-dark ms-1">
                                        {tasks[priority].length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="card-body">
                <div className="task-list">
                    {tasks[activeTab].length > 0 ? (
                        tasks[activeTab].map((task) => (
                            <div
                                key={task.id}
                                className="d-flex align-items-center p-3 border rounded mb-2 task-item"
                            >
                                <div
                                    className={`bg-${task.color} bg-opacity-10 rounded-circle p-2 me-3`}
                                >
                                    <i
                                        className={`${task.icon} text-${task.color}`}
                                    ></i>
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-1">{task.title}</h6>
                                    <p className="text-muted mb-0 small">
                                        {task.description}
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span className={`badge bg-${task.color}`}>
                                        {task.count}
                                    </span>
                                    <button className="btn btn-sm btn-outline-primary">
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <i className="fas fa-check-circle text-success fs-1 mb-3"></i>
                            <h5>
                                All {getTabLabel(activeTab).toLowerCase()} tasks
                                completed!
                            </h5>
                            <p className="text-muted">
                                Great job staying on top of your tasks.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Activities Panel Component
const ActivitiesPanel = ({ activities }) => {
    return (
        <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="fas fa-history text-primary me-2"></i>
                        Recent Activities
                    </h5>
                    <button className="btn btn-sm btn-outline-primary">
                        View All
                    </button>
                </div>
            </div>
            <div className="card-body">
                <div className="activity-timeline">
                    {activities.map((activity) => (
                        <div key={activity.id} className="d-flex mb-3">
                            <div
                                className={`bg-${activity.color} bg-opacity-10 rounded-circle p-2 me-3 flex-shrink-0`}
                                style={{ width: "32px", height: "32px" }}
                            >
                                <i
                                    className={`${activity.icon} text-${activity.color}`}
                                    style={{ fontSize: "12px" }}
                                ></i>
                            </div>
                            <div className="flex-grow-1">
                                <p className="mb-1">{activity.description}</p>
                                <small className="text-muted">
                                    {activity.formatted_time}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-3">
                    <button className="btn btn-sm btn-outline-secondary">
                        <i className="fas fa-plus me-2"></i>
                        Load More
                    </button>
                </div>
            </div>
        </div>
    );
};

// Quick Actions Panel Component
const QuickActionsPanel = ({ actions }) => {
    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <h5 className="card-title mb-0">
                    <i className="fas fa-bolt text-primary me-2"></i>
                    Quick Actions
                </h5>
            </div>
            <div className="card-body">
                <div className="row">
                    {actions.map((action) => (
                        <div key={action.id} className="col-md-3 col-sm-6 mb-3">
                            <div className="card h-100 border-0 bg-light hover-shadow">
                                <div className="card-body text-center">
                                    <div
                                        className={`bg-${action.color} bg-opacity-10 rounded-circle p-3 mb-3 mx-auto`}
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                        }}
                                    >
                                        <i
                                            className={`${action.icon} text-${action.color} fs-4`}
                                        ></i>
                                    </div>
                                    <h6 className="card-title">
                                        {action.title}
                                    </h6>
                                    <p className="card-text text-muted small">
                                        {action.description}
                                    </p>
                                    <button
                                        className={`btn btn-sm btn-${action.color} w-100`}
                                    >
                                        Get Started
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Loading Skeleton Component
const DashboardSkeleton = () => {
    return (
        <div className="container-fluid">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="placeholder-glow">
                        <span className="placeholder col-6 placeholder-lg"></span>
                        <span className="placeholder col-4"></span>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="col-md-3 mb-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="placeholder-glow">
                                    <span className="placeholder col-7"></span>
                                    <span className="placeholder col-4 placeholder-lg"></span>
                                    <span className="placeholder col-6"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row">
                <div className="col-lg-8 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header">
                            <div className="placeholder-glow">
                                <span className="placeholder col-4"></span>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="placeholder-glow">
                                <span className="placeholder col-12"></span>
                                <span className="placeholder col-12"></span>
                                <span className="placeholder col-8"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header">
                            <div className="placeholder-glow">
                                <span className="placeholder col-6"></span>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="placeholder-glow">
                                <span className="placeholder col-12"></span>
                                <span className="placeholder col-8"></span>
                                <span className="placeholder col-10"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Error Component
const DashboardError = ({ error, onRetry }) => {
    return (
        <div className="container-fluid">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">
                            <i className="fas fa-exclamation-triangle text-warning fs-1 mb-3"></i>
                            <h4>Dashboard Loading Error</h4>
                            <p className="text-muted mb-4">{error}</p>
                            <button
                                className="btn btn-primary"
                                onClick={onRetry}
                            >
                                <i className="fas fa-sync-alt me-2"></i>
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;

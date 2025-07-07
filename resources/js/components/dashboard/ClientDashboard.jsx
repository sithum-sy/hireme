import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const ClientDashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        activeJobs: 0,
        completedJobs: 0,
        totalSpent: 0,
        savedProviders: 0,
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [featuredProviders, setFeaturedProviders] = useState([]);

    useEffect(() => {
        // Mock data - replace with actual API calls
        setStats({
            activeJobs: 3,
            completedJobs: 12,
            totalSpent: 2450,
            savedProviders: 8,
        });

        setRecentActivities([
            {
                id: 1,
                type: "job_posted",
                title: "Posted new job: Web Development",
                time: "2 hours ago",
                icon: "💼",
            },
            {
                id: 2,
                type: "proposal_received",
                title: "Received proposal for Graphic Design",
                time: "1 day ago",
                icon: "📋",
            },
            {
                id: 3,
                type: "job_completed",
                title: "Job completed: Mobile App UI/UX",
                time: "3 days ago",
                icon: "✅",
            },
        ]);

        setFeaturedProviders([
            {
                id: 1,
                name: "Sarah Johnson",
                specialty: "Web Development",
                rating: 4.9,
                hourlyRate: 75,
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&q=80",
            },
            {
                id: 2,
                name: "Michael Chen",
                specialty: "Graphic Design",
                rating: 4.8,
                hourlyRate: 60,
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&q=80",
            },
            {
                id: 3,
                name: "Emma Rodriguez",
                specialty: "Digital Marketing",
                rating: 4.9,
                hourlyRate: 85,
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=50&q=80",
            },
        ]);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    const StatCard = ({ title, value, icon, color }) => (
        <div className="card h-100 shadow-sm">
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div className={`p-3 rounded-3 ${color} me-3`}>
                        <span style={{ fontSize: "1.5rem" }}>{icon}</span>
                    </div>
                    <div>
                        <p className="card-text text-muted small mb-1">
                            {title}
                        </p>
                        <h4 className="card-title mb-0">{value}</h4>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-vh-100 bg-light">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center py-4">
                        <div className="d-flex align-items-center">
                            <h1 className="h3 mb-0 fw-bold text-dark">
                                HireMe
                            </h1>
                        </div>
                        <div className="d-flex align-items-center">
                            <div className="d-flex align-items-center me-3">
                                {user.profile_picture ? (
                                    <img
                                        className="rounded-circle me-3"
                                        src={user.profile_picture}
                                        alt={user.full_name}
                                        width="32"
                                        height="32"
                                    />
                                ) : (
                                    <div
                                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-3"
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                        }}
                                    >
                                        <span className="text-white small fw-medium">
                                            {user.first_name[0]}
                                            {user.last_name[0]}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="mb-0 small fw-medium">
                                        {user.full_name}
                                    </p>
                                    <p
                                        className="mb-0 text-muted"
                                        style={{ fontSize: "0.75rem" }}
                                    >
                                        Client
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline-secondary btn-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container-fluid py-4">
                <div className="px-3">
                    {/* Welcome Section */}
                    <div className="mb-4">
                        <h2 className="h4 fw-bold text-dark mb-1">
                            Welcome back, {user.first_name}!
                        </h2>
                        <p className="text-muted small mb-0">
                            Here's what's happening with your projects today.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-4">
                        <div className="d-flex flex-wrap gap-2">
                            <Link to="/post-job" className="btn btn-primary">
                                Post a Job
                            </Link>
                            <Link
                                to="/browse-providers"
                                className="btn btn-outline-secondary"
                            >
                                Browse Providers
                            </Link>
                            <Link
                                to="/my-jobs"
                                className="btn btn-outline-secondary"
                            >
                                My Jobs
                            </Link>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="row g-3 mb-4">
                        <div className="col-12 col-md-6 col-lg-3">
                            <StatCard
                                title="Active Jobs"
                                value={stats.activeJobs}
                                icon="📊"
                                color="bg-primary bg-opacity-10"
                            />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <StatCard
                                title="Completed Jobs"
                                value={stats.completedJobs}
                                icon="✅"
                                color="bg-success bg-opacity-10"
                            />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <StatCard
                                title="Total Spent"
                                value={`$${stats.totalSpent.toLocaleString()}`}
                                icon="💰"
                                color="bg-warning bg-opacity-10"
                            />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <StatCard
                                title="Saved Providers"
                                value={stats.savedProviders}
                                icon="⭐"
                                color="bg-info bg-opacity-10"
                            />
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="row g-4">
                        {/* Recent Activities */}
                        <div className="col-12 col-lg-8">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="card-title mb-0">
                                        Recent Activities
                                    </h5>
                                </div>
                                <div className="card-body p-0">
                                    {recentActivities.map((activity, index) => (
                                        <div
                                            key={activity.id}
                                            className={`p-3 ${
                                                index !==
                                                recentActivities.length - 1
                                                    ? "border-bottom"
                                                    : ""
                                            }`}
                                        >
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="me-3"
                                                    style={{
                                                        fontSize: "1.5rem",
                                                    }}
                                                >
                                                    {activity.icon}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <p className="mb-1 small fw-medium">
                                                        {activity.title}
                                                    </p>
                                                    <p className="mb-0 text-muted small">
                                                        {activity.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="card-footer bg-light text-end">
                                    <Link
                                        to="/activity"
                                        className="btn btn-link btn-sm text-decoration-none"
                                    >
                                        View all activities
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Featured Providers */}
                        <div className="col-12 col-lg-4">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="card-title mb-0">
                                        Featured Providers
                                    </h5>
                                </div>
                                <div className="card-body p-0">
                                    {featuredProviders.map(
                                        (provider, index) => (
                                            <div
                                                key={provider.id}
                                                className={`p-3 ${
                                                    index !==
                                                    featuredProviders.length - 1
                                                        ? "border-bottom"
                                                        : ""
                                                }`}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        className="rounded-circle me-3"
                                                        src={provider.avatar}
                                                        alt={provider.name}
                                                        width="40"
                                                        height="40"
                                                    />
                                                    <div className="flex-grow-1">
                                                        <p className="mb-1 small fw-medium">
                                                            {provider.name}
                                                        </p>
                                                        <p className="mb-1 text-muted small">
                                                            {provider.specialty}
                                                        </p>
                                                        <div className="d-flex align-items-center">
                                                            <div className="d-flex align-items-center me-2">
                                                                <span className="text-warning">
                                                                    ⭐
                                                                </span>
                                                                <span className="text-muted small ms-1">
                                                                    {
                                                                        provider.rating
                                                                    }
                                                                </span>
                                                            </div>
                                                            <span className="text-muted small">
                                                                •
                                                            </span>
                                                            <span className="text-muted small ms-2">
                                                                $
                                                                {
                                                                    provider.hourlyRate
                                                                }
                                                                /hr
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="card-footer bg-light text-end">
                                    <Link
                                        to="/browse-providers"
                                        className="btn btn-link btn-sm text-decoration-none"
                                    >
                                        View all providers
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClientDashboard;

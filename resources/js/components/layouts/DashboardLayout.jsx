import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardSidebar from "../dashboard/DashboardSidebar";
import DashboardNavbar from "../dashboard/DashboardNavbar";

const DashboardLayout = ({
    children,
    title,
    subtitle,
    role,
    sidebarCollapsed = false,
    onToggleSidebar,
}) => {
    const { user } = useAuth();
    const currentRole = role || user?.role || "client";

    // Set role-specific body class
    useEffect(() => {
        document.body.className = `dashboard-${currentRole}`;
        return () => {
            document.body.className = "";
        };
    }, [currentRole]);

    return (
        <div className="dashboard-layout">
            <div className="dashboard-container">
                <DashboardSidebar
                    role={currentRole}
                    collapsed={sidebarCollapsed}
                />

                <div
                    className={`dashboard-main ${
                        sidebarCollapsed ? "collapsed" : ""
                    }`}
                >
                    <DashboardNavbar
                        role={currentRole}
                        onToggleSidebar={onToggleSidebar}
                        sidebarCollapsed={sidebarCollapsed}
                    />

                    <div className="dashboard-content">
                        {(title || subtitle) && (
                            <div className="page-header">
                                {title && (
                                    <h1 className="page-title">{title}</h1>
                                )}
                                {subtitle && (
                                    <p className="page-subtitle">{subtitle}</p>
                                )}
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;

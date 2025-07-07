export const ROLES = {
    CLIENT: "client",
    SERVICE_PROVIDER: "service_provider",
    ADMIN: "admin",
    STAFF: "staff",
};

export const DASHBOARD_ROUTES = {
    [ROLES.CLIENT]: "/client/dashboard",
    [ROLES.SERVICE_PROVIDER]: "/provider/dashboard",
    [ROLES.ADMIN]: "/admin/dashboard",
    [ROLES.STAFF]: "/staff/dashboard",
};

export const getDashboardRoute = (role) => {
    return DASHBOARD_ROUTES[role] || "/";
};

export const hasRole = (user, requiredRoles) => {
    if (!user || !user.role) return false;
    if (typeof requiredRoles === "string") {
        return user.role === requiredRoles;
    }
    if (Array.isArray(requiredRoles)) {
        return requiredRoles.includes(user.role);
    }
    return false;
};

export const canAccessRoute = (user, allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return hasRole(user, allowedRoles);
};

import React from "react";
import { useStableImageUrl } from "../../../hooks/useStableImageUrl";

const ProvidersTable = ({
    providers = [],
    selectedUsers = [],
    onSelectUser,
    onSelectAll,
    onToggleStatus,
    isProcessing = false,
    loading = false,
}) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusBadge = (user) => {
        return user.is_active ? (
            <span className="badge bg-success">Active</span>
        ) : (
            <span className="badge bg-secondary">Inactive</span>
        );
    };

    const getVerificationBadge = (provider) => {
        if (!provider.provider_profile) {
            return <span className="badge bg-secondary">No Profile</span>;
        }

        const status = provider.provider_profile.verification_status;

        if (status === "verified") {
            return (
                <span className="badge bg-success">
                    <i className="fas fa-check-circle me-1"></i>
                    Verified
                </span>
            );
        } else if (status === "rejected") {
            return (
                <span className="badge bg-danger">
                    <i className="fas fa-times-circle me-1"></i>
                    Rejected
                </span>
            );
        } else {
            return (
                <span className="badge bg-warning">
                    <i className="fas fa-clock me-1"></i>
                    Pending
                </span>
            );
        }
    };

    const formatExperience = (years) => {
        if (!years || years === 0) {
            return <span className="text-muted">New</span>;
        }

        return (
            <div className="text-center">
                <span className="badge bg-info">{years}</span>
                <div>
                    <small className="text-muted">
                        {years === 1 ? "year" : "years"}
                    </small>
                </div>
            </div>
        );
    };

    const ProviderAvatar = ({ provider }) => {
        const stableImageUrl = useStableImageUrl(
            provider.profile_picture,
            "/images/default-avatar.png"
        );

        if (!provider.profile_picture) {
            return (
                <div className="d-flex align-items-center">
                    <div
                        className="rounded-circle bg-warning d-flex align-items-center justify-content-center"
                        style={{
                            width: "40px",
                            height: "40px",
                        }}
                    >
                        <i className="fas fa-briefcase text-white"></i>
                    </div>
                </div>
            );
        }

        return (
            <div className="d-flex align-items-center">
                <img
                    src={stableImageUrl}
                    alt={provider.full_name}
                    className="rounded-circle"
                    style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                    }}
                    onError={(e) => {
                        // Replace with fallback avatar on error
                        const fallback = document.createElement("div");
                        fallback.className =
                            "rounded-circle bg-warning d-flex align-items-center justify-content-center";
                        fallback.style.width = "40px";
                        fallback.style.height = "40px";
                        fallback.innerHTML =
                            '<i class="fas fa-briefcase text-white"></i>';
                        e.target.parentNode.replaceChild(fallback, e.target);
                    }}
                />
            </div>
        );
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "200px" }}
            >
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover mb-0">
                <thead className="table-light">
                    <tr>
                        <th style={{ width: "50px" }}>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={
                                        selectedUsers.length ===
                                            providers.length &&
                                        providers.length > 0
                                    }
                                    onChange={onSelectAll}
                                />
                            </div>
                        </th>
                        <th style={{ width: "60px" }}>Avatar</th>
                        <th>Name & Business</th>
                        <th>Email</th>
                        <th style={{ width: "120px" }}>Phone</th>
                        <th style={{ width: "120px" }}>Experience</th>
                        <th style={{ width: "80px" }}>Services</th>
                        <th style={{ width: "100px" }}>Status</th>
                        <th style={{ width: "100px" }}>Verified</th>
                        <th style={{ width: "120px" }}>Joined</th>
                        <th style={{ width: "150px" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {providers.map((provider) => (
                        <tr key={provider.id}>
                            <td>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={selectedUsers.includes(
                                            provider.id
                                        )}
                                        onChange={() =>
                                            onSelectUser(provider.id)
                                        }
                                    />
                                </div>
                            </td>
                            <td>
                                <ProviderAvatar provider={provider} />
                            </td>
                            <td>
                                <div>
                                    <h6 className="mb-1">
                                        {provider.full_name}
                                    </h6>
                                    <small className="text-muted">
                                        {provider.provider_profile
                                            ?.business_name ||
                                            "No business name"}
                                    </small>
                                    <br />
                                    <small className="text-muted">
                                        ID: {provider.id}
                                        {provider.email_verified_at && (
                                            <span className="ms-2">
                                                <i
                                                    className="fas fa-check-circle text-success"
                                                    title="Email Verified"
                                                ></i>
                                            </span>
                                        )}
                                    </small>
                                </div>
                            </td>
                            <td>
                                <span className="text-break">
                                    {provider.email}
                                </span>
                            </td>
                            <td>
                                <span className="text-nowrap">
                                    {provider.contact_number || (
                                        <em className="text-muted">
                                            Not provided
                                        </em>
                                    )}
                                </span>
                            </td>
                            <td>
                                {formatExperience(
                                    provider.provider_profile
                                        ?.years_of_experience
                                )}
                            </td>
                            <td>
                                <div className="text-center">
                                    <span className="badge bg-primary">
                                        {provider.provider_profile
                                            ?.services_count || 0}
                                    </span>
                                    <div>
                                        <small className="text-muted">
                                            services
                                        </small>
                                    </div>
                                </div>
                            </td>
                            <td>{getStatusBadge(provider)}</td>
                            <td>{getVerificationBadge(provider)}</td>
                            <td>
                                <small className="text-muted">
                                    {formatDate(provider.created_at)}
                                </small>
                            </td>
                            <td>
                                <div className="btn-group" role="group">
                                    <a
                                        href={`/staff/users/${provider.id}`}
                                        className="btn btn-sm btn-outline-primary"
                                        title="View Details"
                                    >
                                        <i className="fas fa-eye"></i>
                                    </a>
                                    <button
                                        className={`btn btn-sm ${
                                            provider.is_active
                                                ? "btn-outline-warning"
                                                : "btn-outline-success"
                                        }`}
                                        onClick={() => onToggleStatus(provider)}
                                        disabled={isProcessing}
                                        title={
                                            provider.is_active
                                                ? "Deactivate"
                                                : "Activate"
                                        }
                                    >
                                        <i
                                            className={`fas fa-${
                                                provider.is_active
                                                    ? "pause"
                                                    : "play"
                                            }`}
                                        ></i>
                                    </button>
                                    <div className="btn-group" role="group">
                                        <button
                                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <i className="fas fa-ellipsis-v"></i>
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li>
                                                <a
                                                    className="dropdown-item"
                                                    href={`/staff/users/${provider.id}`}
                                                >
                                                    <i className="fas fa-eye me-2"></i>
                                                    View Profile
                                                </a>
                                            </li>
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => {}}
                                                >
                                                    <i className="fas fa-briefcase me-2"></i>
                                                    View Services
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => {}}
                                                >
                                                    <i className="fas fa-envelope me-2"></i>
                                                    Send Message
                                                </button>
                                            </li>
                                            {provider.provider_profile &&
                                                provider.provider_profile
                                                    .verification_status !==
                                                    "verified" && (
                                                    <>
                                                        <li>
                                                            <hr className="dropdown-divider" />
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item text-success"
                                                                onClick={() => {}}
                                                            >
                                                                <i className="fas fa-check-circle me-2"></i>
                                                                Verify Provider
                                                            </button>
                                                        </li>
                                                    </>
                                                )}
                                            <li>
                                                <hr className="dropdown-divider" />
                                            </li>
                                            <li>
                                                <button
                                                    className={`dropdown-item ${
                                                        provider.is_active
                                                            ? "text-warning"
                                                            : "text-success"
                                                    }`}
                                                    onClick={() =>
                                                        onToggleStatus(provider)
                                                    }
                                                    disabled={isProcessing}
                                                >
                                                    <i
                                                        className={`fas fa-${
                                                            provider.is_active
                                                                ? "pause"
                                                                : "play"
                                                        } me-2`}
                                                    ></i>
                                                    {provider.is_active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {providers.length === 0 && (
                <div className="text-center py-5">
                    <i className="fas fa-briefcase fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Providers Found</h5>
                    <p className="text-muted mb-0">
                        No providers match your current filters.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProvidersTable;

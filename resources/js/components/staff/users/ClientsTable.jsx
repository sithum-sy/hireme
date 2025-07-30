import React from "react";
import { useStableImageUrl } from "../../../hooks/useStableImageUrl";

const ClientsTable = ({
    clients = [],
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

    const ClientAvatar = ({ client }) => {
        const stableImageUrl = useStableImageUrl(
            client.profile_picture,
            "/images/default-avatar.png"
        );

        if (!client.profile_picture) {
            return (
                <div className="d-flex align-items-center">
                    <div
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                        style={{
                            width: "40px",
                            height: "40px",
                        }}
                    >
                        <i className="fas fa-user text-white"></i>
                    </div>
                </div>
            );
        }

        return (
            <div className="d-flex align-items-center">
                <img
                    src={stableImageUrl}
                    alt={client.full_name}
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
                            "rounded-circle bg-primary d-flex align-items-center justify-content-center";
                        fallback.style.width = "40px";
                        fallback.style.height = "40px";
                        fallback.innerHTML =
                            '<i class="fas fa-user text-white"></i>';
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
                                            clients.length && clients.length > 0
                                    }
                                    onChange={onSelectAll}
                                />
                            </div>
                        </th>
                        <th style={{ width: "60px" }}>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th style={{ width: "120px" }}>Phone</th>
                        <th style={{ width: "100px" }}>Status</th>
                        <th style={{ width: "120px" }}>Joined</th>
                        <th style={{ width: "150px" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client) => (
                        <tr key={client.id}>
                            <td>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={selectedUsers.includes(
                                            client.id
                                        )}
                                        onChange={() => onSelectUser(client.id)}
                                    />
                                </div>
                            </td>
                            <td>
                                <ClientAvatar client={client} />
                            </td>
                            <td>
                                <div>
                                    <h6 className="mb-1">{client.full_name}</h6>
                                    <small className="text-muted">
                                        ID: {client.id}
                                        {client.email_verified_at && (
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
                                    {client.email}
                                </span>
                            </td>
                            <td>
                                <span className="text-nowrap">
                                    {client.contact_number || (
                                        <em className="text-muted">
                                            Not provided
                                        </em>
                                    )}
                                </span>
                            </td>
                            <td>{getStatusBadge(client)}</td>
                            <td>
                                <small className="text-muted">
                                    {formatDate(client.created_at)}
                                </small>
                            </td>
                            <td>
                                <div className="btn-group" role="group">
                                    <a
                                        href={`/staff/users/${client.id}`}
                                        className="btn btn-sm btn-outline-primary"
                                        title="View Details"
                                    >
                                        <i className="fas fa-eye"></i>
                                    </a>
                                    <button
                                        className={`btn btn-sm ${
                                            client.is_active
                                                ? "btn-outline-warning"
                                                : "btn-outline-success"
                                        }`}
                                        onClick={() => onToggleStatus(client)}
                                        disabled={isProcessing}
                                        title={
                                            client.is_active
                                                ? "Deactivate"
                                                : "Activate"
                                        }
                                    >
                                        <i
                                            className={`fas fa-${
                                                client.is_active
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
                                                    href={`/staff/users/${client.id}`}
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
                                                    <i className="fas fa-envelope me-2"></i>
                                                    Send Message
                                                </button>
                                            </li>
                                            <li>
                                                <hr className="dropdown-divider" />
                                            </li>
                                            <li>
                                                <button
                                                    className={`dropdown-item ${
                                                        client.is_active
                                                            ? "text-warning"
                                                            : "text-success"
                                                    }`}
                                                    onClick={() =>
                                                        onToggleStatus(client)
                                                    }
                                                    disabled={isProcessing}
                                                >
                                                    <i
                                                        className={`fas fa-${
                                                            client.is_active
                                                                ? "pause"
                                                                : "play"
                                                        } me-2`}
                                                    ></i>
                                                    {client.is_active
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

            {clients.length === 0 && (
                <div className="text-center py-5">
                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Clients Found</h5>
                    <p className="text-muted mb-0">
                        No clients match your current filters.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ClientsTable;

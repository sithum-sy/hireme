import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const RegisterForm = () => {
    const { register, loading, error } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "client",
        address: "",
        contact_number: "",
        profile_picture: null,
    });

    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : value,
        }));

        // Clear specific field error when user starts typing
        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});

        const result = await register(formData);

        if (result.success) {
            navigate("/dashboard");
        } else {
            if (result.errors) {
                setFormErrors(result.errors);
            }
        }
    };

    const getFieldError = (fieldName) => {
        return formErrors[fieldName] ? formErrors[fieldName][0] : "";
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h2 className="h3 fw-bold text-dark mb-2">
                                        Create your account
                                    </h2>
                                    <p className="text-muted">
                                        Join HireMe and start connecting with
                                        professionals
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {error && (
                                        <div
                                            className="alert alert-danger d-flex align-items-center mb-4"
                                            role="alert"
                                        >
                                            <svg
                                                className="bi flex-shrink-0 me-2"
                                                width="24"
                                                height="24"
                                                role="img"
                                                aria-label="Danger:"
                                            >
                                                <use xlinkHref="#exclamation-triangle-fill" />
                                            </svg>
                                            <div>{error.message}</div>
                                        </div>
                                    )}

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label
                                                htmlFor="first_name"
                                                className="form-label"
                                            >
                                                First Name
                                            </label>
                                            <input
                                                id="first_name"
                                                name="first_name"
                                                type="text"
                                                required
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                className={`form-control ${
                                                    getFieldError("first_name")
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                placeholder="John"
                                            />
                                            {getFieldError("first_name") && (
                                                <div className="invalid-feedback">
                                                    {getFieldError(
                                                        "first_name"
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label
                                                htmlFor="last_name"
                                                className="form-label"
                                            >
                                                Last Name
                                            </label>
                                            <input
                                                id="last_name"
                                                name="last_name"
                                                type="text"
                                                required
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                className={`form-control ${
                                                    getFieldError("last_name")
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                placeholder="Doe"
                                            />
                                            {getFieldError("last_name") && (
                                                <div className="invalid-feedback">
                                                    {getFieldError("last_name")}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="email"
                                            className="form-label"
                                        >
                                            Email Address
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`form-control ${
                                                getFieldError("email")
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            placeholder="john@example.com"
                                        />
                                        {getFieldError("email") && (
                                            <div className="invalid-feedback">
                                                {getFieldError("email")}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="role"
                                            className="form-label"
                                        >
                                            I want to
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className={`form-select ${
                                                getFieldError("role")
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                        >
                                            <option value="client">
                                                Hire service providers
                                            </option>
                                            <option value="service_provider">
                                                Offer my services
                                            </option>
                                        </select>
                                        {getFieldError("role") && (
                                            <div className="invalid-feedback">
                                                {getFieldError("role")}
                                            </div>
                                        )}
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label
                                                htmlFor="password"
                                                className="form-label"
                                            >
                                                Password
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    required
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className={`form-control ${
                                                        getFieldError(
                                                            "password"
                                                        )
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                >
                                                    {showPassword ? "🙈" : "👁️"}
                                                </button>
                                                {getFieldError("password") && (
                                                    <div className="invalid-feedback">
                                                        {getFieldError(
                                                            "password"
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label
                                                htmlFor="password_confirmation"
                                                className="form-label"
                                            >
                                                Confirm Password
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    required
                                                    value={
                                                        formData.password_confirmation
                                                    }
                                                    onChange={handleChange}
                                                    className={`form-control ${
                                                        getFieldError(
                                                            "password_confirmation"
                                                        )
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                >
                                                    {showConfirmPassword
                                                        ? "🙈"
                                                        : "👁️"}
                                                </button>
                                                {getFieldError(
                                                    "password_confirmation"
                                                ) && (
                                                    <div className="invalid-feedback">
                                                        {getFieldError(
                                                            "password_confirmation"
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="address"
                                            className="form-label"
                                        >
                                            Address
                                        </label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            rows={3}
                                            required
                                            value={formData.address}
                                            onChange={handleChange}
                                            className={`form-control ${
                                                getFieldError("address")
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            placeholder="123 Main St, City, State, ZIP"
                                        />
                                        {getFieldError("address") && (
                                            <div className="invalid-feedback">
                                                {getFieldError("address")}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="contact_number"
                                            className="form-label"
                                        >
                                            Contact Number
                                        </label>
                                        <input
                                            id="contact_number"
                                            name="contact_number"
                                            type="tel"
                                            required
                                            value={formData.contact_number}
                                            onChange={handleChange}
                                            className={`form-control ${
                                                getFieldError("contact_number")
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                        {getFieldError("contact_number") && (
                                            <div className="invalid-feedback">
                                                {getFieldError(
                                                    "contact_number"
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label
                                            htmlFor="profile_picture"
                                            className="form-label"
                                        >
                                            Profile Picture (Optional)
                                        </label>
                                        <input
                                            id="profile_picture"
                                            name="profile_picture"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleChange}
                                            className={`form-control ${
                                                getFieldError("profile_picture")
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                        />
                                        {getFieldError("profile_picture") && (
                                            <div className="invalid-feedback">
                                                {getFieldError(
                                                    "profile_picture"
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-grid mb-3">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn btn-primary btn-lg"
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                        aria-hidden="true"
                                                    ></span>
                                                    Creating Account...
                                                </>
                                            ) : (
                                                "Create Account"
                                            )}
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-muted mb-0">
                                            Already have an account?{" "}
                                            <Link
                                                to="/login"
                                                className="text-decoration-none fw-medium"
                                            >
                                                Sign in
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const LoginForm = () => {
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await login(formData.email, formData.password);

        if (result.success) {
            // Redirect based on user role
            const user = result.user;
            switch (user.role) {
                case "admin":
                    navigate("/admin/dashboard");
                    break;
                case "staff":
                    navigate("/staff/dashboard");
                    break;
                case "service_provider":
                    navigate("/provider/dashboard");
                    break;
                case "client":
                default:
                    navigate("/dashboard");
                    break;
            }
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="card shadow">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h2 className="h3 fw-bold text-dark mb-3">
                                        Sign in to your account
                                    </h2>
                                    <p className="text-muted">
                                        Welcome back to HireMe
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {error && (
                                        <div
                                            className="alert alert-danger d-flex align-items-center mb-4"
                                            role="alert"
                                        >
                                            <svg
                                                className="me-2"
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <div>{error.message}</div>
                                        </div>
                                    )}

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
                                            className="form-control"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div className="mb-3">
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
                                                className="form-control"
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
                                                {showPassword ? (
                                                    <svg
                                                        width="20"
                                                        height="20"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.636 5.636m4.242 4.242L14.12 14.12m-4.242-4.242L5.636 5.636m8.485 8.485l4.242 4.242M19.07 19.07L5.636 5.636"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        width="20"
                                                        height="20"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="form-check">
                                            <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) =>
                                                    setRememberMe(
                                                        e.target.checked
                                                    )
                                                }
                                                className="form-check-input"
                                            />
                                            <label
                                                htmlFor="remember-me"
                                                className="form-check-label"
                                            >
                                                Remember me
                                            </label>
                                        </div>

                                        <div>
                                            <Link
                                                to="/forgot-password"
                                                className="text-decoration-none"
                                            >
                                                Forgot your password?
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="d-grid mb-3">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn btn-primary"
                                        >
                                            {loading && (
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                            )}
                                            {loading ? (
                                                "Signing in..."
                                            ) : (
                                                <>
                                                    <svg
                                                        className="me-2"
                                                        width="20"
                                                        height="20"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Sign in
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-muted mb-0">
                                            Don't have an account?{" "}
                                            <Link
                                                to="/register"
                                                className="text-decoration-none"
                                            >
                                                Sign up
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

export default LoginForm;

import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { register, loading } = useAuth();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: searchParams.get("role") || "",
        address: "",
        contact_number: "",
        date_of_birth: "",
        profile_picture: null,
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, profile_picture: file }));
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData((prev) => ({ ...prev, profile_picture: null }));
        setPreviewImage(null);
        document.getElementById("profile_picture").value = "";
    };

    const validateStep = (stepNumber) => {
        const newErrors = {};

        if (stepNumber === 1) {
            if (!formData.role) newErrors.role = "Please select your role";
        }

        if (stepNumber === 2) {
            if (!formData.first_name.trim())
                newErrors.first_name = "First name is required";
            if (!formData.last_name.trim())
                newErrors.last_name = "Last name is required";
            if (!formData.email.trim()) {
                newErrors.email = "Email is required";
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Email is invalid";
            }
            if (!formData.password) {
                newErrors.password = "Password is required";
            } else if (formData.password.length < 8) {
                newErrors.password = "Password must be at least 8 characters";
            }
            if (formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = "Passwords do not match";
            }
            if (!formData.date_of_birth) {
                newErrors.date_of_birth = "Date of birth is required";
            }
        }

        if (stepNumber === 3) {
            if (!formData.address.trim())
                newErrors.address = "Address is required";
            if (!formData.contact_number.trim())
                newErrors.contact_number = "Contact number is required";
        }

        return newErrors;
    };

    const handleNext = () => {
        const stepErrors = validateStep(step);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setErrors({});
        setStep(step + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const stepErrors = validateStep(3);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }

        const result = await register(formData);
        if (result.success) {
            navigate(
                result.user.role === "client"
                    ? "/client/dashboard"
                    : "/provider/dashboard"
            );
        } else {
            setErrors(result.errors || { general: result.message });
        }
    };

    return (
        <div className="register-page min-vh-100 bg-light d-flex align-items-center py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-xl-5">
                        <div className="card shadow border-0">
                            <div className="card-header bg-white text-center py-4">
                                <Link to="/" className="text-decoration-none">
                                    <h3 className="text-primary fw-bold mb-0">
                                        <i className="fas fa-handshake me-2"></i>
                                        HireMe
                                    </h3>
                                </Link>
                                <p className="text-muted mb-0 mt-2">
                                    Create your account
                                </p>
                            </div>

                            <div className="card-body p-4">
                                {/* Step Indicator */}
                                <div className="step-indicator mb-4">
                                    <div className="d-flex justify-content-center">
                                        {[1, 2, 3].map((stepNumber) => (
                                            <div
                                                key={stepNumber}
                                                className="d-flex align-items-center"
                                            >
                                                <div
                                                    className={`step-circle ${
                                                        step >= stepNumber
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                >
                                                    {step > stepNumber ? (
                                                        <i className="fas fa-check"></i>
                                                    ) : (
                                                        stepNumber
                                                    )}
                                                </div>
                                                {stepNumber < 3 && (
                                                    <div
                                                        className={`step-line ${
                                                            step > stepNumber
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                    ></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center mt-2">
                                        <small className="text-muted">
                                            Step {step} of 3:{" "}
                                            {step === 1
                                                ? "Choose Role"
                                                : step === 2
                                                ? "Personal Info"
                                                : "Contact Details"}
                                        </small>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Step 1: Role Selection */}
                                    {step === 1 && (
                                        <div className="step-content">
                                            <h5 className="fw-bold mb-3 text-center">
                                                How do you plan to use HireMe?
                                            </h5>
                                            <div className="row g-3">
                                                {[
                                                    {
                                                        value: "client",
                                                        title: "I need services",
                                                        icon: "fas fa-user",
                                                        color: "primary",
                                                    },
                                                    {
                                                        value: "service_provider",
                                                        title: "I provide services",
                                                        icon: "fas fa-briefcase",
                                                        color: "success",
                                                    },
                                                ].map((role) => (
                                                    <div
                                                        key={role.value}
                                                        className="col-6"
                                                    >
                                                        <div
                                                            className={`role-card p-3 border rounded text-center cursor-pointer ${
                                                                formData.role ===
                                                                role.value
                                                                    ? `border-${role.color} bg-${role.color} bg-opacity-10`
                                                                    : "border-light"
                                                            }`}
                                                            onClick={() =>
                                                                setFormData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        role: role.value,
                                                                    })
                                                                )
                                                            }
                                                        >
                                                            <i
                                                                className={`${role.icon} fa-2x text-${role.color} mb-2`}
                                                            ></i>
                                                            <h6 className="fw-semibold mb-0">
                                                                {role.title}
                                                            </h6>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.role && (
                                                <div className="alert alert-danger mt-3">
                                                    {errors.role}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 2: Personal Information */}
                                    {step === 2 && (
                                        <div className="step-content">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">
                                                        First Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="first_name"
                                                        className={`form-control ${
                                                            errors.first_name
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={
                                                            formData.first_name
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="First name"
                                                    />
                                                    {errors.first_name && (
                                                        <div className="invalid-feedback">
                                                            {errors.first_name}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">
                                                        Last Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="last_name"
                                                        className={`form-control ${
                                                            errors.last_name
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={
                                                            formData.last_name
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="Last name"
                                                    />
                                                    {errors.last_name && (
                                                        <div className="invalid-feedback">
                                                            {errors.last_name}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label">
                                                        Email Address *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className={`form-control ${
                                                            errors.email
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={formData.email}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="email@example.com"
                                                    />
                                                    {errors.email && (
                                                        <div className="invalid-feedback">
                                                            {errors.email}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label">
                                                        Date of Birth *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="date_of_birth"
                                                        className={`form-control ${
                                                            errors.date_of_birth
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={
                                                            formData.date_of_birth
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        max={
                                                            new Date()
                                                                .toISOString()
                                                                .split("T")[0]
                                                        }
                                                    />
                                                    {errors.date_of_birth && (
                                                        <div className="invalid-feedback">
                                                            {
                                                                errors.date_of_birth
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">
                                                        Password *
                                                    </label>
                                                    <div className="input-group">
                                                        <input
                                                            type={
                                                                showPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            name="password"
                                                            className={`form-control ${
                                                                errors.password
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            value={
                                                                formData.password
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            placeholder="Password"
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
                                                            <i
                                                                className={`fas ${
                                                                    showPassword
                                                                        ? "fa-eye-slash"
                                                                        : "fa-eye"
                                                                }`}
                                                            ></i>
                                                        </button>
                                                    </div>
                                                    {errors.password && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors.password}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">
                                                        Confirm Password *
                                                    </label>
                                                    <input
                                                        type="password"
                                                        name="password_confirmation"
                                                        className={`form-control ${
                                                            errors.password_confirmation
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={
                                                            formData.password_confirmation
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="Confirm password"
                                                    />
                                                    {errors.password_confirmation && (
                                                        <div className="invalid-feedback">
                                                            {
                                                                errors.password_confirmation
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Contact & Profile */}
                                    {step === 3 && (
                                        <div className="step-content">
                                            <div className="row g-3">
                                                <div className="col-12">
                                                    <label className="form-label">
                                                        Address *
                                                    </label>
                                                    <textarea
                                                        name="address"
                                                        rows="3"
                                                        className={`form-control ${
                                                            errors.address
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={formData.address}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="Your full address"
                                                    />
                                                    {errors.address && (
                                                        <div className="invalid-feedback">
                                                            {errors.address}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">
                                                        Contact Number *
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="contact_number"
                                                        className={`form-control ${
                                                            errors.contact_number
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        value={
                                                            formData.contact_number
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="+1234567890"
                                                    />
                                                    {errors.contact_number && (
                                                        <div className="invalid-feedback">
                                                            {
                                                                errors.contact_number
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">
                                                        Profile Picture
                                                        (Optional)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        id="profile_picture"
                                                        accept="image/*"
                                                        className="form-control"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />
                                                    <small className="text-muted">
                                                        Max 2MB, JPEG/PNG only
                                                    </small>
                                                </div>
                                                {previewImage && (
                                                    <div className="col-12 text-center">
                                                        <div className="position-relative d-inline-block">
                                                            <img
                                                                src={
                                                                    previewImage
                                                                }
                                                                alt="Preview"
                                                                className="rounded-circle"
                                                                style={{
                                                                    width: "80px",
                                                                    height: "80px",
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    removeImage
                                                                }
                                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.general && (
                                                <div className="alert alert-danger mt-3">
                                                    {errors.general}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="d-flex justify-content-between mt-4">
                                        {step > 1 ? (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() =>
                                                    setStep(step - 1)
                                                }
                                                disabled={loading}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Previous
                                            </button>
                                        ) : (
                                            <div></div>
                                        )}

                                        {step < 3 ? (
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleNext}
                                                disabled={loading}
                                            >
                                                Next
                                                <i className="fas fa-arrow-right ms-2"></i>
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-check me-2"></i>
                                                        Create Account
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            <div className="card-footer bg-light text-center py-3">
                                <small className="text-muted">
                                    Already have an account?
                                    <Link
                                        to="/login"
                                        className="text-primary text-decoration-none ms-1"
                                    >
                                        Sign in
                                    </Link>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

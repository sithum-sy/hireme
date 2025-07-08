import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LocationSelector from "../components/map/LocationSelector";

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
        // Add provider-specific fields
        business_name: "",
        years_of_experience: "",
        service_area_radius: "",
        bio: "",
        service_categories: [],
        business_license: null,
        certifications: [],
        portfolio_images: [],
        service_location: null,
    });

    // Add new state for file previews
    const [documentPreviews, setDocumentPreviews] = useState({
        business_license: null,
        certifications: [],
        portfolio_images: [],
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // const handleFileChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         setFormData((prev) => ({ ...prev, profile_picture: file }));
    //         const reader = new FileReader();
    //         reader.onload = (e) => setPreviewImage(e.target.result);
    //         reader.readAsDataURL(file);
    //     }
    // };
    const prepareFormDataForSubmit = () => {
        const submitData = new FormData();

        // Add text fields
        Object.keys(formData).forEach((key) => {
            if (key === "service_categories" && Array.isArray(formData[key])) {
                formData[key].forEach((category, index) => {
                    submitData.append(`service_categories[${index}]`, category);
                });
            } else if (
                ![
                    "profile_picture",
                    "business_license",
                    "certifications",
                    "portfolio_images",
                ].includes(key)
            ) {
                submitData.append(key, formData[key]);
            }
        });

        // Add files
        if (formData.profile_picture) {
            submitData.append("profile_picture", formData.profile_picture);
        }

        if (formData.business_license) {
            submitData.append("business_license", formData.business_license);
        }

        formData.certifications.forEach((file, index) => {
            submitData.append(`certifications[${index}]`, file);
        });

        formData.portfolio_images.forEach((file, index) => {
            submitData.append(`portfolio_images[${index}]`, file);
        });

        return submitData;
    };

    const handleDocumentUpload = (e, type) => {
        const files = Array.from(e.target.files);

        if (type === "business_license") {
            const file = files[0];
            if (file) {
                setFormData((prev) => ({ ...prev, business_license: file }));
                setDocumentPreviews((prev) => ({
                    ...prev,
                    business_license: file.name,
                }));
            }
        } else if (type === "certifications") {
            setFormData((prev) => ({
                ...prev,
                certifications: [...prev.certifications, ...files],
            }));
            setDocumentPreviews((prev) => ({
                ...prev,
                certifications: [
                    ...prev.certifications,
                    ...files.map((f) => f.name),
                ],
            }));
        } else if (type === "portfolio_images") {
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setDocumentPreviews((prev) => ({
                        ...prev,
                        portfolio_images: [
                            ...prev.portfolio_images,
                            e.target.result,
                        ],
                    }));
                };
                reader.readAsDataURL(file);
            });
            setFormData((prev) => ({
                ...prev,
                portfolio_images: [...prev.portfolio_images, ...files],
            }));
        }
    };

    const removeDocument = (type, index = null) => {
        if (type === "business_license") {
            setFormData((prev) => ({ ...prev, business_license: null }));
            setDocumentPreviews((prev) => ({
                ...prev,
                business_license: null,
            }));
            document.getElementById("business_license").value = "";
        } else if (type === "certifications" && index !== null) {
            setFormData((prev) => ({
                ...prev,
                certifications: prev.certifications.filter(
                    (_, i) => i !== index
                ),
            }));
            setDocumentPreviews((prev) => ({
                ...prev,
                certifications: prev.certifications.filter(
                    (_, i) => i !== index
                ),
            }));
        } else if (type === "portfolio_images" && index !== null) {
            setFormData((prev) => ({
                ...prev,
                portfolio_images: prev.portfolio_images.filter(
                    (_, i) => i !== index
                ),
            }));
            setDocumentPreviews((prev) => ({
                ...prev,
                portfolio_images: prev.portfolio_images.filter(
                    (_, i) => i !== index
                ),
            }));
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

            // Provider-specific validation
            if (formData.role === "service_provider") {
                if (!formData.years_of_experience)
                    newErrors.years_of_experience = "Experience is required";
                if (!formData.service_area_radius)
                    newErrors.service_area_radius = "Service area is required";
                if (!formData.bio || formData.bio.length < 50)
                    newErrors.bio = "Bio must be at least 50 characters";
                if (
                    !formData.service_categories ||
                    formData.service_categories.length === 0
                ) {
                    newErrors.service_categories =
                        "Please select at least one service category";
                }
                // File size validation
                if (
                    formData.business_license &&
                    formData.business_license.size > 5 * 1024 * 1024
                ) {
                    newErrors.business_license =
                        "Business license must be under 5MB";
                }

                if (
                    formData.certifications.some(
                        (file) => file.size > 5 * 1024 * 1024
                    )
                ) {
                    newErrors.certifications =
                        "Each certification file must be under 5MB";
                }

                if (
                    formData.portfolio_images.some(
                        (file) => file.size > 2 * 1024 * 1024
                    )
                ) {
                    newErrors.portfolio_images =
                        "Each portfolio image must be under 2MB";
                }

                if (formData.portfolio_images.length > 10) {
                    newErrors.portfolio_images =
                        "Maximum 10 portfolio images allowed";
                }
                if (!formData.service_location) {
                    newErrors.service_location =
                        "Please select your service area";
                }
            }
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

        const submitData =
            formData.role === "service_provider"
                ? prepareFormDataForSubmit()
                : formData;

        const result = await register(submitData);
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
                                                : formData.role ===
                                                  "service_provider"
                                                ? "Contact & Professional Info"
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
                                            {formData.role ===
                                                "service_provider" && (
                                                <div className="provider-section mt-4 p-3 bg-light rounded">
                                                    <h6 className="fw-bold mb-3 text-success">
                                                        <i className="fas fa-briefcase me-2"></i>
                                                        Professional Information
                                                    </h6>

                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <label className="form-label">
                                                                Business Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="business_name"
                                                                className="form-control"
                                                                value={
                                                                    formData.business_name
                                                                }
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                                placeholder="Your business name (optional)"
                                                            />
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label className="form-label">
                                                                Years of
                                                                Experience *
                                                            </label>
                                                            <select
                                                                name="years_of_experience"
                                                                className={`form-control ${
                                                                    errors.years_of_experience
                                                                        ? "is-invalid"
                                                                        : ""
                                                                }`}
                                                                value={
                                                                    formData.years_of_experience
                                                                }
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select
                                                                    experience
                                                                </option>
                                                                <option value="0">
                                                                    Less than 1
                                                                    year
                                                                </option>
                                                                <option value="1">
                                                                    1-2 years
                                                                </option>
                                                                <option value="3">
                                                                    3-5 years
                                                                </option>
                                                                <option value="6">
                                                                    6-10 years
                                                                </option>
                                                                <option value="11">
                                                                    10+ years
                                                                </option>
                                                            </select>
                                                            {errors.years_of_experience && (
                                                                <div className="invalid-feedback">
                                                                    {
                                                                        errors.years_of_experience
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label className="form-label">
                                                                Service Area *
                                                            </label>
                                                            <select
                                                                name="service_area_radius"
                                                                className={`form-control ${
                                                                    errors.service_area_radius
                                                                        ? "is-invalid"
                                                                        : ""
                                                                }`}
                                                                value={
                                                                    formData.service_area_radius
                                                                }
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select
                                                                    radius
                                                                </option>
                                                                <option value="5">
                                                                    5 km radius
                                                                </option>
                                                                <option value="10">
                                                                    10 km radius
                                                                </option>
                                                                <option value="25">
                                                                    25 km radius
                                                                </option>
                                                                <option value="50">
                                                                    50 km radius
                                                                </option>
                                                            </select>
                                                            {errors.service_area_radius && (
                                                                <div className="invalid-feedback">
                                                                    {
                                                                        errors.service_area_radius
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label className="form-label">
                                                                Service
                                                                Categories *
                                                            </label>
                                                            <div className="category-quick-select">
                                                                {[
                                                                    "Healthcare",
                                                                    "Tutoring",
                                                                    "Home Services",
                                                                    "Cleaning",
                                                                ].map(
                                                                    (
                                                                        cat,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="form-check form-check-inline"
                                                                        >
                                                                            <input
                                                                                className="form-check-input"
                                                                                type="checkbox"
                                                                                id={`cat-${index}`}
                                                                                onChange={(
                                                                                    e
                                                                                ) => {
                                                                                    const value =
                                                                                        index +
                                                                                        1; // Assuming IDs 1-4
                                                                                    const newCategories =
                                                                                        e
                                                                                            .target
                                                                                            .checked
                                                                                            ? [
                                                                                                  ...formData.service_categories,
                                                                                                  value,
                                                                                              ]
                                                                                            : formData.service_categories.filter(
                                                                                                  (
                                                                                                      id
                                                                                                  ) =>
                                                                                                      id !==
                                                                                                      value
                                                                                              );
                                                                                    setFormData(
                                                                                        (
                                                                                            prev
                                                                                        ) => ({
                                                                                            ...prev,
                                                                                            service_categories:
                                                                                                newCategories,
                                                                                        })
                                                                                    );
                                                                                }}
                                                                            />
                                                                            <label
                                                                                className="form-check-label small"
                                                                                htmlFor={`cat-${index}`}
                                                                            >
                                                                                {
                                                                                    cat
                                                                                }
                                                                            </label>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                            {errors.service_categories && (
                                                                <div className="text-danger small">
                                                                    {
                                                                        errors.service_categories
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col-12">
                                                            <label className="form-label">
                                                                Professional Bio
                                                                *
                                                            </label>
                                                            <textarea
                                                                name="bio"
                                                                rows="3"
                                                                className={`form-control ${
                                                                    errors.bio
                                                                        ? "is-invalid"
                                                                        : ""
                                                                }`}
                                                                value={
                                                                    formData.bio
                                                                }
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                                placeholder="Describe your experience and services (minimum 50 characters)"
                                                            />
                                                            <small className="text-muted">
                                                                {
                                                                    formData.bio
                                                                        .length
                                                                }
                                                                /50 minimum
                                                            </small>
                                                            {errors.bio && (
                                                                <div className="invalid-feedback">
                                                                    {errors.bio}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="col-12">
                                                            <hr className="my-3" />
                                                            <h6 className="fw-semibold mb-3 text-secondary">
                                                                <i className="fas fa-upload me-2"></i>
                                                                Documents &
                                                                Portfolio
                                                                (Optional)
                                                            </h6>
                                                        </div>

                                                        {/* Business License */}
                                                        <div className="col-md-6">
                                                            <label className="form-label">
                                                                Business License
                                                            </label>
                                                            <input
                                                                type="file"
                                                                id="business_license"
                                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                                className="form-control"
                                                                onChange={(e) =>
                                                                    handleDocumentUpload(
                                                                        e,
                                                                        "business_license"
                                                                    )
                                                                }
                                                            />
                                                            <small className="text-muted">
                                                                PDF, DOC, or
                                                                Image (Max 5MB)
                                                            </small>
                                                            {documentPreviews.business_license && (
                                                                <div className="mt-2">
                                                                    <div className="d-flex align-items-center bg-light p-2 rounded">
                                                                        <i className="fas fa-file-alt text-primary me-2"></i>
                                                                        <span className="small flex-grow-1">
                                                                            {
                                                                                documentPreviews.business_license
                                                                            }
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() =>
                                                                                removeDocument(
                                                                                    "business_license"
                                                                                )
                                                                            }
                                                                        >
                                                                            <i className="fas fa-times"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Certifications */}
                                                        <div className="col-md-6">
                                                            <label className="form-label">
                                                                Certifications
                                                            </label>
                                                            <input
                                                                type="file"
                                                                id="certifications"
                                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                                className="form-control"
                                                                multiple
                                                                onChange={(e) =>
                                                                    handleDocumentUpload(
                                                                        e,
                                                                        "certifications"
                                                                    )
                                                                }
                                                            />
                                                            <small className="text-muted">
                                                                Multiple files
                                                                allowed (Max 5MB
                                                                each)
                                                            </small>
                                                            {documentPreviews
                                                                .certifications
                                                                .length > 0 && (
                                                                <div className="mt-2">
                                                                    {documentPreviews.certifications.map(
                                                                        (
                                                                            fileName,
                                                                            index
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="d-flex align-items-center bg-light p-2 rounded mb-1"
                                                                            >
                                                                                <i className="fas fa-certificate text-warning me-2"></i>
                                                                                <span className="small flex-grow-1">
                                                                                    {
                                                                                        fileName
                                                                                    }
                                                                                </span>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-outline-danger"
                                                                                    onClick={() =>
                                                                                        removeDocument(
                                                                                            "certifications",
                                                                                            index
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <i className="fas fa-times"></i>
                                                                                </button>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Portfolio Images */}
                                                        <div className="col-12">
                                                            <label className="form-label">
                                                                Portfolio Images
                                                            </label>
                                                            <input
                                                                type="file"
                                                                id="portfolio_images"
                                                                accept="image/*"
                                                                className="form-control"
                                                                multiple
                                                                onChange={(e) =>
                                                                    handleDocumentUpload(
                                                                        e,
                                                                        "portfolio_images"
                                                                    )
                                                                }
                                                            />
                                                            <small className="text-muted">
                                                                Showcase your
                                                                work (Max 10
                                                                images, 2MB
                                                                each)
                                                            </small>
                                                            {documentPreviews
                                                                .portfolio_images
                                                                .length > 0 && (
                                                                <div className="mt-3">
                                                                    <div className="row g-2">
                                                                        {documentPreviews.portfolio_images.map(
                                                                            (
                                                                                imageSrc,
                                                                                index
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="col-3"
                                                                                >
                                                                                    <div className="position-relative">
                                                                                        <img
                                                                                            src={
                                                                                                imageSrc
                                                                                            }
                                                                                            alt={`Portfolio ${
                                                                                                index +
                                                                                                1
                                                                                            }`}
                                                                                            className="img-fluid rounded"
                                                                                            style={{
                                                                                                aspectRatio:
                                                                                                    "1/1",
                                                                                                objectFit:
                                                                                                    "cover",
                                                                                            }}
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle"
                                                                                            style={{
                                                                                                transform:
                                                                                                    "translate(25%, -25%)",
                                                                                            }}
                                                                                            onClick={() =>
                                                                                                removeDocument(
                                                                                                    "portfolio_images",
                                                                                                    index
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <i className="fas fa-times"></i>
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="form-label">
                                                                Service Area *
                                                            </label>
                                                            <LocationSelector
                                                                value={
                                                                    formData.service_location
                                                                }
                                                                onChange={(
                                                                    location
                                                                ) =>
                                                                    setFormData(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            service_location:
                                                                                location,
                                                                        })
                                                                    )
                                                                }
                                                                error={
                                                                    errors.service_location
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
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

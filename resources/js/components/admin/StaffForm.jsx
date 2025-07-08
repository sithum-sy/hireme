import React, { useState, useEffect } from "react";

const StaffForm = ({
    initialData = {},
    onSubmit = null,
    onCancel = null,
    loading = false,
    errors = {},
    mode = "create", // 'create' or 'edit'
    className = "",
}) => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password_confirmation: "",
        contact_number: "",
        address: "",
        date_of_birth: "",
        profile_picture: null,
    });

    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [changePassword, setChangePassword] = useState(mode === "create");

    // Initialize form data
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData({
                first_name: initialData.first_name || "",
                last_name: initialData.last_name || "",
                email: initialData.email || "",
                password: "",
                password_confirmation: "",
                contact_number: initialData.contact_number || "",
                address: initialData.address || "",
                date_of_birth: initialData.date_of_birth || "",
                profile_picture: null,
            });

            if (initialData.profile_picture) {
                setPreviewImage(initialData.profile_picture);
            }
        }
    }, [initialData]);

    // Update form errors from props
    useEffect(() => {
        setFormErrors(errors);
    }, [errors]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear specific field error when user starts typing
        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                setFormErrors((prev) => ({
                    ...prev,
                    profile_picture: "File size must be less than 2MB",
                }));
                return;
            }

            // Validate file type
            const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
            if (!allowedTypes.includes(file.type)) {
                setFormErrors((prev) => ({
                    ...prev,
                    profile_picture: "Only JPG, PNG, and GIF files are allowed",
                }));
                return;
            }

            setFormData((prev) => ({
                ...prev,
                profile_picture: file,
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);

            // Clear any previous errors
            setFormErrors((prev) => ({
                ...prev,
                profile_picture: "",
            }));
        }
    };

    const removeImage = () => {
        setFormData((prev) => ({
            ...prev,
            profile_picture: null,
        }));
        setPreviewImage(mode === "edit" ? initialData.profile_picture : null);
        // Clear file input
        const fileInput = document.getElementById("profile_picture");
        if (fileInput) fileInput.value = "";

        // Clear any errors
        setFormErrors((prev) => ({
            ...prev,
            profile_picture: "",
        }));
    };

    const validateForm = () => {
        const errors = {};

        // Required fields
        if (!formData.first_name.trim()) {
            errors.first_name = "First name is required";
        }

        if (!formData.last_name.trim()) {
            errors.last_name = "Last name is required";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Email is invalid";
        }

        // Password validation
        if (mode === "create" || changePassword) {
            if (!formData.password) {
                errors.password = "Password is required";
            } else if (formData.password.length < 8) {
                errors.password = "Password must be at least 8 characters";
            }

            if (formData.password !== formData.password_confirmation) {
                errors.password_confirmation = "Passwords do not match";
            }
        }

        // Optional validations
        if (
            formData.contact_number &&
            !/^[\+]?[1-9][\d]{0,15}$/.test(
                formData.contact_number.replace(/\s/g, "")
            )
        ) {
            errors.contact_number = "Invalid contact number format";
        }

        if (formData.date_of_birth) {
            const birthDate = new Date(formData.date_of_birth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 18) {
                errors.date_of_birth =
                    "Staff member must be at least 18 years old";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (onSubmit) {
            const submitData = new FormData();

            // Append form fields
            Object.keys(formData).forEach((key) => {
                if (key === "password" || key === "password_confirmation") {
                    // Only include password fields if creating or changing password
                    if (mode === "create" || changePassword) {
                        if (formData[key]) {
                            submitData.append(key, formData[key]);
                        }
                    }
                } else if (formData[key] !== null && formData[key] !== "") {
                    submitData.append(key, formData[key]);
                }
            });

            onSubmit(submitData);
        }
    };

    const generatePassword = () => {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData((prev) => ({
            ...prev,
            password: password,
            password_confirmation: password,
        }));
    };

    const resetForm = () => {
        if (mode === "create") {
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                password_confirmation: "",
                contact_number: "",
                address: "",
                date_of_birth: "",
                profile_picture: null,
            });
            setPreviewImage(null);
        } else {
            // Reset to initial data for edit mode
            setFormData({
                first_name: initialData.first_name || "",
                last_name: initialData.last_name || "",
                email: initialData.email || "",
                password: "",
                password_confirmation: "",
                contact_number: initialData.contact_number || "",
                address: initialData.address || "",
                date_of_birth: initialData.date_of_birth || "",
                profile_picture: null,
            });
            setPreviewImage(initialData.profile_picture || null);
            setChangePassword(false);
        }
        setFormErrors({});
    };

    return (
        <div className={`card border-0 shadow-sm ${className}`}>
            <div className="card-header bg-white border-bottom">
                <h5 className="card-title mb-0">
                    <i
                        className={`fas ${
                            mode === "create" ? "fa-user-plus" : "fa-edit"
                        } text-primary me-2`}
                    ></i>
                    {mode === "create"
                        ? "Create Staff Member"
                        : "Edit Staff Member"}
                </h5>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <h6 className="text-muted text-uppercase mb-3">
                                Personal Information
                            </h6>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">
                                First Name{" "}
                                <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control ${
                                    formErrors.first_name ? "is-invalid" : ""
                                }`}
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                placeholder="Enter first name"
                                disabled={loading}
                            />
                            {formErrors.first_name && (
                                <div className="invalid-feedback">
                                    {formErrors.first_name}
                                </div>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">
                                Last Name <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control ${
                                    formErrors.last_name ? "is-invalid" : ""
                                }`}
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                placeholder="Enter last name"
                                disabled={loading}
                            />
                            {formErrors.last_name && (
                                <div className="invalid-feedback">
                                    {formErrors.last_name}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <h6 className="text-muted text-uppercase mb-3">
                                Contact Information
                            </h6>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">
                                Email Address{" "}
                                <span className="text-danger">*</span>
                            </label>
                            <input
                                type="email"
                                className={`form-control ${
                                    formErrors.email ? "is-invalid" : ""
                                }`}
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                disabled={loading}
                            />
                            {formErrors.email && (
                                <div className="invalid-feedback">
                                    {formErrors.email}
                                </div>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Contact Number</label>
                            <input
                                type="tel"
                                className={`form-control ${
                                    formErrors.contact_number
                                        ? "is-invalid"
                                        : ""
                                }`}
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleInputChange}
                                placeholder="Enter contact number"
                                disabled={loading}
                            />
                            {formErrors.contact_number && (
                                <div className="invalid-feedback">
                                    {formErrors.contact_number}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address & Date of Birth */}
                    <div className="row mb-4">
                        <div className="col-md-8">
                            <label className="form-label">Address</label>
                            <textarea
                                className="form-control"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Enter full address"
                                disabled={loading}
                            ></textarea>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Date of Birth</label>
                            <input
                                type="date"
                                className={`form-control ${
                                    formErrors.date_of_birth ? "is-invalid" : ""
                                }`}
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            {formErrors.date_of_birth && (
                                <div className="invalid-feedback">
                                    {formErrors.date_of_birth}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Profile Picture */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <h6 className="text-muted text-uppercase mb-3">
                                Profile Picture
                            </h6>
                        </div>
                        <div className="col-md-4">
                            <div className="text-center">
                                {previewImage ? (
                                    <div className="position-relative d-inline-block">
                                        <img
                                            src={previewImage}
                                            alt="Profile Preview"
                                            className="rounded-circle"
                                            style={{
                                                width: "120px",
                                                height: "120px",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle"
                                            onClick={removeImage}
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                            }}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                        }}
                                    >
                                        <i className="fas fa-user fa-3x text-muted"></i>
                                    </div>
                                )}
                                <div className="mt-3">
                                    <input
                                        type="file"
                                        id="profile_picture"
                                        className="d-none"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    "profile_picture"
                                                )
                                                .click()
                                        }
                                        disabled={loading}
                                    >
                                        <i className="fas fa-upload me-2"></i>
                                        Choose Photo
                                    </button>
                                    <div className="mt-2">
                                        <small className="text-muted">
                                            JPG, PNG or GIF (max 2MB)
                                        </small>
                                    </div>
                                    {formErrors.profile_picture && (
                                        <div className="text-danger mt-1">
                                            <small>
                                                {formErrors.profile_picture}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="text-muted text-uppercase mb-0">
                                    {mode === "create"
                                        ? "Account Security"
                                        : "Password Settings"}
                                </h6>
                                {mode === "edit" && (
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="changePasswordSwitch"
                                            checked={changePassword}
                                            onChange={(e) => {
                                                setChangePassword(
                                                    e.target.checked
                                                );
                                                if (!e.target.checked) {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        password: "",
                                                        password_confirmation:
                                                            "",
                                                    }));
                                                    setFormErrors((prev) => ({
                                                        ...prev,
                                                        password: "",
                                                        password_confirmation:
                                                            "",
                                                    }));
                                                }
                                            }}
                                            disabled={loading}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="changePasswordSwitch"
                                        >
                                            Change Password
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(mode === "create" || changePassword) && (
                            <>
                                <div className="col-md-6">
                                    <label className="form-label">
                                        {mode === "create"
                                            ? "Password"
                                            : "New Password"}{" "}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            className={`form-control ${
                                                formErrors.password
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder={
                                                mode === "create"
                                                    ? "Enter password"
                                                    : "Enter new password"
                                            }
                                            disabled={loading}
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            disabled={loading}
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
                                    {formErrors.password && (
                                        <div className="invalid-feedback d-block">
                                            {formErrors.password}
                                        </div>
                                    )}
                                    <small className="text-muted">
                                        Minimum 8 characters
                                    </small>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Confirm Password{" "}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            className={`form-control ${
                                                formErrors.password_confirmation
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            name="password_confirmation"
                                            value={
                                                formData.password_confirmation
                                            }
                                            onChange={handleInputChange}
                                            placeholder="Confirm password"
                                            disabled={loading}
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            disabled={loading}
                                        >
                                            <i
                                                className={`fas ${
                                                    showConfirmPassword
                                                        ? "fa-eye-slash"
                                                        : "fa-eye"
                                                }`}
                                            ></i>
                                        </button>
                                    </div>
                                    {formErrors.password_confirmation && (
                                        <div className="invalid-feedback d-block">
                                            {formErrors.password_confirmation}
                                        </div>
                                    )}
                                </div>
                                <div className="col-12 mt-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={generatePassword}
                                        disabled={loading}
                                    >
                                        <i className="fas fa-key me-1"></i>
                                        Generate Secure Password
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="d-flex justify-content-between">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={resetForm}
                            disabled={loading}
                        >
                            <i className="fas fa-undo me-2"></i>
                            Reset Form
                        </button>

                        <div className="d-flex gap-2">
                            {onCancel && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        {mode === "create"
                                            ? "Creating..."
                                            : "Updating..."}
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save me-2"></i>
                                        {mode === "create"
                                            ? "Create Staff Member"
                                            : "Update Staff Member"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Form Guidelines */}
            <div className="card-footer bg-light">
                <div className="row">
                    <div className="col-md-6">
                        <h6 className="text-muted mb-2">
                            <i className="fas fa-info-circle me-1"></i>
                            Guidelines
                        </h6>
                        <ul className="list-unstyled small text-muted">
                            <li>
                                <i className="fas fa-check text-success me-2"></i>
                                Use a professional email address
                            </li>
                            <li>
                                <i className="fas fa-check text-success me-2"></i>
                                Password must be at least 8 characters
                            </li>
                            <li>
                                <i className="fas fa-check text-success me-2"></i>
                                Profile picture should be professional
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-6">
                        <h6 className="text-muted mb-2">
                            <i className="fas fa-lightbulb me-1"></i>
                            Tips
                        </h6>
                        <ul className="list-unstyled small text-muted">
                            <li>
                                <i className="fas fa-check text-info me-2"></i>
                                Staff will receive login credentials via email
                            </li>
                            <li>
                                <i className="fas fa-check text-info me-2"></i>
                                Use the password generator for security
                            </li>
                            <li>
                                <i className="fas fa-check text-info me-2"></i>
                                All fields can be updated later
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffForm;

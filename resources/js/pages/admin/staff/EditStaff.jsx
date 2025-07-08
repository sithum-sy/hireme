import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdmin } from "../../../context/AdminContext";
import AdminLayout from "../../../components/AdminLayout";

const EditStaff = () => {
    const { id } = useParams();
    const { updateStaff, getStaffById, errors, isProcessing } = useAdmin();
    const navigate = useNavigate();

    const [staffMember, setStaffMember] = useState(null);
    const [loading, setLoading] = useState(true);
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
    const [changePassword, setChangePassword] = useState(false);

    useEffect(() => {
        loadStaffData();
    }, [id]);

    const loadStaffData = async () => {
        try {
            setLoading(true);
            const staff = await getStaffById(id);
            setStaffMember(staff);

            // Populate form with existing data
            setFormData({
                first_name: staff.first_name || "",
                last_name: staff.last_name || "",
                email: staff.email || "",
                password: "",
                password_confirmation: "",
                contact_number: staff.contact_number || "",
                address: staff.address || "",
                date_of_birth: staff.date_of_birth || "",
                profile_picture: null,
            });

            if (staff.profile_picture) {
                setPreviewImage(staff.profile_picture);
            }
        } catch (error) {
            console.error("Failed to load staff data:", error);
            navigate("/admin/staff");
        } finally {
            setLoading(false);
        }
    };

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
        }
    };

    const removeImage = () => {
        setFormData((prev) => ({
            ...prev,
            profile_picture: null,
        }));
        setPreviewImage(staffMember.profile_picture);
        // Clear file input
        const fileInput = document.getElementById("profile_picture");
        if (fileInput) fileInput.value = "";
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

        // Password validation only if changing password
        if (changePassword) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const staffData = new FormData();

            // Append form fields (excluding password fields if not changing password)
            Object.keys(formData).forEach((key) => {
                if (key === "password" || key === "password_confirmation") {
                    if (changePassword && formData[key]) {
                        staffData.append(key, formData[key]);
                    }
                } else if (formData[key] !== null && formData[key] !== "") {
                    staffData.append(key, formData[key]);
                }
            });

            const updatedStaff = await updateStaff(id, staffData);

            // Navigate to staff details page
            navigate(`/admin/staff/${id}`, {
                state: { message: "Staff member updated successfully!" },
            });
        } catch (error) {
            console.error("Failed to update staff:", error);
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

    if (loading) {
        return (
            <AdminLayout>
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: "400px" }}
                >
                    <div className="text-center">
                        <div
                            className="spinner-border text-primary mb-3"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h5>Loading staff data...</h5>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!staffMember) {
        return (
            <AdminLayout>
                <div className="text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h4>Staff Member Not Found</h4>
                    <p className="text-muted">
                        The staff member you're looking for doesn't exist.
                    </p>
                    <Link to="/admin/staff" className="btn btn-primary">
                        Back to Staff List
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1">Edit Staff Member</h1>
                    <p className="text-muted mb-0">
                        Update {staffMember.full_name}'s information
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Link
                        to={`/admin/staff/${id}`}
                        className="btn btn-outline-info"
                    >
                        <i className="fas fa-eye me-2"></i>
                        View Details
                    </Link>
                    <Link
                        to="/admin/staff"
                        className="btn btn-outline-secondary"
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Staff List
                    </Link>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    {/* Main Form */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="card-title mb-0">
                                <i className="fas fa-edit text-primary me-2"></i>
                                Staff Information
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
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                formErrors.first_name
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            placeholder="Enter first name"
                                        />
                                        {formErrors.first_name && (
                                            <div className="invalid-feedback">
                                                {formErrors.first_name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Last Name{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                formErrors.last_name
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            placeholder="Enter last name"
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
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            className={`form-control ${
                                                formErrors.email
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter email address"
                                        />
                                        {formErrors.email && (
                                            <div className="invalid-feedback">
                                                {formErrors.email}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Contact Number
                                        </label>
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
                                        <label className="form-label">
                                            Address
                                        </label>
                                        <textarea
                                            className="form-control"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="3"
                                            placeholder="Enter full address"
                                        ></textarea>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            className={`form-control ${
                                                formErrors.date_of_birth
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleInputChange}
                                        />
                                        {formErrors.date_of_birth && (
                                            <div className="invalid-feedback">
                                                {formErrors.date_of_birth}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="text-muted text-uppercase mb-0">
                                                Password Settings
                                            </h6>
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
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    password:
                                                                        "",
                                                                    password_confirmation:
                                                                        "",
                                                                })
                                                            );
                                                        }
                                                    }}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="changePasswordSwitch"
                                                >
                                                    Change Password
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {changePassword && (
                                        <>
                                            <div className="col-md-6">
                                                <label className="form-label">
                                                    New Password{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
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
                                                        value={
                                                            formData.password
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="Enter new password"
                                                    />
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
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
                                                    Confirm New Password{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
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
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="Confirm new password"
                                                    />
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
                                                        onClick={() =>
                                                            setShowConfirmPassword(
                                                                !showConfirmPassword
                                                            )
                                                        }
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
                                                        {
                                                            formErrors.password_confirmation
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-12 mt-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={generatePassword}
                                                >
                                                    <i className="fas fa-key me-1"></i>
                                                    Generate Secure Password
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="d-flex justify-content-end gap-2">
                                    <Link
                                        to={`/admin/staff/${id}`}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>
                                                Update Staff Member
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Current Staff Info */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-bottom">
                            <h6 className="card-title mb-0">
                                Current Information
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="text-center mb-3">
                                {staffMember.profile_picture ? (
                                    <img
                                        src={staffMember.profile_picture}
                                        alt={staffMember.full_name}
                                        className="rounded-circle"
                                        style={{
                                            width: "80px",
                                            height: "80px",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto"
                                        style={{
                                            width: "80px",
                                            height: "80px",
                                        }}
                                    >
                                        <i className="fas fa-user fa-2x text-primary"></i>
                                    </div>
                                )}
                                <h6 className="mt-2 mb-1">
                                    {staffMember.full_name}
                                </h6>
                                <small className="text-muted">
                                    {staffMember.email}
                                </small>
                            </div>

                            <div className="row g-2">
                                <div className="col-6">
                                    <small className="text-muted d-block">
                                        Status
                                    </small>
                                    <span
                                        className={`badge ${
                                            staffMember.is_active
                                                ? "bg-success"
                                                : "bg-secondary"
                                        }`}
                                    >
                                        {staffMember.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </div>
                                <div className="col-6">
                                    <small className="text-muted d-block">
                                        Last Login
                                    </small>
                                    <small>
                                        {staffMember.last_login_human ||
                                            "Never"}
                                    </small>
                                </div>
                                <div className="col-12 mt-2">
                                    <small className="text-muted d-block">
                                        Created
                                    </small>
                                    <small>
                                        {new Date(
                                            staffMember.created_at
                                        ).toLocaleDateString()}
                                    </small>
                                </div>
                                {staffMember.creator_name && (
                                    <div className="col-12">
                                        <small className="text-muted d-block">
                                            Created By
                                        </small>
                                        <small>
                                            {staffMember.creator_name}
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Picture Update */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white border-bottom">
                            <h6 className="card-title mb-0">
                                Update Profile Picture
                            </h6>
                        </div>
                        <div className="card-body text-center">
                            <div className="mb-3">
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
                                        {formData.profile_picture && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle"
                                                onClick={removeImage}
                                                style={{
                                                    width: "30px",
                                                    height: "30px",
                                                }}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        )}
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
                            </div>
                            <input
                                type="file"
                                id="profile_picture"
                                className="d-none"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() =>
                                    document
                                        .getElementById("profile_picture")
                                        .click()
                                }
                            >
                                <i className="fas fa-upload me-2"></i>
                                {formData.profile_picture
                                    ? "Change Photo"
                                    : "Upload New Photo"}
                            </button>
                            <div className="mt-2">
                                <small className="text-muted">
                                    JPG, PNG or GIF (max 2MB)
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h6 className="card-title mb-0">Quick Actions</h6>
                        </div>
                        <div className="card-body">
                            <div className="d-grid gap-2">
                                <Link
                                    to={`/admin/staff/${id}`}
                                    className="btn btn-outline-info"
                                >
                                    <i className="fas fa-eye me-2"></i>
                                    View Full Details
                                </Link>
                                <Link
                                    to="/admin/staff"
                                    className="btn btn-outline-primary"
                                >
                                    <i className="fas fa-list me-2"></i>
                                    Back to Staff List
                                </Link>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={loadStaffData}
                                >
                                    <i className="fas fa-undo me-2"></i>
                                    Reset Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="card border-0 shadow-sm mt-4">
                        <div className="card-header bg-white border-bottom">
                            <h6 className="card-title mb-0">
                                <i className="fas fa-info-circle text-info me-2"></i>
                                Update Guidelines
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="list-group list-group-flush">
                                <div className="list-group-item border-0 px-0 py-2">
                                    <div className="d-flex">
                                        <i className="fas fa-check text-success me-2 mt-1"></i>
                                        <small>
                                            Email changes require verification
                                        </small>
                                    </div>
                                </div>
                                <div className="list-group-item border-0 px-0 py-2">
                                    <div className="d-flex">
                                        <i className="fas fa-check text-success me-2 mt-1"></i>
                                        <small>
                                            Password changes are optional
                                        </small>
                                    </div>
                                </div>
                                <div className="list-group-item border-0 px-0 py-2">
                                    <div className="d-flex">
                                        <i className="fas fa-check text-success me-2 mt-1"></i>
                                        <small>
                                            Staff will be notified of changes
                                        </small>
                                    </div>
                                </div>
                                <div className="list-group-item border-0 px-0 py-2">
                                    <div className="d-flex">
                                        <i className="fas fa-check text-success me-2 mt-1"></i>
                                        <small>
                                            Profile picture updates are instant
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EditStaff;

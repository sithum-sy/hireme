// components/auth/RegisterForm.jsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";
import StepIndicator from "./StepIndicator";
import RoleSelection from "./steps/RoleSelection";
import PersonalInfo from "./steps/PersonalInfo";
import ContactAndProfessional from "./steps/ContactAndProfessional";
import NavigationButtons from "../ui/NavigationButtons";

const RegisterForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { register, loading } = useAuth();

    // State Management
    const [step, setStep] = useState(1);
    const [subStep, setSubStep] = useState(1); // For provider sub-steps in step 3
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
        // Provider-specific fields
        business_name: "",
        years_of_experience: "",
        bio: "",
        business_license: null,
        certifications: [],
        portfolio_images: [],
    });

    const [documentPreviews, setDocumentPreviews] = useState({
        business_license: null,
        certifications: [],
        portfolio_images: [],
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    // Form Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleRoleSelect = (role) => {
        setFormData((prev) => ({ ...prev, role }));
        if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
    };

    const handleFileChange = (file) => {
        if (file) {
            setFormData((prev) => ({ ...prev, profile_picture: file }));
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDocumentUpload = (files, type) => {
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

    const handleRemoveDocument = (type, index = null) => {
        if (type === "business_license") {
            setFormData((prev) => ({ ...prev, business_license: null }));
            setDocumentPreviews((prev) => ({
                ...prev,
                business_license: null,
            }));
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

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, profile_picture: null }));
        setPreviewImage(null);
    };

    // Validation
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
            } else {
                // Check if user is at least 18 years old
                const birthDate = new Date(formData.date_of_birth);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (
                    monthDiff < 0 ||
                    (monthDiff === 0 && today.getDate() < birthDate.getDate())
                ) {
                    age--;
                }

                if (age < 18) {
                    newErrors.date_of_birth =
                        "You must be at least 18 years old to register";
                }
            }
        }

        if (stepNumber === 3) {
            // Always validate contact information first
            if (!formData.address.trim())
                newErrors.address = "Address is required";
            if (!formData.contact_number.trim())
                newErrors.contact_number = "Contact number is required";

            // Profile picture validation for all users
            if (
                formData.profile_picture &&
                formData.profile_picture.size > 2 * 1024 * 1024
            ) {
                newErrors.profile_picture = "Profile picture must be under 2MB";
            }

            // For providers, validate based on current sub-step
            if (formData.role === "service_provider") {
                if (subStep === 2) {
                    // Professional info validation
                    if (!formData.years_of_experience)
                        newErrors.years_of_experience =
                            "Experience is required";
                    if (!formData.bio || formData.bio.length < 50)
                        newErrors.bio = "Bio must be at least 50 characters";
                } else if (subStep === 3) {
                    // Documents validation (all optional, but validate file sizes if present)
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
                }
            }
        }

        return newErrors;
    };

    // Navigation
    const handleNext = (e) => {
        e.preventDefault();
        console.log("Moving from step", step, "sub-step", subStep); // Debug log

        // For step 3 providers, handle sub-steps
        if (step === 3 && formData.role === "service_provider") {
            if (subStep === 1) {
                // Validate contact section first
                const contactErrors = {};
                if (!formData.address.trim())
                    contactErrors.address = "Address is required";
                if (!formData.contact_number.trim())
                    contactErrors.contact_number = "Contact number is required";
                if (
                    formData.profile_picture &&
                    formData.profile_picture.size > 2 * 1024 * 1024
                ) {
                    contactErrors.profile_picture =
                        "Profile picture must be under 2MB";
                }

                if (Object.keys(contactErrors).length > 0) {
                    setErrors(contactErrors);
                    return;
                }
                setErrors({});
                setSubStep(2); // Move to professional info sub-step
                return;
            } else if (subStep === 2) {
                // Validate professional section
                const professionalErrors = {};
                if (!formData.years_of_experience)
                    professionalErrors.years_of_experience =
                        "Experience is required";
                if (!formData.bio || formData.bio.length < 50)
                    professionalErrors.bio =
                        "Bio must be at least 50 characters";

                if (Object.keys(professionalErrors).length > 0) {
                    setErrors(professionalErrors);
                    return;
                }
                setErrors({});
                setSubStep(3); // Move to documents sub-step
                return;
            }
            // If subStep === 3, validate documents (optional) and submit
        }

        const stepErrors = validateStep(step);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setErrors({});
        setStep(step + 1);
    };

    const handlePrevious = (e) => {
        e.preventDefault();
        console.log("Moving from step", step, "sub-step", subStep); // Debug log

        // For step 3 providers, handle sub-step navigation
        if (step === 3 && formData.role === "service_provider") {
            if (subStep === 2) {
                setSubStep(1); // Go back to contact
                return;
            } else if (subStep === 3) {
                setSubStep(2); // Go back to professional
                return;
            }
        }

        // Reset sub-step when going to previous main step
        setSubStep(1);
        setStep(step - 1);
    };

    // Form Submission
    const prepareFormDataForSubmit = () => {
        const submitData = new FormData();

        // Add text fields
        Object.keys(formData).forEach((key) => {
            if (
                ![
                    "profile_picture",
                    "business_license",
                    "certifications",
                    "portfolio_images",
                ].includes(key)
            ) {
                submitData.append(key, formData[key] || "");
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

    // Check if we need to use FormData (if any files are present)
    const hasFiles = () => {
        return (
            formData.profile_picture ||
            formData.business_license ||
            formData.certifications.length > 0 ||
            formData.portfolio_images.length > 0
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const stepErrors = validateStep(3); // Always validate step 3 for submission
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }

        // const submitData =
        //     formData.role === "service_provider"
        //         ? prepareFormDataForSubmit()
        //         : formData;
        // const submitData = hasFiles() ? prepareFormDataForSubmit() : formData;
        const submitData = prepareFormDataForSubmit();

        const result = await register(submitData);
        if (result.success) {
            if (result.requires_verification) {
                // Show success message and redirect to login with verification message
                navigate("/login", {
                    state: {
                        message:
                            result.message ||
                            "Registration successful! Please check your email to verify your account before logging in.",
                        type: "success",
                        email: result.user.email,
                    },
                });
            } else {
                // Normal registration with immediate login (shouldn't happen now)
                navigate(
                    result.user.role === "client"
                        ? "/client/dashboard"
                        : "/provider/dashboard"
                );
            }
        } else {
            setErrors(result.errors || { general: result.message });
        }
    };

    // Step Labels
    const getStepLabels = () => {
        const labels = ["Choose Role", "Personal Info"];
        if (formData.role === "service_provider") {
            labels.push("Contact & Professional Info");
        } else {
            labels.push("Contact Details");
        }
        return labels;
    };

    // Get total steps based on role
    const getTotalSteps = () => {
        return 3; // Keep it at 3 steps for both roles as it was before
    };

    return (
        <AuthLayout showBranding={true}>
            <div className="register-form-container">
                {/* Header */}
                <div className="form-header">
                    <div className="logo-section">
                        <div className="logo-icon">
                            <img
                                src="/images/hireme-logo.png"
                                alt="HireMe"
                                className="logo-img"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                }}
                            />
                            <div
                                className="logo-fallback"
                                style={{ display: "none" }}
                            >
                                <div className="logo-icon">
                                    <i className="fas fa-handshake fa-2x"></i>
                                </div>
                                <span className="logo-text">HireMe</span>
                            </div>
                        </div>
                    </div>
                    <div className="header-text">
                        <h2 className="form-title">Create your account</h2>
                        <p className="form-subtitle">
                            Join our community of professionals
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="form-card">
                    <StepIndicator
                        currentStep={step}
                        totalSteps={getTotalSteps()}
                        stepLabels={getStepLabels()}
                    />

                    <form onSubmit={handleSubmit} className="register-form">
                        {/* General Error */}
                        {errors.general && (
                            <div className="auth-alert danger">
                                <i className="fas fa-exclamation-triangle"></i>
                                {errors.general}
                            </div>
                        )}

                        {/* Current Step Content */}
                        <div className="step-content">
                            {/* Step 1: Role Selection */}
                            {step === 1 ? (
                                <div className="step-container active-step">
                                    <RoleSelection
                                        selectedRole={formData.role}
                                        onRoleSelect={handleRoleSelect}
                                        error={errors.role}
                                    />
                                </div>
                            ) : null}

                            {/* Step 2: Personal Info */}
                            {step === 2 ? (
                                <div className="step-container active-step">
                                    <PersonalInfo
                                        formData={formData}
                                        onChange={handleInputChange}
                                        errors={errors}
                                        showPassword={showPassword}
                                        onTogglePassword={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    />
                                </div>
                            ) : null}

                            {/* Step 3: Contact & Professional */}
                            {step === 3 ? (
                                <div className="step-container active-step">
                                    <ContactAndProfessional
                                        formData={formData}
                                        onChange={handleInputChange}
                                        errors={errors}
                                        onFileChange={handleFileChange}
                                        onDocumentUpload={handleDocumentUpload}
                                        onRemoveDocument={handleRemoveDocument}
                                        previewImage={previewImage}
                                        onRemoveImage={handleRemoveImage}
                                        documentPreviews={documentPreviews}
                                        currentSubStep={subStep}
                                        onSubStepChange={setSubStep}
                                    />
                                </div>
                            ) : null}
                        </div>

                        {/* Navigation */}
                        <NavigationButtons
                            currentStep={step}
                            totalSteps={getTotalSteps()}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onSubmit={handleSubmit}
                            loading={loading}
                            isProvider={formData.role === "service_provider"}
                            currentSubStep={subStep}
                            isProviderSubStep={
                                step === 3 &&
                                formData.role === "service_provider"
                            }
                        />
                    </form>
                </div>

                {/* Footer */}
                <div className="form-footer">
                    <p>
                        Already have an account?{" "}
                        <a href="/login" className="login-link">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>

            <style jsx>{`
                .register-form-container {
                    width: 100%;
                    max-width: 460px;
                    animation: fadeInUp 0.6s ease-out;
                }

                .form-header {
                    text-align: center;
                    margin-bottom: 1.5rem;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                }

                .logo-icon {
                     {
                        /* width: 50px;
                    height: 50px; */
                    }
                    background: var(--primary-color);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
                }

                .logo-img {
                    height: 45px;
                    width: auto;
                    object-fit: contain;
                }

                .header-text {
                    margin-bottom: 0.5rem;
                }

                .form-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .form-subtitle {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    margin: 0;
                }

                .form-card {
                    background: var(--bg-white);
                    border-radius: 16px;
                    box-shadow: var(--shadow-xl);
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }

                .register-form {
                    width: 100%;
                }

                .general-error {
                    background: rgba(220, 38, 38, 0.1);
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    color: var(--danger-color);
                    padding: 0.875rem;
                    border-radius: 8px;
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: center;
                    font-size: 0.85rem;
                }

                .step-content {
                    margin-bottom: 0.75rem;
                    min-height: 400px;
                    position: relative;
                    overflow: hidden;
                }

                .step-container {
                    width: 100%;
                    display: none; /* Hide all steps by default */
                }

                .step-container.active-step {
                    display: block; /* Only show active step */
                    animation: fadeIn 0.3s ease-in-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .form-footer {
                    text-align: center;
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }

                .login-link {
                    color: var(--primary-color);
                    text-decoration: none;
                    font-weight: 500;
                }

                .login-link:hover {
                    color: var(--primary-hover);
                    text-decoration: underline;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .register-form-container {
                        max-width: none;
                        margin: 0;
                    }

                    .form-card {
                        margin: 0 1rem 1rem 1rem;
                        padding: 1.25rem;
                    }

                    .logo-icon {
                        width: 45px;
                        height: 45px;
                    }

                    .form-title {
                        font-size: 1.375rem;
                    }
                }

                @media (max-width: 576px) {
                    .form-card {
                        margin: 0 0.5rem 0.75rem 0.5rem;
                        padding: 1rem;
                    }

                    .logo-icon {
                        width: 40px;
                        height: 40px;
                    }

                    .form-title {
                        font-size: 1.25rem;
                    }

                    .form-subtitle {
                        font-size: 0.875rem;
                    }
                }
            `}</style>
        </AuthLayout>
    );
};

export default RegisterForm;

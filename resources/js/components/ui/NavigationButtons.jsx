import React from "react";

const NavigationButtons = ({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
    onSubmit,
    loading = false,
    disabled = false,
    isProviderSubStep = false,
    currentSubStep = 1,
    isProvider = false,
}) => {
    const isFirstStep = currentStep === 1;
    // For providers on step 3, only show "Create Account" when on sub-step 3
    const isLastStep = currentStep === totalSteps && (!isProvider || currentSubStep === 3);

    return (
        <div className="navigation-buttons">
            {!isFirstStep && (
                <button
                    type="button"
                    className="nav-btn secondary"
                    onClick={onPrevious}
                    disabled={loading || disabled}
                >
                    <i className="fas fa-arrow-left me-2"></i>
                    Previous
                </button>
            )}

            <div className="spacer"></div>

            {isLastStep ? (
                <button
                    type="submit"
                    className="nav-btn primary submit"
                    onClick={onSubmit}
                    disabled={loading || disabled}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Creating Account...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-check me-2"></i>
                            Create Account
                        </>
                    )}
                </button>
            ) : (
                <button
                    type="button"
                    className="nav-btn primary"
                    onClick={onNext}
                    disabled={loading || disabled}
                >
                    Next
                    <i className="fas fa-arrow-right ms-2"></i>
                </button>
            )}

            <style jsx>{`
                .navigation-buttons {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 2rem;
                    gap: 1rem;
                }

                .spacer {
                    flex: 1;
                }

                .nav-btn {
                    padding: 0.875rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    min-width: 120px;
                    justify-content: center;
                }

                .nav-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                }

                .nav-btn.secondary {
                    background: #f8f9fa;
                    color: #6b7280;
                    border: 2px solid #e5e7eb;
                }

                .nav-btn.secondary:hover:not(:disabled) {
                    background: #e5e7eb;
                    transform: translateY(-1px);
                }

                .nav-btn.primary {
                    background: linear-gradient(
                        135deg,
                        #4a90e2 0%,
                        #357abd 100%
                    );
                    color: white;
                }

                .nav-btn.primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
                }

                .nav-btn.submit {
                    background: linear-gradient(
                        135deg,
                        #10b981 0%,
                        #059669 100%
                    );
                    min-width: 160px;
                }

                .nav-btn.submit:hover:not(:disabled) {
                    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
                }

                .spinner {
                    width: 1rem;
                    height: 1rem;
                    border: 2px solid transparent;
                    border-top-color: currentColor;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-right: 0.5rem;
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (max-width: 576px) {
                    .navigation-buttons {
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .spacer {
                        display: none;
                    }

                    .nav-btn {
                        width: 100%;
                        min-width: unset;
                    }
                }
            `}</style>
        </div>
    );
};

export default NavigationButtons;

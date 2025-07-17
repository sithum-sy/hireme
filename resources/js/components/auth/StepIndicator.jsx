import React from "react";

const StepIndicator = ({ currentStep, totalSteps = 3, stepLabels }) => {
    const getStepLabel = (step) => {
        if (stepLabels && stepLabels[step - 1]) {
            return stepLabels[step - 1];
        }

        // Default labels
        const defaultLabels = [
            "Choose Role",
            "Personal Info",
            "Contact Details",
        ];
        return defaultLabels[step - 1];
    };

    return (
        <div className="step-indicator">
            <div className="steps-container">
                {Array.from({ length: totalSteps }, (_, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isActive = currentStep === stepNumber;

                    return (
                        <div key={stepNumber} className="step-item">
                            <div
                                className={`step-circle ${
                                    isCompleted ? "completed" : ""
                                } ${isActive ? "active" : ""}`}
                            >
                                {isCompleted ? (
                                    <i className="fas fa-check"></i>
                                ) : (
                                    stepNumber
                                )}
                            </div>
                            {stepNumber < totalSteps && (
                                <div
                                    className={`step-line ${
                                        isCompleted ? "completed" : ""
                                    }`}
                                ></div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="step-label">
                <small>
                    Step {currentStep} of {totalSteps}:{" "}
                    {getStepLabel(currentStep)}
                </small>
            </div>

            <style jsx>{`
                .step-indicator {
                    margin-bottom: 2rem;
                }

                .steps-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .step-item {
                    display: flex;
                    align-items: center;
                }

                .step-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #e5e7eb;
                    color: #9ca3af;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: all 0.3s ease;
                }

                .step-circle.active {
                    background: #4a90e2;
                    color: white;
                    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.2);
                }

                .step-circle.completed {
                    background: #10b981;
                    color: white;
                }

                .step-line {
                    width: 60px;
                    height: 3px;
                    background: #e5e7eb;
                    margin: 0 0.75rem;
                    transition: all 0.3s ease;
                }

                .step-line.completed {
                    background: #10b981;
                }

                .step-label {
                    text-align: center;
                    color: #6b7280;
                    font-weight: 500;
                }

                @media (max-width: 576px) {
                    .step-circle {
                        width: 32px;
                        height: 32px;
                        font-size: 0.75rem;
                    }

                    .step-line {
                        width: 40px;
                        margin: 0 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default StepIndicator;

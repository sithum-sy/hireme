import React from "react";

const StepIndicator = ({
    steps,
    currentStep,
    onStepClick,
    canNavigateToStep,
}) => {
    return (
        <div className="step-indicator">
            <div className="row justify-content-center">
                {steps.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const isClickable = canNavigateToStep(step.id);

                    return (
                        <div key={step.id} className="col-auto">
                            <div
                                className={`step-item d-flex align-items-center ${
                                    isActive
                                        ? "active"
                                        : isCompleted
                                        ? "completed"
                                        : "pending"
                                } ${isClickable ? "clickable" : ""}`}
                                // onClick={() =>
                                //     isClickable && onStepClick(step.id)
                                // }
                                style={{
                                    cursor: isClickable ? "pointer" : "default",
                                }}
                            >
                                {/* Step Circle */}
                                <div
                                    className={`step-circle d-flex align-items-center justify-content-center ${
                                        isActive
                                            ? "bg-primary text-white"
                                            : isCompleted
                                            ? "bg-success text-white"
                                            : "bg-light text-muted"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <i className="fas fa-check" />
                                    ) : (
                                        <i className={step.icon} />
                                    )}
                                </div>

                                {/* Step Info */}
                                <div className="step-info ms-2 d-none d-md-block">
                                    <div
                                        className={`step-title fw-semibold ${
                                            isActive
                                                ? "text-primary"
                                                : isCompleted
                                                ? "text-success"
                                                : "text-muted"
                                        }`}
                                    >
                                        {step.title}
                                    </div>

                                    {/* Step Status */}
                                    <div className="step-status">
                                        {isCompleted && (
                                            <small className="text-success">
                                                <i className="fas fa-check-circle me-1" />
                                                Complete
                                            </small>
                                        )}
                                        {isActive && (
                                            <small className="text-primary">
                                                <i className="fas fa-arrow-right me-1" />
                                                Current
                                            </small>
                                        )}
                                        {!isActive && !isCompleted && (
                                            <small className="text-muted">
                                                Pending
                                            </small>
                                        )}
                                    </div>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div
                                        className={`step-connector ${
                                            isCompleted ? "completed" : ""
                                        }`}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepIndicator;

import React from "react";

const ProgressIndicator = ({ currentStep, steps }) => {
    const getStepProgress = () => (currentStep / steps.length) * 100;

    return (
        <div className="progress-container mb-4">
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="progress mb-3" style={{ height: "8px" }}>
                        <div
                            className="progress-bar bg-primary"
                            style={{ width: `${getStepProgress()}%` }}
                        ></div>
                    </div>
                    <div className="row">
                        {steps.map((step) => (
                            <div key={step.number} className="col-3">
                                <div className="step-indicator text-center">
                                    <div
                                        className={`step-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${
                                            currentStep >= step.number
                                                ? "bg-primary text-white"
                                                : "bg-light text-muted"
                                        }`}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                    >
                                        <i className={step.icon}></i>
                                    </div>
                                    <div className="step-title small fw-semibold">
                                        {step.title}
                                    </div>
                                    <div className="step-description small text-muted">
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressIndicator;
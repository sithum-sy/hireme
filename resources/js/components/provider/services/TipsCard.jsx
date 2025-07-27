import React from "react";

const TipsCard = () => {
    const tips = [
        "Use clear, descriptive titles that include the main service",
        "Write detailed descriptions to help clients understand your service",
        "Add high-quality images to showcase your work",
        "Set competitive prices based on your market research",
        "Include multiple service areas to reach more clients"
    ];

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <h6 className="mb-0 fw-bold">
                    <i className="fas fa-lightbulb text-warning me-2"></i>
                    Tips for Success
                </h6>
            </div>
            <div className="card-body">
                <div className="tips-list">
                    {tips.map((tip, index) => (
                        <div key={index} className="tip-item d-flex align-items-start mb-3">
                            <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                            <small>{tip}</small>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TipsCard;
import React from "react";

const StarRating = ({
    rating = 0,
    onRatingChange = null,
    size = "md",
    showNumber = true,
    readonly = false,
    maxRating = 5,
}) => {
    const sizeClasses = {
        sm: "fs-6",
        md: "fs-5",
        lg: "fs-4",
    };

    const handleStarClick = (selectedRating) => {
        if (!readonly && onRatingChange) {
            onRatingChange(selectedRating);
        }
    };

    const renderStars = () => {
        const stars = [];

        for (let i = 1; i <= maxRating; i++) {
            const isFilled = i <= rating;
            const isHalf = rating > i - 1 && rating < i;

            stars.push(
                <span
                    key={i}
                    className={`star ${sizeClasses[size]} ${
                        readonly ? "" : "star-interactive"
                    } ${isFilled ? "text-warning" : "text-muted"}`}
                    onClick={() => handleStarClick(i)}
                    style={{
                        cursor: readonly ? "default" : "pointer",
                        transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        if (!readonly) {
                            e.target.style.color = "#ffc107";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!readonly) {
                            e.target.style.color = isFilled
                                ? "#ffc107"
                                : "#6c757d";
                        }
                    }}
                >
                    {isFilled ? (
                        <i className="fas fa-star"></i>
                    ) : isHalf ? (
                        <i className="fas fa-star-half-alt"></i>
                    ) : (
                        <i className="far fa-star"></i>
                    )}
                </span>
            );
        }

        return stars;
    };

    return (
        <div className="star-rating d-flex align-items-center gap-1">
            <div className="stars">{renderStars()}</div>
            {showNumber && (
                <span className="rating-number text-muted ms-2">
                    {rating > 0 ? rating.toFixed(1) : "0.0"}
                </span>
            )}
        </div>
    );
};

export default StarRating;

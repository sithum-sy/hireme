import React from "react";

const ServiceSort = ({ value, onChange, hasLocation = false }) => {
    const sortOptions = [
        { value: "recent", label: "Newest First", icon: "fas fa-clock" },
        { value: "popularity", label: "Most Popular", icon: "fas fa-fire" },
        { value: "rating", label: "Highest Rated", icon: "fas fa-star" },
        {
            value: "price",
            label: "Price: Low to High",
            icon: "fas fa-sort-amount-up",
        },
        {
            value: "price_desc",
            label: "Price: High to Low",
            icon: "fas fa-sort-amount-down",
        },
        ...(hasLocation
            ? [
                  {
                      value: "distance",
                      label: "Nearest First",
                      icon: "fas fa-map-marker-alt",
                  },
              ]
            : []),
    ];

    return (
        <div className="service-sort">
            <div className="d-flex align-items-center">
                <label className="form-label text-muted me-2 mb-0 small">
                    Sort by:
                </label>
                <select
                    className="form-select form-select-sm"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ minWidth: "180px" }}
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ServiceSort;

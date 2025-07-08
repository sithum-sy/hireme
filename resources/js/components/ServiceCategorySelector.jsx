import React, { useState, useEffect } from "react";
import axios from "axios";

const ServiceCategorySelector = ({ selectedCategories, onChange, error }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("/api/service-categories");
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryToggle = (categoryId) => {
        const newSelection = selectedCategories.includes(categoryId)
            ? selectedCategories.filter((id) => id !== categoryId)
            : [...selectedCategories, categoryId];
        onChange(newSelection);
    };

    if (loading) {
        return (
            <div className="text-center">
                <span className="spinner-border spinner-border-sm"></span>
            </div>
        );
    }

    return (
        <div className={`category-selector ${error ? "is-invalid" : ""}`}>
            <div className="row g-2">
                {categories.map((category) => (
                    <div key={category.id} className="col-6">
                        <div
                            className={`category-item p-2 border rounded text-center cursor-pointer ${
                                selectedCategories.includes(category.id)
                                    ? "border-success bg-success bg-opacity-10"
                                    : "border-light"
                            }`}
                            onClick={() => handleCategoryToggle(category.id)}
                        >
                            <i
                                className={`${category.icon} text-${category.color} mb-1`}
                            ></i>
                            <div className="small fw-semibold">
                                {category.name}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    );
};

export default ServiceCategorySelector;

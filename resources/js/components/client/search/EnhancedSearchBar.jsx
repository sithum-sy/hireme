import React, { useState, useEffect, useRef } from "react";
import searchService from "../../../services/searchService";

const EnhancedSearchBar = ({
    onSearch,
    placeholder = "Search services, categories, or providers...",
    showFilters = false,
    location = null,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchInputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Debounced search for suggestions
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.length >= 2) {
                fetchSuggestions();
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const response = await searchService.getSearchSuggestions(
                searchQuery
            );
            if (response.success) {
                setSuggestions(response.data);
                setShowSuggestions(true);
                setSelectedIndex(-1);
            }
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            performSearch(searchQuery.trim());
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion.text);
        setShowSuggestions(false);

        // Perform different actions based on suggestion type
        switch (suggestion.type) {
            case "service":
                performSearch(suggestion.text);
                break;
            case "category":
                performSearch(suggestion.text, { category_id: suggestion.id });
                break;
            case "provider":
            case "business":
                performSearch(suggestion.text);
                break;
            default:
                performSearch(suggestion.text);
        }
    };

    const performSearch = (query, additionalFilters = {}) => {
        const searchParams = {
            search: query,
            ...additionalFilters,
        };

        // Add location if available
        if (location) {
            searchParams.latitude = location.lat;
            searchParams.longitude = location.lng;
            searchParams.radius = location.radius || 15;
        }

        onSearch(searchParams);
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else {
                    handleSubmit(e);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target) &&
                !searchInputRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="enhanced-search-bar position-relative">
            <form onSubmit={handleSubmit} className="search-form">
                <div className="input-group input-group-lg">
                    <span className="input-group-text bg-white border-end-0">
                        <i className="fas fa-search text-purple"></i>
                    </span>
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="form-control border-start-0 shadow-none"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() =>
                            searchQuery.length >= 2 && setShowSuggestions(true)
                        }
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setSearchQuery("");
                                setSuggestions([]);
                                setShowSuggestions(false);
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                    <button
                        type="submit"
                        className="btn btn-purple px-4"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            "Search"
                        )}
                    </button>
                </div>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="suggestions-dropdown position-absolute w-100 bg-white border rounded-bottom shadow-lg"
                    style={{
                        top: "100%",
                        zIndex: 1000,
                        maxHeight: "300px",
                        overflowY: "auto",
                    }}
                >
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={`${suggestion.type}-${suggestion.id}`}
                            className={`suggestion-item p-3 border-bottom cursor-pointer ${
                                index === selectedIndex ? "bg-light" : ""
                            }`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="d-flex align-items-center">
                                <div className="suggestion-icon me-3">
                                    <i
                                        className={`${suggestion.icon} text-muted`}
                                    ></i>
                                </div>
                                <div className="suggestion-content flex-grow-1">
                                    <div className="suggestion-text fw-semibold">
                                        {suggestion.text}
                                    </div>
                                    <small className="text-muted">
                                        {suggestion.category}
                                    </small>
                                </div>
                                <div className="suggestion-type">
                                    <span
                                        className={`badge badge-sm ${getSuggestionBadgeClass(
                                            suggestion.type
                                        )}`}
                                    >
                                        {suggestion.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .enhanced-search-bar .form-control:focus {
                    border-color: #6f42c1;
                    box-shadow: 0 0 0 0.2rem rgba(111, 66, 193, 0.25);
                }
                
                .suggestion-item:hover {
                    background-color: #f8f9fa !important;
                }
                
                .suggestions-dropdown {
                    border-top: none;
                    border-top-left-radius: 0;
                    border-top-right-radius: 0;
                }
                
                .text-purple { color: #6f42c1 !important; }
                .btn-purple {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
                    color: white;
                }
                .btn-purple:hover {
                    background-color: #5a2d91;
                    border-color: #5a2d91;
                    color: white;
                }
            `}</style>
        </div>
    );
};

// Helper function for badge classes
const getSuggestionBadgeClass = (type) => {
    switch (type) {
        case "service":
            return "bg-primary";
        case "category":
            return "bg-info";
        case "provider":
            return "bg-success";
        case "business":
            return "bg-warning";
        default:
            return "bg-secondary";
    }
};

export default EnhancedSearchBar;

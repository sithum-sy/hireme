import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import searchService from "../../../services/searchService";

const QuickServiceSearch = ({ location }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;

        const searchParams = {
            search: searchQuery,
            ...(location && {
                latitude: location.lat,
                longitude: location.lng,
                radius: location.radius || 15,
            }),
        };

        // Track the search
        await searchService.trackSearch(searchParams);

        // Navigate to search results
        const params = new URLSearchParams(searchParams);
        navigate(`/client/services/search?${params}`);
    };

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length >= 2) {
            setLoading(true);
            try {
                const response = await searchService.getSearchSuggestions(
                    value
                );
                if (response.success) {
                    setSuggestions(response.data);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Failed to load suggestions:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.text);
        setShowSuggestions(false);
        handleSearch(suggestion.text);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        handleSearch(query);
    };

    return (
        <div className="quick-service-search">
            <div className="search-container position-relative">
                <form onSubmit={handleSubmit}>
                    <div className="input-group input-group-lg">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="fas fa-search text-purple"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 shadow-none"
                            placeholder="Search for services (e.g., house cleaning, plumbing...)"
                            value={query}
                            onChange={handleInputChange}
                            onFocus={() =>
                                query.length >= 2 && setShowSuggestions(true)
                            }
                            onBlur={() =>
                                setTimeout(() => setShowSuggestions(false), 200)
                            }
                        />
                        <button
                            type="submit"
                            className="btn btn-purple px-4"
                            disabled={loading || !query.trim()}
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
                        className="search-suggestions position-absolute w-100 bg-white border rounded-bottom shadow-lg"
                        style={{ top: "100%", zIndex: 1000 }}
                    >
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="suggestion-item p-3 border-bottom cursor-pointer"
                                onClick={() =>
                                    handleSuggestionClick(suggestion)
                                }
                                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                            >
                                <div className="d-flex align-items-center">
                                    <i
                                        className={`fas ${
                                            suggestion.type === "service"
                                                ? "fa-concierge-bell"
                                                : "fa-tag"
                                        } text-muted me-3`}
                                    ></i>
                                    <div>
                                        <div className="fw-semibold">
                                            {suggestion.text}
                                        </div>
                                        <small className="text-muted">
                                            {suggestion.category}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Search Tips */}
            <div className="search-tips mt-2">
                <small className="text-muted">
                    💡 Try searching: "house cleaning", "plumbing repair",
                    "tutoring", "car wash"
                </small>
            </div>

            <style>{`
                .cursor-pointer {
                    cursor: pointer;
                }
                .suggestion-item:hover {
                    background-color: #f8f9fa;
                }
                .search-suggestions {
                    max-height: 300px;
                    overflow-y: auto;
                }
                .btn-purple {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
                    color: white;
                }
                .btn-purple:hover {
                    background-color: #5a2d91;
                    border-color: #5a2d91;
                }
                .text-purple {
                    color: #6f42c1 !important;
                }
            `}</style>
        </div>
    );
};

export default QuickServiceSearch;

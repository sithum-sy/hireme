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
            <div className="search-container">
                <form onSubmit={handleSubmit} className="search-form">
                    <div className="search-input-group">
                        <div className="search-icon">
                            <i className="fas fa-search"></i>
                        </div>
                        <input
                            type="text"
                            className="search-input"
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
                            className="search-submit-btn"
                            disabled={loading || !query.trim()}
                        >
                            {loading ? (
                                <div className="loading-spinner"></div>
                            ) : (
                                <span>Search</span>
                            )}
                        </button>
                    </div>
                </form>

                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="search-suggestions">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="suggestion-item"
                                onClick={() =>
                                    handleSuggestionClick(suggestion)
                                }
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                <div className="suggestion-icon">
                                    <i
                                        className={`fas ${
                                            suggestion.type === "service"
                                                ? "fa-concierge-bell"
                                                : "fa-tag"
                                        }`}
                                    ></i>
                                </div>
                                <div className="suggestion-content">
                                    <div className="suggestion-text">
                                        {suggestion.text}
                                    </div>
                                    <div className="suggestion-category">
                                        {suggestion.category}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Search Tips */}
            <div className="search-tips">
                <i className="fas fa-lightbulb"></i>
                <span>
                    Try searching: "house cleaning", "plumbing repair",
                    "tutoring", "car wash"
                </span>
            </div>
        </div>
    );
};

export default QuickServiceSearch;

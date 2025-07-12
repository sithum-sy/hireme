import React from "react";

const SearchSuggestions = ({ suggestions, onSelect }) => {
    if (!suggestions.length) return null;

    return (
        <div
            className="search-suggestions position-absolute w-100 bg-white border rounded-bottom shadow-lg"
            style={{
                top: "100%",
                zIndex: 1000,
                maxHeight: "300px",
                overflowY: "auto",
            }}
        >
            {suggestions.map((suggestion, index) => (
                <div
                    key={index}
                    className="suggestion-item p-3 border-bottom cursor-pointer"
                    onClick={() => onSelect(suggestion)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                >
                    <div className="d-flex align-items-center">
                        <div className="suggestion-icon me-3">
                            <i
                                className={`fas ${
                                    suggestion.type === "service"
                                        ? "fa-concierge-bell"
                                        : suggestion.type === "category"
                                        ? "fa-tag"
                                        : suggestion.type === "provider"
                                        ? "fa-user"
                                        : "fa-search"
                                } text-muted`}
                            ></i>
                        </div>
                        <div className="suggestion-content flex-grow-1">
                            <div className="suggestion-text fw-semibold">
                                {suggestion.text}
                            </div>
                            {suggestion.category && (
                                <small className="text-muted">
                                    {suggestion.category}
                                </small>
                            )}
                            {suggestion.count && (
                                <small className="text-muted">
                                    {" "}
                                    • {suggestion.count} results
                                </small>
                            )}
                        </div>
                        {suggestion.type === "recent" && (
                            <div className="suggestion-badge">
                                <small className="badge bg-light text-muted">
                                    Recent
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <style>{`
                .cursor-pointer {
                    cursor: pointer;
                }
                .suggestion-item:hover {
                    background-color: #f8f9fa;
                }
                .suggestion-item:last-child {
                    border-bottom: none;
                }
            `}</style>
        </div>
    );
};

export default SearchSuggestions;

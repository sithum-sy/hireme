import React, { useState, useEffect } from "react";

const LocationSearch = ({ city, onLocationSelect }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    // Offline area data for Sri Lankan cities
    const areaData = {
        Colombo: [
            { name: "Bambalapitiya", lat: 6.8905, lng: 79.8565 },
            { name: "Mount Lavinia", lat: 6.8411, lng: 79.8617 },
            { name: "Nugegoda", lat: 6.8671, lng: 79.8992 },
            { name: "Dehiwala", lat: 6.8566, lng: 79.863 },
            { name: "Rajagiriya", lat: 6.9076, lng: 79.896 },
            { name: "Kotte", lat: 6.8905, lng: 79.9015 },
            { name: "Wellawatta", lat: 6.8767, lng: 79.859 },
            { name: "Kollupitiya", lat: 6.9147, lng: 79.8472 },
            { name: "Pettah", lat: 6.9395, lng: 79.855 },
            { name: "Fort", lat: 6.9344, lng: 79.8428 },
        ],
        Kandy: [
            { name: "Peradeniya", lat: 7.2599, lng: 80.5974 },
            { name: "Katugastota", lat: 7.3167, lng: 80.6333 },
            { name: "Gampola", lat: 7.1644, lng: 80.5736 },
            { name: "Digana", lat: 7.2167, lng: 80.7833 },
            { name: "Kundasale", lat: 7.2833, lng: 80.6833 },
            { name: "Akurana", lat: 7.3667, lng: 80.6167 },
            { name: "Kandy City Center", lat: 7.2906, lng: 80.6337 },
        ],
        Galle: [
            { name: "Hikkaduwa", lat: 6.1408, lng: 80.1019 },
            { name: "Unawatuna", lat: 6.0107, lng: 80.2489 },
            { name: "Bentota", lat: 6.4204, lng: 79.9951 },
            { name: "Ambalangoda", lat: 6.2353, lng: 80.0539 },
            { name: "Baddegama", lat: 6.1833, lng: 80.3 },
            { name: "Galle Fort", lat: 6.0269, lng: 80.217 },
        ],
        Negombo: [
            { name: "Katunayake", lat: 7.1697, lng: 79.8842 },
            { name: "Seeduwa", lat: 7.1333, lng: 79.8833 },
            { name: "Ja-Ela", lat: 7.0833, lng: 79.8917 },
            { name: "Wattala", lat: 6.9833, lng: 79.8667 },
            { name: "Minuwangoda", lat: 7.1667, lng: 79.95 },
            { name: "Negombo Beach", lat: 7.2083, lng: 79.8358 },
        ],
    };

    useEffect(() => {
        const areas = areaData[city] || [];

        if (query.length > 1) {
            // Filter areas based on search query
            const filtered = areas.filter((area) =>
                area.name.toLowerCase().includes(query.toLowerCase())
            );
            setResults(
                filtered.map((area) => ({
                    ...area,
                    address: `${area.name}, ${city}, Sri Lanka`,
                    neighborhood: area.name,
                    city: city,
                    province: getProvinceForCity(city),
                    accuracy: "area_search",
                }))
            );
        } else {
            // Show all areas when no search query
            setResults(
                areas.map((area) => ({
                    ...area,
                    address: `${area.name}, ${city}, Sri Lanka`,
                    neighborhood: area.name,
                    city: city,
                    province: getProvinceForCity(city),
                    accuracy: "area_list",
                }))
            );
        }
    }, [query, city]);

    const getProvinceForCity = (cityName) => {
        const cityProvinces = {
            Colombo: "Western Province",
            Kandy: "Central Province",
            Galle: "Southern Province",
            Negombo: "Western Province",
            Jaffna: "Northern Province",
            Anuradhapura: "North Central Province",
            Trincomalee: "Eastern Province",
            Matara: "Southern Province",
        };
        return cityProvinces[cityName] || "";
    };

    const handleResultSelect = (result) => {
        onLocationSelect(result);
        setQuery("");
    };

    return (
        <div className="location-search">
            {/* Search Input */}
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder={`Search areas in ${city}... (e.g., Bambalapitiya)`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <span className="input-group-text">
                    <i className="fas fa-search"></i>
                </span>
            </div>

            {/* ENHANCED: Search results appear immediately below search bar */}
            <div className="search-results-container">
                {query.length > 1 && (
                    <div className="search-results mb-3">
                        <div className="search-results-header mb-2">
                            <small className="text-muted fw-semibold">
                                <i className="fas fa-search me-1"></i>
                                Search Results for "{query}" in {city}:
                            </small>
                        </div>
                        
                        {results.length > 0 ? (
                            <div className="list-group">
                                {results.map((result, index) => (
                                    <button
                                        key={index}
                                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                        onClick={() => handleResultSelect(result)}
                                    >
                                        <div>
                                            <div className="fw-semibold">
                                                <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                                                {result.name}
                                            </div>
                                            <small className="text-muted">
                                                {result.address}
                                            </small>
                                        </div>
                                        <i className="fas fa-chevron-right text-muted"></i>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="no-results text-center py-3 text-muted">
                                <i className="fas fa-search-minus fa-2x mb-2"></i>
                                <div>No areas found for "{query}" in {city}</div>
                                <small>Try a different search term</small>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ENHANCED: Quick suggestions (shown when not searching) */}
            {query.length <= 1 && results.length > 0 && (
                <div className="quick-suggestions mb-3">
                    <div className="suggestions-header mb-2">
                        <small className="text-muted fw-semibold">
                            <i className="fas fa-star me-1"></i>
                            Popular areas in {city}:
                        </small>
                    </div>
                    <div className="suggestions-grid">
                        {results.slice(0, 8).map((result, index) => (
                            <button
                                key={index}
                                className="suggestion-btn"
                                onClick={() => handleResultSelect(result)}
                            >
                                <i className="fas fa-location-dot me-1"></i>
                                {result.name}
                            </button>
                        ))}
                    </div>
                    {results.length > 8 && (
                        <div className="text-center mt-2">
                            <small className="text-muted">
                                Type to search for more areas...
                            </small>
                        </div>
                    )}
                </div>
            )}

            {/* Enhanced Styling */}
            <style jsx>{`
                .search-results-header {
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #e9ecef;
                }
                
                .list-group-item {
                    border: 1px solid #e9ecef;
                    border-radius: 0.375rem !important;
                    margin-bottom: 0.25rem;
                    transition: all 0.2s ease;
                }
                
                .list-group-item:hover {
                    background-color: #f8f9fa;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .no-results {
                    background-color: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 0.375rem;
                    padding: 1rem;
                }
                
                .suggestions-header {
                    padding: 0.5rem 0;
                }
                
                .suggestions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 0.5rem;
                }
                
                .suggestion-btn {
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 0.375rem;
                    padding: 0.5rem 0.75rem;
                    text-align: left;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                
                .suggestion-btn:hover {
                    background: #e9ecef;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .quick-suggestions {
                    animation: slideInUp 0.3s ease-out;
                }
                
                .search-results {
                    animation: slideInDown 0.3s ease-out;
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Enhanced mobile responsiveness */
                @media (max-width: 767.98px) {
                    .location-search {
                        margin: 0 -0.75rem;
                        padding: 0 0.75rem;
                    }
                    
                    .search-results-container {
                        position: relative;
                        z-index: 1050;
                        margin: 0 -0.75rem;
                    }
                    
                    .search-results {
                        max-height: 50vh;
                        border-radius: 0.5rem;
                        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                        margin: 0.5rem 0;
                        background: white;
                        border: 1px solid #dee2e6;
                    }
                    
                    .list-group-item {
                        padding: 1rem 0.75rem;
                        font-size: 0.95rem;
                        border: none;
                        border-bottom: 1px solid #f8f9fa;
                    }
                    
                    .list-group-item:last-child {
                        border-bottom: none;
                    }
                    
                    .suggestions-grid {
                        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                        gap: 0.5rem;
                        margin: 0 -0.75rem;
                        padding: 0 0.75rem;
                    }
                    
                    .suggestion-btn {
                        font-size: 0.85rem;
                        padding: 0.6rem 0.75rem;
                    }
                    
                    .input-group {
                        margin: 0 -0.75rem 1rem -0.75rem;
                        padding: 0 0.75rem;
                    }
                }
                
                @media (max-width: 575.98px) {
                    .location-search {
                        margin: 0 -0.5rem;
                        padding: 0 0.5rem;
                    }
                    
                    .search-results-container {
                        margin: 0 -0.5rem;
                    }
                    
                    .search-results {
                        max-height: 40vh;
                        margin: 0.25rem 0;
                        border-radius: 0.375rem;
                    }
                    
                    .list-group-item {
                        padding: 0.875rem 0.75rem;
                        font-size: 0.9rem;
                    }
                    
                    .suggestions-grid {
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                        gap: 0.375rem;
                        margin: 0 -0.5rem;
                        padding: 0 0.5rem;
                    }
                    
                    .suggestion-btn {
                        font-size: 0.8rem;
                        padding: 0.4rem 0.6rem;
                    }
                    
                    .search-results-header {
                        padding: 0.375rem 0.75rem;
                        font-size: 0.85rem;
                    }
                    
                    .no-results {
                        padding: 0.75rem;
                        font-size: 0.9rem;
                    }
                    
                    .input-group {
                        margin: 0 -0.5rem 1rem -0.5rem;
                        padding: 0 0.5rem;
                    }
                    
                    .form-control {
                        font-size: 1rem; /* Prevent zoom on iOS */
                    }
                }
            `}</style>
        </div>
    );
};

export default LocationSearch;

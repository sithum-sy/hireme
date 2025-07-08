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

            {/* Quick suggestions */}
            {query.length <= 1 && results.length > 0 && (
                <div className="mb-3">
                    <small className="text-muted fw-semibold">
                        Popular areas in {city}:
                    </small>
                    <div className="d-flex flex-wrap gap-1 mt-2">
                        {results.slice(0, 6).map((result, index) => (
                            <button
                                key={index}
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => handleResultSelect(result)}
                            >
                                {result.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Search results */}
            {query.length > 1 && (
                <div className="search-results">
                    {results.length > 0 ? (
                        <div className="list-group">
                            {results.map((result, index) => (
                                <button
                                    key={index}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => handleResultSelect(result)}
                                >
                                    <div className="fw-semibold">
                                        {result.name}
                                    </div>
                                    <small className="text-muted">
                                        {result.address}
                                    </small>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-3 text-muted">
                            <i className="fas fa-search me-2"></i>
                            No areas found for "{query}" in {city}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LocationSearch;

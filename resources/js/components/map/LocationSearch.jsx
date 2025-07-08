import React, { useState, useEffect, useRef } from "react";

const LocationSearch = ({ city, onLocationSelect }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (query.length > 2) {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                searchLocations(query);
            }, 300);
        } else {
            setResults([]);
        }

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const searchLocations = async (searchQuery) => {
        setLoading(true);
        try {
            const fullQuery = `${searchQuery}, ${city}, Sri Lanka`;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    fullQuery
                )}&addressdetails=1&countrycodes=lk&limit=5`
            );
            const data = await response.json();

            const formattedResults = data.map((item) => ({
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                address: item.display_name,
                neighborhood:
                    item.address?.suburb || item.address?.neighbourhood || "",
                city: item.address?.city || item.address?.town || city,
                province: item.address?.state || "",
                name:
                    item.address?.suburb ||
                    item.address?.neighbourhood ||
                    item.address?.road ||
                    item.name,
            }));

            setResults(formattedResults);
        } catch (error) {
            console.error("Search failed:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResultSelect = (result) => {
        onLocationSelect(result);
        setQuery("");
        setResults([]);
    };

    return (
        <div className="location-search">
            <div className="input-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder={`Search areas in ${city}...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loading && (
                    <span className="input-group-text">
                        <div className="spinner-border spinner-border-sm"></div>
                    </span>
                )}
            </div>

            {results.length > 0 && (
                <div className="search-results mt-2 border rounded max-height-200 overflow-auto">
                    {results.map((result, index) => (
                        <button
                            key={index}
                            className="list-group-item list-group-item-action border-0"
                            onClick={() => handleResultSelect(result)}
                        >
                            <div className="fw-semibold">{result.name}</div>
                            <small className="text-muted">
                                {result.address}
                            </small>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocationSearch;

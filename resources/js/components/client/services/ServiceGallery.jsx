import React, { useState } from "react";
import { useServiceImages } from "../../../hooks/useServiceImages";

const ServiceGallery = ({ images, title, service }) => {
    const [activeImage, setActiveImage] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // Use the custom hook if service object is provided, otherwise process images directly
    const hookImages = useServiceImages(service);

    // Handle both array of URLs and array of objects with url property
    const processImages = (imageData) => {
        if (!imageData || !Array.isArray(imageData)) {
            return [];
        }

        return imageData
            .map((item, index) => {
                if (typeof item === "string") {
                    return { url: item, alt: `${title} - Image ${index + 1}` };
                } else if (item && typeof item === "object" && item.url) {
                    return {
                        url: item.url,
                        alt: item.alt || `${title} - Image ${index + 1}`,
                    };
                }
                return null;
            })
            .filter(Boolean);
    };

    // Use hook images if available, otherwise process provided images
    const processedImages =
        service && hookImages.length > 0
            ? hookImages.map((url, index) => ({
                  url,
                  alt: `${title} - Image ${index + 1}`,
              }))
            : processImages(images);

    // If no valid images, don't render the gallery
    if (processedImages.length === 0) {
        return (
            <div className="service-gallery">
                <div className="no-images-placeholder bg-light rounded-lg d-flex align-items-center justify-content-center img-gallery">
                    <div className="text-center text-muted">
                        <i className="fas fa-image fa-3x mb-3"></i>
                        <p className="mb-0 text-sm">No images available</p>
                    </div>
                </div>
            </div>
        );
    }

    // For single image, show simplified layout
    const isSingleImage = processedImages.length === 1;

    return (
        <div className="service-gallery">
            {/* Main Image */}
            <div className="main-image mb-3">
                <div
                    className="main-image-container position-relative cursor-pointer"
                    onClick={() => setShowModal(true)}
                >
                    <img
                        src={processedImages[activeImage]?.url}
                        alt={processedImages[activeImage]?.alt || title}
                        className="w-100 rounded-lg img-gallery"
                        onError={(e) => {
                            console.error(
                                "Image failed to load:",
                                e.target.src
                            );
                            e.target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f8f9fa"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236c757d" font-size="16"%3EImage not found%3C/text%3E%3C/svg%3E';
                        }}
                    />

                    {/* Zoom Overlay */}
                    <div className="zoom-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0 transition">
                        <div className="zoom-icon bg-white bg-opacity-75 rounded-full p-3 shadow">
                            <i className="fas fa-search-plus fa-lg text-primary"></i>
                        </div>
                    </div>

                    {/* Image Counter - Only show if multiple images */}
                    {!isSingleImage && (
                        <div className="image-counter position-absolute bottom-0 end-0 m-3">
                            <span className="badge bg-overlay text-white px-3 py-2 rounded text-sm">
                                {activeImage + 1} / {processedImages.length}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Thumbnail Navigation - Only show if multiple images */}
            {!isSingleImage && (
                <div className="thumbnail-nav">
                    <div className="row g-2 g-md-3">
                        {processedImages.map((image, index) => (
                            <div
                                key={index}
                                className="col-3 col-sm-3 col-md-2 col-lg-2"
                            >
                                <div
                                    className={`thumbnail cursor-pointer border rounded overflow-hidden transition ${
                                        index === activeImage
                                            ? "border-primary border-2 shadow"
                                            : "border-2"
                                    }`}
                                    onClick={() => setActiveImage(index)}
                                >
                                    <img
                                        src={image.url}
                                        alt={image.alt}
                                        className="w-100 img-thumbnail-small"
                                        onError={(e) => {
                                            e.target.src =
                                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Crect width="60" height="60" fill="%23f8f9fa"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236c757d" font-size="10"%3E❌%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fullscreen Modal */}
            {showModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="modal-content mx-3 mx-md-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-body p-0 position-relative">
                            {/* Close Button */}
                            <button
                                className="btn-close btn-close-white position-absolute top-0 end-0 m-3 z-50"
                                onClick={() => setShowModal(false)}
                            ></button>

                            {/* Image */}
                            <img
                                src={processedImages[activeImage]?.url}
                                alt={processedImages[activeImage]?.alt || title}
                                className="w-100 h-auto rounded-lg img-responsive modal-image"
                            />

                            {/* Navigation Arrows - Only show if multiple images */}
                            {!isSingleImage && (
                                <>
                                    <button
                                        className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2 ms-md-3 d-none d-sm-block"
                                        onClick={() =>
                                            setActiveImage(
                                                activeImage > 0
                                                    ? activeImage - 1
                                                    : processedImages.length - 1
                                            )
                                        }
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    <button
                                        className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2 me-md-3 d-none d-sm-block"
                                        onClick={() =>
                                            setActiveImage(
                                                activeImage <
                                                    processedImages.length - 1
                                                    ? activeImage + 1
                                                    : 0
                                            )
                                        }
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </>
                            )}

                            {/* Image Counter - Only show if multiple images */}
                            {!isSingleImage && (
                                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
                                    <span className="badge bg-overlay text-white px-3 py-2 rounded text-sm">
                                        {activeImage + 1} /{" "}
                                        {processedImages.length}
                                    </span>
                                </div>
                            )}
                            {/* </div> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceGallery;

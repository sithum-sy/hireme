import React, { useState } from "react";

const ServiceGallery = ({ images, title }) => {
    const [activeImage, setActiveImage] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // Default placeholder if no images
    const displayImages =
        images && images.length > 0
            ? images
            : [{ url: "/placeholder-service.jpg", alt: title }];

    return (
        <div className="service-gallery">
            {/* Main Image */}
            <div className="main-image mb-3">
                <div
                    className="main-image-container position-relative cursor-pointer"
                    onClick={() => setShowModal(true)}
                >
                    <img
                        src={
                            displayImages[activeImage]?.url ||
                            "/placeholder-service.jpg"
                        }
                        alt={displayImages[activeImage]?.alt || title}
                        className="w-100 rounded-3"
                        style={{ height: "400px", objectFit: "cover" }}
                    />

                    {/* Zoom Overlay */}
                    <div className="zoom-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0">
                        <div className="zoom-icon bg-white bg-opacity-75 rounded-circle p-3">
                            <i className="fas fa-search-plus fa-lg"></i>
                        </div>
                    </div>

                    {/* Image Counter */}
                    {displayImages.length > 1 && (
                        <div className="image-counter position-absolute bottom-0 end-0 m-3">
                            <span className="badge bg-dark bg-opacity-75">
                                {activeImage + 1} / {displayImages.length}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Thumbnail Navigation */}
            {displayImages.length > 1 && (
                <div className="thumbnail-nav">
                    <div className="row g-2">
                        {displayImages.map((image, index) => (
                            <div key={index} className="col-3 col-md-2">
                                <div
                                    className={`thumbnail cursor-pointer border rounded-2 overflow-hidden ${
                                        index === activeImage
                                            ? "border-purple border-2"
                                            : "border-2"
                                    }`}
                                    onClick={() => setActiveImage(index)}
                                >
                                    <img
                                        src={image.url}
                                        alt={
                                            image.alt ||
                                            `${title} - Image ${index + 1}`
                                        }
                                        className="w-100"
                                        style={{
                                            height: "60px",
                                            objectFit: "cover",
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
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
                >
                    <div className="modal-dialog modal-xl modal-dialog-centered">
                        <div className="modal-content bg-transparent border-0">
                            <div className="modal-body p-0 position-relative">
                                {/* Close Button */}
                                <button
                                    className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                                    style={{ zIndex: 1060 }}
                                    onClick={() => setShowModal(false)}
                                ></button>

                                {/* Image */}
                                <img
                                    src={displayImages[activeImage]?.url}
                                    alt={
                                        displayImages[activeImage]?.alt || title
                                    }
                                    className="w-100 h-auto rounded-3"
                                    style={{
                                        maxHeight: "80vh",
                                        objectFit: "contain",
                                    }}
                                />

                                {/* Navigation Arrows */}
                                {displayImages.length > 1 && (
                                    <>
                                        <button
                                            className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3"
                                            onClick={() =>
                                                setActiveImage(
                                                    activeImage > 0
                                                        ? activeImage - 1
                                                        : displayImages.length -
                                                              1
                                                )
                                            }
                                        >
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                        <button
                                            className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3"
                                            onClick={() =>
                                                setActiveImage(
                                                    activeImage <
                                                        displayImages.length - 1
                                                        ? activeImage + 1
                                                        : 0
                                                )
                                            }
                                        >
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </>
                                )}

                                {/* Image Counter */}
                                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
                                    <span className="badge bg-dark bg-opacity-75">
                                        {activeImage + 1} /{" "}
                                        {displayImages.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .cursor-pointer {
                    cursor: pointer;
                }
                .main-image-container:hover .zoom-overlay {
                    opacity: 1 !important;
                    transition: opacity 0.3s ease;
                }
                .border-purple {
                    border-color: #6f42c1 !important;
                }
                .thumbnail {
                    transition: all 0.2s ease;
                }
                .thumbnail:hover {
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
};

export default ServiceGallery;

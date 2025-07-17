import React from "react";

const DocumentPreview = ({ documents, type, onRemove, className = "" }) => {
    if (!documents || documents.length === 0) {
        return null;
    }

    const getFileIcon = (fileName) => {
        const extension = fileName.split(".").pop().toLowerCase();

        if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
            return "fas fa-image";
        } else if (["pdf"].includes(extension)) {
            return "fas fa-file-pdf";
        } else if (["doc", "docx"].includes(extension)) {
            return "fas fa-file-word";
        } else {
            return "fas fa-file-alt";
        }
    };

    const getFileColor = (fileName) => {
        const extension = fileName.split(".").pop().toLowerCase();

        if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
            return "#10b981";
        } else if (["pdf"].includes(extension)) {
            return "#ef4444";
        } else if (["doc", "docx"].includes(extension)) {
            return "#2563eb";
        } else {
            return "#6b7280";
        }
    };

    return (
        <div className={`document-preview ${className}`}>
            {type === "portfolio_images" ? (
                <div className="image-grid">
                    {documents.map((imageSrc, index) => (
                        <div key={index} className="image-item">
                            <img
                                src={imageSrc}
                                alt={`Portfolio ${index + 1}`}
                                className="preview-image"
                            />
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => onRemove(index)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="file-list">
                    {documents.map((doc, index) => (
                        <div key={index} className="file-item">
                            <div className="file-info">
                                <i
                                    className={getFileIcon(doc)}
                                    style={{ color: getFileColor(doc) }}
                                ></i>
                                <span className="file-name">{doc}</span>
                            </div>
                            <button
                                type="button"
                                className="remove-btn-small"
                                onClick={() => onRemove(index)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .document-preview {
                    margin-top: 1rem;
                }

                .image-grid {
                    display: grid;
                    grid-template-columns: repeat(
                        auto-fill,
                        minmax(100px, 1fr)
                    );
                    gap: 0.75rem;
                }

                .image-item {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .preview-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 8px;
                }

                .remove-btn {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #ef4444;
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    transition: all 0.2s ease;
                }

                .remove-btn:hover {
                    background: #dc2626;
                    transform: scale(1.1);
                }

                .file-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .file-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: #f8f9fa;
                    padding: 0.75rem;
                    border-radius: 6px;
                    border: 1px solid #e5e7eb;
                }

                .file-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex: 1;
                }

                .file-name {
                    font-size: 0.875rem;
                    color: #374151;
                    word-break: break-all;
                }

                .remove-btn-small {
                    background: #ef4444;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    width: 28px;
                    height: 28px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    transition: all 0.2s ease;
                }

                .remove-btn-small:hover {
                    background: #dc2626;
                }

                @media (max-width: 576px) {
                    .image-grid {
                        grid-template-columns: repeat(
                            auto-fill,
                            minmax(80px, 1fr)
                        );
                        gap: 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default DocumentPreview;

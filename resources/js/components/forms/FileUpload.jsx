import React from "react";

const FileUpload = ({
    label,
    name,
    accept,
    multiple = false,
    maxSize,
    onFileSelect,
    error,
    helpText,
    className = "",
}) => {
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        onFileSelect(files, name);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    return (
        <div className={`file-upload ${className}`}>
            {label && <label className="file-label">{label}</label>}

            <div className="upload-area">
                <input
                    type="file"
                    name={name}
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                    className="file-input"
                    id={name}
                />
                <label htmlFor={name} className="upload-label">
                    <div className="upload-icon">
                        <i className="fas fa-cloud-upload-alt fa-2x"></i>
                    </div>
                    <div className="upload-text">
                        <span className="upload-main">
                            {multiple ? "Choose files" : "Choose file"} or drag
                            and drop
                        </span>
                        {helpText && (
                            <span className="upload-help">{helpText}</span>
                        )}
                    </div>
                </label>
            </div>

            {error && (
                <div className="error-message">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    {error}
                </div>
            )}

            <style jsx>{`
                .file-upload {
                    margin-bottom: 1.25rem;
                }

                .file-label {
                    display: block;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                    font-size: 0.875rem;
                }

                .upload-area {
                    position: relative;
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    background: #fafafa;
                    transition: all 0.2s ease;
                }

                .upload-area:hover {
                    border-color: #4a90e2;
                    background: #f8fafc;
                }

                .file-input {
                    position: absolute;
                    opacity: 0;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }

                .upload-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1rem;
                    cursor: pointer;
                    margin: 0;
                }

                .upload-icon {
                    color: #9ca3af;
                    margin-bottom: 1rem;
                    transition: color 0.2s ease;
                }

                .upload-area:hover .upload-icon {
                    color: #4a90e2;
                }

                .upload-text {
                    text-align: center;
                }

                .upload-main {
                    display: block;
                    color: #374151;
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }

                .upload-help {
                    display: block;
                    color: #9ca3af;
                    font-size: 0.8rem;
                }

                .error-message {
                    color: #ef4444;
                    font-size: 0.8rem;
                    margin-top: 0.375rem;
                    display: flex;
                    align-items: center;
                }

                @media (max-width: 576px) {
                    .upload-label {
                        padding: 1.5rem 0.75rem;
                    }

                    .upload-icon i {
                        font-size: 1.5rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default FileUpload;

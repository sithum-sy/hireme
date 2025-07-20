/**
 * Convert file to base64 for preview
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get file type icon class
 */
export const getFileIcon = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();

    const iconMap = {
        // Images
        jpg: "fas fa-image text-success",
        jpeg: "fas fa-image text-success",
        png: "fas fa-image text-success",
        gif: "fas fa-image text-success",
        webp: "fas fa-image text-success",

        // Documents
        pdf: "fas fa-file-pdf text-danger",
        doc: "fas fa-file-word text-primary",
        docx: "fas fa-file-word text-primary",
        txt: "fas fa-file-alt text-secondary",

        // Spreadsheets
        xls: "fas fa-file-excel text-success",
        xlsx: "fas fa-file-excel text-success",

        // Default
        default: "fas fa-file text-muted",
    };

    return iconMap[extension] || iconMap.default;
};

/**
 * Validate file type
 */
export const isValidFileType = (file, allowedTypes) => {
    const extension = file.name.split(".").pop().toLowerCase();
    return allowedTypes.includes(extension);
};

/**
 * Check if file is an image
 */
export const isImageFile = (file) => {
    return file.type.startsWith("image/");
};

/**
 * Compress image file
 */
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(resolve, file.type, quality);
        };

        img.src = URL.createObjectURL(file);
    });
};

/**
 * Create thumbnail from image file
 */
export const createThumbnail = (file, size = 150) => {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = size;
            canvas.height = size;

            // Calculate cropping to maintain aspect ratio
            const scale = Math.max(size / img.width, size / img.height);
            const x = (size - img.width * scale) / 2;
            const y = (size - img.height * scale) / 2;

            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            canvas.toBlob(resolve, "image/jpeg", 0.8);
        };

        img.src = URL.createObjectURL(file);
    });
};

class NotificationService {
    success(message) {
        this.showNotification(message, "success");
    }

    error(message) {
        this.showNotification(message, "error");
    }

    warning(message) {
        this.showNotification(message, "warning");
    }

    info(message) {
        this.showNotification(message, "info");
    }

    showNotification(message, type) {
        const notification = document.createElement("div");
        notification.className = `alert alert-${this.getBootstrapClass(
            type
        )} position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: none;
            animation: slideInRight 0.3s ease;
        `;

        notification.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <i class="fas ${this.getIcon(type)} me-2"></i>
                    <span>${message}</span>
                </div>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = "slideOutRight 0.3s ease";
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    getBootstrapClass(type) {
        const classes = {
            success: "success",
            error: "danger",
            warning: "warning",
            info: "info",
        };
        return classes[type] || "info";
    }

    getIcon(type) {
        const icons = {
            success: "fa-check-circle",
            error: "fa-exclamation-circle",
            warning: "fa-exclamation-triangle",
            info: "fa-info-circle",
        };
        return icons[type] || "fa-info-circle";
    }
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

export default new NotificationService();

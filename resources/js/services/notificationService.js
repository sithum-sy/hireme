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
        // Calculate position for stacking notifications
        const existingNotifications = document.querySelectorAll('.toast-notification');
        const topOffset = 80 + (existingNotifications.length * 90); // Stack with 90px spacing
        
        const notification = document.createElement("div");
        const enhancedStyles = this.getEnhancedStyles(type);
        
        notification.className = `alert position-fixed toast-notification`;
        notification.style.cssText = `
            top: ${topOffset}px;
            right: 20px;
            z-index: 10000;
            min-width: 320px;
            max-width: 420px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
            border: 2px solid ${enhancedStyles.borderColor};
            background: ${enhancedStyles.background};
            color: ${enhancedStyles.color};
            animation: slideInRight 0.3s ease;
            backdrop-filter: blur(10px);
            margin-bottom: 10px;
            border-radius: 12px;
            font-weight: 500;
        `;

        notification.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <i class="fas ${this.getIcon(type)} me-2" style="font-size: 1.2rem;"></i>
                    <span style="font-weight: 500;">${message}</span>
                </div>
                <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()" style="filter: brightness(0) invert(1); opacity: 0.8;"></button>
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

    getEnhancedStyles(type) {
        const styles = {
            success: {
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                borderColor: "#10b981",
                color: "#ffffff"
            },
            error: {
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", 
                borderColor: "#ef4444",
                color: "#ffffff"
            },
            warning: {
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                borderColor: "#f59e0b", 
                color: "#ffffff"
            },
            info: {
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                borderColor: "#3b82f6",
                color: "#ffffff"
            }
        };
        return styles[type] || styles.info;
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

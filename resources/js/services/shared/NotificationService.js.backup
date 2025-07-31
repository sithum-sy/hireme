import BaseService from '../core/BaseService';

/**
 * Shared Notification Service
 * Handles notifications for all user roles
 */
class NotificationService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            cacheTimeout: 30 * 1000, // 30 seconds cache for notifications
            enableCache: true
        });
        this.baseURL = "";
    }

    /**
     * Get all notifications with pagination
     */
    async getNotifications(params = {}) {
        const defaultParams = {
            page: 1,
            per_page: 20,
            type: null,
            read: null
        };

        return this.apiCall("GET", "/notifications", {
            ...defaultParams,
            ...this.cleanPayload(params)
        });
    }

    /**
     * Get recent notifications
     */
    async getRecent(limit = 10) {
        return this.apiCall("GET", "/notifications/recent", { limit });
    }

    /**
     * Get unread count
     */
    async getUnreadCount() {
        const cacheKey = "unread_count";
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.apiCall("GET", "/notifications/unread-count");
            this.setCachedData(cacheKey, response);
            return response;
        } catch (error) {
            if (error.status === 429) {
                const cached = this.cache.get(cacheKey);
                if (cached) return cached.data;
            }
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        this.clearCache("unread_count");
        return this.apiCall("POST", `/notifications/${notificationId}/mark-read`);
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        this.clearCache();
        return this.apiCall("POST", "/notifications/mark-all-read");
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId) {
        this.clearCache();
        return this.apiCall("DELETE", `/notifications/${notificationId}`);
    }

    /**
     * Get notification preferences
     */
    async getPreferences() {
        return this.apiCall("GET", "/notifications/preferences");
    }

    /**
     * Update notification preferences
     */
    async updatePreferences(preferences) {
        return this.apiCall("PUT", "/notifications/preferences", preferences);
    }

    /**
     * Subscribe to push notifications
     */
    async subscribeToPush(subscription) {
        return this.apiCall("POST", "/notifications/push/subscribe", subscription);
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribeFromPush() {
        return this.apiCall("POST", "/notifications/push/unsubscribe");
    }

    // Utility methods

    /**
     * Format notification data for display
     */
    formatNotificationData(notification) {
        return {
            ...notification,
            time_ago: this.formatTimeAgo(notification.created_at),
            is_unread: !notification.read_at,
            type_icon: this.getTypeIcon(notification.type),
            type_class: this.getTypeClass(notification.type)
        };
    }

    /**
     * Get notification type icon
     */
    getTypeIcon(type) {
        const icons = {
            'appointment': 'bi-calendar-check',
            'payment': 'bi-credit-card',
            'message': 'bi-chat-dots',
            'quote': 'bi-file-text',
            'review': 'bi-star',
            'system': 'bi-gear',
            'reminder': 'bi-bell'
        };

        return icons[type] || 'bi-info-circle';
    }

    /**
     * Get notification type CSS class
     */
    getTypeClass(type) {
        const classes = {
            'appointment': 'text-primary',
            'payment': 'text-success',
            'message': 'text-info',
            'quote': 'text-warning',
            'review': 'text-warning',
            'system': 'text-secondary',
            'reminder': 'text-primary'
        };

        return classes[type] || 'text-secondary';
    }

    /**
     * Format time ago
     */
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

export default NotificationService;
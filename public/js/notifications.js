// Notification System
class NotificationSystem {
    constructor() {
        this.init();
    }

    init() {
        // Create container if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    show(message, type = 'success', duration = 5000) {
        const container = document.querySelector('.notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                container.removeChild(notification);
            }, 300); // Match animation duration
        }, duration);
    }

    success(message, duration = 5000) {
        this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        this.show(message, 'error', duration);
    }
}

// Create global instance
window.notifications = new NotificationSystem();

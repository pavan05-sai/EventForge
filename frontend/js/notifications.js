// ====================================
// Notifications Logic
// ====================================
// Handles loading and displaying notifications.
// Used on all authenticated pages.

// ---- Load notifications from API ----
async function loadNotifications() {
    try {
        const data = await get('/notifications');

        // Update the bell badge count
        const countBadge = document.getElementById('notif-count');
        if (data.unread_count > 0) {
            countBadge.textContent = data.unread_count > 9 ? '9+' : data.unread_count;
            countBadge.classList.remove('hidden');
        } else {
            countBadge.classList.add('hidden');
        }

        // Render notification items
        renderNotifications(data.notifications);
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// ---- Render notification list ----
function renderNotifications(notifications) {
    const list = document.getElementById('notification-list');
    if (!list) return;

    if (!notifications || notifications.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="icon">🔕</div>
                <h3>No notifications</h3>
                <p>You're all caught up!</p>
            </div>
        `;
        return;
    }

    list.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.is_read ? '' : 'unread'}" 
             onclick="markNotifRead('${notif.id}', this)">
            <div>${notif.message}</div>
            <div class="notification-time">${timeAgo(notif.created_at)}</div>
        </div>
    `).join('');
}

// ---- Toggle notification panel ----
function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    panel.classList.toggle('open');
}

// ---- Mark a single notification as read ----
async function markNotifRead(id, element) {
    try {
        await put(`/notifications/${id}/read`);
        element.classList.remove('unread');
        loadNotifications(); // Refresh count
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// ---- Mark all notifications as read ----
async function markAllRead() {
    try {
        await put('/notifications/read-all');
        loadNotifications(); // Refresh
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
}

// ---- Auto-refresh notifications every 30 seconds ----
setInterval(() => {
    if (isLoggedIn()) {
        loadNotifications();
    }
}, 30000);

// ====================================
// Dashboard Page Logic
// ====================================
// Loads and displays events, stats, and handles user interactions

// Check authentication
if (!requireAuth()) {
    // requireAuth() redirects to login if not logged in
}

// ---- Initialize the dashboard ----
document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    loadEvents();
    loadNotifications();
});

// ---- Set up user info in sidebar ----
function setupUserInfo() {
    const user = getUser();
    if (!user) return;

    document.getElementById('user-name').textContent = user.full_name;
    document.getElementById('user-role').textContent = user.role;
    document.getElementById('user-avatar').textContent = user.full_name.charAt(0).toUpperCase();

    // Show admin link if user is admin
    if (user.role === 'admin') {
        document.getElementById('admin-link').classList.remove('hidden');
    }
}

// ---- Load events from the API ----
async function loadEvents() {
    try {
        // Build query parameters from filters
        const status = document.getElementById('filter-status').value;
        const fromDate = document.getElementById('filter-from').value;
        const toDate = document.getElementById('filter-to').value;

        let queryParams = '?';
        if (status) queryParams += `status=${status}&`;
        if (fromDate) queryParams += `from_date=${fromDate}&`;
        if (toDate) queryParams += `to_date=${toDate}&`;

        const data = await get(`/events${queryParams}`);

        // Render own events
        renderEvents(data.own_events, 'own-events-grid', true);

        // Render participating events
        renderEvents(data.participating_events, 'participating-events-grid', false);

        // Update stats
        updateStats(data.own_events, data.participating_events);
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// ---- Render event cards into a grid ----
function renderEvents(events, containerId, isOwner) {
    const container = document.getElementById(containerId);

    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <h3>No events found</h3>
                <p>${isOwner ? 'Create your first event to get started!' : 'You haven\'t been invited to any events yet.'}</p>
                ${isOwner ? '<a href="/event" class="btn btn-primary">➕ Create Event</a>' : ''}
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(event => `
        <div class="event-card status-${event.status}" onclick="window.location.href='/event-detail?id=${event.id}'">
            <div class="flex justify-between items-center mb-10">
                <span class="badge badge-${event.status}">${event.status}</span>
                ${event.participant_status ? `<span class="badge badge-${event.participant_status}">${event.participant_status}</span>` : ''}
            </div>
            <h3>${escapeHtml(event.title)}</h3>
            <div class="event-meta">
                <span>📅 ${formatDate(event.date)}</span>
                <span>🕐 ${formatTime(event.start_time)} - ${formatTime(event.end_time)}</span>
                ${event.location ? `<span>📍 ${escapeHtml(event.location)}</span>` : ''}
            </div>
            ${event.description ? `<p class="event-description">${escapeHtml(event.description)}</p>` : ''}
            ${isOwner ? `
                <div class="event-actions">
                    <a href="/event?id=${event.id}" class="btn btn-outline btn-sm" onclick="event.stopPropagation()">✏️ Edit</a>
                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deleteEvent('${event.id}')">🗑️ Delete</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ---- Update stats numbers ----
function updateStats(ownEvents, participatingEvents) {
    const total = ownEvents.length;
    const upcoming = ownEvents.filter(e => e.status === 'upcoming').length;
    const completed = ownEvents.filter(e => e.status === 'completed').length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-upcoming').textContent = upcoming;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-participating').textContent = participatingEvents.length;
}

// ---- Delete an event ----
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        await del(`/events/${eventId}`);
        loadEvents(); // Refresh the list
    } catch (error) {
        alert('Error deleting event: ' + error.message);
    }
}

// ---- Clear all filters ----
function clearFilters() {
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-from').value = '';
    document.getElementById('filter-to').value = '';
    loadEvents();
}

// ---- Handle logout ----
function handleLogout() {
    removeToken();
    window.location.href = '/';
}

// ---- Toggle sidebar on mobile ----
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ---- Escape HTML to prevent XSS ----
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

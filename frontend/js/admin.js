// ====================================
// Admin Panel Logic
// ====================================
// Loads and displays all users and events for admins.

if (!requireAuth()) {}

// Check if user is admin
const user = getUser();
if (user && user.role !== 'admin') {
    alert('Access denied. Admin privileges required.');
    window.location.href = '/dashboard';
}

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    loadAdminUsers();
    loadAdminEvents();
});

// ---- Setup user info ----
function setupUserInfo() {
    if (!user) return;
    document.getElementById('user-name').textContent = user.full_name;
    document.getElementById('user-role').textContent = user.role;
    document.getElementById('user-avatar').textContent = user.full_name.charAt(0).toUpperCase();
}

// ---- Switch between Users and Events tabs ----
function showAdminTab(tab) {
    const usersSection = document.getElementById('users-section');
    const eventsSection = document.getElementById('events-section');
    const usersTab = document.getElementById('users-tab');
    const eventsTab = document.getElementById('events-tab');

    if (tab === 'users') {
        usersSection.classList.remove('hidden');
        eventsSection.classList.add('hidden');
        usersTab.classList.add('active');
        eventsTab.classList.remove('active');
    } else {
        usersSection.classList.add('hidden');
        eventsSection.classList.remove('hidden');
        usersTab.classList.remove('active');
        eventsTab.classList.add('active');
    }
}

// ---- Load all users ----
async function loadAdminUsers() {
    try {
        const data = await get('/admin/users');
        const tbody = document.getElementById('users-table-body');

        document.getElementById('stat-users').textContent = data.users.length;

        tbody.innerHTML = data.users.map(u => `
            <tr>
                <td><strong>${escapeHtml(u.full_name)}</strong></td>
                <td>${escapeHtml(u.email)}</td>
                <td><span class="badge badge-${u.role}">${u.role}</span></td>
                <td>${formatDate(u.created_at)}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// ---- Load all events ----
async function loadAdminEvents() {
    try {
        const data = await get('/admin/events');
        const tbody = document.getElementById('events-table-body');

        document.getElementById('stat-events').textContent = data.events.length;

        tbody.innerHTML = data.events.map(event => `
            <tr style="cursor: pointer;" onclick="window.location.href='/event-detail?id=${event.id}'">
                <td><strong>${escapeHtml(event.title)}</strong></td>
                <td>${formatDate(event.date)}</td>
                <td>${formatTime(event.start_time)} - ${formatTime(event.end_time)}</td>
                <td>${event.users ? escapeHtml(event.users.full_name) : 'Unknown'}</td>
                <td><span class="badge badge-${event.status}">${event.status}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// ---- Escape HTML ----
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ---- Logout ----
function handleLogout() {
    removeToken();
    window.location.href = '/';
}

// ---- Toggle sidebar ----
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

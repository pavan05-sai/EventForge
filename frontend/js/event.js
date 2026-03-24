// ====================================
// Event Create/Edit Page Logic
// ====================================

if (!requireAuth()) {}

// Check if we're in edit mode (URL has ?id=...)
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');
const isEditMode = !!eventId;

// ---- Initialize the page ----
document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();

    if (isEditMode) {
        // We're editing an existing event
        document.getElementById('page-title').textContent = 'Edit Event';
        document.getElementById('submit-btn').textContent = '💾 Save Changes';
        document.getElementById('status-group').classList.remove('hidden');
        document.title = 'Edit Event - Event Manager';
        loadEventData();
    }
});

// ---- Set up user info in sidebar ----
function setupUserInfo() {
    const user = getUser();
    if (!user) return;
    document.getElementById('user-name').textContent = user.full_name;
    document.getElementById('user-role').textContent = user.role;
    document.getElementById('user-avatar').textContent = user.full_name.charAt(0).toUpperCase();
    if (user.role === 'admin') {
        document.getElementById('admin-link').classList.remove('hidden');
    }
}

// ---- Load existing event data for editing ----
async function loadEventData() {
    try {
        const data = await get(`/events/${eventId}`);
        const event = data.event;

        document.getElementById('event-title').value = event.title;
        document.getElementById('event-description').value = event.description || '';
        document.getElementById('event-date').value = event.date;
        document.getElementById('event-start').value = event.start_time;
        document.getElementById('event-end').value = event.end_time;
        document.getElementById('event-location').value = event.location || '';
        document.getElementById('event-status').value = event.status;
    } catch (error) {
        alert('Error loading event: ' + error.message);
        window.location.href = '/dashboard';
    }
}

// ---- Handle form submission (Create or Update) ----
async function handleSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('submit-btn');
    const alertContainer = document.getElementById('form-alert');

    // Gather form data
    const eventData = {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-description').value,
        date: document.getElementById('event-date').value,
        start_time: document.getElementById('event-start').value,
        end_time: document.getElementById('event-end').value,
        location: document.getElementById('event-location').value,
    };

    // Add status only in edit mode
    if (isEditMode) {
        eventData.status = document.getElementById('event-status').value;
    }

    // Validate end time is after start time
    if (eventData.end_time <= eventData.start_time) {
        showAlert(alertContainer, 'End time must be after start time.', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Saving...';

    try {
        if (isEditMode) {
            await put(`/events/${eventId}`, eventData);
            showAlert(alertContainer, 'Event updated successfully!', 'success');
        } else {
            await post('/events', eventData);
            showAlert(alertContainer, 'Event created successfully!', 'success');
            // Redirect to dashboard after a short delay
            setTimeout(() => window.location.href = '/dashboard', 1500);
        }
    } catch (error) {
        showAlert(alertContainer, error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = isEditMode ? '💾 Save Changes' : '➕ Create Event';
    }
}

// ---- Logout ----
function handleLogout() {
    removeToken();
    window.location.href = '/';
}

// ---- Toggle sidebar on mobile ----
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

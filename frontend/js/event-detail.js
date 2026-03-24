// ====================================
// Event Detail Page Logic
// ====================================
// Shows event details, participants, and allows invitation management.

if (!requireAuth()) {}

// Get event ID from URL query parameter
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

let currentEvent = null;

if (!eventId) {
    window.location.href = '/dashboard';
}

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    loadEventDetail();
    loadParticipants();
});

// ---- Setup user info ----
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

// ---- Load event details ----
async function loadEventDetail() {
    try {
        const data = await get(`/events/${eventId}`);
        currentEvent = data.event;
        renderEventDetail(currentEvent);
    } catch (error) {
        document.getElementById('event-info').innerHTML = `
            <div class="empty-state">
                <div class="icon">❌</div>
                <h3>Event not found</h3>
                <p>${error.message}</p>
                <a href="/dashboard" class="btn btn-primary">Go to Dashboard</a>
            </div>
        `;
    }
}

// ---- Render event detail card ----
function renderEventDetail(event) {
    const user = getUser();
    const isOwner = event.created_by === user.id;

    // Get creator name
    const creatorName = event.users ? event.users.full_name : 'Unknown';
    const creatorEmail = event.users ? event.users.email : '';

    document.getElementById('event-info').innerHTML = `
        <div class="flex justify-between items-center mb-10">
            <span class="badge badge-${event.status}">${event.status}</span>
            ${isOwner ? `
                <div class="flex gap-10">
                    <a href="/event?id=${event.id}" class="btn btn-outline btn-sm">✏️ Edit</a>
                    <button class="btn btn-danger btn-sm" onclick="deleteEvent()">🗑️ Delete</button>
                </div>
            ` : ''}
        </div>

        <h2 style="font-size: 22px; margin-bottom: 16px;">${escapeHtml(event.title)}</h2>
        
        ${event.description ? `<p style="color: var(--gray-600); margin-bottom: 20px;">${escapeHtml(event.description)}</p>` : ''}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div>
                <strong style="font-size: 12px; color: var(--gray-500); text-transform: uppercase;">Date</strong>
                <p>📅 ${formatDate(event.date)}</p>
            </div>
            <div>
                <strong style="font-size: 12px; color: var(--gray-500); text-transform: uppercase;">Time</strong>
                <p>🕐 ${formatTime(event.start_time)} - ${formatTime(event.end_time)}</p>
            </div>
            <div>
                <strong style="font-size: 12px; color: var(--gray-500); text-transform: uppercase;">Location</strong>
                <p>📍 ${event.location ? escapeHtml(event.location) : 'Not specified'}</p>
            </div>
            <div>
                <strong style="font-size: 12px; color: var(--gray-500); text-transform: uppercase;">Created By</strong>
                <p>👤 ${escapeHtml(creatorName)}</p>
            </div>
        </div>
    `;

    // Show/hide invite button based on ownership
    const inviteBtn = document.getElementById('invite-btn');
    if (!isOwner && user.role !== 'admin') {
        inviteBtn.classList.add('hidden');
    }
}

// ---- Load participants ----
async function loadParticipants() {
    try {
        const data = await get(`/events/${eventId}/participants`);
        renderParticipants(data.participants);
    } catch (error) {
        console.error('Error loading participants:', error);
    }
}

// ---- Render participants list ----
function renderParticipants(participants) {
    const container = document.getElementById('participants-container');
    const user = getUser();
    const isOwner = currentEvent && currentEvent.created_by === user.id;

    if (!participants || participants.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 30px;">
                <div class="icon">👥</div>
                <h3>No participants yet</h3>
                <p>Invite people to this event!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <ul class="participants-list">
            ${participants.map(p => {
                const pUser = p.users;
                const isMe = pUser.id === user.id;

                return `
                    <li>
                        <div class="participant-info">
                            <div class="participant-avatar">${pUser.full_name.charAt(0).toUpperCase()}</div>
                            <div>
                                <strong>${escapeHtml(pUser.full_name)} ${isMe ? '(You)' : ''}</strong>
                                <div style="font-size: 12px; color: var(--gray-500);">${escapeHtml(pUser.email)}</div>
                            </div>
                        </div>
                        <div class="flex gap-10 items-center">
                            <span class="badge badge-${p.status}">${p.status}</span>
                            ${isMe && p.status === 'invited' ? `
                                <button class="btn btn-success btn-sm" onclick="respondInvite('${p.id}', 'accepted')">✅ Accept</button>
                                <button class="btn btn-danger btn-sm" onclick="respondInvite('${p.id}', 'declined')">❌ Decline</button>
                            ` : ''}
                            ${isOwner ? `
                                <button class="btn btn-outline btn-sm" onclick="removeParticipant('${p.id}')" title="Remove">🗑️</button>
                            ` : ''}
                        </div>
                    </li>
                `;
            }).join('')}
        </ul>
    `;
}

// ---- Show invite modal ----
function showInviteModal() {
    document.getElementById('invite-modal').classList.add('active');
    document.getElementById('invite-email').focus();
}

// ---- Hide invite modal ----
function hideInviteModal() {
    document.getElementById('invite-modal').classList.remove('active');
    document.getElementById('invite-email').value = '';
}

// ---- Invite a participant ----
async function inviteParticipant() {
    const email = document.getElementById('invite-email').value.trim();
    const alertContainer = document.getElementById('invite-alert');

    if (!email) {
        showAlert(alertContainer, 'Please enter an email address.', 'error');
        return;
    }

    try {
        await post(`/events/${eventId}/participants`, { email });
        hideInviteModal();
        showAlert(document.getElementById('event-alert'), 'Participant invited successfully!', 'success');
        loadParticipants(); // Refresh the list
    } catch (error) {
        showAlert(alertContainer, error.message, 'error');
    }
}

// ---- Accept or decline invitation ----
async function respondInvite(participantId, status) {
    try {
        await put(`/events/${eventId}/participants/${participantId}`, { status });
        loadParticipants(); // Refresh
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ---- Remove a participant ----
async function removeParticipant(participantId) {
    if (!confirm('Remove this participant?')) return;

    try {
        await del(`/events/${eventId}/participants/${participantId}`);
        loadParticipants(); // Refresh
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ---- Delete the event ----
async function deleteEvent() {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;

    try {
        await del(`/events/${eventId}`);
        window.location.href = '/dashboard';
    } catch (error) {
        alert('Error: ' + error.message);
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

// ====================================
// API Helper (Fetch Wrapper)
// ====================================
// This file provides a simple wrapper around the fetch API.
// It automatically attaches the JWT token to every request.
// All other JS files use this to communicate with the backend.

const API_BASE = '/api';

// ---- Get the stored JWT token ----
function getToken() {
    return localStorage.getItem('token');
}

// ---- Save token to localStorage ----
function setToken(token) {
    localStorage.setItem('token', token);
}

// ---- Remove token (logout) ----
function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// ---- Get stored user info ----
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// ---- Save user info ----
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// ---- Main API request function ----
// This is the core function that all API calls use
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = getToken();

    // Set default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add auth token if available
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Parse the JSON response
        const data = await response.json();

        // If the response is not OK, throw an error
        if (!response.ok) {
            // If token is invalid/expired, redirect to login
            if (response.status === 401) {
                removeToken();
                window.location.href = '/';
                return;
            }
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        // Re-throw the error so the calling code can handle it
        throw error;
    }
}

// ---- Convenience methods for common HTTP verbs ----

// GET request (fetch data)
function get(endpoint) {
    return apiRequest(endpoint, { method: 'GET' });
}

// POST request (create data)
function post(endpoint, body) {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

// PUT request (update data)
function put(endpoint, body) {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

// DELETE request (remove data)
function del(endpoint) {
    return apiRequest(endpoint, { method: 'DELETE' });
}

// ---- Check if user is logged in ----
function isLoggedIn() {
    return !!getToken();
}

// ---- Redirect to login if not authenticated ----
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/';
        return false;
    }
    return true;
}

// ---- Show alert message ----
function showAlert(container, message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    // Remove existing alerts
    const existing = container.querySelector('.alert');
    if (existing) existing.remove();

    container.prepend(alertDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => alertDiv.remove(), 5000);
}

// ---- Format date for display ----
function formatDate(dateStr) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

// ---- Format time for display ----
function formatTime(timeStr) {
    // Convert "14:30:00" to "2:30 PM"
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// ---- Format relative time (e.g., "2 hours ago") ----
function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateStr);
}

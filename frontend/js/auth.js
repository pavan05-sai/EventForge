// ====================================
// Auth Page Logic (Login & Register)
// ====================================
// Handles the login and register forms on index.html

// If the user is already logged in, redirect to dashboard
if (isLoggedIn()) {
    window.location.href = '/dashboard';
}

// ---- Switch between Login and Register tabs ----
function showTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
    }
}

// ---- Handle Login Form Submission ----
async function handleLogin(e) {
    e.preventDefault(); // Prevent page refresh

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    const alertContainer = document.getElementById('login-alert');

    // Disable button while loading
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Logging in...';

    try {
        // Send login request to backend
        const data = await post('/auth/login', { email, password });

        // Save token and user info
        setToken(data.token);
        setUser(data.user);

        // Redirect to dashboard
        window.location.href = '/dashboard';
    } catch (error) {
        showAlert(alertContainer, error.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Login';
    }
}

// ---- Handle Register Form Submission ----
async function handleRegister(e) {
    e.preventDefault();

    const full_name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    const btn = document.getElementById('register-btn');
    const alertContainer = document.getElementById('register-alert');

    // Check if passwords match
    if (password !== confirm) {
        showAlert(alertContainer, 'Passwords do not match!', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account...';

    try {
        const data = await post('/auth/register', { email, password, full_name });

        // Save token and user info
        setToken(data.token);
        setUser(data.user);

        // Redirect to dashboard
        window.location.href = '/dashboard';
    } catch (error) {
        showAlert(alertContainer, error.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Create Account';
    }
}

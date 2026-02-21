// ===================================
// AUTHENTICATION - auth.js
// Supabase Authentication Logic
// ===================================

// Initialize Supabase Client (Replace with your actual credentials)
const SUPABASE_URL = 'https://ujadsysjxizlrayajrjq.supabase.co'; // Replace with your Supabase project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYWRzeXNqeGl6bHJheWFqcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjAyMjYsImV4cCI6MjA4NzIzNjIyNn0.Wq0jcCWMvLrTcYnzIjlYaGWw0YJY4Hbfl9dRaNeeI9k'; // Replace with your Supabase anon key

// Client instance - using 'let' to avoid overwriting window.supabase from CDN
let supabaseClient = null;

// Initialize Supabase synchronously
function initSupabase() {
    if (supabaseClient) return true;
             
    try {
        // Check if Supabase library is loaded
        if (typeof window.supabase === 'undefined' || window.supabase === null) {
            return false;
        }
        
        // Handle different possible structures
        let createClient;
        
        // Structure 1: window.supabase.createClient (most common)
        if (typeof window.supabase.createClient === 'function') {
            createClient = window.supabase.createClient;
        }
        // Structure 2: window.supabase itself is the createClient function
        else if (typeof window.supabase === 'function') {
            createClient = window.supabase;
        }
        // Structure 3: Check for default export
        else if (window.supabase.default && typeof window.supabase.default.createClient === 'function') {
            createClient = window.supabase.default.createClient;
        }
        else {
            console.warn('⚠️ Supabase loaded but structure unexpected:', {
                type: typeof window.supabase,
                keys: Object.keys(window.supabase || {}).slice(0, 10),
                hasCreateClient: 'createClient' in (window.supabase || {})
            });
            return false;
        }
        
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabaseClient; // Expose for dashboard.js, profile.js, etc.
        console.log('✅ Supabase initialized successfully');
        
        // Optionally check auth state
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                console.log('👤 User session active');
            } else {
                console.log('👋 No active session (browsing as guest)');
            }
        }).catch(() => {
            // Silent - session check is optional
        });
        
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

// Poll for Supabase library availability with debugging
let initAttempts = 0;
const maxInitAttempts = 30; // Increased attempts
const initInterval = setInterval(() => {
    if (supabaseClient) {
        clearInterval(initInterval);
        return;
    }
    
    // Debug log every 5 attempts
    if (initAttempts % 5 === 0 && initAttempts > 0) {
        console.log(`⏳ Attempt ${initAttempts}: window.supabase =`, typeof window.supabase);
    }
    
    if (initSupabase()) {
        clearInterval(initInterval);
    } else {
        initAttempts++;
        if (initAttempts >= maxInitAttempts) {
            clearInterval(initInterval);
            console.error('❌ Supabase library failed to load after multiple attempts');
            console.error('Debug info:', {
                'window.supabase type': typeof window.supabase,
                'window.supabase value': window.supabase,
                'window keys': Object.keys(window).filter(k => k.toLowerCase().includes('supabase'))
            });
        }
    }
}, 100);

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Show toast notification
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            ${type === 'success' 
                ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>'
                : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>'
            }
        </svg>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Create toast container if it doesn't exist
function createToastContainer() {
    let container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Show loading state
function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Loading...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Submit';
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'weak', width: '33%', color: '#ef4444' };
    if (strength <= 4) return { level: 'medium', width: '66%', color: '#f59e0b' };
    return { level: 'strong', width: '100%', color: '#10b981' };
}

// ===================================
// AUTHENTICATION FUNCTIONS
// ===================================

// Sign Up
async function handleSignUp(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Get form values
    const fullName = form.querySelector('#name')?.value.trim() || '';
    const email = form.querySelector('#email')?.value.trim() || '';
    const password = form.querySelector('#password')?.value || '';
    const confirmPassword = form.querySelector('#confirmPassword')?.value || '';
    const termsCheckbox = form.querySelector('#agreeTerms') || form.querySelector('#terms');
    const termsAccepted = termsCheckbox ? termsCheckbox.checked : false;
    const userType = form.querySelector('input[name="userType"]:checked')?.value || 'user';
    
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showToast('Password must be at least 8 characters long', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showToast('Please accept the terms and conditions', 'error');
        return;
    }
    
    setLoading(submitBtn, true);
    
    try {
        // Ensure supabase is initialized
        if (!supabaseClient) {
            initSupabase();
        }
        
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized');
        }
        
        // Sign up with Supabase
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    user_type: userType
                }
            }
        });
        
        if (error) throw error;
        
        const accountType = userType === 'agent' ? 'Agent' : 'User';
        showToast(`${accountType} account created successfully! Please check your email to verify.`, 'success');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        console.error('Sign up error:', error);
        showToast(error.message || 'Failed to create account', 'error');
    } finally {
        setLoading(submitBtn, false);
    }
}

// Login
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Get form values
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    const rememberMe = form.querySelector('#remember')?.checked || false;
    
    // Validation
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    setLoading(submitBtn, true);
    
    try {
        // Ensure supabase is initialized
        if (!supabaseClient) {
            initSupabase();
        }
        
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized');
        }
        
        // Login with Supabase
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Store remember me preference
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        showToast('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Invalid email or password', 'error');
    } finally {
        setLoading(submitBtn, false);
    }
}

// Logout
async function handleLogout() {
    try {
        // Ensure supabase is initialized
        if (!supabaseClient) {
            initSupabase();
        }
        
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized');
        }
        
        const { error } = await supabaseClient.auth.signOut();
        
        if (error) throw error;
        
        // Clear local storage
        localStorage.removeItem('rememberMe');
        
        showToast('Logged out successfully', 'success');
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Failed to logout', 'error');
    }
}

// Get current user
async function getCurrentUser() {
    try {
        // Wait for supabase to be initialized (max 3 seconds)
        let attempts = 0;
        while (!supabaseClient && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!supabaseClient || !supabaseClient.auth) {
            return null;
        }
        
        // First check if there's an active session
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        // If no session, user is not logged in (this is normal, not an error)
        if (!session) {
            return null;
        }
        
        // If there's a session, get the user details
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError) {
            // Only log if it's not a "no user" error
            if (!userError.message?.includes('missing sub claim')) {
                console.error('Get user error:', userError);
            }
            return null;
        }
        
        return user;
    } catch (error) {
        // Only log unexpected errors
        if (!error.message?.includes('missing sub claim') && !error.message?.includes('No session')) {
            console.error('Get user error:', error);
        }
        return null;
    }
}

// Check if user is logged in
async function isLoggedIn() {
    const user = await getCurrentUser();
    return user !== null;
}

// Get authentication status without redirecting
// Returns: { isAuthenticated: boolean, user: object|null }
async function getAuthStatus() {
    try {
        const user = await getCurrentUser();
        return {
            isAuthenticated: user !== null,
            user: user
        };
    } catch (error) {
        console.error('Error getting auth status:', error);
        return {
            isAuthenticated: false,
            user: null
        };
    }
}

// Protect route - redirect to login if not authenticated.
// Call ONLY from dashboard and profile pages (never on index or public pages).
async function requireAuth() {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        showToast('Please login to access this page', 'error');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Redirect if already logged in (for login/signup pages)
async function redirectIfLoggedIn() {
    const loggedIn = await isLoggedIn();
    
    if (loggedIn) {
        window.location.href = 'dashboard.html';
        return true;
    }
    
    return false;
}

// ===================================
// UI FUNCTIONS
// ===================================

// Navbar: if NOT logged in show Login & Signup; if logged in show Dashboard & Logout (no redirect).
// Supports (1) ul.nav-menu / #navMenu and (2) div.nav-actions (Chalgumbe Bastar landing).
async function initAuthUI() {
    const authStatus = await getAuthStatus();
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const navMenu = navbar.querySelector('.nav-menu, #navMenu');
    const navActions = navbar.querySelector('.nav-actions');

    if (navActions) {
        // Landing page: .nav-actions with Sign In / Sign Up links
        const authLinks = navActions.querySelectorAll('.auth-link, a[href="login.html"], a[href="signup.html"], a[href="dashboard.html"], .logout-link');
        authLinks.forEach(el => el.remove());

        if (authStatus.isAuthenticated) {
            const dash = document.createElement('a');
            dash.href = 'dashboard.html';
            dash.className = 'sign-in auth-link';
            dash.textContent = 'Dashboard';
            navActions.appendChild(dash);
            const out = document.createElement('a');
            out.href = '#';
            out.className = 'btn btn-green auth-link logout-link';
            out.id = 'navLogoutBtn';
            out.textContent = 'Logout';
            navActions.appendChild(out);
            out.addEventListener('click', function(e) { e.preventDefault(); handleLogout(); });
        } else {
            const signIn = document.createElement('a');
            signIn.href = 'login.html';
            signIn.className = 'sign-in auth-link';
            signIn.textContent = 'Sign In';
            navActions.appendChild(signIn);
            const signUp = document.createElement('a');
            signUp.href = 'signup.html';
            signUp.className = 'btn btn-green auth-link';
            signUp.textContent = 'Sign Up';
            navActions.appendChild(signUp);
        }
        return;
    }

    if (!navMenu) return;

    const authButtons = navMenu.querySelectorAll('li > a[href="login.html"], li > a[href="signup.html"], li > a[href="dashboard.html"], li > .logout-link');
    authButtons.forEach(btn => {
        if (btn.parentElement && btn.parentElement.tagName === 'LI') {
            btn.parentElement.remove();
        }
    });

    if (authStatus.isAuthenticated) {
        const dashboardLi = document.createElement('li');
        dashboardLi.innerHTML = '<a href="dashboard.html" class="btn-secondary-nav">Dashboard</a>';
        navMenu.appendChild(dashboardLi);
        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = '<a href="#" class="btn-primary-nav logout-link" id="navLogoutBtn">Logout</a>';
        navMenu.appendChild(logoutLi);
        const logoutLink = document.getElementById('navLogoutBtn');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) { e.preventDefault(); handleLogout(); });
        }
    } else {
        const loginLi = document.createElement('li');
        loginLi.innerHTML = '<a href="login.html" class="btn-secondary-nav">Login</a>';
        navMenu.appendChild(loginLi);
        const signupLi = document.createElement('li');
        signupLi.innerHTML = '<a href="signup.html" class="btn-primary-nav">Get Started</a>';
        navMenu.appendChild(signupLi);
    }
}

// Show "Please login to continue" modal with Login button (do not redirect or block whole page).
function showLoginModal(actionName = 'perform this action') {
    // Create modal HTML
    const modalHTML = `
        <div class="auth-modal-overlay" id="loginRequiredModal">
            <div class="auth-modal glass-card">
                <div class="auth-modal-icon">🔒</div>
                <h3 class="auth-modal-title">Login Required</h3>
                <p class="auth-modal-message">Please login to ${actionName}</p>
                <div class="auth-modal-actions">
                    <button class="btn btn-secondary" onclick="document.getElementById('loginRequiredModal').remove()">Cancel</button>
                    <a href="login.html" class="btn btn-primary">Login</a>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('loginRequiredModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Close modal on overlay click
    const overlay = document.getElementById('loginRequiredModal');
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// For protected actions (e.g. Submit complaint, Connect agent): show modal if not logged in; do not block page.
async function requireAuthForAction(actionName) {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        showLoginModal(actionName);
        return false;
    }
    return true;
}

// ===================================
// PASSWORD VISIBILITY TOGGLE
// ===================================

function initPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (!input) return;
            
            // Toggle password visibility
            if (input.type === 'password') {
                input.type = 'text';
            } else {
                input.type = 'password';
            }
        });
    });
}

// ===================================
// PASSWORD STRENGTH INDICATOR
// ===================================

function initPasswordStrength() {
    const passwordInput = document.querySelector('#password');
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (passwordInput && strengthBar && strengthText) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            if (password.length === 0) {
                strengthBar.style.width = '0%';
                strengthText.textContent = '';
                return;
            }
            
            const strength = checkPasswordStrength(password);
            strengthBar.style.width = strength.width;
            strengthBar.style.backgroundColor = strength.color;
            strengthText.textContent = `Password strength: ${strength.level}`;
            strengthText.style.color = strength.color;
        });
    }
}

// ===================================
// PAGE INITIALIZATION
// No global auth redirect. Public pages (index, 404, etc.) never redirect to login.
// requireAuth() is called ONLY for dashboard.html and profile.html.
// ===================================

document.addEventListener('DOMContentLoaded', async function() {
    // Supabase is being initialized via polling at script load
    if (!supabaseClient) {
        console.log('⏳ Waiting for Supabase initialization...');
    }
    
    initPasswordToggles();
    initPasswordStrength();
    
    const path = window.location.pathname;
    const currentPage = path.split('/').pop() || 'index.html';
    
    // ----- Login page: redirect to dashboard if already logged in -----
    if (currentPage === 'login.html') {
        await redirectIfLoggedIn();
        const loginForm = document.querySelector('#loginForm');
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
    }
    // ----- Signup page: redirect to dashboard if already logged in -----
    else if (currentPage === 'signup.html') {
        await redirectIfLoggedIn();
        const signupForm = document.querySelector('#signupForm');
        if (signupForm) signupForm.addEventListener('submit', handleSignUp);
    }
    // ----- PROTECTED ROUTES: requireAuth() ONLY here -----
    else if (currentPage === 'dashboard.html' || currentPage === 'profile.html') {
        await requireAuth();
    }
    // ----- PUBLIC PAGES: index.html, 404.html, etc. - NO redirect, only navbar -----
    else {
        await initAuthUI();
    }
    
    // Logout button handler (for any page that has it)
    document.querySelectorAll('.logout-btn, #logoutBtn, .logout-link').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    });
});

// ===================================
// EXPORT FOR USE IN OTHER FILES
// ===================================

// Make functions available globally
window.authFunctions = {
    // Core auth functions
    getCurrentUser,
    isLoggedIn,
    getAuthStatus,
    
    // Route protection
    requireAuth,
    requireAuthForAction,
    
    // UI functions
    initAuthUI,
    showLoginModal,
    
    // Auth actions
    handleLogout,
    
    // Utilities
    showToast
};

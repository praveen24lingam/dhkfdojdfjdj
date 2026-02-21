// ===================================
// MAIN - main.js
// General Functionality & UI Interactions
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Initialize language toggle
    initLanguageToggle();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize smooth scroll
    initSmoothScroll();
    
    // Initialize navbar scroll effect
    initNavbarScroll();
    
    // Initialize animations on scroll
    initScrollAnimations();
    
    // Initialize protected action handlers
    initProtectedActions();
});

// ===================================
// THEME TOGGLE (Dark/Light Mode)
// ===================================

function initTheme() {
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Theme toggle buttons
    const themeToggles = document.querySelectorAll('.theme-toggle, .theme-toggle-auth');
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', toggleTheme);
    });
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// ===================================
// LANGUAGE TOGGLE (Hindi/English)
// ===================================

const translations = {
    hi: {
        navLinks: ['होम', 'अन्वेषण', 'यात्रा योजना', 'त्योहार', 'गैलरी', 'परिवहन', 'सहायता', 'संपर्क'],
        langBtn: 'हिंदी',
        signIn: 'साइन इन',
        signUp: 'साइन अप'
    },
    en: {
        navLinks: ['Home', 'Explore', 'Plan Trip', 'Festivals', 'Gallery', 'Transport', 'Help', 'Contact'],
        langBtn: 'English',
        signIn: 'Sign In',
        signUp: 'Sign Up'
    }
};

function initLanguageToggle() {
    // Get saved language or default to Hindi
    const savedLang = localStorage.getItem('language') || 'hi';
    setLanguage(savedLang, false);
    
    // Language toggle buttons
    const langToggles = document.querySelectorAll('.lang, .lang-toggle, #footerLangToggle');
    langToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleLanguage();
        });
    });
}

function setLanguage(lang, animate = true) {
    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem('language', lang);
    
    const t = translations[lang];
    
    // Update navbar links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link, index) => {
        if (t.navLinks[index] && animate) {
            link.style.opacity = '0';
            setTimeout(() => {
                link.textContent = t.navLinks[index];
                link.style.opacity = '1';
            }, 100);
        } else if (t.navLinks[index]) {
            link.textContent = t.navLinks[index];
        }
    });
    
    // Update drawer links
    const drawerLinks = document.querySelectorAll('.drawer-link');
    drawerLinks.forEach((link, index) => {
        if (t.navLinks[index]) {
            link.textContent = t.navLinks[index];
        }
    });
    
    // Update language button text
    const langButtons = document.querySelectorAll('.lang, .lang-toggle span, #footerLangToggle span');
    langButtons.forEach(btn => {
        const textElement = btn.tagName === 'SPAN' ? btn : btn;
        if (animate) {
            textElement.style.opacity = '0';
            setTimeout(() => {
                textElement.textContent = t.langBtn;
                textElement.style.opacity = '1';
            }, 100);
        } else {
            textElement.textContent = t.langBtn;
        }
    });
    
    // Update auth links
    const signInLinks = document.querySelectorAll('.sign-in');
    signInLinks.forEach(link => {
        if (link.textContent.includes('Sign') || link.textContent.includes('साइन')) {
            link.textContent = t.signIn;
        }
    });
    
    // Update sign up buttons
    const signUpBtns = document.querySelectorAll('a[href="signup.html"], a[href="sign-up.html"]');
    signUpBtns.forEach(btn => {
        if (btn.classList.contains('btn') && (btn.textContent.includes('Sign') || btn.textContent.includes('साइन'))) {
            btn.textContent = t.signUp;
        }
    });
}

function toggleLanguage() {
    const currentLang = document.documentElement.getAttribute('data-lang') || 'hi';
    const newLang = currentLang === 'hi' ? 'en' : 'hi';
    setLanguage(newLang, true);
}

// ===================================
// MOBILE MENU (Hamburger)
// ===================================

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!hamburger || !navMenu) return;
    
    // Toggle menu
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('open');
        this.classList.toggle('active');
        
        // Animate hamburger
        const spans = this.querySelectorAll('span');
        if (navMenu.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translateY(7px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-7px)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });
    
    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
            
            // Reset hamburger animation
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
            
            // Reset hamburger animation
            const spans = hamburger.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity = '';
            spans[2].style.transform = '';
        }
    });
}

// ===================================
// SMOOTH SCROLL
// ===================================

function initSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or empty
            if (!href || href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const offsetTop = target.offsetTop - 80; // Account for navbar height
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// NAVBAR SCROLL EFFECT
// ===================================

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    if (!navbar) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add shadow when scrolled
        if (currentScroll > 10) {
            navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// ===================================
// SCROLL ANIMATIONS
// ===================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-fade-up, .animate-fade-left, .glass-card, .feature-card, .step-card, .testimonial-card');
    
    if (!animatedElements.length) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ===================================
// PROTECTED ACTIONS (Require Login)
// ===================================

function initProtectedActions() {
    // Get all protected action buttons/links
    // These actions require authentication
    const protectedActions = {
        '.submit-complaint-btn': 'submit a complaint',
        '.submit-feedback-btn': 'submit feedback',
        '.connect-agent-btn': 'connect with an agent',
        '.request-agent-btn': 'request an agent',
        '[data-protected-action]': null // Will use data attribute value
    };
    
    // Attach click handlers
    Object.keys(protectedActions).forEach(selector => {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
            element.addEventListener('click', async function(e) {
                // Check if auth functions are available
                if (!window.authFunctions || !window.authFunctions.requireAuthForAction) {
                    console.warn('Auth functions not loaded yet');
                    return;
                }
                
                // Get action name
                let actionName = protectedActions[selector];
                if (!actionName) {
                    actionName = this.getAttribute('data-protected-action') || 'perform this action';
                }
                
                // Check authentication
                const isAuthorized = await window.authFunctions.requireAuthForAction(actionName);
                
                if (!isAuthorized) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                
                // User is authenticated, allow action to proceed
            });
        });
    });
}

// ===================================
// PUBLIC DATA FETCHING (No Auth Required)
// Do NOT check session before fetching. Anon client is enough; RLS allows public read.
// ===================================

function getPublicSupabaseClient() {
    return window.supabaseClient;
}

// Wait for client (used by auth.js anon key - no login required)
async function waitForSupabaseClient(maxWaitMs = 3000) {
    let attempts = 0;
    const step = 100;
    while (!window.supabaseClient && attempts * step < maxWaitMs) {
        await new Promise(resolve => setTimeout(resolve, step));
        attempts++;
    }
    return window.supabaseClient;
}

// Fetch tourist places - NO session check. Public read only.
async function fetchTouristPlaces() {
    try {
        const client = await waitForSupabaseClient();
        if (!client) {
            console.error('Supabase client not available');
            return [];
        }
        const { data, error } = await client
            .from('tourist_places')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching tourist_places:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('fetchTouristPlaces:', err);
        return [];
    }
}

// Fetch public places (alias / alternate table) - NO session check
async function fetchPublicPlaces() {
    try {
        const client = await waitForSupabaseClient();
        if (!client) return [];
        const { data, error } = await client
            .from('places')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching places:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('fetchPublicPlaces:', err);
        return [];
    }
}

// Fetch public listings - NO session check
async function fetchPublicListings() {
    try {
        const client = await waitForSupabaseClient();
        if (!client) return [];
        const { data, error } = await client
            .from('listings')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching listings:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('fetchPublicListings:', err);
        return [];
    }
}

// ===================================
// FORM VALIDATION HELPERS
// ===================================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
}

function validateRequired(value) {
    return value.trim().length > 0;
}

// Add real-time validation to forms
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateInput(this);
                }
            });
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    const errorElement = input.parentElement.querySelector('.form-error');
    
    let isValid = true;
    let errorMessage = '';
    
    // Check required
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Check email
    else if (type === 'email' && value && !validateEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    }
    
    // Check min length
    else if (input.hasAttribute('minlength')) {
        const minLength = parseInt(input.getAttribute('minlength'));
        if (value.length < minLength) {
            isValid = false;
            errorMessage = `Must be at least ${minLength} characters`;
        }
    }
    
    // Update UI
    if (isValid) {
        input.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    } else {
        input.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }
    
    return isValid;
}

// ===================================
// LOADING SPINNER
// ===================================

function showLoadingSpinner(container) {
    if (!container) return;
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="var(--primary)" stroke-width="4" stroke-dasharray="90 30" opacity="0.3"/>
            <circle cx="20" cy="20" r="18" stroke="var(--primary)" stroke-width="4" stroke-dasharray="90 30" stroke-linecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="1s" repeatCount="indefinite"/>
            </circle>
        </svg>
    `;
    
    container.appendChild(spinner);
    return spinner;
}

function hideLoadingSpinner(spinner) {
    if (spinner && spinner.parentElement) {
        spinner.remove();
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===================================
// COPY TO CLIPBOARD
// ===================================

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// ===================================
// DETECT MOBILE
// ===================================

function isMobile() {
    return window.innerWidth < 768;
}

function isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
}

function isDesktop() {
    return window.innerWidth >= 1024;
}

// ===================================
// LOCAL STORAGE HELPERS
// ===================================

function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function getFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// ===================================
// FORMAT HELPERS
// ===================================

function formatDate(date, format = 'default') {
    const d = new Date(date);
    
    if (format === 'short') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (format === 'long') {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else if (format === 'time') {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
        return d.toLocaleDateString('en-US');
    }
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// ===================================
// EXPORT HELPERS FOR GLOBAL USE
// ===================================

window.utils = {
    validateEmail,
    validatePhone,
    validateRequired,
    debounce,
    throttle,
    copyToClipboard,
    isMobile,
    isTablet,
    isDesktop,
    saveToLocalStorage,
    getFromLocalStorage,
    removeFromLocalStorage,
    formatDate,
    formatNumber,
    showLoadingSpinner,
    hideLoadingSpinner,
    fetchTouristPlaces,
    fetchPublicPlaces,
    fetchPublicListings,
    waitForSupabaseClient,
    getPublicSupabaseClient
};

// ===================================
// CONSOLE MESSAGE
// ===================================

console.log('%cConnectHub Platform', 'color: #667eea; font-size: 24px; font-weight: bold;');
console.log('%cBuilt with HTML, CSS, Vanilla JavaScript & Supabase', 'color: #764ba2; font-size: 14px;');

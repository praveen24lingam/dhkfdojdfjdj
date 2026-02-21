# Authentication Setup Guide

## Overview
This application uses a **public-first** authentication model where:
- ✅ All content is accessible without login
- 🔒 Specific features require authentication
- 🚀 Clean separation between public and protected logic

---

## Architecture

### File Structure
```
js/
├── auth.js          # Authentication logic, session management
├── main.js          # Public content, UI interactions
├── dashboard.js     # Protected dashboard features
└── profile.js       # Protected profile management
```

### Script Loading Order
**Critical:** Scripts must load in this order:
```html
<!-- 1. Supabase CDN -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- 2. Auth Logic -->
<script src="js/auth.js"></script>

<!-- 3. Page-specific scripts -->
<script src="js/main.js"></script>
```

---

## Public vs Protected Pages

### Public Pages (No Authentication Required)
- ✅ `index.html` - Landing page
- ✅ `login.html` - Login form
- ✅ `signup.html` - Registration form
- ✅ Any informational pages

**Behavior:**
- Users can browse freely
- Navbar shows: Login | Get Started
- No redirects if not authenticated

### Protected Pages (Authentication Required)
- 🔒 `dashboard.html` - User dashboard
- 🔒 `profile.html` - Profile settings

**Behavior:**
- Calls `requireAuth()` on load
- Redirects to login if not authenticated
- Navbar shows: Dashboard | Logout

---

## Authentication Functions

### Core Functions (in `auth.js`)

#### 1. `getAuthStatus()`
Returns authentication status without redirecting.
```javascript
const status = await window.authFunctions.getAuthStatus();
// Returns: { isAuthenticated: boolean, user: object|null }

if (status.isAuthenticated) {
    console.log('User:', status.user.email);
}
```

#### 2. `requireAuth()`
Protects entire pages. Redirects to login if not authenticated.
```javascript
// In dashboard.js or profile.js
const isAuthorized = await window.authFunctions.requireAuth();
if (!isAuthorized) return; // Stop execution
```

#### 3. `requireAuthForAction(actionName)`
Protects specific actions. Shows login modal if not authenticated.
```javascript
// Example: Protect complaint submission
const canSubmit = await window.authFunctions.requireAuthForAction('submit a complaint');
if (!canSubmit) return; // User will see login modal
```

#### 4. `initAuthUI()`
Updates navbar based on authentication status. Called automatically on public pages.
```javascript
// Shows Login/Signup if not authenticated
// Shows Dashboard/Logout if authenticated
await window.authFunctions.initAuthUI();
```

#### 5. `showLoginModal(actionName)`
Displays a modal prompting user to login.
```javascript
window.authFunctions.showLoginModal('submit feedback');
// Shows: "Please login to submit feedback" with Login button
```

---

## Protecting Actions (Not Pages)

### Method 1: Using Data Attributes (Recommended)
Add `data-protected-action` to any button/link:
```html
<!-- Complaint submission -->
<button class="btn btn-primary" data-protected-action="submit a complaint">
    Submit Complaint
</button>

<!-- Feedback form -->
<button class="btn btn-secondary" data-protected-action="submit feedback">
    Give Feedback
</button>

<!-- Agent connection -->
<a href="#" class="btn" data-protected-action="connect with an agent">
    Connect Agent
</a>
```

**How it works:**
- `main.js` automatically attaches click handlers
- Checks authentication before allowing action
- Shows login modal if not authenticated

### Method 2: Predefined Selectors
These selectors are automatically protected:
```javascript
// In main.js
const protectedActions = {
    '.submit-complaint-btn': 'submit a complaint',
    '.submit-feedback-btn': 'submit feedback',
    '.connect-agent-btn': 'connect with an agent',
    '.request-agent-btn': 'request an agent'
};
```

Use predefined classes:
```html
<button class="btn submit-complaint-btn">Submit Complaint</button>
<button class="btn submit-feedback-btn">Submit Feedback</button>
<button class="btn connect-agent-btn">Connect Agent</button>
```

### Method 3: Manual Check in JavaScript
```javascript
// In your custom script
document.querySelector('#myButton').addEventListener('click', async function(e) {
    e.preventDefault();
    
    const isAuthorized = await window.authFunctions.requireAuthForAction('perform this action');
    
    if (!isAuthorized) {
        return; // Login modal shown automatically
    }
    
    // User is authenticated, proceed with action
    submitForm();
});
```

---

## Public Data Fetching

### Fetching Without Authentication
Use the utility functions in `main.js`:

```javascript
// Fetch public places
const places = await window.utils.fetchPublicPlaces();
console.log('Public places:', places);

// Fetch public listings
const listings = await window.utils.fetchPublicListings();
console.log('Public listings:', listings);
```

**Requirements:**
- Supabase RLS policies must allow `SELECT` for `anon` role
- Tables must have an `is_public` column (boolean)

### Setting Up RLS Policies
```sql
-- Allow anonymous users to read public places
CREATE POLICY "Public places are viewable"
ON places FOR SELECT
TO anon
USING (is_public = true);

-- Allow anonymous users to read public listings
CREATE POLICY "Public listings are viewable"
ON listings FOR SELECT
TO anon
USING (is_public = true);
```

---

## Navbar Behavior

### Automatic Updates
The navbar updates automatically based on auth status:

**Not Authenticated:**
```html
<li><a href="login.html" class="btn-secondary-nav">Login</a></li>
<li><a href="signup.html" class="btn-primary-nav">Get Started</a></li>
```

**Authenticated:**
```html
<li><a href="dashboard.html" class="btn-secondary-nav">Dashboard</a></li>
<li><a href="#" class="btn-primary-nav logout-link">Logout</a></li>
```

### Manual Refresh
To manually refresh navbar:
```javascript
await window.authFunctions.initAuthUI();
```

---

## Common Patterns

### Pattern 1: Public Page with Protected Actions
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Tourist Places</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <nav class="navbar" id="navbar">
        <!-- Navbar will be auto-populated -->
        <ul class="nav-menu" id="navMenu">
            <li><a href="#home">Home</a></li>
            <li><a href="#features">Features</a></li>
            <!-- Auth buttons added automatically -->
        </ul>
    </nav>

    <section>
        <h2>Tourist Places</h2>
        <!-- Public content - no login required -->
        <div id="placesList"></div>
        
        <!-- Protected action - login required -->
        <button class="btn" data-protected-action="report an issue">
            Report Issue
        </button>
    </section>

    <!-- Script loading order -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/auth.js"></script>
    <script src="js/main.js"></script>
    
    <script>
        // Load public data
        async function loadPlaces() {
            const places = await window.utils.fetchPublicPlaces();
            // Render places
        }
        loadPlaces();
    </script>
</body>
</html>
```

### Pattern 2: Fully Protected Page
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Dashboard</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <!-- Protected page content -->
    
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/auth.js"></script>
    <script src="js/dashboard.js"></script>
    
    <!-- dashboard.js will call requireAuth() automatically -->
</body>
</html>
```

### Pattern 3: Conditional Features
```javascript
// Show different UI based on auth status
async function initPage() {
    const status = await window.authFunctions.getAuthStatus();
    
    if (status.isAuthenticated) {
        // Show user-specific content
        document.querySelector('#welcomeMessage').textContent = 
            `Welcome back, ${status.user.email}!`;
        document.querySelector('#premiumFeatures').style.display = 'block';
    } else {
        // Show guest content
        document.querySelector('#welcomeMessage').textContent = 
            'Welcome! Sign up to access premium features.';
        document.querySelector('#premiumFeatures').style.display = 'none';
    }
}
```

---

## Database Setup

### Required Tables

#### Profiles Table
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT,
    user_type TEXT CHECK (user_type IN ('user', 'agent')) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### RLS Policies for Profiles
```sql
-- Users can read own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);
```

#### Public Content Tables (Example)
```sql
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access
CREATE POLICY "Public places viewable"
ON places FOR SELECT
TO anon, authenticated
USING (is_public = true);
```

---

## Testing Checklist

### ✅ Public Access
- [ ] Index page loads without authentication
- [ ] Navbar shows Login/Signup when not logged in
- [ ] Public data fetches without errors
- [ ] No console errors for null sessions
- [ ] No automatic redirects on public pages

### ✅ Protected Actions
- [ ] Clicking protected button shows login modal
- [ ] Modal has "Login" and "Cancel" buttons
- [ ] Login button redirects to login.html
- [ ] Authenticated users bypass modal

### ✅ Protected Pages
- [ ] Dashboard redirects to login if not authenticated
- [ ] Profile redirects to login if not authenticated
- [ ] After login, user lands on dashboard
- [ ] Navbar shows Dashboard/Logout when logged in

### ✅ Authentication Flow
- [ ] Signup creates new user
- [ ] Login authenticates user
- [ ] Logout clears session
- [ ] Remember me persists session
- [ ] Session persists across page reloads

### ✅ Edge Cases
- [ ] No infinite redirect loops
- [ ] Handles Supabase initialization delays
- [ ] Works with slow network
- [ ] Mobile menu works correctly
- [ ] Theme toggle persists

---

## Security Notes

### ✅ Safe Practices
1. **Never expose service_role key** - Only use anon key in client
2. **Use RLS policies** - Database-level security is critical
3. **Validate on server** - Never trust client-side checks alone
4. **HTTPS only** - Always use secure connections in production

### ⚠️ Important
- RLS policies are the REAL security layer
- JavaScript auth checks are for UX only
- Always implement server-side validation
- Test RLS policies thoroughly

---

## Troubleshooting

### Navbar not updating
```javascript
// Manually reinitialize
await window.authFunctions.initAuthUI();
```

### Login modal not showing
Check:
1. Is auth.js loaded?
2. Is `data-protected-action` attribute present?
3. Are protected action handlers initialized?

```javascript
// Debug
console.log('Auth functions:', window.authFunctions);
console.log('Utils:', window.utils);
```

### Public data not loading
Check:
1. RLS policies allow `SELECT` for `anon` role
2. Supabase client initialized
3. Network requests in browser DevTools

```javascript
// Debug Supabase
console.log('Supabase client:', window.supabase);
```

### Infinite redirect loop
Check:
1. Protected pages call `requireAuth()` not on public pages
2. Login/signup pages don't have `requireAuth()`
3. Clear browser cache and cookies

---

## Migration from Old System

If updating from old authentication system:

### Step 1: Update Function Calls
```javascript
// OLD
await window.authFunctions.redirectIfNotLoggedIn();

// NEW
await window.authFunctions.requireAuth();
```

### Step 2: Add Script Tags
Add to all HTML files:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/auth.js"></script>
```

### Step 3: Remove Auto-Redirects
Remove any automatic redirect logic from public pages.

### Step 4: Add Protected Action Attributes
```html
<!-- Add to buttons that need protection -->
<button data-protected-action="action name">Button</button>
```

---

## Support

For questions or issues:
1. Check browser console for errors
2. Verify Supabase connection in Network tab
3. Test RLS policies in Supabase dashboard
4. Review this guide's troubleshooting section

---

**Last Updated:** February 21, 2026
**Version:** 2.0

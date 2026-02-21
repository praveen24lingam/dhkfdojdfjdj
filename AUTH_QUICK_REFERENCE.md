# Authentication Quick Reference

## 🚀 Quick Start

### Add Scripts (Required order)
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/auth.js"></script>
<script src="js/main.js"></script>
```

---

## 📖 Common Functions

### Check Auth Status (No Redirect)
```javascript
const { isAuthenticated, user } = await window.authFunctions.getAuthStatus();
```

### Protect Entire Page
```javascript
const authorized = await window.authFunctions.requireAuth();
if (!authorized) return;
```

### Protect Specific Action
```javascript
const canProceed = await window.authFunctions.requireAuthForAction('action name');
if (!canProceed) return;
```

### Update Navbar
```javascript
await window.authFunctions.initAuthUI();
```

### Show Login Modal
```javascript
window.authFunctions.showLoginModal('custom message');
```

---

## 🔒 Protect Buttons

### Method 1: Data Attribute (Easiest)
```html
<button data-protected-action="submit complaint">Submit</button>
```

### Method 2: Predefined Classes
```html
<button class="submit-complaint-btn">Submit Complaint</button>
<button class="submit-feedback-btn">Submit Feedback</button>
<button class="connect-agent-btn">Connect Agent</button>
```

### Method 3: Manual JavaScript
```javascript
btn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!await window.authFunctions.requireAuthForAction('action')) return;
    // Proceed with action
});
```

---

## 📊 Fetch Public Data

```javascript
// Public places
const places = await window.utils.fetchPublicPlaces();

// Public listings
const listings = await window.utils.fetchPublicListings();
```

---

## 🎯 Page Types

### Public Page Template
```html
<!DOCTYPE html>
<html>
<head><title>Public Page</title></head>
<body>
    <nav id="navbar">
        <ul class="nav-menu" id="navMenu">
            <!-- Auth buttons added automatically -->
        </ul>
    </nav>
    
    <section>
        <!-- Public content -->
        <button data-protected-action="action name">Protected Action</button>
    </section>
    
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/auth.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### Protected Page Template
```html
<!DOCTYPE html>
<html>
<head><title>Protected Page</title></head>
<body>
    <!-- Protected content -->
    
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/auth.js"></script>
    <script src="js/dashboard.js"></script>
    <!-- dashboard.js calls requireAuth() automatically -->
</body>
</html>
```

---

## 🎨 Navbar States

### Not Authenticated
- Shows: Login | Get Started
- Links: login.html | signup.html

### Authenticated
- Shows: Dashboard | Logout
- Links: dashboard.html | logout action

---

## 🗄️ Database (RLS Policies)

### Allow Public Read
```sql
CREATE POLICY "public_read"
ON table_name FOR SELECT
TO anon, authenticated
USING (is_public = true);
```

### Allow User Read Own Data
```sql
CREATE POLICY "user_read_own"
ON table_name FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### Allow User Update Own Data
```sql
CREATE POLICY "user_update_own"
ON table_name FOR UPDATE
TO authenticated
USING (user_id = auth.uid());
```

---

## 🐛 Debug Commands

```javascript
// Check if auth loaded
console.log('Auth:', window.authFunctions);

// Check if utils loaded
console.log('Utils:', window.utils);

// Check Supabase
console.log('Supabase:', window.supabase);

// Get current auth status
window.authFunctions.getAuthStatus().then(console.log);

// Check current user
window.authFunctions.getCurrentUser().then(console.log);
```

---

## ⚠️ Common Mistakes

❌ **Don't:**
- Load scripts in wrong order
- Call `requireAuth()` on public pages
- Trust client-side auth for security
- Expose service_role key

✅ **Do:**
- Load Supabase CDN first
- Use RLS policies for real security
- Test with and without authentication
- Handle null user gracefully

---

## 📋 Testing Checklist

**Public Access:**
- [ ] Page loads without login
- [ ] No console errors
- [ ] Navbar shows Login/Signup
- [ ] Public data loads

**Protected Actions:**
- [ ] Shows modal when not logged in
- [ ] Works when logged in
- [ ] Modal has Login button

**Protected Pages:**
- [ ] Redirects to login
- [ ] Works after login
- [ ] Navbar shows Dashboard/Logout

---

## 🔑 Key Concepts

1. **Public by Default** - All content accessible without login
2. **Selective Protection** - Only protect specific features/pages
3. **RLS is Security** - JavaScript is just UX
4. **Graceful Degradation** - Handle missing auth gracefully

---

## 📞 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Navbar not updating | Call `initAuthUI()` manually |
| Modal not showing | Check script load order |
| Data not loading | Check RLS policies |
| Infinite redirects | Remove `requireAuth()` from public pages |
| Supabase undefined | Wait for CDN to load |

---

## 💡 Pro Tips

1. **Use data attributes** for quick protection
2. **Check auth status** before rendering user-specific UI
3. **Test as guest** to ensure public access works
4. **Use browser DevTools** to debug network/auth issues
5. **Clear cache** when testing auth changes

---

**Full Documentation:** See `AUTH_SETUP_GUIDE.md`

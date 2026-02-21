# ConnectHub Platform - Setup Instructions

## 🚀 Quick Start Guide

This is a production-ready, modern web platform built with pure HTML, CSS, Vanilla JavaScript, and Supabase.

---

## 📋 Prerequisites

1. A Supabase account (free tier available at [supabase.com](https://supabase.com))
2. A modern web browser
3. A local web server (or use VS Code Live Server extension)

---

## ⚙️ Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: ConnectHub (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
4. Wait for your project to be created (takes ~2 minutes)

### Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### Step 3: Configure Authentication

1. **Open**: `js/auth.js`
2. **Find** lines 7-8:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
3. **Replace** with your actual credentials:
   ```javascript
   const SUPABASE_URL = 'https://xxxxxxxxxxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

### Step 4: Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `database-schema.sql` from this project
3. Copy all the SQL code
4. Paste it into the Supabase SQL Editor
5. Click **Run** to execute the SQL
6. Verify tables are created: Go to **Table Editor** and you should see:
   - `complaints`
   - `feedback`
   - `agent_requests`
   - `profiles` (optional)

### Step 5: Enable Email Authentication

1. Go to **Authentication** > **Providers** in Supabase
2. Make sure **Email** provider is enabled
3. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize confirmation and password reset emails

### Step 6: Configure Site URL

1. Go to **Authentication** > **URL Configuration**
2. Set your **Site URL**:
   - For local development: `http://localhost:5500` or `http://127.0.0.1:5500`
   - For production: Your actual domain (e.g., `https://yourdomain.com`)
3. Add **Redirect URLs**:
   - `http://localhost:5500/**` (for local dev)
   - `https://yourdomain.com/**` (for production)

### Step 7: Run the Project

#### Option 1: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option 2: Python HTTP Server
```bash
# Navigate to project directory
cd path/to/Aamcho_Bastar

# Python 3
python -m http.server 8000

# Open browser to http://localhost:8000
```

#### Option 3: Node.js HTTP Server
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000

# Open browser to http://localhost:8000
```

---

## 📁 Project Structure

```
Aamcho_Bastar/
├── index.html              # Landing page
├── login.html              # Login page
├── signup.html             # Registration page
├── dashboard.html          # User dashboard
├── profile.html            # Profile management
├── 404.html                # Error page
├── database-schema.sql     # Database setup SQL
├── README.md               # This file
├── css/
│   └── style.css          # All styles
├── js/
│   ├── auth.js            # Authentication logic
│   ├── dashboard.js       # Dashboard functionality
│   ├── profile.js         # Profile management
│   └── main.js            # General functionality
└── assets/                # Images, icons (create as needed)
```

---

## 🎨 Features

### ✅ Implemented
- **Two User Types**: Normal Users (tourists/residents) and Agents (service providers)
- **Public Browsing**: Anyone can browse the website without logging in
- **Authentication Required For**: Submitting complaints, feedback, connecting with agents
- **Authentication**: Signup with user type selection, Login, Logout, Session Management
- **Dark/Light Mode**: Toggle with persistent preference
- **Responsive Design**: Mobile-first, works on all devices
- **Dashboard**: Submit complaints, feedback, and agent requests
- **Profile Management**: Update name, change password, delete account, view user type
- **Toast Notifications**: User-friendly feedback messages
- **Form Validation**: Real-time validation with password strength indicator
- **Protected Routes**: Automatic redirect if not logged in
- **Glass Morphism UI**: Modern, premium design
- **User Type Badges**: Visual distinction between Users and Agents

### 🎯 User Types
- **Normal Users**: Tourists or residents who can:
  - Browse the website without login
  - Submit complaints and feedback (requires login)
  - Request to connect with agents (requires login)
  - View their submissions in dashboard
  
- **Agents**: Service providers who can:
  - Browse the website without login
  - Submit complaints and feedback (requires login)
  - View and manage their agent requests (requires login)
  - Connected with users through the platform

---

## 🔐 Authentication Model (Updated)

### Public-First Architecture
This platform uses a **public-first** authentication model:
- ✅ **All content is accessible without login** - Browse freely
- 🔒 **Specific features require authentication** - Complaints, feedback, agent connections
- 🚀 **Clean separation** - Public vs protected logic

### Key Features
1. **Public Access**
   - Landing page fully accessible
   - Feature browsing without account
   - Navbar dynamically shows Login/Signup OR Dashboard/Logout
   - Tourist places and listings viewable without login

2. **Protected Actions**
   - Submit complaints → Login required
   - Submit feedback → Login required
   - Connect with agents → Login required
   - Unauthenticated users see login modal instead

3. **Protected Pages**
   - Dashboard → Requires login
   - Profile → Requires login
   - Auto-redirect to login if not authenticated

### 📚 Documentation
For detailed authentication setup and usage:
- **[AUTH_SETUP_GUIDE.md](AUTH_SETUP_GUIDE.md)** - Complete authentication guide
- **[AUTH_QUICK_REFERENCE.md](AUTH_QUICK_REFERENCE.md)** - Quick reference cheat sheet

### Common Use Cases

#### Protect a Button/Action
```html
<!-- Add data-protected-action attribute -->
<button data-protected-action="submit complaint">Submit Complaint</button>
```

#### Check Auth Status in JavaScript
```javascript
const { isAuthenticated, user } = await window.authFunctions.getAuthStatus();
if (isAuthenticated) {
    console.log('User email:', user.email);
}
```

#### Fetch Public Data
```javascript
// Works without authentication
const places = await window.utils.fetchPublicPlaces();
```

---

## 🔐 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Email Verification**: Supabase sends confirmation emails
- **Password Requirements**: Minimum 8 characters
- **Session Management**: Automatic token refresh
- **XSS Protection**: All user input is escaped
- **HTTPS**: Use HTTPS in production

---

## 🏗️ Database Schema

### Tables Created

#### 1. **complaints**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `title` (TEXT)
- `description` (TEXT)
- `status` (TEXT, default: 'pending')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 2. **feedback**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `message` (TEXT)
- `rating` (INTEGER, 1-5, optional)
- `created_at` (TIMESTAMP)

#### 3. **agent_requests**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `message` (TEXT)
- `status` (TEXT: 'pending', 'approved', 'rejected', 'completed')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 4. **profiles** (User Information)
- `id` (UUID, Primary Key, Foreign Key to auth.users)
- `full_name` (TEXT)
- `user_type` (TEXT: 'user' or 'agent')
- `avatar_url` (TEXT)
- `phone` (TEXT)
- `bio` (TEXT)
- `is_verified` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 5. **agent_connections** (User-Agent Connections)
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `agent_id` (UUID, Foreign Key to auth.users)
- `request_id` (UUID, Foreign Key to agent_requests)
- `status` (TEXT: 'active', 'completed', 'cancelled')
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## 🚨 Troubleshooting

### Issue: "Failed to initialize Supabase"
- Check that you've replaced the placeholder credentials in `js/auth.js`
- Verify your Supabase project is active

### Issue: "Invalid email or password"
- Make sure you've created an account via the signup page
- Check your email for verification link (if enabled)

### Issue: "Failed to submit complaint/feedback"
- Verify database tables are created correctly
- Check browser console for detailed error messages
- Ensure RLS policies are enabled

### Issue: "CORS errors"
- Make sure you've added your Site URL in Supabase settings
- Use a proper web server (not `file://` protocol)

### Issue: Dark mode not working
- Clear browser cache and localStorage
- Check browser console for errors

---

## 🎯 Next Steps (Optional Enhancements)

1. **Email Templates**: Customize Supabase email templates
2. **Avatar Upload**: Set up Supabase Storage for profile pictures
3. **Admin Dashboard**: Create admin role for managing complaints
4. **Agent Portal**: Separate interface for agents
5. **Real-time Updates**: Use Supabase Realtime for live notifications
6. **Advanced Analytics**: Add charts and statistics
7. **Export Data**: Allow users to download their data
8. **Multi-language Support**: Add i18n

---

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Design**: Custom CSS with CSS Variables
- **Icons**: SVG inline icons
- **Fonts**: Google Fonts (Inter)

---

## 📄 License

This project is open source and available for personal and commercial use.

---

## 🤝 Support

If you encounter any issues:
1. Check the browser console for err - **No login required to browse**
2. Browse features, testimonials, and information freely
3. Click "Get Started" or "Sign Up" when you want to use features
4. Select your account type:
   - **User**: If you're a tourist or resident looking for services
   - **Agent**: If you're a service provider helping tourists
5. Create an account with email and password
6. Check email for verification (if enabled)
7. Login with your credentials
8. Access dashboard to:
   - Submit complaints (requires login)
   - Submit feedback (requires login)
   - Connect with agents (requires login)
9. Manage your profile and view your user type
10. Toggle between dark and light modes

**Key Points:**
- ✅ Browsing = No login required
- 🔒 Submitting complaints/feedback = Login required
- 🔒 Connecting with agents = Login required
- 🔒 Dashboard access = Login required
## 🎉 Congratulations!

Your ConnectHub platform is now ready to use. Visit `index.html` in your browser to get started.

**Default Flow:**
1. Visit landing page (`index.html`)
2. Click "Get Started" or "Sign Up"
3. Create an account with email and password
4. Check email for verification (if enabled)
5. Login with your credentials
6. Access dashboard to submit complaints, feedback, or agent requests
7. Manage your profile and change settings

---

**Built with ❤️ using Pure HTML, CSS, Vanilla JavaScript & Supabase**

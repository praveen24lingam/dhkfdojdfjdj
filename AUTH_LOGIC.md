# Authentication Logic (Public-First)

## Rules

- **Public pages** (index.html, 404.html, etc.): **No redirect**. Users can see all informational content without login.
- **Protected pages**: **Only** `dashboard.html` and `profile.html` call `requireAuth()` and redirect to login if not authenticated.
- **Tourist places / listings**: Fetched **without** session check. Use `fetchTouristPlaces()`, `fetchPublicPlaces()`, `fetchPublicListings()` from `main.js` (no auth).

## Login required only for

- Submitting complaints  
- Submitting feedback  
- Connecting with agents  
- Accessing dashboard  
- Viewing personal user data (profile)

## Implementation

| File        | Role |
|------------|------|
| `auth.js`  | Auth only: session, requireAuth (called only for dashboard/profile), initAuthUI, showLoginModal, requireAuthForAction. No global redirect on public pages. |
| `main.js`  | Public content: fetchTouristPlaces, fetchPublicPlaces, fetchPublicListings (no session check). Protected action handlers show modal instead of blocking. |
| `dashboard.js` | Protected: calls `requireAuth()` on load. |
| `profile.js`   | Protected: calls `requireAuth()` on load. |

## Navbar

- **Not logged in**: Show **Login** and **Sign Up**; hide Dashboard.  
- **Logged in**: Show **Dashboard** and **Logout**; hide Login / Sign Up.

## Protected actions

If an unauthenticated user clicks e.g. "Submit complaint" or "Connect agent": show modal **"Please login to continue"** with a **Login** button. Do not redirect the whole page.

## RLS

Run `public-content-rls.sql` in Supabase so `tourist_places` (and optionally `places` / `listings`) allow public `SELECT` for anon users.

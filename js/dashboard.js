// ===================================
// DASHBOARD - dashboard.js
// Dashboard Functionality & Data Management
// ===================================

// Global variables
let currentUser = null;
let complaints = [];
let feedbacks = [];
let agentRequests = [];

// Use shared Supabase client from auth.js (window.supabaseClient)
function getSupabase() {
    return window.supabaseClient;
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in (PROTECTED PAGE)
    const loggedIn = await window.authFunctions.requireAuth();
    if (!loggedIn) return;
    
    // Load current user
    await loadCurrentUser();
    
    // Initialize navigation
    initNavigation();
    // Initialize notifications toggle
    initNotifications();
    
    // Initialize forms
    initForms();
    
    // Initialize modals
    initModals();
    
    // Load dashboard data
    await loadDashboardData();
    
    // Initialize sidebar toggle for mobile
    initSidebarToggle();
});

// ===================================
// USER MANAGEMENT
// ===================================

async function loadCurrentUser() {
    try {
        currentUser = await window.authFunctions.getCurrentUser();
        
        if (currentUser) {
            // Get user type
            const userType = currentUser.user_metadata?.user_type || 'user';
            
            // Display user name in header
            const userName = document.querySelector('.user-name');
            if (userName) {
                const name = currentUser.user_metadata?.full_name || currentUser.email.split('@')[0];
                const badge = userType === 'agent' ? ' <span class="user-badge">Agent</span>' : '';
                userName.innerHTML = name + badge;
            }
            
            // Display user avatar initial
            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar) {
                const name = currentUser.user_metadata?.full_name || currentUser.email;
                userAvatar.textContent = name.charAt(0).toUpperCase();
                
                // Add agent styling
                if (userType === 'agent') {
                    userAvatar.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
                }
            }
            
            // Show/hide features based on user type
            updateUIForUserType(userType);
        }
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

// Update UI based on user type
function updateUIForUserType(userType) {
    // Get navigation items
    const connectAgentNav = document.querySelector('[data-page="agent-page"]');
    
    if (userType === 'agent') {
        // For agents, change the "Connect Agent" to "Agent Dashboard"
        if (connectAgentNav) {
            connectAgentNav.querySelector('span').textContent = 'My Requests';
        }
    }
}

// ===================================
// NAVIGATION
// ===================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.dataset.page;
            showPage(pageId);
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Close sidebar on mobile
            document.querySelector('.sidebar')?.classList.remove('open');
        });
    });
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
}

// ===================================
// SIDEBAR TOGGLE (Mobile)
// ===================================

function initSidebarToggle() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarClose = document.querySelector('.sidebar-close');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
        });
    }
    
    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            sidebar?.classList.remove('open');
        });
    }
}

// ===================================
// DATA LOADING
// ===================================

async function loadDashboardData() {
    await Promise.all([
        loadComplaints(),
        loadFeedbacks(),
        loadAgentRequests(),
        loadBookings(),
        loadNotifications(),
        loadActivityLog()
    ]);
    
    updateStats();
}

// ===================================
// BOOKINGS, NOTIFICATIONS & ACTIVITY
// ===================================

let bookings = [];
let notifications = [];
let activityLog = [];

async function loadBookings() {
    const supabase = getSupabase();
    if (!supabase || !currentUser) return;
    try {
        const { data, error } = await supabase.from('bookings').select('*').or(`user_id.eq.${currentUser.id},agent_id.eq.${currentUser.id}`).order('created_at', { ascending: false });
        if (error) throw error;
        bookings = data || [];
        displayUpcomingTrips();
        displayTravelHistory();
    } catch (err) {
        console.error('Error loading bookings:', err);
        bookings = [];
    }
}

async function loadNotifications() {
    const supabase = getSupabase();
    if (!supabase || !currentUser) return;
    try {
        const { data, error } = await supabase.from('notifications').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
        if (error) throw error;
        notifications = data || [];
        displayNotifications();
        updateNotificationCount();
    } catch (err) {
        console.error('Error loading notifications:', err);
        notifications = [];
    }
}

function initNotifications() {
    const toggle = document.getElementById('notifToggle');
    const dropdown = document.getElementById('notifDropdown');
    if (!toggle || !dropdown) return;
    toggle.addEventListener('click', function(e){
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'block' : 'none';
    });
    document.addEventListener('click', function(){ if (dropdown) dropdown.style.display = 'none'; });
}

// update notification count after loading
function updateNotificationCount() {
    const el = document.getElementById('notifCount');
    if (!el) return;
    const unread = notifications.filter(n => !n.read).length;
    el.textContent = unread > 0 ? `(${unread})` : '';
}

async function loadActivityLog() {
    const supabase = getSupabase();
    if (!supabase || !currentUser) return;
    try {
        const { data, error } = await supabase.from('activity_log').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(50);
        if (error) throw error;
        activityLog = data || [];
        displayActivityLog();
    } catch (err) {
        console.error('Error loading activity log:', err);
        activityLog = [];
    }
}

function displayUpcomingTrips() {
    const el = document.querySelector('#upcomingTrips');
    if (!el) return;
    const upcoming = bookings.filter(b => b.status === 'confirmed' && b.start_date && new Date(b.start_date) > new Date());
    if (!upcoming || upcoming.length === 0) {
        el.innerHTML = '<div class="empty-state">No upcoming trips</div>';
        return;
    }
    el.innerHTML = upcoming.map(b => `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <h4 class="item-title">${escapeHtml(b.location_id || 'Trip')}</h4>
                    <p class="item-date">${formatDate(b.start_date)} - ${formatDate(b.end_date)}</p>
                </div>
                <span class="badge">${escapeHtml(b.status)}</span>
            </div>
            <p class="item-content">${escapeHtml(b.metadata?.notes || '')}</p>
        </div>
    `).join('');
}

function displayTravelHistory() {
    const el = document.querySelector('#travelHistory');
    if (!el) return;
    const past = bookings.filter(b => b.status === 'completed' || (b.end_date && new Date(b.end_date) < new Date()));
    if (!past || past.length === 0) {
        el.innerHTML = '<div class="empty-state">No travel history yet</div>';
        return;
    }
    el.innerHTML = past.map(b => `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <h4 class="item-title">${escapeHtml(b.location_id || 'Trip')}</h4>
                    <p class="item-date">${formatDate(b.start_date)}</p>
                </div>
                <span class="badge">${escapeHtml(b.status)}</span>
            </div>
            <p class="item-content">${escapeHtml(b.metadata?.notes || '')}</p>
        </div>
    `).join('');
}

function displayActivityLog() {
    const el = document.querySelector('#activityLog');
    if (!el) return;
    if (!activityLog || activityLog.length === 0) {
        el.innerHTML = '<div class="empty-state">No recent activity</div>';
        return;
    }
    el.innerHTML = activityLog.map(a => `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <p class="item-date">${formatDate(a.created_at)}</p>
                </div>
            </div>
            <p class="item-content">${escapeHtml(a.action)} ${escapeHtml(JSON.stringify(a.meta || {}))}</p>
        </div>
    `).join('');
}

function displayNotifications() {
    const el = document.querySelector('#notificationList');
    if (!el) return;
    if (!notifications || notifications.length === 0) {
        el.innerHTML = '<div class="empty-state">No notifications</div>';
        return;
    }
    el.innerHTML = notifications.map(n => `
        <div class="notif-item ${n.read ? 'read' : 'unread'}">
            <div><small>${formatDate(n.created_at)}</small></div>
            <div>${escapeHtml(n.message || n.type)}</div>
        </div>
    `).join('');
}

async function loadComplaints() {
    const supabase = getSupabase();
    if (!supabase) {
        console.warn('Supabase client not ready yet');
        return;
    }
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        complaints = data || [];
        displayComplaints();
    } catch (error) {
        console.error('Error loading complaints:', error);
        complaints = [];
    }
}

async function loadFeedbacks() {
    const supabase = getSupabase();
    if (!supabase) {
        console.warn('Supabase client not ready yet');
        return;
    }
    try {
        const { data, error } = await supabase
            .from('feedback')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        feedbacks = data || [];
        displayFeedbacks();
    } catch (error) {
        console.error('Error loading feedbacks:', error);
        feedbacks = [];
    }
}

async function loadAgentRequests() {
    const supabase = getSupabase();
    if (!supabase) {
        console.warn('Supabase client not ready yet');
        return;
    }
    try {
        const { data, error } = await supabase
            .from('agent_requests')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        agentRequests = data || [];
        displayAgentRequests();
    } catch (error) {
        console.error('Error loading agent requests:', error);
        agentRequests = [];
    }
}

// ===================================
// STATS UPDATE
// ===================================

function updateStats() {
    // Update stat cards
    document.querySelector('#stat-complaints').textContent = complaints.length;
    document.querySelector('#stat-feedbacks').textContent = feedbacks.length;
    document.querySelector('#stat-agents').textContent = agentRequests.length;
}

// ===================================
// DISPLAY FUNCTIONS
// ===================================

function displayComplaints() {
    const complaintsList = document.querySelector('#complaintsList');
    
    if (!complaintsList) return;
    
    if (complaints.length === 0) {
        complaintsList.innerHTML = '<div class="empty-state">No complaints yet</div>';
        return;
    }
    
    complaintsList.innerHTML = complaints.map(complaint => `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <h4 class="item-title">${escapeHtml(complaint.title)}</h4>
                    <p class="item-date">${formatDate(complaint.created_at)}</p>
                </div>
                <button class="btn btn-danger btn-small" onclick="deleteComplaint('${complaint.id}')">Delete</button>
            </div>
            <p class="item-content">${escapeHtml(complaint.description)}</p>
        </div>
    `).join('');
}

function displayFeedbacks() {
    const feedbacksList = document.querySelector('#feedbacksList');
    
    if (!feedbacksList) return;
    
    if (feedbacks.length === 0) {
        feedbacksList.innerHTML = '<div class="empty-state">No feedback yet</div>';
        return;
    }
    
    feedbacksList.innerHTML = feedbacks.map(feedback => `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <p class="item-date">${formatDate(feedback.created_at)}</p>
                </div>
                <button class="btn btn-danger btn-small" onclick="deleteFeedback('${feedback.id}')">Delete</button>
            </div>
            <p class="item-content">${escapeHtml(feedback.message)}</p>
        </div>
    `).join('');
}

function displayAgentRequests() {
    const agentRequestsList = document.querySelector('#agentRequestsList');
    
    if (!agentRequestsList) return;
    
    if (agentRequests.length === 0) {
        agentRequestsList.innerHTML = '<div class="empty-state">No agent requests yet</div>';
        return;
    }
    
    agentRequestsList.innerHTML = agentRequests.map(request => `
        <div class="item-card">
            <div class="item-header">
                <div>
                    <p class="item-date">${formatDate(request.created_at)}</p>
                    <span class="badge ${request.status === 'pending' ? 'badge-warning' : 'badge-success'}">${request.status}</span>
                </div>
                <button class="btn btn-danger btn-small" onclick="deleteAgentRequest('${request.id}')">Delete</button>
            </div>
            <p class="item-content">${escapeHtml(request.message)}</p>
        </div>
    `).join('');
}

// ===================================
// FORM HANDLING
// ===================================

function initForms() {
    // Complaint form
    const complaintForm = document.querySelector('#complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', handleComplaintSubmit);
    }
    
    // Feedback form
    const feedbackForm = document.querySelector('#feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }
    
    // Agent request form
    const agentForm = document.querySelector('#agentForm');
    if (agentForm) {
        agentForm.addEventListener('submit', handleAgentRequestSubmit);
    }
}

async function handleComplaintSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const title = form.querySelector('#complaintTitle').value.trim();
    const description = form.querySelector('#complaintDescription').value.trim();
    
    if (!title || !description) {
        window.authFunctions.showToast('Please fill in all fields', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const { data, error } = await getSupabase()
            .from('complaints')
            .insert([
                {
                    user_id: currentUser.id,
                    title: title,
                    description: description
                }
            ])
            .select();
        
        if (error) throw error;
        
        window.authFunctions.showToast('Complaint submitted successfully', 'success');
        form.reset();
        await loadComplaints();
        updateStats();
    } catch (error) {
        console.error('Error submitting complaint:', error);
        window.authFunctions.showToast('Failed to submit complaint', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Complaint';
    }
}

async function handleFeedbackSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const message = form.querySelector('#feedbackMessage').value.trim();
    
    if (!message) {
        window.authFunctions.showToast('Please enter your feedback', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const { data, error } = await getSupabase()
            .from('feedback')
            .insert([
                {
                    user_id: currentUser.id,
                    message: message
                }
            ])
            .select();
        
        if (error) throw error;
        
        window.authFunctions.showToast('Feedback submitted successfully', 'success');
        form.reset();
        await loadFeedbacks();
        updateStats();
    } catch (error) {
        console.error('Error submitting feedback:', error);
        window.authFunctions.showToast('Failed to submit feedback', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Feedback';
    }
}

async function handleAgentRequestSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const message = form.querySelector('#agentMessage').value.trim();
    
    if (!message) {
        window.authFunctions.showToast('Please describe your request', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const { data, error } = await getSupabase()
            .from('agent_requests')
            .insert([
                {
                    user_id: currentUser.id,
                    message: message,
                    status: 'pending'
                }
            ])
            .select();
        
        if (error) throw error;
        
        window.authFunctions.showToast('Agent request submitted successfully', 'success');
        form.reset();
        await loadAgentRequests();
        updateStats();
    } catch (error) {
        console.error('Error submitting agent request:', error);
        window.authFunctions.showToast('Failed to submit agent request', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request';
    }
}

// ===================================
// DELETE FUNCTIONS
// ===================================

let deleteItem = null;
let deleteType = null;

async function deleteComplaint(id) {
    deleteItem = id;
    deleteType = 'complaint';
    showDeleteModal('complaint');
}

async function deleteFeedback(id) {
    deleteItem = id;
    deleteType = 'feedback';
    showDeleteModal('feedback');
}

async function deleteAgentRequest(id) {
    deleteItem = id;
    deleteType = 'agent request';
    showDeleteModal('agent request');
}

function showDeleteModal(type) {
    const modal = document.querySelector('#deleteModal');
    const modalText = modal.querySelector('.modal-text');
    
    if (modalText) {
        modalText.textContent = `Are you sure you want to delete this ${type}? This action cannot be undone.`;
    }
    
    modal.classList.add('show');
}

function hideDeleteModal() {
    const modal = document.querySelector('#deleteModal');
    modal.classList.remove('show');
    deleteItem = null;
    deleteType = null;
}

async function confirmDelete() {
    if (!deleteItem || !deleteType) return;
    
    const confirmBtn = document.querySelector('#confirmDelete');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';
    
    try {
        let tableName = '';
        
        if (deleteType === 'complaint') tableName = 'complaints';
        else if (deleteType === 'feedback') tableName = 'feedback';
        else if (deleteType === 'agent request') tableName = 'agent_requests';
        
        const { error } = await getSupabase()
            .from(tableName)
            .delete()
            .eq('id', deleteItem)
            .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        window.authFunctions.showToast(`${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)} deleted successfully`, 'success');
        
        // Reload data
        if (deleteType === 'complaint') await loadComplaints();
        else if (deleteType === 'feedback') await loadFeedbacks();
        else if (deleteType === 'agent request') await loadAgentRequests();
        
        updateStats();
        hideDeleteModal();
    } catch (error) {
        console.error('Error deleting item:', error);
        window.authFunctions.showToast(`Failed to delete ${deleteType}`, 'error');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Delete';
    }
}

// ===================================
// MODAL INITIALIZATION
// ===================================

function initModals() {
    const deleteModal = document.querySelector('#deleteModal');
    
    if (deleteModal) {
        // Cancel button
        const cancelBtn = deleteModal.querySelector('#cancelDelete');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hideDeleteModal);
        }
        
        // Confirm button
        const confirmBtn = deleteModal.querySelector('#confirmDelete');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', confirmDelete);
        }
        
        // Close on outside click
        deleteModal.addEventListener('click', function(e) {
            if (e.target === deleteModal) {
                hideDeleteModal();
            }
        });
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make delete functions globally accessible
window.deleteComplaint = deleteComplaint;
window.deleteFeedback = deleteFeedback;
window.deleteAgentRequest = deleteAgentRequest;

// ===================================
// PROFILE - profile.js
// Profile Management & Settings
// ===================================

let currentUser = null;

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in (PROTECTED PAGE)
    const loggedIn = await window.authFunctions.requireAuth();
    if (!loggedIn) return;
    
    // Load current user
    await loadCurrentUser();
    
    // Initialize forms
    initProfileForms();
    
    // Initialize modals
    initDeleteModal();
    
    // Load profile data
    loadProfileData();
    
    // Initialize password strength
    initPasswordStrength();
    
    // Initialize password toggle
    initPasswordToggle();
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
        }
    } catch (error) {
        console.error('Error loading user:', error);
    }
}

// ===================================
// LOAD PROFILE DATA
// ===================================

function loadProfileData() {
    if (!currentUser) return;
    
    // Get user type
    const userType = currentUser.user_metadata?.user_type || 'user';
    const userTypeName = userType === 'agent' ? 'Agent' : 'User';
    
    // Load full name
    const fullNameInput = document.querySelector('#fullName');
    if (fullNameInput) {
        fullNameInput.value = currentUser.user_metadata?.full_name || '';
    }
    
    // Load email (readonly)
    const emailInput = document.querySelector('#email');
    if (emailInput) {
        emailInput.value = currentUser.email;
        emailInput.readOnly = true;
    }
    
    // Load profile avatar
    const profileAvatar = document.querySelector('.profile-avatar-large');
    if (profileAvatar) {
        const name = currentUser.user_metadata?.full_name || currentUser.email;
        profileAvatar.textContent = name.charAt(0).toUpperCase();
        
        // Add agent styling
        if (userType === 'agent') {
            profileAvatar.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        }
    }
    
    // Display user type badge
    const avatarSection = document.querySelector('.profile-avatar-section');
    if (avatarSection && !document.querySelector('.profile-user-type')) {
        const userTypeBadge = document.createElement('div');
        userTypeBadge.className = 'profile-user-type';
        userTypeBadge.textContent = userTypeName;
        avatarSection.insertBefore(userTypeBadge, avatarSection.querySelector('.avatar-hint'));
    }
}

// ===================================
// FORM INITIALIZATION
// ===================================

function initProfileForms() {
    // Profile info form
    const profileForm = document.querySelector('#profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Password change form
    const passwordForm = document.querySelector('#passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // Avatar upload (UI only)
    const avatarUpload = document.querySelector('#avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarChange);
    }
}

// ===================================
// PROFILE UPDATE
// ===================================

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const fullName = form.querySelector('#fullName').value.trim();
    
    if (!fullName) {
        window.authFunctions.showToast('Please enter your full name', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    try {
        const { data, error } = await window.supabaseClient.auth.updateUser({
            data: {
                full_name: fullName
            }
        });
        
        if (error) throw error;
        
        window.authFunctions.showToast('Profile updated successfully', 'success');
        
        // Reload user data
        await loadCurrentUser();
        
    } catch (error) {
        console.error('Error updating profile:', error);
        window.authFunctions.showToast('Failed to update profile', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Profile';
    }
}

// ===================================
// PASSWORD CHANGE
// ===================================

async function handlePasswordChange(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const currentPassword = form.querySelector('#currentPassword').value;
    const newPassword = form.querySelector('#newPassword').value;
    const confirmNewPassword = form.querySelector('#confirmNewPassword').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        window.authFunctions.showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        window.authFunctions.showToast('New password must be at least 8 characters long', 'error');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        window.authFunctions.showToast('New passwords do not match', 'error');
        return;
    }
    
    if (currentPassword === newPassword) {
        window.authFunctions.showToast('New password must be different from current password', 'error');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Changing...';
    
    try {
        // Verify current password by signing in
        const { error: signInError } = await window.supabaseClient.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword
        });
        
        if (signInError) {
            throw new Error('Current password is incorrect');
        }
        
        // Update password
        const { error: updateError } = await window.supabaseClient.auth.updateUser({
            password: newPassword
        });
        
        if (updateError) throw updateError;
        
        window.authFunctions.showToast('Password changed successfully', 'success');
        form.reset();
        
    } catch (error) {
        console.error('Error changing password:', error);
        window.authFunctions.showToast(error.message || 'Failed to change password', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Change Password';
    }
}

// ===================================
// AVATAR UPLOAD (UI Only)
// ===================================

function handleAvatarChange(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        window.authFunctions.showToast('Please select an image file', 'error');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        window.authFunctions.showToast('Image must be less than 2MB', 'error');
        return;
    }
    
    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarLarge = document.querySelector('.profile-avatar-large');
        if (avatarLarge) {
            avatarLarge.style.backgroundImage = `url(${e.target.result})`;
            avatarLarge.style.backgroundSize = 'cover';
            avatarLarge.style.backgroundPosition = 'center';
            avatarLarge.textContent = '';
        }
        
        window.authFunctions.showToast('Avatar preview updated (Note: Upload functionality requires storage setup)', 'success');
    };
    reader.readAsDataURL(file);
}

// ===================================
// ACCOUNT DELETION
// ===================================

function showDeleteAccountModal() {
    const modal = document.querySelector('#deleteAccountModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function hideDeleteAccountModal() {
    const modal = document.querySelector('#deleteAccountModal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Clear password field
    const passwordInput = document.querySelector('#deletePasswordConfirm');
    if (passwordInput) {
        passwordInput.value = '';
    }
}

async function confirmDeleteAccount() {
    const passwordInput = document.querySelector('#deletePasswordConfirm');
    const password = passwordInput?.value || '';
    
    if (!password) {
        window.authFunctions.showToast('Please enter your password to confirm', 'error');
        return;
    }
    
    const confirmBtn = document.querySelector('#confirmDeleteAccount');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';
    
    try {
        // Verify password by signing in
        const { error: signInError } = await window.supabaseClient.auth.signInWithPassword({
            email: currentUser.email,
            password: password
        });
        
        if (signInError) {
            throw new Error('Password is incorrect');
        }
        
        // Delete user data from tables (optional - depends on your RLS policies)
        await Promise.all([
            (window.supabaseClient).from('complaints').delete().eq('user_id', currentUser.id),
            (window.supabaseClient).from('feedback').delete().eq('user_id', currentUser.id),
            (window.supabaseClient).from('agent_requests').delete().eq('user_id', currentUser.id)
        ]);
        
        // Note: Supabase doesn't have a direct user deletion API from client
        // You would need to implement this via an Edge Function or Admin API
        // For now, we'll just sign out the user
        
        window.authFunctions.showToast('Account deletion initiated. Please contact support to complete the process.', 'success');
        
        // Sign out after 2 seconds
        setTimeout(async () => {
            await window.authFunctions.handleLogout();
        }, 2000);
        
    } catch (error) {
        console.error('Error deleting account:', error);
        window.authFunctions.showToast(error.message || 'Failed to delete account', 'error');
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Delete My Account';
    }
}

function initDeleteModal() {
    // Delete account button
    const deleteAccountBtn = document.querySelector('#deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', showDeleteAccountModal);
    }
    
    // Cancel button
    const cancelBtn = document.querySelector('#cancelDeleteAccount');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideDeleteAccountModal);
    }
    
    // Confirm button
    const confirmBtn = document.querySelector('#confirmDeleteAccount');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmDeleteAccount);
    }
    
    // Close on outside click
    const modal = document.querySelector('#deleteAccountModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideDeleteAccountModal();
            }
        });
    }
}

// ===================================
// PASSWORD STRENGTH INDICATOR
// ===================================

function initPasswordStrength() {
    const newPasswordInput = document.querySelector('#newPassword');
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (newPasswordInput && strengthBar && strengthText) {
        newPasswordInput.addEventListener('input', function() {
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
// PASSWORD TOGGLE
// ===================================

function initPasswordToggle() {
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const eyeOpen = this.querySelector('.eye-open');
            const eyeClosed = this.querySelector('.eye-closed');
            
            if (input.type === 'password') {
                input.type = 'text';
                if (eyeOpen) eyeOpen.style.display = 'none';
                if (eyeClosed) eyeClosed.style.display = 'block';
            } else {
                input.type = 'password';
                if (eyeOpen) eyeOpen.style.display = 'block';
                if (eyeClosed) eyeClosed.style.display = 'none';
            }
        });
    });
}

// Make functions globally accessible
window.showDeleteAccountModal = showDeleteAccountModal;

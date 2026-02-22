// Admin Agent Requests management
(async function(){
    // wait for supabase initialization
    if (!initSupabase()) {
        console.error('Supabase not initialized');
    }

    // Ensure user is logged in and admin
    const authStatus = await getAuthStatus();
    if (!authStatus.isAuthenticated) {
        alert('Please login as admin to view this page');
        window.location.href = '../login.html';
        return;
    }

    const role = getUserRole(authStatus.user);
    if (role !== 'admin') {
        alert('Access denied: admin only');
        window.location.href = '../';
        return;
    }

    const container = document.getElementById('requests');

    async function loadRequests(){
        container.innerHTML = '<p>Loading...</p>';
        try {
            // fetch profiles with pending agent_request_status
            const { data: profiles, error } = await supabaseClient.from('profiles').select('*').eq('agent_request_status','pending');
            if (error) throw error;

            if (!profiles || profiles.length === 0) {
                container.innerHTML = '<p>No pending requests.</p>';
                return;
            }

            // build list
            container.innerHTML = '';
            for (const p of profiles) {
                // fetch agent profile for extra fields
                const { data: ap } = await supabaseClient.from('agent_profiles').select('*').eq('user_id', p.id).single();
                const card = document.createElement('div');
                card.className = 'glass-card';
                card.style.padding = '12px';
                card.style.marginBottom = '12px';
                card.innerHTML = `
                    <h3>${p.full_name || '(no name)'} <small style="color:#6b7280">${p.id}</small></h3>
                    <p><strong>Agency:</strong> ${ap?.agency_name || '-'} • <strong>City:</strong> ${ap?.city || '-'}</p>
                    <p>${ap?.description || ''}</p>
                    <div style="margin-top:8px">
                        <button class="btn btn-green" data-uid="${p.id}" data-action="approve">Approve</button>
                        <button class="btn btn-red" style="margin-left:8px" data-uid="${p.id}" data-action="reject">Reject</button>
                    </div>
                `;
                container.appendChild(card);
            }

            // attach handlers
            container.querySelectorAll('button[data-action]').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const uid = btn.dataset.uid;
                    const action = btn.dataset.action;
                    btn.disabled = true;
                    try {
                        const approve = action === 'approve';
                        // call RPC that enforces admin check server-side
                        const { error } = await supabaseClient.rpc('admin_set_agent_status', { target_user: uid, approve: approve });
                        if (error) throw error;
                        showToast('Updated successfully', 'success');
                        loadRequests();
                    } catch (err) {
                        console.error(err);
                        showToast(err.message || 'Failed to update', 'error');
                        btn.disabled = false;
                    }
                });
            });

        } catch (err) {
            console.error('Failed to load requests', err);
            container.innerHTML = '<p>Error loading requests.</p>';
        }
    }

    loadRequests();
})();

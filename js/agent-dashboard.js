(async function(){
    // Wait for supabase
    let attempts = 0;
    while (typeof window.supabaseClient === 'undefined' && attempts < 50) { await new Promise(r=>setTimeout(r,100)); attempts++; }
    const supabase = window.supabaseClient;
    if (!supabase) return;

    // Ensure logged in agent
    const auth = await window.authFunctions.getAuthStatus();
    if (!auth.isAuthenticated) { window.location.href = '/'; return; }
    const role = window.authFunctions.getUserRole(auth.user);
    if (role !== 'agent') { window.location.href = '/'; return; }

    const inbox = document.getElementById('agentInbox');
    if (!inbox) return;

    async function loadBookingRequests() {
        inbox.innerHTML = '<p>Loading booking requests...</p>';
        try {
            const { data, error } = await supabase.from('bookings').select('*').eq('status','inquiry').or(`agent_id.eq.${auth.user.id},agent_id.is.null`);
            if (error) throw error;
            const requests = data || [];
            if (requests.length === 0) {
                inbox.innerHTML = '<p>No booking requests at the moment.</p>';
                return;
            }
            inbox.innerHTML = '';
            requests.forEach(req => {
                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-header">
                        <div>
                            <h4 class="item-title">${req.location_id || 'Booking Request'}</h4>
                            <p class="item-date">${new Date(req.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <button class="btn btn-green btn-small" data-id="${req.id}" data-action="accept">Accept</button>
                            <button class="btn btn-red btn-small" data-id="${req.id}" data-action="reject">Reject</button>
                        </div>
                    </div>
                    <p class="item-content">Guests: ${req.guests || 1}</p>
                `;
                inbox.appendChild(card);
            });

            // attach handlers
            inbox.querySelectorAll('button[data-action]').forEach(btn => btn.addEventListener('click', async function(){
                const id = this.dataset.id;
                const action = this.dataset.action;
                this.disabled = true;
                try {
                    if (action === 'accept') {
                        // update booking status and push to timeline
                        const timeline = [{ status: 'confirmed', timestamp: new Date().toISOString() }];
                        await supabase.from('bookings').update({ status: 'confirmed', status_timeline: timeline }).eq('id', id);
                        // notify user
                        const { data: b } = await supabase.from('bookings').select('*').eq('id', id).single();
                        await supabase.from('notifications').insert([{ user_id: b.user_id, actor_id: auth.user.id, type: 'booking_confirmed', message: 'Your booking has been confirmed by the agent', data: { booking_id: id } }]);
                        // add activity log for agent
                        await supabase.from('activity_log').insert([{ user_id: auth.user.id, action: 'Accepted booking', meta: { booking_id: id } }]);
                        window.authFunctions.showToast('Booking accepted', 'success');
                    } else {
                        const timeline = [{ status: 'rejected', timestamp: new Date().toISOString() }];
                        await supabase.from('bookings').update({ status: 'rejected', status_timeline: timeline }).eq('id', id);
                        const { data: b } = await supabase.from('bookings').select('*').eq('id', id).single();
                        await supabase.from('notifications').insert([{ user_id: b.user_id, actor_id: auth.user.id, type: 'booking_rejected', message: 'Your booking was rejected by the agent', data: { booking_id: id } }]);
                        await supabase.from('activity_log').insert([{ user_id: auth.user.id, action: 'Rejected booking', meta: { booking_id: id } }]);
                        window.authFunctions.showToast('Booking rejected', 'success');
                    }
                    // reload
                    loadBookingRequests();
                } catch (err) {
                    console.error(err);
                    window.authFunctions.showToast('Failed to update booking', 'error');
                    this.disabled = false;
                }
            }));
        } catch (err) {
            console.error('Error loading booking requests', err);
            inbox.innerHTML = '<p>Error loading requests.</p>';
        }
    }

    // initial load
    loadBookingRequests();
})();

/**
 * location-detail.html: tabs, booking form, payment dialog, toast
 */
(function() {
    'use strict';

    var locationData = {
        chitrakote: { title: 'Chitrakote Waterfall', rating: '4.8', desc: 'Chitrakote Falls is often called the "Niagara Falls of India". The waterfall cascades from a height of about 90 feet and is at its fullest during the monsoon. A must-visit in Bastar.', img: 'https://images.unsplash.com/photo-1621682333008-0130db99806e?w=1200&q=80' },
        danteshwari: { title: 'Danteshwari Temple', rating: '4.9', desc: 'One of the 52 Shakti Peethas. The presiding deity is Goddess Danteshwari, revered across Bastar. Ancient temple with deep cultural significance.', img: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200&q=80' },
        kanger: { title: 'Kanger Valley National Park', rating: '4.7', desc: 'Pristine wilderness with unique caves, waterfalls and diverse wildlife. Home to the famous Kutumsar Cave and Tirathgarh Falls.', img: 'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=1200&q=80' }
    };

    function getQueryId() {
        var m = /[?&]id=([^&]+)/.exec(window.location.search);
        return m ? m[1] : 'chitrakote';
    }

    function applyLocationData() {
        var id = getQueryId();
        var data = locationData[id] || locationData.chitrakote;
        var titleEl = document.getElementById('locationTitle');
        var ratingEl = document.getElementById('locationRating');
        var descEl = document.getElementById('locationDescription');
        var heroBg = document.querySelector('.location-hero-bg');
        if (titleEl) titleEl.textContent = data.title;
        if (ratingEl) ratingEl.textContent = data.rating;
        if (descEl) descEl.textContent = data.desc;
        if (heroBg) heroBg.style.backgroundImage = 'url(' + data.img + ')';
    }

    function initTabs() {
        document.querySelectorAll('.detail-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                var t = this.getAttribute('data-tab');
                document.querySelectorAll('.detail-tab').forEach(function(x) { x.classList.remove('active'); });
                document.querySelectorAll('.detail-panel').forEach(function(p) { p.classList.remove('active'); });
                this.classList.add('active');
                var panel = document.getElementById('panel-' + t);
                if (panel) panel.classList.add('active');
            });
        });
    }

    function initBooking() {
        var openBtn = document.getElementById('openBookingBtn');
        var overlay = document.getElementById('bookingFormOverlay');
        var closeBtn = document.getElementById('closeBookingBtn');
        var form = document.getElementById('bookingForm');

        if (openBtn && overlay) {
            openBtn.addEventListener('click', function() { overlay.classList.add('is-open'); });
        }
        if (closeBtn && overlay) {
            closeBtn.addEventListener('click', function() { overlay.classList.remove('is-open'); });
        }
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) overlay.classList.remove('is-open');
            });
        }
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                overlay.classList.remove('is-open');
                var payOverlay = document.getElementById('paymentDialogOverlay');
                var summary = document.getElementById('paymentSummary');
                if (summary) {
                    var visitors = form.querySelector('[name="visitors"]').value;
                    summary.textContent = 'Visit for ' + visitors + ' person(s)';
                }
                if (payOverlay) payOverlay.classList.add('is-open');
            });
        }
    }

    function initPayment() {
        var confirmBtn = document.getElementById('confirmPaymentBtn');
        var closeBtn = document.getElementById('closePaymentBtn');
        var overlay = document.getElementById('paymentDialogOverlay');

        if (confirmBtn && overlay) {
            confirmBtn.addEventListener('click', function() {
                overlay.classList.remove('is-open');
                // Create booking record if supabase is available and user is logged in
                (async function(){
                    try {
                        if (window.supabaseClient && window.authFunctions) {
                            const auth = await window.authFunctions.getAuthStatus();
                            const form = document.getElementById('bookingForm');
                            const visitors = form ? form.querySelector('[name="visitors"]').value : 1;
                            const start = form ? form.querySelector('[name="date"]').value : null;
                            const payload = {
                                user_id: auth.user?.id || null,
                                location_id: getQueryId(),
                                start_date: start || null,
                                guests: visitors || 1,
                                status: 'inquiry',
                                status_timeline: JSON.stringify([{ status: 'inquiry', timestamp: new Date().toISOString() }]),
                                metadata: JSON.stringify({ visitors })
                            };
                            // insert booking
                            const { data: booking, error } = await window.supabaseClient.from('bookings').insert([payload]).select().single();
                            if (error) throw error;

                            // create activity log for user
                            if (auth.isAuthenticated) {
                                await window.supabaseClient.from('activity_log').insert([{ user_id: auth.user.id, action: 'Created booking request', meta: { booking_id: booking.id } }]);
                            }

                            // notify platform/admins/agents - create a notification (agent_id may be null)
                            await window.supabaseClient.from('notifications').insert([{ user_id: auth.user?.id || null, actor_id: auth.user?.id || null, type: 'booking_created', message: 'Booking request created', data: { booking_id: booking.id } }]);

                            if (window.showToast) showToast('Booking request submitted. We will notify you when confirmed.');
                            return;
                        }
                    } catch (err) {
                        console.error('Failed to create booking:', err);
                    }
                    if (window.showToast) showToast('Booking confirmed! Thank you.');
                })();
            });
        }
        if (closeBtn && overlay) {
            closeBtn.addEventListener('click', function() { overlay.classList.remove('is-open'); });
        }
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) overlay.classList.remove('is-open');
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        applyLocationData();
        initTabs();
        initBooking();
        initPayment();
    });
})();

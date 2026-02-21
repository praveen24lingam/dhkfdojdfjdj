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
                if (window.showToast) showToast('Booking confirmed! Thank you.');
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

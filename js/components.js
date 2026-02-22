/**
 * Shared components: mobile drawer, toast, accordion
 * Load on all pages that have nav-drawer
 */
(function() {
    'use strict';

    function initDrawer() {
        var toggle = document.getElementById('navToggle');
        var overlay = document.getElementById('navDrawerOverlay');
        var drawer = document.getElementById('navDrawer');
        var closeBtn = document.getElementById('navDrawerClose');
        var drawerLinks = document.querySelectorAll('.nav-drawer .drawer-link');

        function openDrawer() {
            if (overlay) overlay.classList.add('is-open');
            if (drawer) drawer.classList.add('is-open');
            if (toggle) { toggle.setAttribute('aria-expanded', 'true'); }
            document.body.style.overflow = 'hidden';
        }
        function closeDrawer() {
            if (overlay) overlay.classList.remove('is-open');
            if (drawer) drawer.classList.remove('is-open');
            if (toggle) { toggle.setAttribute('aria-expanded', 'false'); }
            document.body.style.overflow = '';
        }

        if (toggle) toggle.addEventListener('click', function() {
            if (drawer && drawer.classList.contains('is-open')) closeDrawer();
            else openDrawer();
        });
        if (overlay) overlay.addEventListener('click', closeDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
        drawerLinks.forEach(function(link) { link.addEventListener('click', closeDrawer); });
    }

    function initAccordion() {
        document.querySelectorAll('.accordion-item').forEach(function(item) {
            var head = item.querySelector('.accordion-head');
            if (!head) return;
            head.addEventListener('click', function() {
                item.classList.toggle('is-open');
            });
        });
    }

    // Initialize translation toggle for elements using data-en / data-hi attributes
    function initTranslation() {
        // Use capture so this runs before other handlers that may stopPropagation
        document.addEventListener('click', function(e) {
            var btn = e.target.closest('.lang-toggle');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();

            var current = document.documentElement.getAttribute('data-lang') || 'en';
            var next = current === 'en' ? 'hi' : 'en';
            document.documentElement.setAttribute('data-lang', next);

            // Update all translatable elements (prefer explicit data attributes)
            var els = document.querySelectorAll('[data-en], .translatable');
            els.forEach(function(el) {
                var text = el.getAttribute('data-' + next);
                if (!text) return;
                // preserve icon markup if present
                var icon = el.querySelector('i') || el.querySelector('svg');
                if (icon) {
                    var iconHTML = icon.outerHTML;
                    el.innerHTML = iconHTML + ' ' + text;
                } else {
                    el.innerText = text;
                }
            });

            // Update small lang label if present
            var langText = document.getElementById('lang-text');
            if (langText) {
                langText.innerText = next === 'en' ? 'हिंदी' : 'English';
            }
        }, true);
    }

    window.showToast = function(message, type) {
        type = type || 'success';
        var container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 4000);
    };

    document.addEventListener('DOMContentLoaded', function() {
        initDrawer();
        initAccordion();
        initTranslation();
    });
})();

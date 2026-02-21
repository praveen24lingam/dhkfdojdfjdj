// Landing page: navbar scroll, active link (by section), hero animation, smooth scroll. Drawer = components.js
(function() {
    'use strict';

    function initNavbarScroll() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            }
        });
    }

    function initActiveLink() {
        var navLinks = document.querySelectorAll('.nav-links .nav-link[data-section]');
        var sections = [];
        navLinks.forEach(function(link) {
            var id = link.getAttribute('data-section');
            if (id) {
                var el = document.getElementById(id);
                if (el) sections.push({ id: id, el: el, link: link });
            }
        });

        if (sections.length === 0) return;

        function setActive() {
            var scrollY = window.scrollY;
            var viewportMid = scrollY + window.innerHeight * 0.35;
            var activeSection = null;
            sections.forEach(function(s) {
                var top = s.el.offsetTop;
                var height = s.el.offsetHeight;
                if (viewportMid >= top && viewportMid <= top + height) {
                    activeSection = s;
                }
            });
            if (!activeSection && scrollY < 100) {
                activeSection = sections[0];
            }
            navLinks.forEach(function(l) { l.classList.remove('active'); });
            if (activeSection) {
                activeSection.link.classList.add('active');
            }
        }

        window.addEventListener('scroll', function() {
            requestAnimationFrame(setActive);
        });
        setActive();
    }

    function initHeroAnimation() {
        var heroContent = document.getElementById('heroContent');
        if (!heroContent) return;
        window.requestAnimationFrame(function() {
            setTimeout(function() {
                heroContent.classList.add('hero-visible');
            }, 80);
        });
    }

    function initHeroSlideshow() {
        var hero = document.getElementById('hero');
        if (!hero || !hero.classList.contains('hero-slideshow')) return;

        var slides = hero.querySelectorAll('.hero-slide');
        if (slides.length === 0) return;

        var fallbacks = [
            'https://images.unsplash.com/photo-1596423735880-5c6a5bb1fb21?w=1920&q=80',
            'https://images.unsplash.com/photo-1621682333008-0130db99806e?w=1920&q=80',
            'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=1920&q=80'
        ];
        slides.forEach(function(slide, i) {
            if (!fallbacks[i]) return;
            slide.dataset.fallback = fallbacks[i];
            var bg = slide.style.backgroundImage;
            var m = bg && bg.match(/url\(['"]?([^'")]+)['"]?\)/);
            var url = m ? m[1] : '';
            if (url && (url.indexOf('assets/') === 0 || url.indexOf('/assets/') !== -1)) {
                var img = new Image();
                img.onerror = function() { slide.style.backgroundImage = 'url(' + fallbacks[i] + ')'; };
                img.src = url;
            } else if (!url) {
                slide.style.backgroundImage = 'url(' + fallbacks[i] + ')';
            }
        });

        var current = 0;
        var interval = 5000;
        var timer = null;

        function goTo(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(s, i) {
                s.classList.toggle('active', i === current);
            });
        }

        function next() {
            goTo(current + 1);
            resetTimer();
        }

        function prev() {
            goTo(current - 1);
            resetTimer();
        }

        function resetTimer() {
            if (timer) clearInterval(timer);
            timer = setInterval(next, interval);
        }

        var nextBtn = document.getElementById('heroSlideNext');
        var prevBtn = document.getElementById('heroSlidePrev');
        if (nextBtn) nextBtn.addEventListener('click', next);
        if (prevBtn) prevBtn.addEventListener('click', prev);

        resetTimer();
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            var href = anchor.getAttribute('href');
            if (href === '#') return;
            var target = document.querySelector(href);
            if (target) {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        initNavbarScroll();
        initActiveLink();
        initHeroAnimation();
        initHeroSlideshow();
        initSmoothScroll();
    });
})();

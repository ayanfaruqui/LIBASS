/* ================================================================
   LIBASS — Main Application Logic
   Navigation, scroll effects, preloader, animations
   ================================================================ */

(function () {
    'use strict';

    // ── Preloader ──────────────────────────────────────────────
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = '';
            initScrollReveal();
            animateStats();
        }, 1800);
    });

    // Prevent scroll during preload
    document.body.style.overflow = 'hidden';

    // ── Navbar Scroll Effect ──────────────────────────────────
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function handleNavScroll() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        let current = '';
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // Smooth scroll for nav links
    navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Close mobile menu
            document.getElementById('nav-links').classList.remove('open');
            document.getElementById('mobile-toggle').classList.remove('active');
        });
    });

    // ── Mobile Menu Toggle ────────────────────────────────────
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinksContainer = document.getElementById('nav-links');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinksContainer.classList.toggle('open');
    });

    // ── Scroll Reveal Animation ───────────────────────────────
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.getAttribute('data-delay') || 0;
                        setTimeout(() => {
                            entry.target.classList.add('revealed');
                        }, parseInt(delay));
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        revealElements.forEach((el) => observer.observe(el));
    }

    // ── Stats Counter Animation ───────────────────────────────
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const target = parseInt(entry.target.getAttribute('data-target'));
                        animateNumber(entry.target, 0, target, 2000);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        statNumbers.forEach((num) => observer.observe(num));
    }

    function animateNumber(element, start, end, duration) {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ── Parallax Effect on Hero Image ─────────────────────────
    const heroImageFrame = document.querySelector('.hero-image-frame');
    if (heroImageFrame) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 10;
            const y = (e.clientY / window.innerHeight - 0.5) * 10;
            heroImageFrame.style.transform = `perspective(1000px) rotateY(${x * 0.5}deg) rotateX(${-y * 0.5}deg)`;
        });
    }

    // ── Fabric Showcase Hover 3D Effect ───────────────────────
    const fabricItems = document.querySelectorAll('.fabric-item');
    fabricItems.forEach((item) => {
        item.addEventListener('mouseenter', () => {
            const fabricName = item.getAttribute('data-fabric');
            item.querySelector('span').textContent = fabricName;
        });

        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const texture = item.querySelector('.fabric-texture');
            texture.style.transform = `perspective(500px) rotateX(${y * 20}deg) rotateY(${-x * 20}deg) scale(1.15)`;
        });

        item.addEventListener('mouseleave', () => {
            const texture = item.querySelector('.fabric-texture');
            texture.style.transform = '';
        });
    });

    // ── Service Cards Touch Support (mobile) ──────────────────
    if ('ontouchstart' in window) {
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach((card) => {
            card.addEventListener('touchstart', (e) => {
                serviceCards.forEach((c) => c.classList.remove('flipped'));
                card.classList.toggle('flipped');
            });
        });
    }

})();

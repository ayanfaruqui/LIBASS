/* ================================================================
   LIBASS — Gallery / Lookbook Carousel
   3D carousel with smooth transitions, dots, auto-rotation,
   drag/swipe support
   ================================================================ */

(function () {
    'use strict';

    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotsContainer = document.getElementById('carousel-dots');

    if (!track) return;

    const items = track.querySelectorAll('.carousel-item');
    const totalItems = items.length;

    let currentIndex = 0;
    let itemsPerView = getItemsPerView();
    let autoPlayTimer = null;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let dragOffset = 0;

    // ── Responsive items per view ──
    function getItemsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1200) return 2;
        return 3;
    }

    // ── Create Dots ──
    function createDots() {
        dotsContainer.innerHTML = '';
        const maxIndex = Math.max(0, totalItems - itemsPerView);

        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    // ── Update Dots ──
    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    // ── Go To Slide ──
    function goToSlide(index) {
        const maxIndex = Math.max(0, totalItems - itemsPerView);
        currentIndex = Math.max(0, Math.min(index, maxIndex));

        const slideWidth = 100 / itemsPerView;
        currentTranslate = -(currentIndex * slideWidth);
        track.style.transform = `translateX(${currentTranslate}%)`;

        updateDots();
        updateItemStyles();
    }

    // ── Update Item Scale for 3D Effect ──
    function updateItemStyles() {
        items.forEach((item, i) => {
            const card = item.querySelector('.carousel-card');
            if (i >= currentIndex && i < currentIndex + itemsPerView) {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            } else {
                card.style.opacity = '0.5';
                card.style.transform = 'scale(0.9)';
            }
        });
    }

    // ── Navigation ──
    prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
        resetAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
        resetAutoPlay();
    });

    // ── Keyboard Navigation ──
    document.addEventListener('keydown', (e) => {
        const gallery = document.getElementById('gallery');
        const rect = gallery.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (!isVisible) return;

        if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
        if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    });

    // ── Touch / Drag Support ──
    track.addEventListener('mousedown', dragStart);
    track.addEventListener('touchstart', dragStart, { passive: true });
    track.addEventListener('mousemove', dragMove);
    track.addEventListener('touchmove', dragMove, { passive: true });
    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('mouseleave', dragEnd);
    track.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
    }

    function dragMove(e) {
        if (!isDragging) return;
        const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        dragOffset = currentX - startX;

        const slideWidth = 100 / itemsPerView;
        const offsetPercent = (dragOffset / track.parentElement.offsetWidth) * 100;
        track.style.transform = `translateX(${currentTranslate + offsetPercent}%)`;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = '';
        track.style.cursor = '';

        const threshold = 50;
        if (dragOffset > threshold) {
            goToSlide(currentIndex - 1);
        } else if (dragOffset < -threshold) {
            goToSlide(currentIndex + 1);
        } else {
            goToSlide(currentIndex);
        }

        dragOffset = 0;
        resetAutoPlay();
    }

    // ── Auto-play ──
    function startAutoPlay() {
        autoPlayTimer = setInterval(() => {
            const maxIndex = Math.max(0, totalItems - itemsPerView);
            if (currentIndex >= maxIndex) {
                goToSlide(0);
            } else {
                goToSlide(currentIndex + 1);
            }
        }, 5000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayTimer);
        startAutoPlay();
    }

    // ── Pause on hover ──
    track.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    track.addEventListener('mouseleave', () => startAutoPlay());

    // ── Resize Handler ──
    window.addEventListener('resize', () => {
        const newItemsPerView = getItemsPerView();
        if (newItemsPerView !== itemsPerView) {
            itemsPerView = newItemsPerView;
            items.forEach((item) => {
                item.style.minWidth = `${100 / itemsPerView}%`;
            });
            createDots();
            goToSlide(Math.min(currentIndex, totalItems - itemsPerView));
        }
    });

    // ── Initialize ──
    items.forEach((item) => {
        item.style.minWidth = `${100 / itemsPerView}%`;
    });
    createDots();
    updateItemStyles();
    startAutoPlay();

})();

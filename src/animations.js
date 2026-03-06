/**
 * animations.js
 * ─────────────
 * IntersectionObserver-based reveal animations and navbar scroll state.
 */

/**
 * Initializes reveal-on-scroll animations for all elements with the `.reveal` class.
 */
export function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');

    if (!reveals.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Only animate once
                }
            }
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px',
        }
    );

    for (const el of reveals) {
        observer.observe(el);
    }
}

/**
 * Adds a background to the navbar after scrolling past the hero.
 */
export function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;

    window.addEventListener(
        'scroll',
        () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (window.scrollY > 80) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        },
        { passive: true }
    );
}

/**
 * Initializes mobile hamburger menu toggle.
 */
export function initMobileMenu() {
    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    // Close on link click
    const links = mobileMenu.querySelectorAll('a');
    for (const link of links) {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    }
}

/**
 * Hides the scroll indicator once the user starts scrolling.
 */
export function initScrollIndicatorHide() {
    const indicator = document.getElementById('scroll-indicator');
    if (!indicator) return;

    let hidden = false;

    window.addEventListener(
        'scroll',
        () => {
            if (!hidden && window.scrollY > 100) {
                indicator.style.opacity = '0';
                indicator.style.transition = 'opacity 0.5s ease';
                hidden = true;
            }
        },
        { passive: true }
    );
}

/**
 * main.js
 * ───────
 * Entry point — orchestrates loading, scroll animation init, and page animations.
 */

import './style.css';
import { preloadFrames, initScrollAnimation } from './scroll-animation.js';
import {
    initRevealAnimations,
    initNavbarScroll,
    initMobileMenu,
    initScrollIndicatorHide,
} from './animations.js';

// ── DOM References ──
const loadingScreen = document.getElementById('loading-screen');
const loaderFill = document.getElementById('loader-bar-fill');
const loaderPercent = document.getElementById('loader-percent');

/**
 * Updates the loading bar UI.
 */
function updateLoadingUI(loaded, total) {
    const pct = Math.round((loaded / total) * 100);
    loaderFill.style.width = `${pct}%`;
    loaderPercent.textContent = `${pct}%`;
}

/**
 * Hides the loading screen with a smooth transition.
 */
function hideLoadingScreen() {
    return new Promise((resolve) => {
        loadingScreen.classList.add('hidden');
        loadingScreen.addEventListener('transitionend', () => {
            loadingScreen.style.display = 'none';
            resolve();
        }, { once: true });
    });
}

/**
 * Boot sequence:
 * 1. Preload all frames (with progress UI)
 * 2. Initialize scroll animation
 * 3. Hide loading screen
 * 4. Kick off page animations
 */
async function boot() {
    try {
        // 1. Preload frames
        const frames = await preloadFrames(updateLoadingUI);

        // 2. Init scroll animation
        initScrollAnimation(frames);

        // 3. Small delay for polish, then hide loader
        await new Promise((r) => setTimeout(r, 300));
        await hideLoadingScreen();

        // 4. Start page animations
        document.body.classList.add('loaded');
        initRevealAnimations();
        initNavbarScroll();
        initMobileMenu();
        initScrollIndicatorHide();

    } catch (err) {
        console.error('Boot failed:', err);
        // Still hide loader so page is usable
        loadingScreen.style.display = 'none';
    }
}

// Start
boot();

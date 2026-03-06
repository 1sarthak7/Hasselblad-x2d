/**
 * scroll-animation.js
 * ───────────────────
 * Apple-style scroll-driven frame animation on <canvas>.
 * Follows the pipeline: preload all frames → sticky container → rAF render loop.
 */

const TOTAL_FRAMES = 240;
const BATCH_SIZE = 20;
const FRAME_PATH = '/frames/frame-';
const FRAME_EXT = '.jpg';

/**
 * Pads a number with leading zeros.
 */
function pad(n, width = 4) {
  return String(n).padStart(width, '0');
}

/**
 * Loads a single frame image.
 * @returns {Promise<HTMLImageElement>}
 */
function loadFrame(index) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load frame ${index}`));
    img.src = `${FRAME_PATH}${pad(index)}${FRAME_EXT}`;
  });
}

/**
 * Preloads all frames in batches, calling onProgress after each batch.
 * @param {(loaded: number, total: number) => void} onProgress
 * @returns {Promise<HTMLImageElement[]>}
 */
export async function preloadFrames(onProgress) {
  const frames = new Array(TOTAL_FRAMES);

  for (let i = 0; i < TOTAL_FRAMES; i += BATCH_SIZE) {
    const batch = [];
    for (let j = i; j < Math.min(i + BATCH_SIZE, TOTAL_FRAMES); j++) {
      batch.push(
        loadFrame(j + 1).then((img) => {
          frames[j] = img;
        })
      );
    }
    await Promise.all(batch);
    const loaded = Math.min(i + BATCH_SIZE, TOTAL_FRAMES);
    onProgress?.(loaded, TOTAL_FRAMES);
  }

  return frames;
}

/**
 * Phase overlay definitions — scroll progress ranges where each card is visible.
 */
const PHASES = [
  { id: 'phase-1', start: 0.06, end: 0.22 },
  { id: 'phase-2', start: 0.28, end: 0.44 },
  { id: 'phase-3', start: 0.52, end: 0.68 },
  { id: 'phase-4', start: 0.74, end: 0.92 },
];

/**
 * Initializes the scroll-driven frame animation.
 * @param {HTMLImageElement[]} frames
 */
export function initScrollAnimation(frames) {
  const canvas = document.getElementById('frame-canvas');
  const ctx = canvas.getContext('2d');
  const container = document.getElementById('scroll-animation');
  const progressBar = document.getElementById('scroll-progress-bar');

  // Resolve phase overlay DOM elements
  const phases = PHASES.map((p) => ({
    ...p,
    el: document.getElementById(p.id),
  }));

  // --- Canvas sizing ---
  const firstFrame = frames[0];
  const FW = firstFrame.naturalWidth;
  const FH = firstFrame.naturalHeight;

  function resizeCanvas() {
    // Canvas internal resolution matches frame dimensions
    canvas.width = FW;
    canvas.height = FH;

    // Cover strategy: scale to fill viewport completely, cropping excess
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const scale = Math.max(vpW / FW, vpH / FH);
    canvas.style.width = `${FW * scale}px`;
    canvas.style.height = `${FH * scale}px`;
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // --- Draw first frame ---
  ctx.drawImage(frames[0], 0, 0, FW, FH);

  // --- Scroll state ---
  let currentFrame = 0;
  let drawnFrame = -1;
  let scrollProgress = 0;

  /**
   * Calculates scroll progress (0–1) through the scroll container.
   */
  function getScrollProgress() {
    const rect = container.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    const progress = -rect.top / total;
    return Math.max(0, Math.min(1, progress));
  }

  // --- Scroll listener (state only, no drawing) ---
  window.addEventListener(
    'scroll',
    () => {
      scrollProgress = getScrollProgress();
      currentFrame = Math.min(
        Math.floor(scrollProgress * TOTAL_FRAMES),
        TOTAL_FRAMES - 1
      );

      // Update phase overlays
      for (const phase of phases) {
        if (scrollProgress >= phase.start && scrollProgress <= phase.end) {
          phase.el.classList.add('visible');
        } else {
          phase.el.classList.remove('visible');
        }
      }

      // Update progress bar
      if (progressBar) {
        progressBar.style.width = `${scrollProgress * 100}%`;
      }
    },
    { passive: true }
  );

  // --- rAF render loop (only draws when frame changes) ---
  function tick() {
    if (currentFrame !== drawnFrame && frames[currentFrame]) {
      ctx.clearRect(0, 0, FW, FH);
      ctx.drawImage(frames[currentFrame], 0, 0, FW, FH);
      drawnFrame = currentFrame;
    }
    requestAnimationFrame(tick);
  }
  tick();
}

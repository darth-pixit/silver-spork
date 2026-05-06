/* =========================================================
   Spork — Interaction primitives
   - Round dot cursor with adaptive complementary trail
   - Mechanical keycap button (Newtonian press)
   ========================================================= */

(function () {
  // ---------------- Cursor + trail ----------------
  // Hide native cursor on devices that have a fine pointer
  if (window.matchMedia("(pointer: fine)").matches) {
    document.documentElement.classList.add("spork-cursor-on");
  } else {
    return; // touch device — skip the dot cursor entirely
  }

  const TRAIL_LENGTH = 5;          // dots
  const TRAIL_MAX_OPACITY = 0.22;
  const TRAIL_BASE_SIZE = 14;      // px, head dot (bigger, lighter)
  const FOLLOW_SPEED = 0.28;       // 0..1, head dot easing toward mouse
  const TAIL_FOLLOW = 0.38;        // each tail dot eases toward previous

  const root = document.documentElement;
  const layer = document.createElement("div");
  layer.className = "spork-cursor-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  const head = document.createElement("div");
  head.className = "spork-cursor-head";
  layer.appendChild(head);

  const tail = [];
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const d = document.createElement("div");
    d.className = "spork-cursor-trail";
    const t = i / (TRAIL_LENGTH - 1); // 0..1
    const size = TRAIL_BASE_SIZE * (1 - t * 0.7);
    const opacity = TRAIL_MAX_OPACITY * Math.pow(1 - t, 1.8);
    d.style.width = size + "px";
    d.style.height = size + "px";
    d.style.opacity = opacity.toFixed(3);
    layer.appendChild(d);
    tail.push({ el: d, x: 0, y: 0, opacity });
  }

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let headX = targetX;
  let headY = targetY;
  let lastMove = performance.now();
  let visible = false;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    lastMove = performance.now();
    if (!visible) {
      layer.style.opacity = "1";
      visible = true;
    }
  });

  window.addEventListener("mouseleave", () => {
    layer.style.opacity = "0";
    visible = false;
  });

  // Detect background under cursor for trail color adaptation
  let cachedBg = "cream";
  function detectBgFromElement(el) {
    while (el && el !== document.body) {
      const data = el.dataset && el.dataset.bg;
      if (data) return data;
      el = el.parentElement;
    }
    return "cream";
  }
  let lastDetectAt = 0;
  function maybeUpdateBg() {
    const now = performance.now();
    if (now - lastDetectAt < 80) return;
    lastDetectAt = now;
    const el = document.elementFromPoint(targetX, targetY);
    if (!el) return;
    const bg = detectBgFromElement(el);
    if (bg !== cachedBg) {
      cachedBg = bg;
      root.setAttribute("data-bg", bg);
    }
  }

  // Hover detection on interactive elements
  let hoveringInteractive = false;
  function maybeUpdateHover() {
    const el = document.elementFromPoint(targetX, targetY);
    const interactive = !!(el && el.closest && el.closest('button, a, [role="button"], input, label, [data-cursor="hover"]'));
    if (interactive !== hoveringInteractive) {
      hoveringInteractive = interactive;
      head.classList.toggle("is-hover", interactive);
    }
  }

  function tick() {
    headX += (targetX - headX) * FOLLOW_SPEED;
    headY += (targetY - headY) * FOLLOW_SPEED;
    head.style.transform = `translate3d(${headX - TRAIL_BASE_SIZE / 2}px, ${headY - TRAIL_BASE_SIZE / 2}px, 0)`;

    let prevX = headX;
    let prevY = headY;
    for (let i = 0; i < tail.length; i++) {
      const dot = tail[i];
      dot.x += (prevX - dot.x) * TAIL_FOLLOW;
      dot.y += (prevY - dot.y) * TAIL_FOLLOW;
      const half = parseFloat(dot.el.style.width) / 2;
      dot.el.style.transform = `translate3d(${dot.x - half}px, ${dot.y - half}px, 0)`;
      prevX = dot.x;
      prevY = dot.y;
    }

    maybeUpdateBg();
    maybeUpdateHover();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ---------------- Keycap press ripple ----------------
  // Adds a tiny bounce-back overshoot to any [data-keycap] on click.
  const KEYCAP_SELECTOR = '[data-keycap], button:not(.link-btn):not(.chip):not(.seg):not(.tab):not(.onboard-card):not(.pref-list button):not(.plan-list button)';
  document.addEventListener("pointerdown", (e) => {
    const k = e.target.closest && e.target.closest(KEYCAP_SELECTOR);
    if (!k) return;
    k.classList.add("is-pressing");
  });
  document.addEventListener("pointerup", () => {
    document.querySelectorAll(".is-pressing").forEach((el) => {
      el.classList.remove("is-pressing");
      el.classList.add("is-rebound");
      setTimeout(() => el.classList.remove("is-rebound"), 220);
    });
  });
  document.addEventListener("pointercancel", () => {
    document.querySelectorAll(".is-pressing").forEach((el) => el.classList.remove("is-pressing"));
  });
})();

/* =========================================================
   Meal Swipe — Theme handling (Fleetr)
   The Fleetr design system intentionally has no custom cursor,
   no keycap rebound, no scroll-linked motion. Behaviour-only:
   honour an explicit user theme choice, otherwise auto.
   ========================================================= */
(function () {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch {}
})();

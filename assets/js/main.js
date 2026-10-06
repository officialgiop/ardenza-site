(function () {
  var cfg = window.ARDENZA || {};
  var url = (cfg.appStoreUrl || "").trim();

  // App Store badge: real link when configured, dimmed and inactive otherwise (with a "soon" chip).
  document.querySelectorAll("[data-store]").forEach(function (el) {
    if (url) {
      el.setAttribute("href", url);
      el.setAttribute("rel", "noopener");
    } else {
      el.removeAttribute("href");
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("role", "link");
      el.classList.add("is-soon");
      el.addEventListener("click", function (e) { e.preventDefault(); });
    }
  });
  if (url) document.querySelectorAll("[data-soon-chip]").forEach(function (n) { n.hidden = true; });

  // Header border once scrolled.
  var nav = document.querySelector(".nav");
  var onScroll = function () { if (nav) nav.classList.toggle("scrolled", window.scrollY > 8); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  // Reveal on scroll (content is visible without JS and with reduced motion).
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".rv");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (n) { n.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (n) { io.observe(n); });
  }

  // Carousel: buttons and arrow keys, no auto-rotation.
  var track = document.querySelector(".track");
  if (track) {
    var step = function (dir) {
      var slide = track.querySelector(".slide");
      var w = slide ? slide.getBoundingClientRect().width + 18 : 260;
      track.scrollBy({ left: dir * w, behavior: reduce ? "auto" : "smooth" });
    };
    document.querySelector("[data-prev]").addEventListener("click", function () { step(-1); });
    document.querySelector("[data-next]").addEventListener("click", function () { step(1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });
  }
})();

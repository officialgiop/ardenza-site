(function () {
  var cfg = window.ARDENZA || {};
  var url = (cfg.appStoreUrl || "").trim();

  // Campaign attribution without cookies or personal data: the ad URL carries utm_content (the ad)
  // and utm_campaign; they are forwarded to the App Store link as ct (campaign name), so
  // App Store Connect > Analytics > Campaigns shows page views and downloads per ad.
  // pt (provider token) comes from config.js once it is known; ct alone is harmless until then.
  if (url) {
    try {
      var q = new URLSearchParams(window.location.search);
      var clean = function (v) { return (v || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40); };
      var ad = clean(q.get("utm_content")), camp = clean(q.get("utm_campaign"));
      var ct = [camp, ad].filter(Boolean).join("_");
      if (ct) {
        var u = new URL(url);
        if (cfg.providerToken) u.searchParams.set("pt", cfg.providerToken);
        u.searchParams.set("ct", ct);
        u.searchParams.set("mt", "8");
        url = u.toString();
      }
    } catch (e) { /* keep the plain App Store link */ }
  }

  // Visit counter (GoatCounter): no cookies, no personal data. Loads only when config.js names a site.
  // Besides page views it counts clicks on the App Store badges as events (see the loop below).
  var counterOn = false;
  (function () {
    var code = (cfg.goatcounter || "").trim();
    if (!/^[a-z0-9-]{2,40}$/.test(code)) return;
    counterOn = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + code + ".goatcounter.com/count");
    document.head.appendChild(s);
  })();

  // App Store badge: real link when configured, dimmed and inactive otherwise (with a "soon" chip).
  document.querySelectorAll("[data-store]").forEach(function (el) {
    if (url) {
      el.setAttribute("href", url);
      el.setAttribute("rel", "noopener");
      if (counterOn) {
        // GoatCounter binds clicks on [data-goatcounter-click] by itself. The event name carries the ad
        // (utm_content) so clicks can be compared with visits per ad; the title says which badge was used.
        var adTag = "";
        try { adTag = (new URLSearchParams(window.location.search).get("utm_content") || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40); } catch (e) {}
        el.setAttribute("data-goatcounter-click", "click-appstore" + (adTag ? "-" + adTag : ""));
        var pos = el.closest(".store-sm") ? "intestazione" : (el.closest(".final") ? "fondo pagina" : "in alto");
        el.setAttribute("data-goatcounter-title", "Pulsante App Store (" + pos + ")");
      }
    } else {
      el.removeAttribute("href");
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("role", "link");
      el.classList.add("is-soon");
      el.addEventListener("click", function (e) { e.preventDefault(); });
    }
  });
  if (url) document.querySelectorAll("[data-soon-chip]").forEach(function (n) { n.hidden = true; });
  // Invito al clic ("Tocca per scaricare gratis" con freccia): solo se il link App Store esiste.
  if (url) document.querySelectorAll("[data-store-hint]").forEach(function (n) { n.hidden = false; });

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

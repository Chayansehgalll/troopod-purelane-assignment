/* ==========================================================================
   PURELANE — ANIMATIONS
   Modular animation helpers, all respecting prefers-reduced-motion.
   Safe to load once per page. Each helper is idempotent (safe to re-run
   after theme editor block reorder).
   ========================================================================== */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     REVEAL ON SCROLL
     Any element with .pl-rv fades in when it enters the viewport.
     ------------------------------------------------------------------------ */
  function initReveal(root) {
    root = root || document;
    var els = root.querySelectorAll(".pl-rv:not(.pl-in)");
    if (!els.length) return;

    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("pl-in");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("pl-in");
            io.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.12,
      },
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     HERO CAROUSEL
     Cycles through slides in .pl-hero-stage.
     Auto-plays when in view. Pauses on hover/focus.
     ------------------------------------------------------------------------ */
  function initHeroCarousel(stage) {
    if (!stage || stage.dataset.plInit) return;
    stage.dataset.plInit = "1";

    var slides = [].slice.call(stage.querySelectorAll(".pl-hslide"));
    var dotContainer = stage.parentElement.querySelector(".pl-hdots");
    var dots = dotContainer
      ? [].slice.call(dotContainer.querySelectorAll("button"))
      : [];
    if (slides.length < 2) return;

    var i = 0;
    var timer = null;
    var interval = parseInt(stage.dataset.plInterval, 10) || 3800;

    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, idx) {
        s.classList.toggle("pl-on", idx === i);
      });
      dots.forEach(function (d, idx) {
        d.classList.toggle("pl-on", idx === i);
      });
    }

    function play() {
      if (!timer && !reduce) {
        timer = setInterval(function () {
          go(i + 1);
        }, interval);
      }
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (d, idx) {
      d.addEventListener("click", function () {
        stop();
        go(idx);
        play();
      });
    });

    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", play);
    stage.addEventListener("focusin", stop);
    stage.addEventListener("focusout", play);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            e.isIntersecting ? play() : stop();
          });
        },
        { threshold: 0.2 },
      ).observe(stage);
    } else {
      play();
    }

    go(0);
  }

  /* ------------------------------------------------------------------------
     PRODUCT ROTATOR
     Used in "Why it works" — cycles through a stack of product images
     with matching caption + dot indicators.
     ------------------------------------------------------------------------ */
  function initRotator(rot) {
    if (!rot || rot.dataset.plInit) return;
    rot.dataset.plInit = "1";

    var imgs = [].slice.call(rot.querySelectorAll(".pl-frame .pl-pimg"));
    var dots = [].slice.call(rot.querySelectorAll(".pl-dots i"));
    var capB = rot.querySelector(".pl-cap b");
    var capS = rot.querySelector(".pl-cap span");
    if (imgs.length < 2) return;

    var i = 0;
    var timer = null;
    var interval = parseInt(rot.dataset.plInterval, 10) || 2900;

    function step() {
      imgs[i].classList.remove("pl-on");
      if (dots[i]) dots[i].classList.remove("pl-on");
      i = (i + 1) % imgs.length;
      imgs[i].classList.add("pl-on");
      if (dots[i]) dots[i].classList.add("pl-on");
      if (capB) capB.textContent = imgs[i].getAttribute("data-name") || "";
      if (capS) capS.textContent = imgs[i].getAttribute("data-note") || "";
    }

    if (reduce) return;

    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !timer) timer = setInterval(step, interval);
          else if (!e.isIntersecting && timer) {
            clearInterval(timer);
            timer = null;
          }
        });
      },
      { threshold: 0.25 },
    ).observe(rot);
  }

  /* ------------------------------------------------------------------------
     MARQUEE PAUSE CONTROL
     Pauses marquee animation on hover/focus for accessibility.
     CSS handles the actual animation; JS handles pause state.
     ------------------------------------------------------------------------ */
  function initMarquee(rail) {
    if (!rail || rail.dataset.plInit) return;
    rail.dataset.plInit = "1";

    var track = rail.querySelector(".pl-marquee-track");
    if (!track) return;

    function pause() {
      track.style.animationPlayState = "paused";
    }
    function resume() {
      track.style.animationPlayState = "running";
    }

    rail.addEventListener("mouseenter", pause);
    rail.addEventListener("mouseleave", resume);
    rail.addEventListener("focusin", pause);
    rail.addEventListener("focusout", resume);
  }

  /* ------------------------------------------------------------------------
     PUBLIC API
     Sections can call window.Purelane.init(sectionEl) after render
     to bootstrap all animations inside that section.
     ------------------------------------------------------------------------ */
  window.Purelane = window.Purelane || {};

  window.Purelane.init = function (root) {
    root = root || document;
    initReveal(root);
    root.querySelectorAll(".pl-hero-stage").forEach(initHeroCarousel);
    root.querySelectorAll(".pl-rot").forEach(initRotator);
    root.querySelectorAll(".pl-marquee").forEach(initMarquee);
  };

  /* ------------------------------------------------------------------------
     BOOTSTRAP
     Run on DOM ready. Also re-run on Shopify theme editor events so
     newly-added sections get animated too.
     ------------------------------------------------------------------------ */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.Purelane.init();
    });
  } else {
    window.Purelane.init();
  }

  // Shopify theme editor lifecycle events
  if (window.Shopify && Shopify.designMode) {
    document.addEventListener("shopify:section:load", function (e) {
      window.Purelane.init(e.target);
    });
    document.addEventListener("shopify:section:reorder", function () {
      window.Purelane.init();
    });
  }
})();

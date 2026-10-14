(function() {
  "use strict";
  document.documentElement.classList.remove("no-js");
  (function initNav() {
    var toggle = document.getElementById("js-navToggle");
    var nav = document.getElementById("js-nav");
    if (!toggle || !nav) {
      return;
    }
    var scrollY = 0;
    function open() {
      scrollY = window.scrollY;
      document.body.style.top = "-" + scrollY + "px";
      document.body.classList.add("u-noScroll");
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      var first = nav.querySelector("a");
      if (first) {
        first.focus();
      }
    }
    function close(returnFocus) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("u-noScroll");
      document.body.style.top = "";
      window.scrollTo(0, scrollY);
      if (returnFocus) {
        toggle.focus();
      }
    }
    toggle.addEventListener("click", function() {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        close(true);
      } else {
        open();
      }
    });
    nav.addEventListener("click", function(e) {
      if (e.target.closest("a") && nav.classList.contains("is-open")) {
        close(false);
      }
    });
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        close(true);
      }
    });
    var mq = window.matchMedia("(min-width: 768px)");
    function onChange(e) {
      if (e.matches && nav.classList.contains("is-open")) {
        close(false);
      }
    }
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(onChange);
    }
  })();
  (function initScrollSpy() {
    var links = document.querySelectorAll("[data-navlink]");
    if (!links.length || !("IntersectionObserver" in window)) {
      return;
    }
    var map = {};
    var sections = [];
    links.forEach(function(link) {
      var id = link.getAttribute("href");
      if (!id || id.charAt(0) !== "#") {
        return;
      }
      var section = document.querySelector(id);
      if (!section) {
        return;
      }
      map[id.slice(1)] = link;
      sections.push(section);
    });
    var spy = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var link = map[entry.target.id];
        if (!link) {
          return;
        }
        if (entry.isIntersecting) {
          links.forEach(function(l) {
            l.classList.remove("is-current");
            l.removeAttribute("aria-current");
          });
          link.classList.add("is-current");
          link.setAttribute("aria-current", "true");
        }
      });
    }, {
      rootMargin: "-40% 0px -55% 0px",
      threshold: 0
    });
    sections.forEach(function(s) {
      spy.observe(s);
    });
  })();
  (function initHeaderTone() {
    var header = document.querySelector(".l-header");
    if (!header || !document.elementFromPoint) {
      return;
    }
    var ticking = false;
    function update() {
      ticking = false;
      var el = document.elementFromPoint(16, 36);
      if (!el || !el.closest) {
        return;
      }
      var toned = el.closest("[data-tone]");
      var tone = toned ? toned.getAttribute("data-tone") : "light";
      header.classList.toggle("is-onLight", tone === "light");
    }
    function onScroll() {
      if (ticking) {
        return;
      }
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    window.addEventListener("resize", onScroll);
    update();
  })();
  (function initBrand() {
    var brand = document.getElementById("js-brand");
    var hero = document.getElementById("hero");
    if (!brand || !hero || !("IntersectionObserver" in window)) {
      if (brand) {
        brand.classList.add("is-visible");
      }
      return;
    }
    var obs = new IntersectionObserver(function(entries) {
      brand.classList.toggle("is-visible", !entries[0].isIntersecting);
    }, {
      rootMargin: "-72px 0px 0px 0px",
      threshold: 0
    });
    obs.observe(hero);
  })();
  (function initMovie() {
    var button = document.getElementById("js-moviePlay");
    if (!button) {
      return;
    }
    button.addEventListener("click", function() {
      var wrap = button.closest(".p-movie");
      var src = button.getAttribute("data-movie-src");
      if (!wrap || !src) {
        return;
      }
      var iframe = document.createElement("iframe");
      iframe.className = "p-movie__frame";
      iframe.src = src;
      iframe.title = "Gen 2027 S/S コレクションムービー";
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      wrap.appendChild(iframe);
      button.remove();
    });
  })();
  (function initAnchorFocus() {
    document.addEventListener("click", function(e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) {
        return;
      }
      var id = link.getAttribute("href");
      if (!id || id === "#") {
        return;
      }
      var target = document.querySelector(id);
      if (!target) {
        return;
      }
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({
        preventScroll: true
      });
    });
  })();
})();

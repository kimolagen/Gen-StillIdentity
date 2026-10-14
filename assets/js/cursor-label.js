(function() {
  "use strict";
  var conf = window.GEN_MOTION || {};
  if (conf.cursorLabel === false) {
    return;
  }
  var el = document.getElementById("js-cursorLabel");
  if (!el) {
    return;
  }
  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!finePointerQuery.matches || reduceMotionQuery.matches) {
    return;
  }
  var coordEl = el.querySelector("[data-coord]");
  var subEl = el.querySelector("[data-sub]");
  var target = {
    x: -200,
    y: -200
  };
  var current = {
    x: -200,
    y: -200
  };
  var rafId = null;
  var hideTimer = null;
  var OFFSET_X = 18;
  var OFFSET_Y = 22;
  function pad4(n) {
    var s = String(Math.max(0, Math.round(n)));
    while (s.length < 4) {
      s = "0" + s;
    }
    return s;
  }
  function loop() {
    current.x += (target.x - current.x) * .12;
    current.y += (target.y - current.y) * .12;
    el.style.transform = "translate3d(" + (current.x + OFFSET_X).toFixed(1) + "px, " + (current.y + OFFSET_Y).toFixed(1) + "px, 0)";
    if (Math.abs(target.x - current.x) < .3 && Math.abs(target.y - current.y) < .3) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(loop);
  }
  function onMove(e) {
    target.x = e.clientX;
    target.y = e.clientY;
    if (coordEl) {
      coordEl.textContent = "X:" + pad4(e.clientX) + "  Y:" + pad4(e.clientY);
    }
    el.classList.add("is-active");
    if (rafId === null) {
      rafId = requestAnimationFrame(loop);
    }
    if (hideTimer) {
      clearTimeout(hideTimer);
    }
    hideTimer = window.setTimeout(hideAll, 1600);
  }
  function hideAll() {
    el.classList.remove("is-active");
  }
  function updateSpecimen() {
    if (!subEl) {
      return;
    }
    var sections = document.querySelectorAll("main section[id]:not([hidden])");
    var mid = window.innerHeight / 2;
    var inView = null;
    for (var i = 0; i < sections.length; i++) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        inView = sections[i];
        break;
      }
    }
    var no = inView ? Array.prototype.indexOf.call(sections, inView) + 1 : 0;
    subEl.textContent = "SPECIMEN " + (no > 0 ? "0" + no : "—");
  }
  window.addEventListener("mousemove", onMove, {
    passive: true
  });
  window.addEventListener("scroll", updateSpecimen, {
    passive: true
  });
  updateSpecimen();
  document.addEventListener("mouseleave", hideAll);
})();

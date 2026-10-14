(function() {
  "use strict";
  var conf = window.GEN_MOTION || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function splitHeadings() {
    var targets = document.querySelectorAll("[data-split]");
    for (var i = 0; i < targets.length; i++) {
      var el = targets[i];
      var text = el.textContent.trim();
      if (!text) {
        continue;
      }
      el.setAttribute("aria-label", text);
      var frag = document.createDocumentFragment();
      var index = 0;
      for (var c = 0; c < text.length; c++) {
        var ch = text.charAt(c);
        var span = document.createElement("span");
        span.className = "c-splitChar" + (ch === " " ? " c-splitChar--space" : "");
        span.style.setProperty("--i", index);
        span.textContent = ch;
        frag.appendChild(span);
        index++;
      }
      el.textContent = "";
      var wrap = document.createElement("span");
      wrap.setAttribute("aria-hidden", "true");
      wrap.appendChild(frag);
      el.appendChild(wrap);
    }
  }
  var parallaxItems = [];
  function collectParallax() {
    var nodes = document.querySelectorAll("[data-parallax]");
    for (var i = 0; i < nodes.length; i++) {
      parallaxItems.push({
        el: nodes[i],
        strength: parseFloat(nodes[i].getAttribute("data-parallax")) || 8,
        visible: false
      });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          for (var j = 0; j < parallaxItems.length; j++) {
            if (parallaxItems[j].el === entry.target) {
              parallaxItems[j].visible = entry.isIntersecting;
            }
          }
        });
      }, {
        rootMargin: "10% 0px"
      });
      for (var k = 0; k < parallaxItems.length; k++) {
        io.observe(parallaxItems[k].el);
      }
    } else {
      for (var m = 0; m < parallaxItems.length; m++) {
        parallaxItems[m].visible = true;
      }
    }
  }
  function updateParallax() {
    var vh = window.innerHeight;
    for (var i = 0; i < parallaxItems.length; i++) {
      var item = parallaxItems[i];
      if (!item.visible) {
        continue;
      }
      var rect = item.el.getBoundingClientRect();
      var progress = (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2);
      progress = Math.max(-1, Math.min(1, progress));
      item.el.style.setProperty("--parallax-y", (progress * item.strength).toFixed(2) + "%");
    }
  }
  var grainBase = .05;
  var grainMax = .13;
  var lastY = window.scrollY;
  var velocity = 0;
  var currentGrain = grainBase;
  function updateGrain() {
    var y = window.scrollY;
    var delta = Math.abs(y - lastY);
    lastY = y;
    velocity = Math.max(velocity * .88, Math.min(1, delta / 90));
    var target = grainBase + (grainMax - grainBase) * velocity;
    currentGrain += (target - currentGrain) * .2;
    document.documentElement.style.setProperty("--grain-opacity", currentGrain.toFixed(3));
  }
  var rafId = null;
  var idleFrames = 0;
  var useParallax = false;
  var useGrain = false;
  function frame() {
    if (useParallax) {
      updateParallax();
    }
    if (useGrain) {
      updateGrain();
    }
    if (velocity < .004 && Math.abs(currentGrain - grainBase) < .002) {
      idleFrames++;
    } else {
      idleFrames = 0;
    }
    if (idleFrames > 30) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(frame);
  }
  function wake() {
    idleFrames = 0;
    if (rafId === null) {
      rafId = requestAnimationFrame(frame);
    }
  }
  if (reduceMotion) {
    return;
  }
  if (conf.splitHeading !== false) {
    splitHeadings();
  }
  if (conf.parallax !== false) {
    collectParallax();
    useParallax = parallaxItems.length > 0;
  }
  useGrain = conf.grainReact !== false;
  if (useParallax || useGrain) {
    window.addEventListener("scroll", wake, {
      passive: true
    });
    window.addEventListener("resize", wake, {
      passive: true
    });
    wake();
  }
})();

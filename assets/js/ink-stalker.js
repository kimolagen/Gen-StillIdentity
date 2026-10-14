(function() {
  "use strict";
  var canvas = document.getElementById("js-stalker");
  if (!canvas || !canvas.getContext) {
    return;
  }
  var ctx = canvas.getContext("2d");
  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  function canRun() {
    return finePointerQuery.matches && !reduceMotionQuery.matches;
  }
  var dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  var PALETTES = {
    dark: {
      composite: "screen",
      a: [ [ 248, 252, 248 ], [ 215, 235, 220 ], [ 120, 150, 110 ] ],
      b: [ [ 250, 248, 244 ], [ 225, 212, 190 ], [ 150, 125, 85 ] ]
    },
    light: {
      composite: "multiply",
      a: [ [ 18, 22, 16 ], [ 46, 56, 27 ], [ 235, 236, 228 ] ],
      b: [ [ 26, 24, 20 ], [ 90, 82, 66 ], [ 240, 238, 230 ] ]
    }
  };
  var currentTone = "dark";
  var palette = PALETTES.dark;
  function setTone(tone) {
    if (tone === currentTone) {
      return;
    }
    currentTone = tone;
    palette = PALETTES[tone] || PALETTES.dark;
    canvas.classList.toggle("is-light", tone === "light");
  }
  var blots = [];
  var MAX_BLOTS = 240;
  var mouse = {
    px: null,
    py: null
  };
  var rafId = null;
  function spawn(x, y, amount) {
    var pts = 9;
    var jags = [];
    for (var i = 0; i < pts; i++) {
      jags.push(.8 + Math.random() * .4);
    }
    blots.push({
      x: x,
      y: y,
      r: 3,
      maxR: (12 + Math.random() * 14) * (.25 + .75 * amount),
      life: 1,
      amount: amount,
      growSpeed: .3 + Math.random() * .2,
      decay: .007 + Math.random() * .005,
      driftX: (Math.random() - .5) * .06,
      driftY: .02 + Math.random() * .03,
      jags: jags,
      rot: Math.random() * Math.PI * 2,
      lean: Math.random(),
      tone: currentTone
    });
    if (blots.length > MAX_BLOTS) {
      blots.splice(0, blots.length - MAX_BLOTS);
    }
  }
  function onMouseMove(e) {
    if (!running) {
      return;
    }
    var x = e.clientX;
    var y = e.clientY;
    var el = e.target;
    if (el && el.closest) {
      var toned = el.closest("[data-tone]");
      setTone(toned ? toned.getAttribute("data-tone") : "dark");
    }
    if (mouse.px !== null) {
      var d = Math.hypot(x - mouse.px, y - mouse.py);
      var speedFactor = Math.min(1, d / 55);
      var inkFactor = 1 - speedFactor * .88;
      var spacing = 4 + speedFactor * 10;
      var steps = Math.max(1, Math.floor(d / spacing));
      if (steps > 40) {
        steps = 40;
      }
      for (var i = 1; i <= steps; i++) {
        if (Math.random() > inkFactor && i !== steps) {
          continue;
        }
        var t = i / steps;
        var amt = inkFactor * (.6 + Math.random() * .4);
        spawn(mouse.px + (x - mouse.px) * t, mouse.py + (y - mouse.py) * t, amt);
      }
    } else {
      spawn(x, y, 1);
    }
    mouse.px = x;
    mouse.py = y;
    if (rafId === null) {
      rafId = requestAnimationFrame(draw);
    }
  }
  function drawBlob(b) {
    var n = b.jags.length;
    var pts = [];
    var i;
    for (i = 0; i < n; i++) {
      var ang = i / n * Math.PI * 2 + b.rot;
      var rr = b.r * b.jags[i];
      pts.push([ b.x + Math.cos(ang) * rr, b.y + Math.sin(ang) * rr ]);
    }
    ctx.beginPath();
    for (i = 0; i < n; i++) {
      var p0 = pts[i];
      var p1 = pts[(i + 1) % n];
      var mx = (p0[0] + p1[0]) / 2;
      var my = (p0[1] + p1[1]) / 2;
      if (i === 0) {
        ctx.moveTo(mx, my);
      }
      ctx.quadraticCurveTo(p0[0], p0[1], mx, my);
    }
    ctx.closePath();
    var a = Math.min(1, b.life * .42 * b.amount);
    var pal = PALETTES[b.tone] || PALETTES.dark;
    var set = b.lean < .55 ? pal.a : pal.b;
    var grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    grad.addColorStop(0, rgba(set[0], a));
    grad.addColorStop(.6, rgba(set[1], a * .75));
    grad.addColorStop(1, rgba(set[2], a * .2));
    ctx.fillStyle = grad;
    ctx.fill();
  }
  function rgba(c, a) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }
  function draw() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    for (var i = blots.length - 1; i >= 0; i--) {
      var b = blots[i];
      if (b.r < b.maxR) {
        b.r += b.growSpeed;
      }
      b.x += b.driftX;
      b.y += b.driftY;
      b.life -= b.decay;
      if (b.life <= 0) {
        blots.splice(i, 1);
        continue;
      }
      ctx.globalCompositeOperation = (PALETTES[b.tone] || PALETTES.dark).composite;
      drawBlob(b);
    }
    ctx.globalCompositeOperation = "source-over";
    if (blots.length > 0) {
      rafId = requestAnimationFrame(draw);
    } else {
      rafId = null;
    }
  }
  var running = false;
  function start() {
    if (running) {
      return;
    }
    running = true;
    resize();
    canvas.classList.add("is-active");
    window.addEventListener("mousemove", onMouseMove, {
      passive: true
    });
  }
  function stop() {
    if (!running) {
      return;
    }
    running = false;
    canvas.classList.remove("is-active");
    window.removeEventListener("mousemove", onMouseMove);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    blots.length = 0;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
  function sync() {
    if (canRun()) {
      start();
    } else {
      stop();
    }
  }
  var resizeTimer = null;
  window.addEventListener("resize", function() {
    if (!running) {
      return;
    }
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = setTimeout(resize, 150);
  });
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      blots.length = 0;
    }
  });
  function watch(mq, handler) {
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(handler);
    }
  }
  watch(reduceMotionQuery, sync);
  watch(finePointerQuery, sync);
  sync();
})();

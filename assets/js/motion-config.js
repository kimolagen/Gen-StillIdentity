window.GEN_MOTION = {
  loader: true,
  breathe: true,
  drift: true,
  glowPulse: true,
  grainReact: true,
  blurReveal: true,
  splitHeading: true,
  parallax: true,
  counterTick: true,
  cursorLabel: true,
  typewriter: true
};

(function() {
  "use strict";
  var root = document.documentElement;
  var conf = window.GEN_MOTION;
  for (var key in conf) {
    if (Object.prototype.hasOwnProperty.call(conf, key) && conf[key] === false) {
      root.classList.add("m-off-" + key);
    }
  }
  if (conf.blurReveal === false) {
    root.style.setProperty("--reveal-blur", "0px");
  }
})();

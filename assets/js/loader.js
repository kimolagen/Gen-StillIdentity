(function() {
  "use strict";
  var conf = window.GEN_MOTION || {};
  var loader = document.querySelector(".c-loader");
  if (!loader) {
    return;
  }
  if (conf.loader === false || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
    return;
  }
  try {
    window.sessionStorage.setItem("gen-loader-seen", "1");
  } catch (e) {}
  function remove() {
    if (loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
  }
  loader.addEventListener("animationend", function(e) {
    if (e.animationName === "c-loaderOut") {
      remove();
    }
  });
  window.setTimeout(remove, 3e3);
})();

(function() {
  "use strict";
  var targets = document.querySelectorAll(".js-reveal");
  if (!targets.length) {
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (var i = 0; i < targets.length; i++) {
      targets[i].classList.add("is-inview");
    }
    return;
  }
  if (!("IntersectionObserver" in window)) {
    for (var j = 0; j < targets.length; j++) {
      targets[j].classList.add("is-inview");
    }
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("is-inview");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -12% 0px",
    threshold: .05
  });
  for (var k = 0; k < targets.length; k++) {
    observer.observe(targets[k]);
  }
})();

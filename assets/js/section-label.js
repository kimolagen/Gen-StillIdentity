(function() {
  "use strict";
  var labels = document.querySelectorAll(".js-sectionLabel");
  if (!labels.length) {
    return;
  }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    for (var i = 0; i < labels.length; i++) {
      labels[i].classList.add("is-inview");
    }
    return;
  }
  var map = [];
  for (var j = 0; j < labels.length; j++) {
    var section = labels[j].closest(".l-section");
    if (section) {
      map.push({
        section: section,
        label: labels[j]
      });
    }
  }
  if (!map.length) {
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      for (var k = 0; k < map.length; k++) {
        if (map[k].section !== entry.target) {
          continue;
        }
        map[k].label.classList.toggle("is-inview", entry.isIntersecting);
      }
    });
  }, {
    rootMargin: "-25% 0px -25% 0px",
    threshold: 0
  });
  for (var m = 0; m < map.length; m++) {
    observer.observe(map[m].section);
  }
})();

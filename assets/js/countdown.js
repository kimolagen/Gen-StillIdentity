(function() {
  "use strict";
  var nodes = document.querySelectorAll("[data-countdown]");
  if (!nodes.length) {
    return;
  }
  function pad(n, len) {
    return String(n).padStart(len || 2, "0");
  }
  function paint(el, text) {
    var spans = el.__tickSpans;
    if (!spans || spans.length !== text.length) {
      el.textContent = "";
      spans = [];
      for (var i = 0; i < text.length; i++) {
        var span = document.createElement("span");
        span.className = "c-tick";
        span.textContent = text.charAt(i);
        el.appendChild(span);
        spans.push(span);
      }
      el.__tickSpans = spans;
      return;
    }
    for (var j = 0; j < text.length; j++) {
      var ch = text.charAt(j);
      if (spans[j].textContent === ch) {
        continue;
      }
      spans[j].textContent = ch;
      spans[j].classList.remove("is-ticking");
      void spans[j].offsetWidth;
      spans[j].classList.add("is-ticking");
    }
  }
  function render() {
    var now = Date.now();
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var raw = el.getAttribute("data-deadline");
      var target = raw ? Date.parse(raw) : NaN;
      if (isNaN(target)) {
        paint(el, "000:00:00");
        continue;
      }
      var diff = target - now;
      if (diff <= 0) {
        paint(el, "000:00:00");
        el.setAttribute("aria-label", "開催日を迎えました");
        el.classList.add("is-ended");
        continue;
      }
      var totalSec = Math.floor(diff / 1e3);
      var days = Math.floor(totalSec / 86400);
      var hours = Math.floor(totalSec % 86400 / 3600);
      var mins = Math.floor(totalSec % 3600 / 60);
      var secs = totalSec % 60;
      paint(el, pad(days, 3) + ":" + pad(hours) + ":" + pad(mins));
      el.setAttribute("aria-label", "開催まであと" + days + "日" + hours + "時間" + mins + "分");
      el.setAttribute("data-seconds", pad(secs));
    }
  }
  function tick() {
    render();
    var delay = 1e3 - Date.now() % 1e3 + 30;
    setTimeout(tick, delay);
  }
  tick();
})();

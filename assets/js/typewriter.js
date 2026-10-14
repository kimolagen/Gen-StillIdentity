(function() {
  "use strict";
  var conf = window.GEN_MOTION || {};
  if (conf.typewriter === false) {
    return;
  }
  var blocks = document.querySelectorAll("[data-typewriter]");
  if (!blocks.length) {
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  for (var b = 0; b < blocks.length; b++) {
    setup(blocks[b]);
  }
  function setup(block) {
    var lines = block.querySelectorAll(".c-type__line");
    if (!lines.length) {
      return;
    }
    var speed = parseFloat(block.getAttribute("data-type-speed")) || 18;
    var keepCaret = block.getAttribute("data-type-caret") === "keep";
    function delayAfter(ch) {
      var d = speed * (.65 + Math.random() * .7);
      if (ch === "\n") {
        d += speed * 6;
      } else if ("。！？".indexOf(ch) >= 0) {
        d += speed * 7;
      } else if ("、，".indexOf(ch) >= 0) {
        d += speed * 3.5;
      } else if ("」』）".indexOf(ch) >= 0) {
        d += speed * 2;
      }
      if (Math.random() < .015) {
        d += 110 + Math.random() * 220;
      }
      return d;
    }
    var items = [];
    var i;
    for (i = 0; i < lines.length; i++) {
      var line = lines[i];
      var text = line.textContent.split("\n").map(function(row) {
        return row.replace(/[ \t\u3000]+/g, " ").trim();
      }).join("\n").replace(/^\n+|\n+$/g, "");
      if (!text) {
        continue;
      }
      line.textContent = "";
      var ghost = document.createElement("span");
      ghost.className = "c-type__ghost";
      ghost.textContent = text;
      var out = document.createElement("span");
      out.className = "c-type__out";
      out.setAttribute("aria-hidden", "true");
      line.appendChild(ghost);
      line.appendChild(out);
      items.push({
        line: line,
        out: out,
        text: text,
        started: false,
        done: false
      });
    }
    if (!items.length) {
      return;
    }
    block.classList.add("is-ready");
    var queue = [];
    var running = false;
    var io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) {
            return;
          }
          var item = find(entry.target);
          if (!item || item.started) {
            return;
          }
          item.started = true;
          queue.push(item);
          io.unobserve(entry.target);
          pump();
        });
      }, {
        rootMargin: "0px 0px -40% 0px",
        threshold: 0
      });
      for (i = 0; i < items.length; i++) {
        io.observe(items[i].line);
      }
      window.addEventListener("scroll", function atBottom() {
        var reached = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (!reached) {
          return;
        }
        for (var k = 0; k < items.length; k++) {
          if (items[k].started || items[k].done) {
            continue;
          }
          items[k].started = true;
          queue.push(items[k]);
          io.unobserve(items[k].line);
        }
        pump();
        window.removeEventListener("scroll", atBottom);
      }, {
        passive: true
      });
    } else {
      for (i = 0; i < items.length; i++) {
        finish(items[i]);
      }
      return;
    }
    function find(el) {
      for (var k = 0; k < items.length; k++) {
        if (items[k].line === el) {
          return items[k];
        }
      }
      return null;
    }
    function checkComplete() {
      for (var k = 0; k < items.length; k++) {
        if (!items[k].done) {
          return;
        }
      }
      if (keepCaret) {
        block.classList.add("is-complete");
      }
    }
    function pump() {
      if (running) {
        return;
      }
      var item = queue.shift();
      if (!item) {
        checkComplete();
        return;
      }
      if (item.done) {
        pump();
        return;
      }
      var rect = item.line.getBoundingClientRect();
      if (rect.bottom < 0) {
        finish(item);
        pump();
        return;
      }
      running = true;
      type(item, function() {
        running = false;
        pump();
      });
    }
    function type(item, onEnd) {
      var caret = document.createElement("span");
      caret.className = "c-type__caret";
      var textNode = document.createTextNode("");
      item.out.appendChild(textNode);
      item.out.appendChild(caret);
      var shown = 0;
      var nextAt = 0;
      var started = false;
      function frame(now) {
        if (item.done) {
          return;
        }
        if (!started) {
          started = true;
          nextAt = now + 320;
        }
        if (now - nextAt > 500) {
          nextAt = now;
        }
        var emitted = 0;
        while (now >= nextAt && shown < item.text.length && emitted < 3) {
          shown++;
          textNode.nodeValue = item.text.slice(0, shown);
          nextAt += delayAfter(item.text.charAt(shown - 1));
          emitted++;
        }
        if (shown >= item.text.length) {
          finish(item);
          onEnd();
          return;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    function finish(item) {
      if (item.done) {
        return;
      }
      item.done = true;
      item.started = true;
      item.out.textContent = "";
      item.line.classList.add("is-done");
      checkComplete();
    }
    function skipAll() {
      queue.length = 0;
      for (var k = 0; k < items.length; k++) {
        finish(items[k]);
      }
      if (io) {
        io.disconnect();
      }
    }
    block.addEventListener("click", skipAll);
    block.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        skipAll();
      }
    });
  }
})();

(function () {
  var nav = document.getElementById("nav");
  var burger = document.getElementById("navBurger");
  var mobile = document.getElementById("navMobile");

  function onScroll() {
    if (window.scrollY > 8) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeMobile() {
    mobile.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "메뉴 열기");
  }

  burger.addEventListener("click", function () {
    var willOpen = mobile.hidden;
    mobile.hidden = !willOpen;
    burger.setAttribute("aria-expanded", String(willOpen));
    burger.setAttribute("aria-label", willOpen ? "메뉴 닫기" : "메뉴 열기");
  });

  mobile.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeMobile();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeMobile();
  });

  var demo = document.getElementById("demo");
  if (demo) {
    var video = document.getElementById("demoVideo");
    var chips = Array.prototype.slice.call(demo.querySelectorAll(".demo__tab"));
    var titleEl = demo.querySelector('[data-caption="title"]');
    var descEl = demo.querySelector('[data-caption="desc"]');

    function selectChip(chip) {
      chips.forEach(function (c) {
        c.classList.toggle("is-active", c === chip);
        if (c === chip) c.setAttribute("aria-current", "step");
        else c.removeAttribute("aria-current");
      });
      if (titleEl) titleEl.textContent = chip.getAttribute("data-title") || "";
      if (descEl) descEl.textContent = chip.getAttribute("data-desc") || "";
    }

    if (video) {
      // 서버가 Range 요청을 지원하지 않으면 seek 이 막히므로, 칩은 재생 위치 표시로만 쓴다.
      video.addEventListener("timeupdate", function () {
        var t = video.currentTime;
        var active = chips[0];
        chips.forEach(function (chip) {
          if (t >= Number(chip.getAttribute("data-time"))) active = chip;
        });
        if (active && !active.classList.contains("is-active")) selectChip(active);
      });

      var reduceMotion =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        video.removeAttribute("autoplay");
        video.pause();
      } else if ("IntersectionObserver" in window) {
        var videoIo = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                var started = video.play();
                if (started && started.catch) started.catch(function () {});
              } else {
                video.pause();
              }
            });
          },
          { threshold: 0.25 }
        );
        videoIo.observe(demo);
      }
    }
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var carousel = document.getElementById("catCarousel");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".cat-slide"));
    var dotsWrap = document.getElementById("catDots");
    var nameEl = document.getElementById("catName");
    var index = 0;
    var timer = null;
    var interval = 2000;

    var dots = slides.map(function (slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "cat-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", slide.getAttribute("data-name") || String(i + 1));
      dot.addEventListener("click", function () {
        go(i);
        restart();
      });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function go(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
      if (nameEl) nameEl.textContent = slides[index].getAttribute("data-name") || "";
    }

    function start() {
      if (!timer) timer = window.setInterval(function () { go(index + 1); }, interval);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function restart() {
      stop();
      start();
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    start();
  }
})();

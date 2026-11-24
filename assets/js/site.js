(function () {
  var root = document.documentElement;
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var desktopNavQuery = window.matchMedia("(min-width: 1200px)");

  function normalizeTheme(value) {
    return value === "zelena" ? "zelena" : "ljubicasta";
  }

  function getSavedTheme() {
    try {
      return normalizeTheme(localStorage.getItem("theme"));
    } catch (e) {
      return normalizeTheme(root.getAttribute("data-theme"));
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem("theme", normalizeTheme(theme));
    } catch (e) {
      // Ignore storage errors in restricted environments
    }
  }

  function applyTheme(nextTheme) {
    var theme = normalizeTheme(nextTheme);
    var isGreen = theme === "zelena";
    var faviconHref = isGreen
      ? "assets/images/favicon-eye-green.svg"
      : "assets/images/favicon-eye-violet.svg";

    root.setAttribute("data-theme", theme);

    var toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.checked = isGreen;
    }

    var favicon = document.getElementById("favicon");
    if (favicon) {
      var prefix = favicon.getAttribute("data-base") || "";
      var nextHref = prefix + faviconHref;
      if (favicon.getAttribute("href") !== nextHref) {
        favicon.setAttribute("href", nextHref);
      }
    }
  }

  function normalizePath(p) {
    return (p || "")
      .replace(/\/index\.html$/i, "/")
      .replace(/\.html$/i, "")
      .replace(/\/$/, "") || "/";
  }

  function getNavbarOffset() {
    var nav = document.querySelector(".nav-pill");
    return nav ? nav.getBoundingClientRect().height + 20 : 84;
  }

  document.addEventListener("DOMContentLoaded", function () {
    // 1. Theme toggle sync
    applyTheme(getSavedTheme());

    var themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("change", function () {
        var nextTheme = themeToggle.checked ? "zelena" : "ljubicasta";
        saveTheme(nextTheme);
        applyTheme(nextTheme);
      });
    }

    window.addEventListener("pageshow", function () {
      applyTheme(getSavedTheme());
    });

    window.addEventListener("storage", function (e) {
      if (e.key === "theme" || e.key === null) {
        applyTheme(getSavedTheme());
      }
    });

    // 2. Mobile navigation menu
    var navToggle = document.getElementById("navToggle");
    var navMenu = document.getElementById("navMenu");
    var navPill = document.querySelector(".nav-pill");

    function setMenuOpen(open) {
      if (!navToggle || !navMenu) return;
      navMenu.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Zatvori navigaciju" : "Otvori navigaciju");
    }

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", function () {
        var isOpen = navMenu.classList.contains("is-open");
        setMenuOpen(!isOpen);
      });

      document.addEventListener("click", function (e) {
        if (!navMenu.classList.contains("is-open")) return;
        if (!(e.target instanceof Element)) return;

        if (navPill && !navPill.contains(e.target)) {
          setMenuOpen(false);
          return;
        }

        var clickedLink = e.target.closest(".nav-link");
        if (
          clickedLink &&
          clickedLink.hash &&
          clickedLink.origin === window.location.origin &&
          normalizePath(clickedLink.pathname) === normalizePath(window.location.pathname)
        ) {
          setMenuOpen(false);
        }
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
          setMenuOpen(false);
          navToggle.focus();
        }
      });

      window.addEventListener("resize", function () {
        if (desktopNavQuery.matches && navMenu.classList.contains("is-open")) {
          setMenuOpen(false);
        }
      });
    }

    // 3. Same-page smooth anchor scrolling
    document.addEventListener("click", function (e) {
      if (!(e.target instanceof Element)) return;
      var link = e.target.closest("a[href]");
      if (!link || !link.hash || link.hash === "#") return;

      if (
        link.origin !== window.location.origin ||
        normalizePath(link.pathname) !== normalizePath(window.location.pathname)
      ) {
        return;
      }

      var targetId;
      try {
        targetId = decodeURIComponent(link.hash.slice(1));
      } catch (err) {
        return;
      }

      var target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      try {
        var encodedHash = "#" + encodeURIComponent(targetId);
        if (window.location.hash !== encodedHash) {
          history.pushState(null, "", encodedHash);
        }
      } catch (err) {
        // Ignore history errors in restricted environments
      }

      var top =
        target.getBoundingClientRect().top +
        (window.scrollY || document.documentElement.scrollTop) -
        getNavbarOffset();

      window.scrollTo({
        top: Math.max(0, top),
        left: 0,
        behavior: reducedMotionQuery.matches ? "auto" : "smooth"
      });

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });
    });

    // 4. Scroll-to-top button
    var scrollToTopBtn = document.getElementById("scrollToTop");
    if (scrollToTopBtn) {
      var scrollTicking = false;

      function updateScrollToTop() {
        scrollTicking = false;
        var scrollY = window.scrollY || document.documentElement.scrollTop || 0;
        var docHeight = document.documentElement.scrollHeight;
        var winHeight = window.innerHeight;
        var scrollable = docHeight - winHeight;
        var shouldShow =
          scrollY > 240 &&
          (scrollY > winHeight * 0.6 || (scrollable > 300 && scrollY > scrollable / 2));
        scrollToTopBtn.classList.toggle("is-visible", shouldShow);
        scrollToTopBtn.setAttribute("aria-hidden", shouldShow ? "false" : "true");
      }

      window.addEventListener(
        "scroll",
        function () {
          if (!scrollTicking) {
            scrollTicking = true;
            window.requestAnimationFrame(updateScrollToTop);
          }
        },
        { passive: true }
      );

      updateScrollToTop();

      scrollToTopBtn.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: reducedMotionQuery.matches ? "auto" : "smooth"
        });
      });
    }

    // 5. Below-the-fold scroll reveal
    if (!reducedMotionQuery.matches && "IntersectionObserver" in window) {
      var sections = Array.from(document.querySelectorAll("main > section"));
      var belowFoldTargets = [];

      sections.slice(1).forEach(function (sec) {
        var rect = sec.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.95) {
          sec.classList.add("scroll-reveal");
          belowFoldTargets.push(sec);
        }
      });

      if (belowFoldTargets.length > 0) {
        var remainingTargets = new Set(belowFoldTargets);
        var revealScrollTicking = false;

        function markRevealed(el, observer) {
          el.classList.add("is-revealed");
          observer.unobserve(el);
          remainingTargets.delete(el);
          if (remainingTargets.size === 0) {
            window.removeEventListener("scroll", onRevealScroll);
          }
        }

        var revealObserver = new IntersectionObserver(
          function (entries, observer) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                markRevealed(entry.target, observer);
              }
            });
          },
          { rootMargin: "0px 0px -20px 0px", threshold: 0.01 }
        );

        belowFoldTargets.forEach(function (el) {
          revealObserver.observe(el);
        });

        function checkBottomReveal() {
          revealScrollTicking = false;
          if (
            (window.scrollY || document.documentElement.scrollTop) + window.innerHeight >=
            document.documentElement.scrollHeight - 40
          ) {
            Array.from(remainingTargets).forEach(function (el) {
              markRevealed(el, revealObserver);
            });
          }
        }

        function onRevealScroll() {
          if (!revealScrollTicking) {
            revealScrollTicking = true;
            window.requestAnimationFrame(checkBottomReveal);
          }
        }

        window.addEventListener("scroll", onRevealScroll, { passive: true });
      }
    }

    // 6. Keep exclusive <details name="..."> item in view when collapsing a taller sibling shifts it up
    document.querySelectorAll("details.accordion-item[name]").forEach(function (el) {
      el.addEventListener("toggle", function () {
        if (!el.open) return;
        window.requestAnimationFrame(function () {
          var rect = el.getBoundingClientRect();
          var offset = getNavbarOffset();
          if (rect.top < offset) {
            var top = rect.top + (window.scrollY || document.documentElement.scrollTop) - offset;
            window.scrollTo({
              top: Math.max(0, top),
              left: 0,
              behavior: reducedMotionQuery.matches ? "auto" : "smooth"
            });
          }
        });
      });
    });

    // 7. Native <dialog> gallery lightbox (novosti.html)
    var gallery = document.getElementById("novosti-gallery");
    var dialog = document.getElementById("imageModal");
    var modalImage = document.getElementById("modalImage");
    var modalError = document.getElementById("modalError");
    var stage = dialog ? dialog.querySelector(".lightbox-stage") : null;
    var btnPrev = document.getElementById("modalPrev");
    var btnNext = document.getElementById("modalNext");
    var btnClose = document.getElementById("modalClose");

    if (gallery && dialog && modalImage && typeof dialog.showModal === "function") {
      var currentIndex = 0;
      var loadSeq = 0;
      var triggers = Array.from(gallery.querySelectorAll(".gallery-trigger"));

      var items = triggers.map(function (trigger) {
        var img = trigger.querySelector("img");
        return {
          src: img ? img.getAttribute("src") : "",
          alt: (img && img.getAttribute("alt")) || "Slika iz galerije"
        };
      });

      if (items.length > 0) {
        function showImage(index) {
          var targetIndex = ((index % items.length) + items.length) % items.length;
          currentIndex = targetIndex;
          var item = items[targetIndex];
          var seq = ++loadSeq;

          if (modalError) modalError.hidden = true;
          if (modalImage.getAttribute("src")) {
            modalImage.style.opacity = "0.5";
          } else {
            modalImage.hidden = true;
          }

          var preloader = new Image();
          preloader.onload = function () {
            if (seq !== loadSeq) return;
            modalImage.src = item.src;
            modalImage.alt = item.alt;
            modalImage.hidden = false;
            modalImage.style.opacity = "1";
          };
          preloader.onerror = function () {
            if (seq !== loadSeq) return;
            modalImage.hidden = true;
            modalImage.removeAttribute("src");
            if (modalError) modalError.hidden = false;
          };
          preloader.src = item.src;
        }

        gallery.addEventListener("click", function (e) {
          var trigger = e.target instanceof Element ? e.target.closest(".gallery-trigger") : null;
          if (!trigger) return;
          var idx = triggers.indexOf(trigger);
          if (idx < 0) {
            idx = parseInt(trigger.getAttribute("data-gallery-index"), 10);
            if (Number.isNaN(idx)) idx = 0;
          }
          showImage(idx);
          if (!dialog.open) {
            root.classList.add("is-lightbox-open");
            dialog.showModal();
          }
        });

        dialog.addEventListener("close", function () {
          root.classList.remove("is-lightbox-open");
        });

        dialog.addEventListener(
          "wheel",
          function (e) {
            e.preventDefault();
          },
          { passive: false }
        );

        dialog.addEventListener(
          "touchmove",
          function (e) {
            e.preventDefault();
          },
          { passive: false }
        );

        if (btnPrev) {
          btnPrev.addEventListener("click", function (e) {
            e.stopPropagation();
            showImage(currentIndex - 1);
          });
        }

        if (btnNext) {
          btnNext.addEventListener("click", function (e) {
            e.stopPropagation();
            showImage(currentIndex + 1);
          });
        }

        if (btnClose) {
          btnClose.addEventListener("click", function () {
            dialog.close();
          });
        }

        // Backdrop click dismisses dialog (including empty space inside .lightbox-stage)
        dialog.addEventListener("click", function (e) {
          if (e.target === dialog || e.target === stage) {
            dialog.close();
          }
        });

        document.addEventListener("keydown", function (e) {
          if (!dialog.open) return;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            showImage(currentIndex - 1);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            showImage(currentIndex + 1);
          }
        });
      }
    }
  });
})();

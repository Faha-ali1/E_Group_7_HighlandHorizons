/**
 * Highland Horizons — Shared Header & Footer Loader
 * Vanilla JavaScript using fetch() to inject components/header.html and components/footer.html.
 */
(function () {
  "use strict";

  /**
   * Determine the base path to the repository root so shared components, links,
   * and images work both from root HTML files (e.g. index.html) and subfolder
   * HTML files (e.g. pages/about.html).
   */
  function getBasePath() {
    var explicitBase =
      document.body.getAttribute("data-base-path") ||
      (document.getElementById("site-header") &&
        document.getElementById("site-header").getAttribute("data-base-path"));

    if (explicitBase) {
      return explicitBase.replace(/\/+$/, "");
    }

    var currentScript = document.querySelector('script[src*="assets/js/layout.js"]');
    if (currentScript) {
      var src = currentScript.getAttribute("src") || "";
      var markerIndex = src.indexOf("assets/js/layout.js");
      if (markerIndex > 0) {
        return src.slice(0, markerIndex).replace(/\/+$/, "");
      }
    }

    return ".";
  }

  function joinPath(basePath, relativePath) {
    if (
      !relativePath ||
      relativePath === "#" ||
      /^(mailto:|tel:|https?:|#|\/)/i.test(relativePath)
    ) {
      return relativePath;
    }

    if (!basePath || basePath === ".") {
      return relativePath;
    }

    return basePath + "/" + relativePath.replace(/^\/+/, "");
  }

  function resolveComponentPaths(container, basePath) {
    container.querySelectorAll("[data-hh-href]").forEach(function (el) {
      var target = el.getAttribute("data-hh-href");
      el.setAttribute("href", joinPath(basePath, target));
    });

    container.querySelectorAll("[data-hh-src]").forEach(function (el) {
      var target = el.getAttribute("data-hh-src");
      el.setAttribute("src", joinPath(basePath, target));
    });
  }

  function highlightActiveNav(headerContainer) {
    var activePage = document.body.getAttribute("data-hh-active-page");
    var currentFile = window.location.pathname.split("/").pop();

    headerContainer.querySelectorAll(".hh-nav-link, .hh-dropdown-item").forEach(function (link) {
      var linkPage = link.getAttribute("data-hh-page");
      var linkTarget = link.getAttribute("data-hh-href");
      var matchesActivePage = activePage && linkPage && linkPage === activePage;
      var matchesConfirmedFile =
        linkTarget && linkTarget !== "#" && currentFile && linkTarget.split("/").pop() === currentFile;

      if (matchesActivePage || matchesConfirmedFile) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");

        var parentDropdown = link.closest(".dropdown");
        if (parentDropdown) {
          var parentToggle = parentDropdown.querySelector(".hh-dropdown-toggle");
          if (parentToggle) {
            parentToggle.classList.add("active");
          }
        }
      }
    });
  }

  function initHeaderSearch(headerContainer) {
    var triggers = headerContainer.querySelectorAll(".hh-search-trigger");
    var panel = headerContainer.querySelector("#hhSearchPanel");
    var input = headerContainer.querySelector("#hhSearchInput");
    var form = headerContainer.querySelector(".hh-search-form");
    var closeBtn = headerContainer.querySelector(".hh-search-close");
    var status = headerContainer.querySelector("#hhSearchStatus");

    if (!panel || !triggers.length) {
      return;
    }

    function setExpanded(isOpen) {
      panel.hidden = !isOpen;
      triggers.forEach(function (btn) {
        btn.setAttribute("aria-expanded", String(isOpen));
      });

      if (isOpen && input) {
        input.focus();
      } else if (status) {
        status.hidden = true;
        status.textContent = "";
      }
    }

    triggers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setExpanded(panel.hidden);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setExpanded(false);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) {
        setExpanded(false);
      }
    });

    if (form && input && status) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        status.hidden = false;
        if (!query) {
          status.textContent = "Please type a destination or package name to search.";
          input.focus();
          return;
        }
        status.textContent =
          'Search preview for "' + query + '" (static frontend demo — no backend connected).';
      });
    }
  }

  function initHeaderMenu(headerContainer) {
    var navCollapse = headerContainer.querySelector("#hhMainNav");
    var toggler = headerContainer.querySelector(".hh-toggler");

    if (!navCollapse || !toggler) {
      return;
    }

    function hideMenu(restoreFocus) {
      if (!navCollapse.classList.contains("show")) {
        return;
      }
      if (window.bootstrap && window.bootstrap.Collapse) {
        window.bootstrap.Collapse.getOrCreateInstance(navCollapse, { toggle: false }).hide();
      } else {
        navCollapse.classList.remove("show");
        toggler.setAttribute("aria-expanded", "false");
      }
      if (restoreFocus) {
        toggler.focus();
      }
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navCollapse.classList.contains("show")) {
        hideMenu(true);
      }
    });

    document.addEventListener("click", function (event) {
      if (
        navCollapse.classList.contains("show") &&
        !headerContainer.contains(event.target)
      ) {
        hideMenu(false);
      }
    });
  }

  function loadComponent(placeholderId, componentPath, basePath, onLoaded) {
    var target = document.getElementById(placeholderId);
    if (!target) {
      return Promise.resolve();
    }

    return fetch(joinPath(basePath, componentPath))
      .then(function (response) {
        if (!response.ok) {
          throw new Error("HTTP " + response.status + " while loading " + componentPath);
        }
        return response.text();
      })
      .then(function (html) {
        target.innerHTML = html;
        resolveComponentPaths(target, basePath);
        if (typeof onLoaded === "function") {
          onLoaded(target);
        }
      })
      .catch(function (error) {
        console.error(
          "[Highland Horizons] Could not load " +
            componentPath +
            ". Make sure you open the site via a local server (e.g., VS Code Live Server or python3 -m http.server).",
          error
        );
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var basePath = getBasePath();

    loadComponent("site-header", "components/header.html", basePath, function (headerEl) {
      highlightActiveNav(headerEl);
      initHeaderMenu(headerEl);
      initHeaderSearch(headerEl);
    });

    loadComponent("site-footer", "components/footer.html", basePath);
  });
})();

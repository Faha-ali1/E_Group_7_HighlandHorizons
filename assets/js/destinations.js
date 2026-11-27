/**
 * Highland Horizons — Destinations Page Script
 * Renders destination cards from a JavaScript data array and handles
 * combined region filtering and destination name search.
 */
(function () {
  "use strict";

  // Data array for the Popular Destinations cards.
  // Image paths are relative to pages/destinations.html.
  var DESTINATIONS = [
    {
      id: "hunza-valley",
      name: "Hunza Valley",
      description: "Explore Hunza's beauty",
      region: "Gilgit-Baltistan",
      image: "../assets/images/hunza.jpg",
      suggestedFile: "assets/images/hunza.jpg",
      imageAlt: "Turquoise river winding past steep mountains, tall green trees, and a bridge in Hunza Valley"
    },
    {
      id: "skardu",
      name: "Skardu",
      description: "Discover Skardu",
      region: "Gilgit-Baltistan",
      image: "../assets/images/skardu.jpg",
      suggestedFile: "assets/images/skardu.jpg",
      imageAlt: "Deep blue mountain lake surrounded by golden autumn trees and rugged peaks in Skardu"
    },
    {
      id: "swat-valley",
      name: "Swat Valley",
      description: "Green landscapes & rivers",
      region: "KPK",
      image: "../assets/images/sawat.jpg",
      suggestedFile: "assets/images/sawat.jpg",
      imageAlt: "Lush green alpine meadows, pine trees, and a small pond under cloudy skies in Swat Valley"
    },
    {
      id: "naran-valley",
      name: "Naran Valley",
      description: "A scenic mountain escape",
      region: "KPK",
      image: "../assets/images/Naran.jpg",
      suggestedFile: "assets/images/Naran.jpg",
      imageAlt: "Clear mountain river flowing over rocks beside pine-covered slopes in Naran Valley"
    }
  ];

  // Current filter and search state
  var activeRegion = "All";
  var searchQuery = "";

  // DOM element references
  var gridEl = document.getElementById("destinationsGrid");
  var emptyStateEl = document.getElementById("emptyDestinationsMessage");
  var emptyMessageTextEl = document.getElementById("emptyMessageText");
  var searchFormEl = document.getElementById("destinationSearchForm");
  var searchInputEl = document.getElementById("destinationSearchInput");
  var resetBtnEl = document.getElementById("resetFiltersBtn");
  var filterButtons = document.querySelectorAll(".hh-filter-btn");

  /**
   * Builds a graceful placeholder block when an image file is not added yet.
   */
  function createImagePlaceholder(destination) {
    var wrapper = document.createElement("div");
    wrapper.className = "hh-card-placeholder";
    wrapper.setAttribute("role", "img");
    wrapper.setAttribute("aria-label", destination.imageAlt + " (image placeholder)");

    wrapper.innerHTML =
      '<svg class="hh-placeholder-icon" viewBox="0 0 64 46" fill="none" aria-hidden="true">' +
      '<path d="M4 40L21 15L33 31L42 20L60 40H4Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<circle cx="48" cy="11" r="4.5" stroke="currentColor" stroke-width="2.2"/>' +
      "</svg>";

    var titleSpan = document.createElement("span");
    titleSpan.className = "hh-placeholder-title";
    titleSpan.textContent = destination.name + " Photo";

    var noteSpan = document.createElement("span");
    noteSpan.className = "hh-placeholder-note";
    noteSpan.textContent = "Add image: " + destination.suggestedFile;

    wrapper.appendChild(titleSpan);
    wrapper.appendChild(noteSpan);
    return wrapper;
  }

  /**
   * Creates the media container (real <img> when provided, or placeholder fallback).
   */
  function createCardMedia(destination) {
    var mediaBox = document.createElement("div");
    mediaBox.className = "hh-card-media";

    if (destination.image) {
      var img = document.createElement("img");
      img.className = "hh-card-img";
      img.src = destination.image;
      img.alt = destination.imageAlt;

      // Fall back gracefully if the image path fails to load
      img.addEventListener("error", function () {
        mediaBox.innerHTML = "";
        mediaBox.appendChild(createImagePlaceholder(destination));
      });

      mediaBox.appendChild(img);
    } else {
      mediaBox.appendChild(createImagePlaceholder(destination));
    }

    return mediaBox;
  }

  /**
   * Builds one responsive Bootstrap column containing a destination card.
   */
  function createDestinationCard(destination) {
    var col = document.createElement("div");
    col.className = "col";

    var article = document.createElement("article");
    article.className = "hh-destination-card";

    var media = createCardMedia(destination);

    var body = document.createElement("div");
    body.className = "hh-card-body";

    var regionBadge = document.createElement("span");
    regionBadge.className = "hh-region-badge";
    regionBadge.textContent = destination.region;

    var title = document.createElement("h3");
    title.className = "hh-card-title";
    title.textContent = destination.name;

    var description = document.createElement("p");
    description.className = "hh-card-desc";
    description.textContent = destination.description;

    var actions = document.createElement("div");
    actions.className = "hh-card-actions";

    var exploreLink = document.createElement("a");
    exploreLink.className = "btn hh-explore-btn";
    exploreLink.href = "destination-details.html?destination=" + encodeURIComponent(destination.id);
    exploreLink.textContent = "Explore";
    exploreLink.setAttribute("aria-label", "Explore " + destination.name);

    actions.appendChild(exploreLink);
    body.appendChild(regionBadge);
    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(actions);

    article.appendChild(media);
    article.appendChild(body);
    col.appendChild(article);

    return col;
  }

  /**
   * Returns destinations matching BOTH the selected region and the search text.
   */
  function getFilteredDestinations() {
    var normalizedQuery = searchQuery.trim().toLowerCase();

    return DESTINATIONS.filter(function (destination) {
      var matchesRegion = activeRegion === "All" || destination.region === activeRegion;
      var matchesSearch =
        normalizedQuery === "" ||
        destination.name.toLowerCase().indexOf(normalizedQuery) !== -1;

      return matchesRegion && matchesSearch;
    });
  }

  /**
   * Updates the destination cards grid and empty-state message.
   */
  function renderDestinations() {
    if (!gridEl || !emptyStateEl) {
      return;
    }

    var filtered = getFilteredDestinations();
    gridEl.innerHTML = "";

    if (filtered.length === 0) {
      emptyStateEl.hidden = false;
      if (emptyMessageTextEl) {
        var trimmed = searchQuery.trim();
        if (trimmed && activeRegion !== "All") {
          emptyMessageTextEl.textContent =
            'No destinations found matching "' + trimmed + '" in ' + activeRegion + ".";
        } else if (trimmed) {
          emptyMessageTextEl.textContent =
            'No destinations found matching "' + trimmed + '".';
        } else {
          emptyMessageTextEl.textContent =
            "No destinations found in " + activeRegion + ".";
        }
      }
      return;
    }

    emptyStateEl.hidden = true;
    filtered.forEach(function (destination) {
      gridEl.appendChild(createDestinationCard(destination));
    });
  }

  /**
   * Highlights the active region button and updates aria-pressed for accessibility.
   */
  function setActiveRegionButton(selectedRegion) {
    filterButtons.forEach(function (button) {
      var isSelected = button.getAttribute("data-region") === selectedRegion;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function initEvents() {
    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeRegion = button.getAttribute("data-region") || "All";
        setActiveRegionButton(activeRegion);
        renderDestinations();
      });
    });

    if (searchInputEl) {
      searchInputEl.addEventListener("input", function () {
        searchQuery = searchInputEl.value;
        renderDestinations();
      });
    }

    if (searchFormEl) {
      searchFormEl.addEventListener("submit", function (event) {
        event.preventDefault();
        if (searchInputEl) {
          searchQuery = searchInputEl.value;
        }
        renderDestinations();
      });
    }

    if (resetBtnEl) {
      resetBtnEl.addEventListener("click", function () {
        activeRegion = "All";
        searchQuery = "";
        if (searchInputEl) {
          searchInputEl.value = "";
        }
        setActiveRegionButton("All");
        renderDestinations();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initEvents();
    renderDestinations();
  });
})();

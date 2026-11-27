/* ==========================================================================
   Highland Horizons - Tour Packages Page Script
   Author: Asher Maqsood (26i-3246)
   ========================================================================== */

(function () {
  "use strict";

  // Consistent localStorage keys for integration with Package Details & Compare Packages
  const STORAGE_KEYS = {
    COMPARE_IDS: "hh_compare_packages",
    SELECTED_DETAIL_ID: "hh_selected_package_id"
  };

  const MAX_COMPARE_PACKAGES = 2;

  /**
   * Builds a lightweight SVG landscape thumbnail as a data URI.
   * Temporary placeholder until real local photos are added under ../images/packages/.
   */
  function createDestinationThumbnail(title, skyTop, skyBottom, ridgeBack, ridgeFront, accentColor) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 330" role="img" aria-label="${title}">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${skyTop}" />
            <stop offset="100%" stop-color="${skyBottom}" />
          </linearGradient>
        </defs>
        <rect width="440" height="330" fill="url(#sky)" />
        <circle cx="355" cy="72" r="28" fill="${accentColor}" opacity="0.9" />
        <path d="M0 245 L95 145 L185 215 L280 120 L375 205 L440 160 L440 330 L0 330 Z" fill="${ridgeBack}" />
        <path d="M262 138 L280 120 L299 139 L286 135 L276 142 Z" fill="#FFFFFF" opacity="0.9" />
        <path d="M79 162 L95 145 L112 164 L99 159 L90 165 Z" fill="#FFFFFF" opacity="0.85" />
        <path d="M0 270 L70 215 L155 255 L245 195 L335 250 L440 210 L440 330 L0 330 Z" fill="${ridgeFront}" />
        <rect x="0" y="282" width="440" height="48" fill="#26332E" opacity="0.82" />
        <text x="22" y="313" fill="#FFFDF5" font-family="Poppins, Arial, sans-serif" font-size="20" font-weight="600">${title}</text>
      </svg>
    `.trim();

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  /**
   * Master package dataset.
   * Keep IDs and details consistent with Package Details and Compare Packages pages.
   * Future local images can replace imageSrc, e.g. "../images/packages/hunza-valley.jpg".
   */
  const TOUR_PACKAGES = [
    {
      id: "hunza-valley",
      name: "Hunza Valley",
      destination: "Hunza",
      durationDays: 5,
      durationLabel: "5 days",
      pricePkr: 25000,
      description:
        "Discover Karimabad, Baltit Fort, Attabad Lake, and panoramic views of Rakaposhi on a scenic five-day journey through Hunza.",
      hotelCategory: "3-star hotel",
      meals: "Breakfast included",
      tourGuideAvailable: true,
      tourGuideLabel: "Tour guide available",
      imageAlt: "Scenic mountain valley illustration representing Hunza Valley",
      imageSrc: createDestinationThumbnail("Hunza Valley", "#88C9A1", "#E7F6EC", "#2E7D5B", "#1E563E", "#F4B183")
    },
    {
      id: "skardu-adventure",
      name: "Skardu Adventure",
      destination: "Skardu",
      durationDays: 7,
      durationLabel: "7 days",
      pricePkr: 35000,
      description:
        "Experience Shangrila Resort, Upper Kachura Lake, Shigar Fort, and the cold desert of Sarfaranga over an unforgettable week.",
      hotelCategory: "4-star hotel",
      meals: "All meals included",
      tourGuideAvailable: true,
      tourGuideLabel: "Tour guide available",
      imageAlt: "Highland lake and peaks illustration representing Skardu Adventure",
      imageSrc: createDestinationThumbnail("Skardu Adventure", "#7AB8B2", "#E4F3F1", "#28666E", "#1C4B52", "#F4B183")
    },
    {
      id: "fairy-meadows-trek",
      name: "Fairy Meadows Trek",
      destination: "Fairy Meadows",
      durationDays: 6,
      durationLabel: "6 days",
      pricePkr: 30000,
      description:
        "Take a thrilling jeep ride to Tato and trek up to lush alpine meadows facing the towering north face of Nanga Parbat.",
      hotelCategory: "Alpine cabins & camps",
      meals: "Breakfast & dinner included",
      tourGuideAvailable: true,
      tourGuideLabel: "Tour guide available",
      imageAlt: "Alpine meadow and snow peak illustration representing Fairy Meadows Trek",
      imageSrc: createDestinationThumbnail("Fairy Meadows", "#90D0A8", "#ECF8F0", "#357A57", "#23533A", "#FFD59E")
    },
    {
      id: "swat-valley-escape",
      name: "Swat Valley Escape",
      destination: "Swat",
      durationDays: 3,
      durationLabel: "3 days",
      pricePkr: 15000,
      description:
        "Unwind along the Swat River with visits to Mingora, Malam Jabba chairlift, and the cedar forests of Kalam.",
      hotelCategory: "3-star hotel",
      meals: "Breakfast included",
      tourGuideAvailable: true,
      tourGuideLabel: "Tour guide available",
      imageAlt: "Green valley hills illustration representing Swat Valley Escape",
      imageSrc: createDestinationThumbnail("Swat Valley", "#A2DBB7", "#F2FBF5", "#3A8862", "#265E43", "#F4B183")
    },
    {
      id: "naran-kaghan-tour",
      name: "Naran Kaghan Tour",
      destination: "Naran Kaghan",
      durationDays: 4,
      durationLabel: "4 days",
      pricePkr: 20000,
      description:
        "Cruise along the Kunhar River to Saif-ul-Malook Lake, Lulusar Lake, and the misty heights of Babusar Top.",
      hotelCategory: "3-star hotel",
      meals: "Breakfast & dinner included",
      tourGuideAvailable: true,
      tourGuideLabel: "Tour guide available",
      imageAlt: "Mountain river and peaks illustration representing Naran Kaghan Tour",
      imageSrc: createDestinationThumbnail("Naran Kaghan", "#7FC49B", "#E6F5EC", "#2A7253", "#1D4E39", "#F4B183")
    },
    {
      id: "shogran-tour",
      name: "Shogran Tour",
      destination: "Shogran",
      durationDays: 3,
      durationLabel: "3 days",
      pricePkr: 18000,
      description:
        "Enjoy a refreshing pine-forest retreat in Shogran with a jeep excursion up to Siri Paye Meadows and Makra Peak views.",
      hotelCategory: "3-star hill resort",
      meals: "Breakfast included",
      tourGuideAvailable: true,
      tourGuideLabel: "Tour guide available",
      imageAlt: "Pine meadow plateau illustration representing Shogran Tour",
      imageSrc: createDestinationThumbnail("Shogran Tour", "#9BD4B0", "#EEF9F2", "#317B59", "#21553D", "#F7C59F")
    }
  ];

  // Application state
  let selectedCompareIds = [];

  // Cached DOM references
  const dom = {
    searchInput: document.getElementById("tp-search-input"),
    searchClearBtn: document.getElementById("tp-search-clear"),
    destinationSelect: document.getElementById("tp-filter-destination"),
    budgetSelect: document.getElementById("tp-filter-budget"),
    durationSelect: document.getElementById("tp-filter-duration"),
    resetBtn: document.getElementById("tp-reset-filters"),
    resultsCount: document.getElementById("tp-results-count"),
    compareBar: document.getElementById("tp-compare-bar"),
    compareCounter: document.getElementById("tp-compare-counter"),
    compareChips: document.getElementById("tp-compare-chips"),
    compareMessage: document.getElementById("tp-compare-message"),
    clearCompareBtn: document.getElementById("tp-clear-compare"),
    compareSubmitBtn: document.getElementById("tp-compare-btn"),
    packagesList: document.getElementById("tp-packages-list"),
    emptyState: document.getElementById("tp-empty-state"),
    emptyResetBtn: document.getElementById("tp-empty-reset")
  };

  /**
   * Formats integer PKR values cleanly (e.g., 25000 -> "PKR 25,000").
   */
  function formatPkr(amount) {
    return "PKR " + Number(amount).toLocaleString("en-PK");
  }

  /**
   * Finds a package object by its unique ID.
   */
  function findPackageById(packageId) {
    return TOUR_PACKAGES.find(function (pkg) {
      return pkg.id === packageId;
    }) || null;
  }

  /**
   * Loads and sanitizes previously selected comparison IDs from localStorage.
   */
  function loadCompareSelections() {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEYS.COMPARE_IDS);
      if (!rawValue) {
        return [];
      }

      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) {
        return [];
      }

      const uniqueValidIds = [];
      parsed.forEach(function (id) {
        if (
          typeof id === "string" &&
          findPackageById(id) &&
          uniqueValidIds.indexOf(id) === -1 &&
          uniqueValidIds.length < MAX_COMPARE_PACKAGES
        ) {
          uniqueValidIds.push(id);
        }
      });

      return uniqueValidIds;
    } catch (error) {
      return [];
    }
  }

  /**
   * Persists current comparison selections in localStorage.
   */
  function saveCompareSelections(ids) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.COMPARE_IDS, JSON.stringify(ids));
    } catch (error) {
      // Ignore storage quota or private-mode errors gracefully
    }
  }

  /**
   * Populates the Destination filter dropdown dynamically from TOUR_PACKAGES.
   */
  function populateDestinationFilter() {
    const seen = {};
    TOUR_PACKAGES.forEach(function (pkg) {
      if (!seen[pkg.destination]) {
        seen[pkg.destination] = true;
        const option = document.createElement("option");
        option.value = pkg.destination;
        option.textContent = pkg.destination;
        dom.destinationSelect.appendChild(option);
      }
    });
  }

  /**
   * Checks whether a package price matches the selected budget range.
   */
  function matchesBudget(pricePkr, budgetRange) {
    if (budgetRange === "all") {
      return true;
    }
    if (budgetRange === "0-20000") {
      return pricePkr <= 20000;
    }
    if (budgetRange === "20001-30000") {
      return pricePkr >= 20001 && pricePkr <= 30000;
    }
    if (budgetRange === "30001+") {
      return pricePkr >= 30001;
    }
    return true;
  }

  /**
   * Checks whether a package duration matches the selected duration range.
   */
  function matchesDuration(durationDays, durationRange) {
    if (durationRange === "all") {
      return true;
    }
    if (durationRange === "1-3") {
      return durationDays >= 1 && durationDays <= 3;
    }
    if (durationRange === "4-5") {
      return durationDays >= 4 && durationDays <= 5;
    }
    if (durationRange === "6+") {
      return durationDays >= 6;
    }
    return true;
  }

  /**
   * Filters packages using search text and all three dropdown filters together.
   */
  function getFilteredPackages() {
    const query = dom.searchInput.value.trim().toLowerCase();
    const destination = dom.destinationSelect.value;
    const budget = dom.budgetSelect.value;
    const duration = dom.durationSelect.value;

    return TOUR_PACKAGES.filter(function (pkg) {
      const matchesSearch =
        query === "" ||
        pkg.name.toLowerCase().indexOf(query) !== -1 ||
        pkg.destination.toLowerCase().indexOf(query) !== -1 ||
        pkg.description.toLowerCase().indexOf(query) !== -1 ||
        pkg.hotelCategory.toLowerCase().indexOf(query) !== -1 ||
        pkg.meals.toLowerCase().indexOf(query) !== -1;

      const matchesDestination =
        destination === "all" || pkg.destination === destination;

      return (
        matchesSearch &&
        matchesDestination &&
        matchesBudget(pkg.pricePkr, budget) &&
        matchesDuration(pkg.durationDays, duration)
      );
    });
  }

  /**
   * Navigates to the future Package Details page with the chosen package ID.
   */
  function handleViewDetails(packageId) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.SELECTED_DETAIL_ID, packageId);
    } catch (error) {
      // Ignore storage errors gracefully
    }
    window.location.href = "package-details.html?id=" + encodeURIComponent(packageId);
  }

  /**
   * Updates the comparison feedback message and optional error styling.
   */
  function setCompareMessage(text, isError) {
    dom.compareMessage.textContent = text;
    if (isError) {
      dom.compareMessage.classList.add("tp-compare-message--error");
    } else {
      dom.compareMessage.classList.remove("tp-compare-message--error");
    }
  }

  /**
   * Adds or removes a package from the comparison selection list (max 2 unique).
   */
  function toggleComparePackage(packageId) {
    const existingIndex = selectedCompareIds.indexOf(packageId);

    if (existingIndex !== -1) {
      selectedCompareIds.splice(existingIndex, 1);
      saveCompareSelections(selectedCompareIds);
      renderComparisonBar();
      renderPackages();
      return;
    }

    if (selectedCompareIds.length >= MAX_COMPARE_PACKAGES) {
      setCompareMessage(
        "You can only compare 2 packages at a time. Remove one selected package to choose another.",
        true
      );
      return;
    }

    if (!findPackageById(packageId)) {
      setCompareMessage("Invalid package selection. Please try another package.", true);
      return;
    }

    selectedCompareIds.push(packageId);
    saveCompareSelections(selectedCompareIds);
    renderComparisonBar();
    renderPackages();
  }

  /**
   * Removes a single package from comparison and updates UI.
   */
  function removeComparePackage(packageId) {
    selectedCompareIds = selectedCompareIds.filter(function (id) {
      return id !== packageId;
    });
    saveCompareSelections(selectedCompareIds);
    renderComparisonBar();
    renderPackages();
  }

  /**
   * Clears all selected comparison packages.
   */
  function clearAllCompareSelections() {
    selectedCompareIds = [];
    saveCompareSelections(selectedCompareIds);
    renderComparisonBar();
    renderPackages();
  }

  /**
   * Validates that two different valid packages are selected before navigating.
   */
  function handleCompareNavigate() {
    const uniqueIds = selectedCompareIds.filter(function (id, index, arr) {
      return arr.indexOf(id) === index && findPackageById(id) !== null;
    });

    if (uniqueIds.length !== MAX_COMPARE_PACKAGES) {
      setCompareMessage(
        "Please select 2 different packages before clicking Compare Selected.",
        true
      );
      return;
    }

    saveCompareSelections(uniqueIds);
    const query =
      "?p1=" + encodeURIComponent(uniqueIds[0]) +
      "&p2=" + encodeURIComponent(uniqueIds[1]);
    window.location.href = "compare-packages.html" + query;
  }

  /**
   * Renders the comparison tray chips, counter, and status message.
   */
  function renderComparisonBar() {
    dom.compareChips.innerHTML = "";
    dom.compareCounter.textContent =
      selectedCompareIds.length + " / " + MAX_COMPARE_PACKAGES + " selected";

    if (selectedCompareIds.length > 0) {
      dom.compareBar.classList.add("tp-compare-bar--has-items");
      dom.clearCompareBtn.hidden = false;
    } else {
      dom.compareBar.classList.remove("tp-compare-bar--has-items");
      dom.clearCompareBtn.hidden = true;
    }

    selectedCompareIds.forEach(function (id) {
      const pkg = findPackageById(id);
      if (!pkg) {
        return;
      }

      const chip = document.createElement("span");
      chip.className = "tp-compare-chip";

      const label = document.createElement("span");
      label.textContent = pkg.name;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "tp-compare-chip-remove";
      removeBtn.setAttribute("aria-label", "Remove " + pkg.name + " from comparison");
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", function () {
        removeComparePackage(pkg.id);
      });

      chip.appendChild(label);
      chip.appendChild(removeBtn);
      dom.compareChips.appendChild(chip);
    });

    if (selectedCompareIds.length === 0) {
      setCompareMessage("Select up to 2 different packages to compare side by side.", false);
    } else if (selectedCompareIds.length === 1) {
      setCompareMessage("Select 1 more package to compare.", false);
    } else {
      setCompareMessage("2 packages selected. Click Compare Selected to proceed.", false);
    }
  }

  /**
   * Builds a single package card element cleanly without unsafe HTML interpolation.
   */
  function createPackageCard(pkg) {
    const isSelected = selectedCompareIds.indexOf(pkg.id) !== -1;

    const card = document.createElement("article");
    card.className = "tp-card" + (isSelected ? " tp-card--selected" : "");
    card.dataset.packageId = pkg.id;

    // Left Section: Thumbnail + Package Info
    const leftSection = document.createElement("div");
    leftSection.className = "tp-card-left";

    const thumbWrap = document.createElement("div");
    thumbWrap.className = "tp-card-thumb-wrap";

    const img = document.createElement("img");
    img.className = "tp-card-thumb";
    img.src = pkg.imageSrc;
    img.alt = pkg.imageAlt;
    img.loading = "lazy";
    thumbWrap.appendChild(img);

    if (isSelected) {
      const badge = document.createElement("span");
      badge.className = "tp-card-selected-badge";
      badge.textContent = "Selected";
      thumbWrap.appendChild(badge);
    }

    const info = document.createElement("div");
    info.className = "tp-card-info";

    const headerMeta = document.createElement("div");
    headerMeta.className = "tp-card-header-meta";

    const destTag = document.createElement("span");
    destTag.className = "tp-card-destination";
    destTag.textContent = pkg.destination;
    headerMeta.appendChild(destTag);

    const title = document.createElement("h2");
    title.className = "tp-card-title";
    title.textContent = pkg.name;

    const highlights = document.createElement("div");
    highlights.className = "tp-card-highlights";

    const durationSpan = document.createElement("span");
    durationSpan.className = "tp-card-duration";
    durationSpan.textContent = pkg.durationLabel;

    const priceSpan = document.createElement("span");
    priceSpan.className = "tp-card-price";
    priceSpan.textContent = formatPkr(pkg.pricePkr) + " ";

    const priceUnit = document.createElement("span");
    priceUnit.className = "tp-card-price-unit";
    priceUnit.textContent = "/ person";
    priceSpan.appendChild(priceUnit);

    highlights.appendChild(durationSpan);
    highlights.appendChild(priceSpan);

    const description = document.createElement("p");
    description.className = "tp-card-description";
    description.textContent = pkg.description;

    const specsList = document.createElement("ul");
    specsList.className = "tp-card-specs";

    [pkg.hotelCategory, pkg.meals, pkg.tourGuideLabel].forEach(function (specText) {
      const li = document.createElement("li");
      li.className = "tp-card-spec-item";
      li.textContent = specText;
      specsList.appendChild(li);
    });

    info.appendChild(headerMeta);
    info.appendChild(title);
    info.appendChild(highlights);
    info.appendChild(description);
    info.appendChild(specsList);

    leftSection.appendChild(thumbWrap);
    leftSection.appendChild(info);

    // Right Section: Vertically Stacked Peach Buttons (View Details & Compare)
    const actions = document.createElement("div");
    actions.className = "tp-card-actions";

    const detailsBtn = document.createElement("button");
    detailsBtn.type = "button";
    detailsBtn.className = "tp-btn tp-btn--peach";
    detailsBtn.textContent = "View Details";
    detailsBtn.setAttribute("aria-label", "View details for " + pkg.name);
    detailsBtn.addEventListener("click", function () {
      handleViewDetails(pkg.id);
    });

    const compareBtn = document.createElement("button");
    compareBtn.type = "button";
    compareBtn.className =
      "tp-btn " + (isSelected ? "tp-btn--selected" : "tp-btn--peach");
    compareBtn.textContent = isSelected ? "Remove Compare" : "Compare";
    compareBtn.setAttribute("aria-pressed", isSelected ? "true" : "false");
    compareBtn.setAttribute(
      "aria-label",
      (isSelected ? "Remove " : "Add ") + pkg.name + " to comparison"
    );
    compareBtn.addEventListener("click", function () {
      toggleComparePackage(pkg.id);
    });

    actions.appendChild(detailsBtn);
    actions.appendChild(compareBtn);

    card.appendChild(leftSection);
    card.appendChild(actions);

    return card;
  }

  /**
   * Renders the filtered package cards and updates result count / empty state.
   */
  function renderPackages() {
    const filtered = getFilteredPackages();
    dom.packagesList.innerHTML = "";

    const totalCount = TOUR_PACKAGES.length;
    dom.resultsCount.textContent =
      "Showing " + filtered.length + " of " + totalCount + " tour packages";

    dom.searchClearBtn.hidden = dom.searchInput.value.trim() === "";

    if (filtered.length === 0) {
      dom.emptyState.hidden = false;
      return;
    }

    dom.emptyState.hidden = true;
    const fragment = document.createDocumentFragment();
    filtered.forEach(function (pkg) {
      fragment.appendChild(createPackageCard(pkg));
    });
    dom.packagesList.appendChild(fragment);
  }

  /**
   * Resets search input and all dropdown filters back to defaults.
   */
  function resetAllFilters() {
    dom.searchInput.value = "";
    dom.destinationSelect.value = "all";
    dom.budgetSelect.value = "all";
    dom.durationSelect.value = "all";
    renderPackages();
    dom.searchInput.focus();
  }

  /**
   * Attaches all UI event listeners.
   */
  function bindEvents() {
    dom.searchInput.addEventListener("input", renderPackages);
    dom.searchClearBtn.addEventListener("click", function () {
      dom.searchInput.value = "";
      renderPackages();
      dom.searchInput.focus();
    });

    dom.destinationSelect.addEventListener("change", renderPackages);
    dom.budgetSelect.addEventListener("change", renderPackages);
    dom.durationSelect.addEventListener("change", renderPackages);

    dom.resetBtn.addEventListener("click", resetAllFilters);
    dom.emptyResetBtn.addEventListener("click", resetAllFilters);

    dom.clearCompareBtn.addEventListener("click", clearAllCompareSelections);
    dom.compareSubmitBtn.addEventListener("click", handleCompareNavigate);
  }

  /**
   * Initializes the Tour Packages page.
   */
  function init() {
    populateDestinationFilter();
    selectedCompareIds = loadCompareSelections();
    bindEvents();
    renderComparisonBar();
    renderPackages();
  }

  document.addEventListener("DOMContentLoaded", init);
})();

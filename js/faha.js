/**
 * Highland Horizons — Home Page Interactions
 * Author: 26I-3258
 * Handles the Quick Filter, Trip Cost Estimator, and Destination Quick-View modal.
 */
(function () {
  "use strict";

  var DESTINATIONS = {
    hunza: {
      name: "Hunza",
      region: "Gilgit-Baltistan",
      defaultDays: 5,
      dailyRate: 13500,
      altitude: "2,438 m (Karimabad)",
      summary:
        "Journey along the Karakoram Highway to Karimabad, explore centuries-old Baltit Fort, glide across Attabad Lake, and take in the dramatic Passu Cones."
    },
    skardu: {
      name: "Skardu",
      region: "Baltistan",
      defaultDays: 7,
      dailyRate: 14500,
      altitude: "2,228 m (Skardu Valley)",
      summary:
        "Discover Upper Kachura Lake, historic Shigar Fort, the cold desert dunes of Katpana, and the sweeping summer wildflowers of Deosai National Park."
    },
    "fairy-meadows": {
      name: "Fairy Meadows",
      region: "Diamer",
      defaultDays: 4,
      dailyRate: 12000,
      altitude: "3,300 m (Meadows Plateau)",
      summary:
        "Ride the thrilling Raikot Bridge jeep track and trek through alpine pine forests to wooden cabins facing the towering north face of Nanga Parbat."
    },
    shogran: {
      name: "Shogran",
      region: "Kaghan Valley",
      defaultDays: 3,
      dailyRate: 10500,
      altitude: "2,362 m (Shogran Plateau)",
      summary:
        "Unwind amid cedar and pine forests with sweeping views of Makra Peak, plus a mountain ridge excursion to the alpine meadows of Siri Paye."
    }
  };

  var TIER_MULTIPLIERS = {
    standard: 1,
    comfort: 1.25,
    expedition: 1.5
  };

  var JEEP_DAILY_RATE = 6500;

  function formatPkr(amount) {
    return "PKR " + Math.round(amount).toLocaleString("en-PK");
  }

  function clampInt(value, min, max, fallback) {
    var parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      return fallback;
    }
    return Math.min(Math.max(parsed, min), max);
  }

  function initQuickFilter() {
    var destSelect = document.getElementById("hhFilterDestination");
    var maxDaysRange = document.getElementById("hhFilterMaxDays");
    var maxDaysLabel = document.getElementById("hhMaxDaysValue");
    var statusEl = document.getElementById("hhFilterStatus");
    var countPill = document.getElementById("hhDestinationsCount");
    var resetBtn = document.getElementById("hhFilterReset");
    var emptyResetBtn = document.getElementById("hhEmptyResetBtn");
    var emptyState = document.getElementById("hhEmptyFilterState");
    var emptyMessage = document.getElementById("hhEmptyFilterMessage");
    var cards = document.querySelectorAll(".hh-dest-col");

    if (!destSelect || !maxDaysRange || !cards.length) {
      return;
    }

    function applyFilter() {
      var selectedDest = destSelect.value;
      var maxDays = clampInt(maxDaysRange.value, 3, 10, 7);
      var visibleCount = 0;

      if (maxDaysLabel) {
        maxDaysLabel.textContent = "Up to " + maxDays + " days";
      }

      cards.forEach(function (cardCol) {
        var cardDest = cardCol.getAttribute("data-destination");
        var cardDays = parseInt(cardCol.getAttribute("data-days"), 10);
        var matchesDest = selectedDest === "all" || cardDest === selectedDest;
        var matchesDays = cardDays <= maxDays;
        var isVisible = matchesDest && matchesDays;

        cardCol.hidden = !isVisible;
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (countPill) {
        countPill.textContent =
          visibleCount + (visibleCount === 1 ? " Destination" : " Destinations");
      }

      if (statusEl) {
        if (visibleCount === cards.length && selectedDest === "all") {
          statusEl.textContent = "Showing all " + cards.length + " destinations.";
        } else {
          statusEl.textContent =
            "Showing " + visibleCount + " of " + cards.length + " destinations (max " + maxDays + " days).";
        }
      }

      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
        if (visibleCount === 0 && emptyMessage) {
          var destName =
            selectedDest !== "all" && DESTINATIONS[selectedDest]
              ? DESTINATIONS[selectedDest].name
              : "your selection";
          emptyMessage.textContent =
            "No destinations match " + destName + " within " + maxDays + " days.";
        }
      }
    }

    function resetFilter() {
      destSelect.value = "all";
      maxDaysRange.value = "7";
      applyFilter();
    }

    destSelect.addEventListener("change", applyFilter);
    maxDaysRange.addEventListener("input", applyFilter);
    if (resetBtn) {
      resetBtn.addEventListener("click", resetFilter);
    }
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener("click", resetFilter);
    }

    applyFilter();
  }

  function initTripEstimator() {
    var destSelect = document.getElementById("hhEstDestination");
    var tierSelect = document.getElementById("hhEstTier");
    var daysInput = document.getElementById("hhEstDays");
    var travelersInput = document.getElementById("hhEstTravelers");
    var jeepCheckbox = document.getElementById("hhEstJeep");
    var baseEl = document.getElementById("hhEstBaseAmount");
    var adjustmentEl = document.getElementById("hhEstAdjustmentAmount");
    var totalEl = document.getElementById("hhEstTotalAmount");
    var perPersonEl = document.getElementById("hhEstPerPerson");

    if (!destSelect || !tierSelect || !daysInput || !travelersInput) {
      return null;
    }

    function calculateEstimate() {
      var destKey = destSelect.value;
      var destination = DESTINATIONS[destKey] || DESTINATIONS.hunza;
      var tierKey = tierSelect.value;
      var tierMultiplier = TIER_MULTIPLIERS[tierKey] || 1;
      var days = clampInt(daysInput.value, 2, 14, destination.defaultDays);
      var travelers = clampInt(travelersInput.value, 1, 12, 2);
      var includeJeep = Boolean(jeepCheckbox && jeepCheckbox.checked);

      var baseCost = destination.dailyRate * days * travelers * tierMultiplier;
      var jeepCost = includeJeep ? JEEP_DAILY_RATE * days : 0;
      var groupDiscount = travelers >= 4 ? baseCost * 0.1 : 0;
      var netAdjustment = jeepCost - groupDiscount;
      var totalCost = Math.max(0, baseCost + netAdjustment);
      var perTraveler = totalCost / travelers;

      if (baseEl) {
        baseEl.textContent = formatPkr(baseCost);
      }

      if (adjustmentEl) {
        var adjustmentParts = [];
        if (jeepCost > 0) {
          adjustmentParts.push("+" + formatPkr(jeepCost) + " Jeep");
        }
        if (groupDiscount > 0) {
          adjustmentParts.push("-" + formatPkr(groupDiscount) + " Group 10%");
        }
        adjustmentEl.textContent = adjustmentParts.length ? adjustmentParts.join(" / ") : "PKR 0";
      }

      if (totalEl) {
        totalEl.textContent = formatPkr(totalCost);
      }

      if (perPersonEl) {
        perPersonEl.textContent = formatPkr(perTraveler) + " per traveler";
      }
    }

    [destSelect, tierSelect, daysInput, travelersInput].forEach(function (field) {
      field.addEventListener("input", calculateEstimate);
      field.addEventListener("change", calculateEstimate);
    });

    if (jeepCheckbox) {
      jeepCheckbox.addEventListener("change", calculateEstimate);
    }

    daysInput.addEventListener("blur", function () {
      daysInput.value = String(clampInt(daysInput.value, 2, 14, 5));
      calculateEstimate();
    });

    travelersInput.addEventListener("blur", function () {
      travelersInput.value = String(clampInt(travelersInput.value, 1, 12, 2));
      calculateEstimate();
    });

    calculateEstimate();

    return {
      selectDestination: function (destKey, days) {
        if (DESTINATIONS[destKey]) {
          destSelect.value = destKey;
          daysInput.value = String(days || DESTINATIONS[destKey].defaultDays);
          calculateEstimate();
        }
      }
    };
  }

  function initDestinationActions(estimatorApi) {
    var plannerSection = document.getElementById("trip-planner");
    var modalEl = document.getElementById("hhDestModal");
    var modalTitle = document.getElementById("hhDestModalTitle");
    var modalRegion = document.getElementById("hhModalRegion");
    var modalSummary = document.getElementById("hhModalSummary");
    var modalDays = document.getElementById("hhModalDays");
    var modalAltitude = document.getElementById("hhModalAltitude");
    var modalRate = document.getElementById("hhModalRate");
    var modalEstimateBtn = document.getElementById("hhModalEstimateBtn");
    var activeModalDest = "hunza";

    function scrollToEstimator(destKey, days) {
      if (estimatorApi) {
        estimatorApi.selectDestination(destKey, days);
      }
      if (plannerSection) {
        plannerSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    document.querySelectorAll(".hh-select-estimate").forEach(function (button) {
      button.addEventListener("click", function () {
        var destKey = button.getAttribute("data-dest-key");
        var days = parseInt(button.getAttribute("data-dest-days"), 10);
        scrollToEstimator(destKey, days);
      });
    });

    document.querySelectorAll(".hh-view-details").forEach(function (button) {
      button.addEventListener("click", function () {
        var destKey = button.getAttribute("data-dest-key");
        var info = DESTINATIONS[destKey];
        if (!info || !modalEl) {
          return;
        }

        activeModalDest = destKey;
        if (modalTitle) {
          modalTitle.textContent = info.name;
        }
        if (modalRegion) {
          modalRegion.textContent = info.region;
        }
        if (modalSummary) {
          modalSummary.textContent = info.summary;
        }
        if (modalDays) {
          modalDays.textContent = info.defaultDays + " Days";
        }
        if (modalAltitude) {
          modalAltitude.textContent = info.altitude;
        }
        if (modalRate) {
          modalRate.textContent = formatPkr(info.dailyRate) + " / traveler / day";
        }

        if (window.bootstrap && window.bootstrap.Modal) {
          window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
        }
      });
    });

    if (modalEstimateBtn) {
      modalEstimateBtn.addEventListener("click", function () {
        var info = DESTINATIONS[activeModalDest];
        if (modalEl && window.bootstrap && window.bootstrap.Modal) {
          window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        }
        scrollToEstimator(activeModalDest, info ? info.defaultDays : undefined);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initQuickFilter();
    var estimatorApi = initTripEstimator();
    initDestinationActions(estimatorApi);
  });
})();

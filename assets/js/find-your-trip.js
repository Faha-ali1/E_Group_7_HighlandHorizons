/**
 * Highland Horizons — Find Your Trip Quiz
 * Vanilla JavaScript (ES5/ES6 compatible, no external libraries).
 *
 * Key architecture for viva explanation:
 * 1. DESTINATIONS array holds metadata for the 5 Northern Pakistan destinations.
 * 2. QUIZ_QUESTIONS array holds all 5 questions and rebalanced scoring per option.
 * 3. state.answers stores the selected option ID by question index (0..4).
 * 4. Option cards implement WAI-ARIA radiogroup keyboard navigation (Tab + Arrows + Enter/Space).
 * 5. Clicking "See my match" always recalculates from the 5 current answers, then saves to localStorage.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "hh_find_your_trip_state";

  /* ------------------------------------------------------------------------
     1. DESTINATIONS DATA
     Order in this array also serves as the final tie-breaker if two
     destinations match on both total score and Question 1 score.
     ------------------------------------------------------------------------ */
  var DESTINATIONS = [
    {
      id: "hunza",
      name: "Hunza",
      description:
        "Terraced apricot orchards, ancient stone forts, and panoramic views of Rakaposhi and Ultar Sar along the Karakoram Highway.",
      bestSeason: "Spring & Autumn (Apr–May, Sep–Oct)",
      suggestedDays: "5–7 days",
      image: "../assets/images/quiz-culture.jpg",
      imageAlt: "Ancient stone fort perched above green terraced fields and mountain peaks in Hunza Valley"
    },
    {
      id: "skardu",
      name: "Skardu",
      description:
        "Gateway to K2, Shangrila's mirror lakes, cold desert dunes, and dramatic granite peaks in Baltistan.",
      bestSeason: "Summer & Early Autumn (Jun–Sep)",
      suggestedDays: "7–10 days",
      image: "../assets/images/quiz-mountains.jpg",
      imageAlt: "Traditional stone village nestled beneath towering snow-capped mountains in Baltistan"
    },
    {
      id: "swat",
      name: "Swat",
      description:
        "Lush pine valleys, emerald rivers, Buddhist heritage sites, and winter slopes at Malam Jabba.",
      bestSeason: "All year (Winter for snow, Summer for valleys)",
      suggestedDays: "3–5 days",
      image: "../assets/images/quiz-snow.jpg",
      imageAlt: "Snow-covered pine forests and ski slopes in Malam Jabba, Swat Valley"
    },
    {
      id: "naranKaghan",
      name: "Naran-Kaghan",
      description:
        "Alpine lakes like Saif-ul-Malook, flower-filled meadows, and crisp mountain air within easy reach.",
      bestSeason: "Summer (Jun–Aug)",
      suggestedDays: "3–5 days",
      image: "../assets/images/quiz-lakes.jpg",
      imageAlt: "Still alpine lake surrounded by evergreen pines and green valley pastures in Naran-Kaghan"
    },
    {
      id: "fairyMeadows",
      name: "Fairy Meadows",
      description:
        "An iconic high-altitude meadow camp facing the towering north face of Nanga Parbat.",
      bestSeason: "Summer & Early Autumn (Jun–Sep)",
      suggestedDays: "5–7 days",
      image: "../assets/images/quiz-mountains.jpg",
      imageAlt: "High-altitude mountain trail and alpine village beneath snow-capped peaks"
    }
  ];

  /* ------------------------------------------------------------------------
     2. QUIZ QUESTIONS DATA (5 Questions, Data-Driven & Rebalanced)
     Question 1 includes image cards; Questions 2–5 are text-only cards.
     Each option awards points toward matching destinations so every
     destination has clear winning paths.
     ------------------------------------------------------------------------ */
  var QUIZ_QUESTIONS = [
    {
      id: "tripType",
      question: "What kind of trip are you dreaming of?",
      options: [
        {
          id: "mountains",
          label: "Mountains & trekking",
          subtitle: "High trails. Wide-open horizons.",
          image: "../assets/images/quiz-mountains.jpg",
          imageAlt: "Stone mountain village surrounded by tall poplars and high peaks",
          scores: { fairyMeadows: 4, skardu: 4, hunza: 1 }
        },
        {
          id: "lakes",
          label: "Lakes & green valleys",
          subtitle: "Slow days beside still waters.",
          image: "../assets/images/quiz-lakes.jpg",
          imageAlt: "Clear alpine lake reflecting pine trees and grassy slopes",
          scores: { naranKaghan: 5, swat: 1 }
        },
        {
          id: "culture",
          label: "Culture & heritage",
          subtitle: "Stories etched in stone.",
          image: "../assets/images/quiz-culture.jpg",
          imageAlt: "Historic stone fort overlooking a lush mountain valley",
          scores: { hunza: 5, swat: 1 }
        },
        {
          id: "snow",
          label: "Snow & skiing",
          subtitle: "A little winter adventure.",
          image: "../assets/images/quiz-snow.jpg",
          imageAlt: "Snowy pine forest and mountain ski resort slopes",
          scores: { swat: 6 }
        }
      ]
    },
    {
      id: "tripLength",
      question: "How many days do you have for your journey?",
      options: [
        {
          id: "short",
          label: "3–4 days",
          subtitle: "A refreshing long-weekend escape.",
          scores: { naranKaghan: 3, swat: 3 }
        },
        {
          id: "medium",
          label: "5–7 days",
          subtitle: "Enough time to explore at an easy pace.",
          scores: { hunza: 3, fairyMeadows: 4 }
        },
        {
          id: "long",
          label: "8+ days",
          subtitle: "Deep northern expedition across passes.",
          scores: { skardu: 5, hunza: 2, fairyMeadows: 2 }
        }
      ]
    },
    {
      id: "budget",
      question: "What travel budget feels most comfortable?",
      options: [
        {
          id: "budget",
          label: "Budget-friendly",
          subtitle: "Guesthouses, shared transport & local dhabas.",
          scores: { naranKaghan: 3, fairyMeadows: 3, swat: 1 }
        },
        {
          id: "midrange",
          label: "Mid-range comfort",
          subtitle: "Boutique stays, private car & guided stops.",
          scores: { hunza: 3, swat: 2, naranKaghan: 1 }
        },
        {
          id: "premium",
          label: "Premium & private",
          subtitle: "Scenic flights, heritage lodges & custom pace.",
          scores: { skardu: 4, hunza: 2 }
        }
      ]
    },
    {
      id: "season",
      question: "When are you planning to travel?",
      options: [
        {
          id: "spring",
          label: "Spring (Mar–May)",
          subtitle: "Blossoms, mild days & clear valley roads.",
          scores: { hunza: 4, swat: 1 }
        },
        {
          id: "summer",
          label: "Summer (Jun–Aug)",
          subtitle: "Open high passes, alpine lakes & meadows.",
          scores: { fairyMeadows: 4, naranKaghan: 3, skardu: 2 }
        },
        {
          id: "autumn",
          label: "Autumn (Sep–Nov)",
          subtitle: "Golden foliage, crisp air & quiet trails.",
          scores: { hunza: 4, skardu: 3 }
        },
        {
          id: "winter",
          label: "Winter (Dec–Feb)",
          subtitle: "Snowfall, ski slopes & cosy mountain fires.",
          scores: { swat: 5 }
        }
      ]
    },
    {
      id: "group",
      question: "Who is travelling with you?",
      options: [
        {
          id: "solo",
          label: "Solo traveller",
          subtitle: "Flexible days and authentic local encounters.",
          scores: { fairyMeadows: 4, hunza: 2 }
        },
        {
          id: "couple",
          label: "Couple",
          subtitle: "Scenic viewpoints and peaceful valley stays.",
          scores: { hunza: 3, naranKaghan: 2 }
        },
        {
          id: "family",
          label: "Family with kids",
          subtitle: "Comfortable drives and accessible sights.",
          scores: { naranKaghan: 4, swat: 2, hunza: 1 }
        },
        {
          id: "friends",
          label: "Friends / adventure group",
          subtitle: "Campfires, hikes & memorable road trips.",
          scores: { fairyMeadows: 3, skardu: 3, swat: 2 }
        }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     3. STATE & DOM REFERENCES
     state.answers is an array indexed by question index (0..4).
     ------------------------------------------------------------------------ */
  var state = {
    currentStep: 0,
    answers: [null, null, null, null, null],
    completed: false,
    matchedDestinationId: null
  };

  var quizSection = document.getElementById("quizSection");
  var resultSection = document.getElementById("resultSection");
  var progressLabel = document.getElementById("quizProgressLabel");
  var progressBar = document.getElementById("quizProgressBar");
  var progressFill = document.getElementById("quizProgressFill");
  var questionTitle = document.getElementById("quizQuestionTitle");
  var optionsGrid = document.getElementById("quizOptionsGrid");
  var errorMsg = document.getElementById("quizErrorMsg");
  var backBtn = document.getElementById("quizBackBtn");
  var nextBtn = document.getElementById("quizNextBtn");
  var nextLabel = document.getElementById("quizNextLabel");

  var resultImage = document.getElementById("resultImage");
  var resultHeading = document.getElementById("resultHeading");
  var resultDescription = document.getElementById("resultDescription");
  var resultSeason = document.getElementById("resultSeason");
  var resultDays = document.getElementById("resultDays");
  var resultWhyMatched = document.getElementById("resultWhyMatched");
  var retakeQuizBtn = document.getElementById("retakeQuizBtn");

  /* ------------------------------------------------------------------------
     4. LOCALSTORAGE PERSISTENCE HELPERS
     ------------------------------------------------------------------------ */
  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      // Ignore storage errors (e.g., private browsing quota)
    }
  }

  function hasAllAnswers(answers) {
    if (!Array.isArray(answers) || answers.length !== QUIZ_QUESTIONS.length) {
      return false;
    }
    for (var i = 0; i < QUIZ_QUESTIONS.length; i += 1) {
      if (!answers[i] || !getOptionById(QUIZ_QUESTIONS[i], answers[i])) {
        return false;
      }
    }
    return true;
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return;
      }

      if (
        typeof parsed.currentStep === "number" &&
        parsed.currentStep >= 0 &&
        parsed.currentStep < QUIZ_QUESTIONS.length
      ) {
        state.currentStep = parsed.currentStep;
      }

      // Accept array-based answers indexed 0..4; ignore legacy/corrupt shapes
      if (Array.isArray(parsed.answers)) {
        for (var i = 0; i < QUIZ_QUESTIONS.length; i += 1) {
          var candidate = parsed.answers[i];
          if (candidate && getOptionById(QUIZ_QUESTIONS[i], candidate)) {
            state.answers[i] = candidate;
          }
        }
      }

      if (parsed.completed === true && hasAllAnswers(state.answers)) {
        state.completed = true;
        state.matchedDestinationId = parsed.matchedDestinationId || null;
      }
    } catch (err) {
      // If saved JSON is invalid, start fresh safely
    }
  }

  function clearState() {
    state.currentStep = 0;
    state.answers = [null, null, null, null, null];
    state.completed = false;
    state.matchedDestinationId = null;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // Ignore storage errors
    }
  }

  /* ------------------------------------------------------------------------
     5. SCORING & TIE-BREAKING LOGIC
     ------------------------------------------------------------------------ */
  function getOptionById(question, optionId) {
    for (var i = 0; i < question.options.length; i += 1) {
      if (question.options[i].id === optionId) {
        return question.options[i];
      }
    }
    return null;
  }

  /**
   * Calculate total points for each destination across all 5 answered questions.
   * Tie-breaking rule:
   *   1. Highest total score wins.
   *   2. If tied, destination with the higher score on Question 1 (trip type) wins.
   *   3. If still tied, earlier destination in DESTINATIONS array wins.
   */
  function calculateBestDestination() {
    var totalScores = {};
    var q1Scores = {};

    DESTINATIONS.forEach(function (dest) {
      totalScores[dest.id] = 0;
      q1Scores[dest.id] = 0;
    });

    QUIZ_QUESTIONS.forEach(function (question, index) {
      var selectedId = state.answers[index];
      var selectedOption = getOptionById(question, selectedId);
      if (!selectedOption || !selectedOption.scores) {
        return;
      }

      Object.keys(selectedOption.scores).forEach(function (destId) {
        if (typeof totalScores[destId] === "number") {
          totalScores[destId] += selectedOption.scores[destId];
          if (index === 0) {
            q1Scores[destId] += selectedOption.scores[destId];
          }
        }
      });
    });

    var bestDest = DESTINATIONS[0];
    DESTINATIONS.forEach(function (candidate) {
      var candidateTotal = totalScores[candidate.id];
      var bestTotal = totalScores[bestDest.id];

      if (candidateTotal > bestTotal) {
        bestDest = candidate;
      } else if (
        candidateTotal === bestTotal &&
        q1Scores[candidate.id] > q1Scores[bestDest.id]
      ) {
        bestDest = candidate;
      }
    });

    return bestDest;
  }

  function buildWhyMatchedText() {
    var tripTypeOpt = getOptionById(QUIZ_QUESTIONS[0], state.answers[0]);
    var lengthOpt = getOptionById(QUIZ_QUESTIONS[1], state.answers[1]);
    var budgetOpt = getOptionById(QUIZ_QUESTIONS[2], state.answers[2]);
    var seasonOpt = getOptionById(QUIZ_QUESTIONS[3], state.answers[3]);
    var groupOpt = getOptionById(QUIZ_QUESTIONS[4], state.answers[4]);

    var parts = [];
    if (tripTypeOpt) {
      parts.push(tripTypeOpt.label.toLowerCase());
    }
    if (lengthOpt) {
      parts.push("a " + lengthOpt.label + " itinerary");
    }
    if (budgetOpt) {
      parts.push("a " + budgetOpt.label.toLowerCase() + " pace");
    }
    if (seasonOpt) {
      parts.push("travelling in " + seasonOpt.label);
    }
    if (groupOpt) {
      parts.push("suited for " + groupOpt.label.toLowerCase());
    }

    if (!parts.length) {
      return "Matched based on your trip preferences.";
    }

    return "Why this matched: Selected for " + parts.join(", ") + ".";
  }

  /* ------------------------------------------------------------------------
     6. RENDERING QUIZ & RESULT SCREENS
     ------------------------------------------------------------------------ */
  function hideError() {
    errorMsg.hidden = true;
    errorMsg.textContent = "";
  }

  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.hidden = false;
  }

  function selectOption(questionIndex, optionId) {
    state.answers[questionIndex] = optionId;
    state.completed = false;
    state.matchedDestinationId = null;
    hideError();
    saveState();

    // Update radio card states and roving tabindex without rebuilding DOM
    var cards = optionsGrid.querySelectorAll(".hh-option-card");
    cards.forEach(function (card) {
      var isSelected = card.getAttribute("data-option-id") === optionId;
      card.classList.toggle("is-selected", isSelected);
      card.setAttribute("aria-checked", String(isSelected));
      card.setAttribute("tabindex", isSelected ? "0" : "-1");
    });
  }

  function createCheckSvg() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "hh-check-icon");

    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M3.5 8.5L6.5 11.5L12.5 4.5");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2.1");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    svg.appendChild(path);
    return svg;
  }

  function handleRadioKeydown(event, index, cards, questionIndex) {
    var nextIndex = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % cards.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + cards.length) % cards.length;
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      var currentId = cards[index].getAttribute("data-option-id");
      selectOption(questionIndex, currentId);
      return;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      var targetCard = cards[nextIndex];
      var targetId = targetCard.getAttribute("data-option-id");
      selectOption(questionIndex, targetId);
      targetCard.focus();
    }
  }

  function renderQuestion() {
    var total = QUIZ_QUESTIONS.length;
    var step = state.currentStep;
    var question = QUIZ_QUESTIONS[step];
    var selectedId = state.answers[step] || null;
    var percent = Math.round(((step + 1) / total) * 100);

    quizSection.hidden = false;
    resultSection.hidden = true;
    hideError();

    // Update progress text & bar
    progressLabel.textContent = "Question " + (step + 1) + " of " + total;
    progressBar.setAttribute("aria-valuenow", String(percent));
    progressFill.style.width = percent + "%";

    // Update question heading
    questionTitle.textContent = question.question;

    // Update Back / Next buttons
    backBtn.hidden = step === 0;
    nextLabel.textContent = step === total - 1 ? "See my match" : "Next";

    // Render option cards cleanly
    optionsGrid.innerHTML = "";
    optionsGrid.classList.remove("is-animating");
    void optionsGrid.offsetWidth;
    optionsGrid.classList.add("is-animating");

    question.options.forEach(function (option, index) {
      var isSelected = selectedId === option.id;
      var isFirstFocusFallback = !selectedId && index === 0;

      var card = document.createElement("button");
      card.type = "button";
      card.className = "hh-option-card " + (option.image ? "has-image" : "is-text-only");
      if (isSelected) {
        card.classList.add("is-selected");
      }
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", String(isSelected));
      card.setAttribute("tabindex", isSelected || isFirstFocusFallback ? "0" : "-1");
      card.setAttribute("data-option-id", option.id);

      // Optional image block (used for Question 1)
      if (option.image) {
        var mediaWrap = document.createElement("span");
        mediaWrap.className = "hh-option-media";

        var img = document.createElement("img");
        img.src = option.image;
        img.alt = option.imageAlt || option.label;
        img.className = "hh-option-img";
        mediaWrap.appendChild(img);
        card.appendChild(mediaWrap);
      }

      // Card body: tick indicator + title + subtitle
      var body = document.createElement("span");
      body.className = "hh-option-body";

      var checkBox = document.createElement("span");
      checkBox.className = "hh-option-check";
      checkBox.setAttribute("aria-hidden", "true");
      checkBox.appendChild(createCheckSvg());

      var textWrap = document.createElement("span");
      textWrap.className = "hh-option-text";

      var title = document.createElement("span");
      title.className = "hh-option-title";
      title.textContent = option.label;

      var subtitle = document.createElement("span");
      subtitle.className = "hh-option-subtitle";
      subtitle.textContent = option.subtitle;

      textWrap.appendChild(title);
      textWrap.appendChild(subtitle);
      body.appendChild(checkBox);
      body.appendChild(textWrap);
      card.appendChild(body);

      card.addEventListener("click", function () {
        selectOption(step, option.id);
      });

      optionsGrid.appendChild(card);
    });

    // Attach arrow-key radiogroup navigation after all cards are in DOM
    var renderedCards = optionsGrid.querySelectorAll(".hh-option-card");
    renderedCards.forEach(function (card, index) {
      card.addEventListener("keydown", function (event) {
        handleRadioKeydown(event, index, renderedCards, step);
      });
    });
  }

  function renderResult(destination) {
    quizSection.hidden = true;
    resultSection.hidden = false;

    resultImage.src = destination.image;
    resultImage.alt = destination.imageAlt;
    resultHeading.textContent = "Your Match: " + destination.name;
    resultDescription.textContent = destination.description;
    resultSeason.textContent = destination.bestSeason;
    resultDays.textContent = destination.suggestedDays;
    resultWhyMatched.textContent = buildWhyMatchedText();
  }

  /* ------------------------------------------------------------------------
     7. EVENT HANDLERS & INITIALIZATION
     ------------------------------------------------------------------------ */
  nextBtn.addEventListener("click", function () {
    var step = state.currentStep;
    if (!state.answers[step]) {
      showError("Please select an answer to continue.");
      var firstCard = optionsGrid.querySelector(".hh-option-card");
      if (firstCard) {
        firstCard.focus();
      }
      return;
    }

    if (step < QUIZ_QUESTIONS.length - 1) {
      state.currentStep += 1;
      saveState();
      renderQuestion();
    } else {
      // Always recalculate freshly from the 5 current answers before saving
      var matched = calculateBestDestination();
      state.completed = true;
      state.matchedDestinationId = matched.id;
      saveState();
      renderResult(matched);
      resultHeading.setAttribute("tabindex", "-1");
      resultHeading.focus();
    }
  });

  backBtn.addEventListener("click", function () {
    if (state.currentStep > 0) {
      state.currentStep -= 1;
      state.completed = false;
      saveState();
      renderQuestion();
    }
  });

  retakeQuizBtn.addEventListener("click", function () {
    clearState();
    renderQuestion();
    questionTitle.setAttribute("tabindex", "-1");
    questionTitle.focus();
  });

  document.addEventListener("DOMContentLoaded", function () {
    loadState();
    if (state.completed && hasAllAnswers(state.answers)) {
      var matched = calculateBestDestination();
      state.matchedDestinationId = matched.id;
      renderResult(matched);
    } else {
      renderQuestion();
    }
  });
})();

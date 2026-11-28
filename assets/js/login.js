/**
 * Highland Horizons — Login & Sign Up Page Logic
 * Vanilla JavaScript (no external libraries).
 */
(function () {
  "use strict";

  var ACCOUNTS_KEY = "hh_accounts";
  var SESSION_KEY = "hh_current_user";
  var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  document.addEventListener("DOMContentLoaded", function () {
    var tabList = document.querySelector(".hh-auth-tabs");
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".hh-auth-tab"));
    var panels = {
      "tab-login": document.getElementById("panel-login"),
      "tab-signup": document.getElementById("panel-signup")
    };

    var statusBanner = document.getElementById("authStatusBanner");
    var statusMessage = document.getElementById("authStatusMessage");
    var signOutBtn = document.getElementById("authSignOutBtn");

    // Sign up elements
    var signupForm = document.getElementById("signupForm");
    var signupFullName = document.getElementById("signupFullName");
    var signupEmail = document.getElementById("signupEmail");
    var signupPassword = document.getElementById("signupPassword");
    var signupConfirm = document.getElementById("signupConfirmPassword");
    var signupTerms = document.getElementById("signupTerms");
    var strengthMeter = document.getElementById("passwordStrengthMeter");
    var strengthBars = strengthMeter
      ? Array.prototype.slice.call(strengthMeter.querySelectorAll(".hh-strength-bar"))
      : [];
    var strengthText = document.getElementById("passwordStrengthText");

    // Login elements
    var loginForm = document.getElementById("loginForm");
    var loginEmail = document.getElementById("loginEmail");
    var loginPassword = document.getElementById("loginPassword");
    var forgotBtn = document.getElementById("forgotPasswordBtn");
    var forgotPanel = document.getElementById("forgotPasswordPanel");
    var sendResetBtn = document.getElementById("sendResetBtn");

    var signupTouched = {
      fullName: false,
      email: false,
      password: false,
      confirm: false,
      terms: false
    };

    var loginTouched = {
      email: false,
      password: false
    };

    /* ----------------------------------------------------------------------
       LocalStorage Helpers
       ---------------------------------------------------------------------- */

    function getAccounts() {
      try {
        var raw = localStorage.getItem(ACCOUNTS_KEY);
        var parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        return [];
      }
    }

    function saveAccounts(accounts) {
      try {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      } catch (err) {
        // Ignore storage quota/private mode errors gracefully
      }
    }

    function findAccountByEmail(email) {
      var normalized = email.trim().toLowerCase();
      var accounts = getAccounts();
      for (var i = 0; i < accounts.length; i += 1) {
        if ((accounts[i].email || "").toLowerCase() === normalized) {
          return accounts[i];
        }
      }
      return null;
    }

    // Store and read the active session as { email, fullName }
    function getCurrentUser() {
      try {
        var raw = localStorage.getItem(SESSION_KEY);
        if (!raw) {
          return null;
        }
        if (raw.charAt(0) === "{") {
          return JSON.parse(raw);
        }
        return { email: raw, fullName: "" };
      } catch (err) {
        return null;
      }
    }

    function setCurrentUser(user) {
      try {
        if (user && user.email) {
          localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ email: user.email, fullName: user.fullName || "" })
          );
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (err) {
        // Ignore storage errors
      }
      syncHeaderUser();
    }

    function getFirstName(user) {
      if (!user) {
        return "";
      }
      var name = (user.fullName || "").trim();
      if (name) {
        return name.split(/\s+/)[0];
      }
      return (user.email || "").split("@")[0];
    }

    /* ----------------------------------------------------------------------
       Shared Header Greeting Sync (waits for layout.js to inject #site-header)
       ---------------------------------------------------------------------- */

    function syncHeaderUser() {
      var headerContainer = document.getElementById("site-header");
      if (!headerContainer) {
        return;
      }

      var signInButtons = headerContainer.querySelectorAll(".hh-signin-btn");
      if (!signInButtons.length) {
        return;
      }

      // Remove any previously injected greeting blocks before re-rendering
      headerContainer.querySelectorAll(".hh-header-user").forEach(function (node) {
        node.remove();
      });

      var user = getCurrentUser();
      if (!user) {
        signInButtons.forEach(function (btn) {
          btn.style.display = "";
        });
        return;
      }

      var firstName = getFirstName(user);
      signInButtons.forEach(function (btn) {
        btn.style.display = "none";

        var wrapper = document.createElement("div");
        // Preserve responsive visibility class of the Sign in button being replaced
        wrapper.className = btn.classList.contains("d-md-inline-flex")
          ? "hh-header-user d-none d-md-inline-flex"
          : "hh-header-user d-flex";

        var greeting = document.createElement("span");
        greeting.className = "hh-header-greeting";
        greeting.textContent = "Hi, " + firstName;

        var logoutBtn = document.createElement("button");
        logoutBtn.type = "button";
        logoutBtn.className = "hh-header-logout";
        logoutBtn.textContent = "Log out";
        logoutBtn.addEventListener("click", handleSignOut);

        wrapper.appendChild(greeting);
        wrapper.appendChild(logoutBtn);
        btn.parentNode.insertBefore(wrapper, btn.nextSibling);
      });
    }

    function watchHeaderInjection() {
      var headerContainer = document.getElementById("site-header");
      if (!headerContainer) {
        return;
      }

      if (headerContainer.querySelector(".hh-signin-btn")) {
        syncHeaderUser();
        return;
      }

      var observer = new MutationObserver(function () {
        if (headerContainer.querySelector(".hh-signin-btn")) {
          syncHeaderUser();
          observer.disconnect();
        }
      });
      observer.observe(headerContainer, { childList: true, subtree: true });
    }

    /* ----------------------------------------------------------------------
       UI & Validation Helpers
       ---------------------------------------------------------------------- */

    function showBanner(message, showSignOut) {
      if (!statusBanner || !statusMessage) {
        return;
      }
      statusMessage.textContent = message;
      statusBanner.hidden = false;
      if (signOutBtn) {
        signOutBtn.hidden = !showSignOut;
      }
    }

    function hideBanner() {
      if (!statusBanner) {
        return;
      }
      statusBanner.hidden = true;
      if (statusMessage) {
        statusMessage.textContent = "";
      }
      if (signOutBtn) {
        signOutBtn.hidden = true;
      }
    }

    function handleSignOut() {
      setCurrentUser(null);
      hideBanner();
    }

    function triggerShake(elements) {
      elements.forEach(function (el) {
        if (!el) {
          return;
        }
        el.classList.remove("is-shaking");
        // Force reflow so the shake animation replays on repeated invalid submits
        void el.offsetWidth;
        el.classList.add("is-shaking");
        el.addEventListener(
          "animationend",
          function onEnd() {
            el.classList.remove("is-shaking");
            el.removeEventListener("animationend", onEnd);
          }
        );
      });
    }

    function setFieldError(inputEl, errorId, message) {
      var errorEl = document.getElementById(errorId);
      if (!inputEl || !errorEl) {
        return;
      }
      if (message) {
        inputEl.classList.add("is-invalid-field");
        inputEl.setAttribute("aria-invalid", "true");
        errorEl.textContent = message;
        errorEl.hidden = false;
      } else {
        inputEl.classList.remove("is-invalid-field");
        inputEl.setAttribute("aria-invalid", "false");
        errorEl.textContent = "";
        errorEl.hidden = true;
      }
    }

    function evaluatePasswordStrength(password) {
      if (!password) {
        return {
          level: "weak",
          label: "Weak",
          bars: 1,
          detail: "Use 8+ characters, a number and a symbol."
        };
      }

      var hasLength = password.length >= 8;
      var hasLower = /[a-z]/.test(password);
      var hasUpper = /[A-Z]/.test(password);
      var hasNumber = /\d/.test(password);
      var hasSymbol = /[^A-Za-z0-9]/.test(password);

      var score = 0;
      if (hasLength) score += 1;
      if (hasLower && hasUpper) score += 1;
      if (hasNumber) score += 1;
      if (hasSymbol) score += 1;

      if (password.length >= 12 && score >= 3) {
        score += 1;
      }

      if (!hasLength || score <= 2) {
        return {
          level: "weak",
          label: "Weak",
          bars: 1,
          detail: "Use 8+ characters, a number and a symbol."
        };
      }

      if (score === 3) {
        return {
          level: "medium",
          label: "Medium",
          bars: 2,
          detail: "Add an uppercase letter or symbol to make it stronger."
        };
      }

      return {
        level: "strong",
        label: "Strong",
        bars: 3,
        detail: "Your password is ready."
      };
    }

    function updateStrengthMeter(password) {
      if (!strengthMeter || !strengthText) {
        return;
      }
      var result = evaluatePasswordStrength(password);
      strengthMeter.setAttribute("data-strength", result.level);
      strengthBars.forEach(function (bar, index) {
        if (index < result.bars) {
          bar.classList.add("is-active");
        } else {
          bar.classList.remove("is-active");
        }
      });

      strengthText.setAttribute("data-strength", result.level);
      strengthText.textContent = "";
      var levelSpan = document.createElement("span");
      levelSpan.className = "hh-strength-level";
      levelSpan.textContent = result.label;
      strengthText.appendChild(levelSpan);
      strengthText.appendChild(document.createTextNode(" \u00b7 " + result.detail));
    }

    /* ----------------------------------------------------------------------
       Tab Switching (Keyboard Accessible)
       ---------------------------------------------------------------------- */

    function activateTab(tabId, shouldFocus) {
      if (tabList) {
        tabList.setAttribute("data-active-tab", tabId === "tab-login" ? "login" : "signup");
      }

      tabs.forEach(function (tab) {
        var isSelected = tab.id === tabId;
        tab.classList.toggle("is-active", isSelected);
        tab.setAttribute("aria-selected", String(isSelected));
        tab.setAttribute("tabindex", isSelected ? "0" : "-1");

        var panel = panels[tab.id];
        if (panel) {
          panel.hidden = !isSelected;
        }

        if (isSelected && shouldFocus) {
          tab.focus();
        }
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activateTab(tab.id, false);
      });

      tab.addEventListener("keydown", function (event) {
        var nextIndex = null;
        if (event.key === "ArrowRight") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        }

        if (nextIndex !== null) {
          event.preventDefault();
          activateTab(tabs[nextIndex].id, true);
        }
      });
    });

    document.querySelectorAll("[data-switch-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-switch-tab");
        if (targetId) {
          activateTab(targetId, true);
        }
      });
    });

    /* ----------------------------------------------------------------------
       Show / Hide Password Toggles
       ---------------------------------------------------------------------- */

    document.querySelectorAll(".hh-toggle-password").forEach(function (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        var targetId = toggleBtn.getAttribute("data-target");
        var input = targetId ? document.getElementById(targetId) : null;
        if (!input) {
          return;
        }
        var isHidden = input.getAttribute("type") === "password";
        input.setAttribute("type", isHidden ? "text" : "password");

        var eyeOpen = toggleBtn.querySelector(".hh-eye-open");
        var eyeClosed = toggleBtn.querySelector(".hh-eye-closed");
        if (eyeOpen && eyeClosed) {
          eyeOpen.hidden = isHidden;
          eyeClosed.hidden = !isHidden;
        }

        toggleBtn.setAttribute("aria-pressed", String(isHidden));
        toggleBtn.setAttribute(
          "aria-label",
          (isHidden ? "Hide " : "Show ") +
            (targetId === "signupConfirmPassword" ? "confirm password" : "password")
        );
      });
    });

    /* ----------------------------------------------------------------------
       Sign Up Live Validation & Submission
       ---------------------------------------------------------------------- */

    function validateSignupFullName() {
      var val = signupFullName.value.trim();
      var letterCount = (val.match(/[A-Za-z]/g) || []).length;
      if (!val) {
        setFieldError(signupFullName, "signupFullNameError", "Please enter your full name.");
        return false;
      }
      if (letterCount < 2) {
        setFieldError(
          signupFullName,
          "signupFullNameError",
          "Full name must contain at least 2 letters."
        );
        return false;
      }
      setFieldError(signupFullName, "signupFullNameError", "");
      return true;
    }

    function validateSignupEmail() {
      var val = signupEmail.value.trim();
      if (!val) {
        setFieldError(signupEmail, "signupEmailError", "Please enter your email address.");
        return false;
      }
      if (!EMAIL_REGEX.test(val)) {
        setFieldError(
          signupEmail,
          "signupEmailError",
          "Please enter a valid email address (e.g. you@example.com)."
        );
        return false;
      }
      setFieldError(signupEmail, "signupEmailError", "");
      return true;
    }

    function validateSignupPassword() {
      var val = signupPassword.value;
      var strength = evaluatePasswordStrength(val);
      if (!val) {
        setFieldError(signupPassword, "signupPasswordError", "Please create a password.");
        return false;
      }
      if (strength.level === "weak") {
        setFieldError(
          signupPassword,
          "signupPasswordError",
          "Password is too weak. Use at least 8 characters with a number and a symbol."
        );
        return false;
      }
      setFieldError(signupPassword, "signupPasswordError", "");
      return true;
    }

    function validateSignupConfirm() {
      var val = signupConfirm.value;
      if (!val) {
        setFieldError(signupConfirm, "signupConfirmError", "Please confirm your password.");
        return false;
      }
      if (val !== signupPassword.value) {
        setFieldError(signupConfirm, "signupConfirmError", "Passwords do not match.");
        return false;
      }
      setFieldError(signupConfirm, "signupConfirmError", "");
      return true;
    }

    function validateSignupTerms() {
      if (!signupTerms.checked) {
        setFieldError(
          signupTerms,
          "signupTermsError",
          "You must agree to the Terms & Conditions and Privacy Policy."
        );
        return false;
      }
      setFieldError(signupTerms, "signupTermsError", "");
      return true;
    }

    if (signupFullName) {
      signupFullName.addEventListener("blur", function () {
        signupTouched.fullName = true;
        validateSignupFullName();
      });
      signupFullName.addEventListener("input", function () {
        if (signupTouched.fullName) {
          validateSignupFullName();
        }
      });
    }

    if (signupEmail) {
      signupEmail.addEventListener("blur", function () {
        signupTouched.email = true;
        validateSignupEmail();
      });
      signupEmail.addEventListener("input", function () {
        if (signupTouched.email) {
          validateSignupEmail();
        }
      });
    }

    if (signupPassword) {
      signupPassword.addEventListener("input", function () {
        updateStrengthMeter(signupPassword.value);
        if (signupTouched.password) {
          validateSignupPassword();
        }
        if (signupTouched.confirm && signupConfirm.value) {
          validateSignupConfirm();
        }
      });
      signupPassword.addEventListener("blur", function () {
        signupTouched.password = true;
        validateSignupPassword();
      });
    }

    if (signupConfirm) {
      signupConfirm.addEventListener("input", function () {
        if (signupTouched.confirm || signupConfirm.value.length > 0) {
          signupTouched.confirm = true;
          validateSignupConfirm();
        }
      });
      signupConfirm.addEventListener("blur", function () {
        signupTouched.confirm = true;
        validateSignupConfirm();
      });
    }

    if (signupTerms) {
      signupTerms.addEventListener("change", function () {
        signupTouched.terms = true;
        validateSignupTerms();
      });
    }

    if (signupForm) {
      signupForm.addEventListener("submit", function (event) {
        event.preventDefault();
        signupTouched.fullName = true;
        signupTouched.email = true;
        signupTouched.password = true;
        signupTouched.confirm = true;
        signupTouched.terms = true;

        var fullNameOk = validateSignupFullName();
        var emailOk = validateSignupEmail();
        var passwordOk = validateSignupPassword();
        var confirmOk = validateSignupConfirm();
        var termsOk = validateSignupTerms();

        if (!fullNameOk || !emailOk || !passwordOk || !confirmOk || !termsOk) {
          var invalidSignupFields = [];
          if (!fullNameOk) invalidSignupFields.push(signupFullName);
          if (!emailOk) invalidSignupFields.push(signupEmail);
          if (!passwordOk) invalidSignupFields.push(signupPassword);
          if (!confirmOk) invalidSignupFields.push(signupConfirm);
          if (!termsOk) invalidSignupFields.push(signupTerms);
          triggerShake(invalidSignupFields);
          return;
        }

        var fullName = signupFullName.value.trim();
        var normalizedEmail = signupEmail.value.trim().toLowerCase();
        if (findAccountByEmail(normalizedEmail)) {
          setFieldError(
            signupEmail,
            "signupEmailError",
            "An account with this email already exists. Please log in instead."
          );
          triggerShake([signupEmail]);
          signupEmail.focus();
          return;
        }

        var accounts = getAccounts();
        accounts.push({
          fullName: fullName,
          email: normalizedEmail,
          password: signupPassword.value,
          createdAt: new Date().toISOString()
        });
        saveAccounts(accounts);
        setCurrentUser({ email: normalizedEmail, fullName: fullName });

        showBanner(
          "Account created for " + fullName + " (" + normalizedEmail + "). You are now signed in.",
          true
        );

        signupForm.reset();
        signupTouched = {
          fullName: false,
          email: false,
          password: false,
          confirm: false,
          terms: false
        };
        updateStrengthMeter("");
      });
    }

    /* ----------------------------------------------------------------------
       Login Validation & Submission
       ---------------------------------------------------------------------- */

    function validateLoginEmail() {
      var val = loginEmail.value.trim();
      if (!val) {
        setFieldError(loginEmail, "loginEmailError", "Please enter your email address.");
        return false;
      }
      if (!EMAIL_REGEX.test(val)) {
        setFieldError(loginEmail, "loginEmailError", "Please enter a valid email address.");
        return false;
      }
      setFieldError(loginEmail, "loginEmailError", "");
      return true;
    }

    function validateLoginPassword() {
      if (!loginPassword.value) {
        setFieldError(loginPassword, "loginPasswordError", "Please enter your password.");
        return false;
      }
      setFieldError(loginPassword, "loginPasswordError", "");
      return true;
    }

    if (loginEmail) {
      loginEmail.addEventListener("blur", function () {
        loginTouched.email = true;
        validateLoginEmail();
      });
      loginEmail.addEventListener("input", function () {
        if (loginTouched.email) {
          validateLoginEmail();
        }
      });
    }

    if (loginPassword) {
      loginPassword.addEventListener("blur", function () {
        loginTouched.password = true;
        validateLoginPassword();
      });
      loginPassword.addEventListener("input", function () {
        if (loginTouched.password) {
          validateLoginPassword();
        }
      });
    }

    if (loginForm) {
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        loginTouched.email = true;
        loginTouched.password = true;

        var emailOk = validateLoginEmail();
        var passwordOk = validateLoginPassword();

        if (!emailOk || !passwordOk) {
          var invalidLoginFields = [];
          if (!emailOk) invalidLoginFields.push(loginEmail);
          if (!passwordOk) invalidLoginFields.push(loginPassword);
          triggerShake(invalidLoginFields);
          return;
        }

        var normalizedEmail = loginEmail.value.trim().toLowerCase();
        var account = findAccountByEmail(normalizedEmail);

        if (!account) {
          setFieldError(
            loginEmail,
            "loginEmailError",
            "No account found with this email address."
          );
          triggerShake([loginEmail]);
          loginEmail.focus();
          return;
        }

        if (account.password !== loginPassword.value) {
          setFieldError(
            loginPassword,
            "loginPasswordError",
            "Incorrect password. Please try again."
          );
          triggerShake([loginPassword]);
          loginPassword.focus();
          return;
        }

        setCurrentUser({ email: normalizedEmail, fullName: account.fullName || "" });
        showBanner(
          "Welcome back, " + getFirstName({ email: normalizedEmail, fullName: account.fullName }) + ". You are now signed in.",
          true
        );
        loginForm.reset();
        loginTouched = { email: false, password: false };
      });
    }

    /* ----------------------------------------------------------------------
       Forgot Password & Sign Out
       ---------------------------------------------------------------------- */

    if (forgotBtn && forgotPanel) {
      forgotBtn.addEventListener("click", function () {
        forgotPanel.hidden = !forgotPanel.hidden;
      });
    }

    if (sendResetBtn) {
      sendResetBtn.addEventListener("click", function () {
        loginTouched.email = true;
        if (!validateLoginEmail()) {
          loginEmail.focus();
          return;
        }
        var normalizedEmail = loginEmail.value.trim().toLowerCase();
        var account = findAccountByEmail(normalizedEmail);
        if (!account) {
          setFieldError(
            loginEmail,
            "loginEmailError",
            "No account found with this email address."
          );
          loginEmail.focus();
          return;
        }
        forgotPanel.hidden = true;
        showBanner(
          "Password reset instructions have been sent to " + normalizedEmail + " (demo).",
          false
        );
      });
    }

    if (signOutBtn) {
      signOutBtn.addEventListener("click", handleSignOut);
    }

    /* ----------------------------------------------------------------------
       Initial State (Check URL param/hash, watch header, restore session)
       ---------------------------------------------------------------------- */

    var params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "login" || window.location.hash === "#login") {
      activateTab("tab-login", false);
    }

    watchHeaderInjection();

    var activeUser = getCurrentUser();
    if (activeUser) {
      showBanner("Signed in as " + activeUser.email + ".", true);
    }
  });
})();

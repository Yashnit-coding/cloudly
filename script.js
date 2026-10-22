
/* =========================================
   CLOUDLY — INTERACTIVE JAVASCRIPT
   Theme, portfolio filters, navigation,
   animations, and contact form
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------
  // 1. LIGHT / DARK MODE
  // ---------------------------------------

  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.querySelector(".theme-icon");
  const themeLabel = document.querySelector(".theme-label");
  const themeColorMeta = document.getElementById("theme-color-meta");
  const root = document.documentElement;

  function applyTheme(theme) {
    const isDark = theme === "dark";

    root.setAttribute("data-theme", isDark ? "dark" : "light");

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isDark ? "#171522" : "#f7f8ff");
    }

    if (themeIcon) {
      themeIcon.textContent = isDark ? "☀" : "☾";
    }

    if (themeLabel) {
      themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
    }

    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );

      themeToggle.setAttribute("aria-pressed", String(isDark));
    }

    try {
      localStorage.setItem("cloudly-theme", theme);
    } catch (error) {
      // The theme still works if storage is unavailable.
    }
  }

  let savedTheme = "light";

  try {
    savedTheme = localStorage.getItem("cloudly-theme") || "light";
  } catch (error) {
    // Use the default theme.
  }

  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = root.getAttribute("data-theme") || "light";
      applyTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  // ---------------------------------------
  // 2. MOBILE NAVIGATION
  // ---------------------------------------

  const menuToggle = document.getElementById("mt");
  const navigation = document.querySelector(".site-header nav");

  function closeMenu() {
    if (!menuToggle || !navigation) return;

    navigation.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");

    const menuText = menuToggle.querySelector(".menu-text");

    if (menuText) {
      menuText.textContent = "Menu";
    }
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );

      const menuText = menuToggle.querySelector(".menu-text");

      if (menuText) {
        menuText.textContent = isOpen ? "Close" : "Menu";
      }
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        navigation.classList.contains("open") &&
        !navigation.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        closeMenu();
      }
    });
  }

  // ---------------------------------------
  // 3. PORTFOLIO CATEGORY FILTERS
  // ---------------------------------------

  const filterButtons = document.querySelectorAll(".filter-btn");
  const portfolioCards = document.querySelectorAll(".portfolio-card");

  function filterPortfolio(category) {
    let visibleCount = 0;

    portfolioCards.forEach((card) => {
      const cardCategory = card.dataset.category || "all";

      const shouldShow =
        category === "all" || cardCategory === category;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCount++;

        // Re-trigger a subtle entrance animation.
        card.style.animation = "none";
        void card.offsetWidth;
        card.style.animation = "card-in 0.3s ease both";
      }
    });

    const resultsCount = document.getElementById("resultsCount");

    if (resultsCount) {
      resultsCount.textContent =
        `${visibleCount} website ${visibleCount === 1 ? "concept" : "concepts"}`;
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
      });

      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");

      filterPortfolio(button.dataset.filter || "all");
    });
  });

  // ---------------------------------------
  // 4. SCROLL REVEAL ANIMATIONS
  // ---------------------------------------

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }


  // ---------------------------------------
  // 5. CONTACT FORM — EMAILJS
  // ---------------------------------------

  const contactForm = document.getElementById("cf");
  const formStatus = document.getElementById("st");
  const submitButton = document.getElementById("contact-submit");
  const formNote = contactForm?.querySelector(".form-note");

  // EmailJS credentials
  const EMAILJS_PUBLIC_KEY = "WYo4pbX4aTgjL77oM";
  const EMAILJS_SERVICE_ID = "service_94ux09o";
  const EMAILJS_TEMPLATE_ID = "template_jpw6n28";

  // Check that all three credentials are present.
  const emailJsConfigured = Boolean(
    EMAILJS_PUBLIC_KEY &&
    EMAILJS_SERVICE_ID &&
    EMAILJS_TEMPLATE_ID
  );

  // Initialize EmailJS when the library is available.
  if (window.emailjs && emailJsConfigured) {
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      // Basic honeypot spam protection.
      const honeypot = contactForm.querySelector(
        '[name="website"]'
      );

      if (honeypot && honeypot.value.trim() !== "") {
        if (formStatus) {
          formStatus.textContent =
            "Thanks! Your enquiry has been received.";
        }

        contactForm.reset();
        return;
      }

      // Check that EmailJS loaded.
      if (!window.emailjs) {
        if (formStatus) {
          formStatus.textContent =
            "The email service could not load. Please refresh the page and try again.";
        }

        console.error(
          "EmailJS library is missing. Check your EmailJS script tag."
        );
        return;
      }

      // Check the credentials.
      if (!emailJsConfigured) {
        if (formStatus) {
          formStatus.textContent =
            "Please configure your EmailJS credentials in script.js.";
        }

        console.warn(
          "Cloudly contact form: EmailJS credentials are missing."
        );
        return;
      }

      const originalButtonHtml = submitButton
        ? submitButton.innerHTML
        : "";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending enquiry...";
      }

      if (formStatus) {
        formStatus.textContent = "Sending your enquiry...";
      }

      if (formNote) {
        formNote.textContent =
          "Please keep this page open while your enquiry is being sent.";
      }

      try {
        // These names must match your EmailJS template variables.
        const templateParams = {
          user_name:
            contactForm.elements.namedItem("user_name")?.value.trim() || "",

          user_email:
            contactForm.elements.namedItem("user_email")?.value.trim() || "",

          business_name:
            contactForm.elements.namedItem("business_name")?.value.trim() || "",

          service_type:
            contactForm.elements.namedItem("service_type")?.value || "",

          message:
            contactForm.elements.namedItem("message")?.value.trim() || "",

          website: ""
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams
        );

        contactForm.reset();

        if (formStatus) {
          formStatus.textContent =
            "Thanks! Your enquiry has been sent successfully. We'll be in touch soon.";
        }

        if (formNote) {
          formNote.textContent =
            "Your enquiry was sent. We look forward to learning about your project.";
        }
      } catch (error) {
        console.error(
          "Cloudly contact form submission failed:",
          error
        );

        if (formStatus) {
          formStatus.textContent =
            "Sorry, your enquiry could not be sent. Please try again in a moment.";
        }

        if (formNote) {
          formNote.textContent =
            "If the problem continues, please contact us directly by email.";
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHtml;
        }
      }
    });
  }


  // ---------------------------------------
  // 6. CURRENT YEAR IN FOOTER
  // ---------------------------------------

  const yearElement = document.getElementById("yr");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ---------------------------------------
  // 7. SMOOTH ANCHOR NAVIGATION
  // ---------------------------------------

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches ? "auto" : "smooth",
        block: "start"
      });

      if (window.location.hash !== targetId) {
        history.replaceState(null, "", targetId);
      }
    });
  });

  // ---------------------------------------
  // 8. INITIALIZE PORTFOLIO COUNT
  // ---------------------------------------

  filterPortfolio("all");

  console.log("Cloudly website is ready!");
});

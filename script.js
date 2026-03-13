const revealElements = document.querySelectorAll("[data-reveal]");
const counterElements = document.querySelectorAll("[data-count]");
const tiltElements = document.querySelectorAll("[data-tilt]");
const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("site-nav");
const progressBar = document.querySelector(".scroll-progress");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

revealElements.forEach((element) => {
  const siblings = Array.from(element.parentElement?.children || []).filter((child) =>
    child.hasAttribute("data-reveal")
  );
  const staggerIndex = Math.max(siblings.indexOf(element), 0);

  element.style.setProperty("--reveal-delay", `${staggerIndex * 90}ms`);
});

if (progressBar) {
  let progressFrame = null;

  const renderScrollProgress = () => {
    progressFrame = null;

    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight <= 0 ? 0 : window.scrollY / scrollableHeight;

    progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
  };

  const requestProgressRender = () => {
    if (progressFrame !== null) {
      return;
    }

    progressFrame = window.requestAnimationFrame(renderScrollProgress);
  };

  renderScrollProgress();
  window.addEventListener("scroll", requestProgressRender, { passive: true });
  window.addEventListener("resize", requestProgressRender);
}

if (siteHeader && navToggle && siteNav) {
  const setNavState = (isOpen) => {
    siteHeader.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  navToggle.addEventListener("click", () => {
    const isOpen = !siteHeader.classList.contains("is-open");
    setNavState(isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavState(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      setNavState(false);
    }
  });
}

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const animateCounter = (element) => {
  const target = Number(element.dataset.count || "0");
  const suffix = element.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();

  const formatValue = (value) => `${Math.round(value).toLocaleString()}${suffix}`;

  const step = (timestamp) => {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;

    element.textContent = formatValue(value);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

if (!prefersReducedMotion && counterElements.length > 0) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.6,
    }
  );

  counterElements.forEach((element) => counterObserver.observe(element));
} else {
  counterElements.forEach((element) => {
    const target = Number(element.dataset.count || "0");
    const suffix = element.dataset.suffix || "";
    element.textContent = `${target.toLocaleString()}${suffix}`;
  });
}

tiltElements.forEach((element) => {
  if (prefersReducedMotion) {
    return;
  }

  element.addEventListener("pointermove", (event) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateY = ((event.clientX - centerX) / rect.width) * 8;
    const rotateX = ((centerY - event.clientY) / rect.height) * 8;

    element.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  element.addEventListener("pointerleave", () => {
    element.style.transform = "";
  });
});

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

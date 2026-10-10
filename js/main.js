const dialog = document.querySelector("#mobile-menu");
const menuOpen = document.querySelector("#menu-open");
let menuTarget = null;
const closeMenu = () => dialog.close();
dialog.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const focusable = [
    ...dialog.querySelectorAll("a[href], button:not([disabled])"),
  ];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
menuOpen.addEventListener("click", () => {
  dialog.showModal();
  menuOpen.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-is-open");
});
document.querySelector("#menu-close")?.addEventListener("click", closeMenu);
dialog.addEventListener("close", () => {
  menuOpen.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-is-open");
  (menuTarget || menuOpen).focus({ preventScroll: true });
  menuTarget = null;
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeMenu();
});
dialog.querySelectorAll("nav a").forEach((link) =>
  link.addEventListener("click", () => {
    menuTarget = document.querySelector(link.getAttribute("href"));
    menuTarget?.setAttribute("tabindex", "-1");
    closeMenu();
  }),
);
matchMedia("(min-width: 821px)").addEventListener("change", (e) => {
  if (e.matches && dialog.open) closeMenu();
});
const sections = [...document.querySelectorAll("[data-section]")];
let currentSection = location.hash.slice(1) || "home";
let manuallyScrolled = false;
addEventListener(
  "wheel",
  () => {
    manuallyScrolled = true;
  },
  { passive: true },
);
addEventListener(
  "touchmove",
  () => {
    manuallyScrolled = true;
  },
  { passive: true },
);
addEventListener("keydown", (event) => {
  if (
    ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(
      event.key,
    )
  )
    manuallyScrolled = true;
});
addEventListener("hashchange", () => {
  manuallyScrolled = false;
});
document.addEventListener("click", (event) => {
  if (event.target.closest('a[href^="#"]')) manuallyScrolled = false;
});
let queued = false;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const updateSection = () => {
  queued = false;
  const threshold = innerHeight * 0.34;
  currentSection = sections.reduce(
    (id, section) =>
      section.getBoundingClientRect().top <= threshold ? section.id : id,
    "home",
  );
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 8)
    currentSection = "contact";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const active = link.dataset.nav === currentSection;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  document
    .querySelector(".site-header")
    ?.classList.toggle("scrolled", scrollY > 16);
};
addEventListener(
  "scroll",
  () => {
    if (!queued) {
      requestAnimationFrame(updateSection);
      queued = true;
    }
  },
  { passive: true },
);
updateSection();
document.querySelectorAll("[data-language]").forEach((link) =>
  link.addEventListener("click", () => {
    const section =
      !manuallyScrolled && location.hash
        ? location.hash.slice(1)
        : currentSection;
    const destination = new URL(
      "../" + link.dataset.language + "/index.html",
      location.href,
    );
    destination.hash = section === "home" ? "" : section;
    link.href = destination.href;
  }),
);
if (!reducedMotion.matches && "IntersectionObserver" in window) {
  const reveal = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          reveal.unobserve(entry.target);
        }
      }),
    { threshold: 0.07 },
  );
  document.querySelectorAll(".reveal").forEach((el) => {
    el.classList.add("will-reveal");
    reveal.observe(el);
  });
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      reveal.disconnect();
      document
        .querySelectorAll(".will-reveal")
        .forEach((el) => el.classList.add("is-visible"));
    }
  });
}

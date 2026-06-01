const header = document.querySelector("[data-site-header]");
const menuButton = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js-ready");

const setHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 18);
const closeMenu = () => {
  navLinks?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Abrir menú");
};

setHeader();
window.addEventListener("scroll", setHeader, { passive: true });

menuButton?.addEventListener("click", () => {
  const open = navLinks?.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
});
navLinks?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const initMotion = () => {
  if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".hero-copy > *", {
    y: 42, opacity: 0, filter: "blur(8px)", duration: 1, stagger: 0.11, ease: "power4.out", delay: 0.18
  });
  gsap.from(".hero-side, .hero-bottom", {
    opacity: 0, y: 20, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.74
  });
  gsap.to("[data-parallax='hero'] img", {
    yPercent: 8, scale: 1.06, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 }
  });
  gsap.utils.toArray(".media-frame img").forEach((image) => {
    gsap.fromTo(image, { scale: 1.08 }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: image, start: "top bottom", end: "bottom top", scrub: 1.2 }
    });
  });
};

requestAnimationFrame(initMotion);

const trackEvent = (element, eventName = element.dataset.event) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "sante_cta_click", cta_name: eventName, cta_text: element.textContent.trim() });
  if (typeof window.fbq === "function") window.fbq("trackCustom", "SanteCtaClick", { cta_name: eventName });
};

document.querySelectorAll("[data-event]:not([type='submit'])").forEach((element) => {
  element.addEventListener("click", () => {
    trackEvent(element);
  });
});

document.querySelector("[data-lead-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const nombre = data.get("nombre")?.toString().trim();
  const actividad = data.get("actividad")?.toString().trim() || "No especificada";
  const objetivo = data.get("objetivo")?.toString().trim();
  const message = [
    "Hola SANTÉ, quiero coordinar una evaluación.",
    "",
    `Nombre: ${nombre}`,
    `Actividad o deporte: ${actividad}`,
    `Consulta: ${objetivo}`,
  ].join("\n");

  trackEvent(form.querySelector("[type='submit']"), "submit_whatsapp_form");
  window.open(`https://wa.me/541173669695?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

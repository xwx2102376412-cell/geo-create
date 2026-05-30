const appHeader = document.querySelector(".app-header");

function setupPageEffects() {
  if (appHeader) {
    const updateHeader = () => {
      appHeader.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

setupPageEffects();

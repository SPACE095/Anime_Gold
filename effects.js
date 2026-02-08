(() => {
  const body = document.body;
  if (!body) return;
  body.classList.add("js");

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  body.appendChild(glow);

  let lastMove = 0;
  const updateGlow = (event) => {
    const now = performance.now();
    if (now - lastMove < 16) return;
    lastMove = now;
    const x = event.clientX;
    const y = event.clientY;
    glow.style.transform = `translate(${x - 300}px, ${y - 300}px)`;
  };

  window.addEventListener("pointermove", updateGlow, { passive: true });

  const revealTargets = document.querySelectorAll(".reveal, .feature-card, .news-card, .calendar-card, .genre-card");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  const hero = document.querySelector(".hero");
  const handleScroll = () => {
    if (!hero) return;
    const offset = Math.min(120, window.scrollY * 0.2);
    hero.style.setProperty("--hero-offset", `${offset}px`);
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
})();

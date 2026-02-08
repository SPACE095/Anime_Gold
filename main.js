const setupNav = () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
};

const showToast = (message) => {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
};

const setupWatchlistButtons = () => {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".watch-toggle");
    if (!button) return;

    const id = button.dataset.id;
    if (!id) return;

    if (button.dataset.mode === "remove") {
      removeFromWatchlist(id);
      renderWatchlist();
      showToast("تمت الإزالة من قائمتك");
      return;
    }

    const added = toggleWatchlist(id);
    button.textContent = added ? "في قائمتي" : "أضف للقائمة";
    updateWatchButtons();
    showToast(added ? "تمت الإضافة إلى قائمتك" : "تمت الإزالة من قائمتك");
  });
};

const setupContactForm = () => {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.reset();
    showToast("تم إرسال رسالتك بنجاح");
  });
};

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupWatchlistButtons();
  renderDiscover();
  renderWatchlist();
  renderDetail();
  renderPlayer();
  setupContactForm();
});

// frontend/js/main.js
// ------------------------------------------------------------
// Lightweight JS for EihDah landing page.
// - Smooth‑scroll anchor links
// - Form submission success toast
// ------------------------------------------------------------

/* ── Smooth scroll for anchor links ─────────────────────── */
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href^='#']");
  if (!link) return;
  const targetId = link.getAttribute("href").slice(1);
  const target = document.getElementById(targetId);
  if (target) {
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", `#${targetId}`);
  }
});

/* ── Waitlist form mini‑toast ───────────────────────────── */
const waitlistForm = document.querySelector("form[action='/subscribe']");
if (waitlistForm) {
  waitlistForm.addEventListener("submit", () => {
    setTimeout(() => {
      const toast = document.createElement("div");
      toast.className = "position-fixed bottom-0 end-0 m-3 alert alert-success shadow";
      toast.style.zIndex = 1080;
      toast.textContent = "Thanks! We'll be in touch soon.";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    }, 500);
  });
}

/* ============================================================
   PDM CI — JAVASCRIPT GLOBAL
   Menu mobile, en-tête au défilement et consentement confidentialité.
   Ce fichier est partagé par toutes les pages du site.
   ============================================================ */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

// -------------------- MENU MOBILE --------------------
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// -------------------- EN-TÊTE AU SCROLL --------------------
const header = document.getElementById("siteHeader");
window.addEventListener("scroll", () => {
  if (header) header.classList.toggle("scrolled", window.scrollY > 10);
});

// -------------------- CONFIDENTIALITÉ --------------------
document.addEventListener("DOMContentLoaded", () => {
  const privacyModal = document.getElementById("privacyModal");
  const acceptBtn = document.getElementById("acceptPrivacy");
  const declineBtn = document.getElementById("declinePrivacy");

  // Certaines pages peuvent ne pas afficher la fenêtre : on quitte proprement.
  if (!privacyModal || !acceptBtn || !declineBtn) return;

  const privacyConsent = localStorage.getItem("userPrivacyConsent");
  if (!privacyConsent) privacyModal.style.display = "flex";

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("userPrivacyConsent", "accepted");
    privacyModal.style.display = "none";
  });

  declineBtn.addEventListener("click", () => {
    localStorage.setItem("userPrivacyConsent", "declined");
    privacyModal.style.display = "none";
  });
});

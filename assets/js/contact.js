// ============================================================
// PDM CI — PAGE CONTACT
// Phase 1 : stockage local uniquement.
// ============================================================

const form = document.getElementById("contact-form");
const message = document.getElementById("contact-form-message");

const params = new URLSearchParams(window.location.search);
const showroomId = params.get("showroom");

if (showroomId) {
  document.getElementById("contact-sujet").value = "Showroom";
  document.getElementById("contact-message").value =
    `Je souhaite être orienté vers le point de proximité ${showroomId}.`;
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const consent = document.getElementById("contact-consent");
  if (!consent.checked) return;

  const entry = {
    id: `msg_${Date.now()}`,
    date: new Date().toISOString(),
    nom: document.getElementById("contact-nom").value.trim(),
    prenom: document.getElementById("contact-prenom").value.trim(),
    telephone: document.getElementById("contact-telephone").value.trim(),
    email: document.getElementById("contact-email").value.trim(),
    sujet: document.getElementById("contact-sujet").value,
    message: document.getElementById("contact-message").value.trim()
  };

  const previous = JSON.parse(localStorage.getItem("pdmContactMessages") || "[]");
  previous.push(entry);
  localStorage.setItem("pdmContactMessages", JSON.stringify(previous));

  message.className = "form-feedback success";
  message.textContent = "Votre message a été enregistré localement pour la démonstration.";
  form.reset();
});

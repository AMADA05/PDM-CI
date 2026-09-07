// ============================================================
// PDM CI — PAGE SERVICES
// Phase 1 : données fictives.
// ============================================================

// ------------------------------------------------------------
// DONNÉES DES SERVICES
// Ces données pourront plus tard venir de la base de données.
// ------------------------------------------------------------
const services = [
  {
    id: "service_conseil",
    categorie: "Conseil",
    titre: "Conseil & orientation",
    description:
      "Analyse du besoin et orientation vers les équipements ou solutions adaptés au contexte du client.",
    icon: "01",
    accent: "green"
  },
  {
    id: "service_installation",
    categorie: "Technique",
    titre: "Installation & mise en service",
    description:
      "Accompagnement technique pour l'installation, la configuration et la mise en service des équipements.",
    icon: "02",
    accent: "orange"
  },
  {
    id: "service_maintenance",
    categorie: "Technique",
    titre: "Maintenance & assistance",
    description:
      "Maintenance préventive et corrective, assistance technique et suivi des équipements.",
    icon: "03",
    accent: "green"
  },
  {
    id: "service_formation",
    categorie: "Formation",
    titre: "Formation des utilisateurs",
    description:
      "Formation et accompagnement des utilisateurs pour favoriser une utilisation correcte et durable des équipements.",
    icon: "04",
    accent: "orange"
  },
  {
    id: "service_demonstration",
    categorie: "Commercial",
    titre: "Démonstration de solutions",
    description:
      "Présentation des équipements et de leurs fonctionnalités auprès des professionnels et structures de santé.",
    icon: "05",
    accent: "green"
  },
  {
    id: "service_suivi",
    categorie: "Accompagnement",
    titre: "Suivi après-vente",
    description:
      "Suivi de la satisfaction, accompagnement et orientation des demandes après l'acquisition.",
    icon: "06",
    accent: "orange"
  }
];

// ------------------------------------------------------------
// RÉCUPÉRATION DES ÉLÉMENTS HTML
// ------------------------------------------------------------
const grid = document.getElementById("services-grid");
const empty = document.getElementById("services-empty");

// ------------------------------------------------------------
// AFFICHAGE DES CARTES
// ------------------------------------------------------------
function renderServices() {
  if (!grid) return;

  grid.innerHTML = "";

  if (!services.length) {
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;

  services.forEach(service => {
    const card = document.createElement("article");
    card.className = `service-card service-${service.accent}`;

    card.innerHTML = `
      <div class="service-card-top">
        <span class="service-number">${service.icon}</span>
        <span class="service-category">${service.categorie}</span>
      </div>

      <div class="service-card-icon" aria-hidden="true">+</div>

      <h3>${service.titre}</h3>

      <p>${service.description}</p>

      <a
        class="service-link"
        href="contact.html?sujet=${encodeURIComponent(service.titre)}"
      >
        En savoir plus <span>→</span>
      </a>
    `;

    grid.appendChild(card);
  });
}

// ------------------------------------------------------------
// INITIALISATION
// ------------------------------------------------------------
renderServices();

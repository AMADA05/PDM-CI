// ==========================================================
// PDM-CI — GESTION GLOBALE DE L'AUTHENTIFICATION & DU TOKEN JWT
// ==========================================================

const Auth = {
  // ======================================================
  // SESSION ET STORAGE
  // ======================================================

  getToken() {
    return localStorage.getItem("pdm_token");
  },

  getUser() {
    const data = localStorage.getItem("pdm_user");
    if (!data) return null;

    try {
      const user = JSON.parse(data);
      if (!user || typeof user !== "object" || (!user.id && !user.utilisateur_id)) {
        this.clearSession();
        return null;
      }
      return user;
    } catch (error) {
      console.warn("Session utilisateur corrompue. Nettoyage du localStorage.");
      this.clearSession();
      return null;
    }
  },

  isLoggedIn() {
    return Boolean(this.getToken() && this.getUser());
  },

  // ======================================================
  // GESTION DES RÔLES ET AUTORISATIONS
  // ======================================================

  getRoles() {
    const user = this.getUser();
    if (!user) return [];

    // Support des rôles sous forme d'un tableau d'objets ou d'un tableau de chaînes
    const rolesArray = user.roles || user.roles_noms || (user.role ? [user.role] : []);
    
    if (!Array.isArray(rolesArray)) {
      return typeof rolesArray === "string" ? [rolesArray.toLowerCase()] : [];
    }

    return rolesArray
      .map(role => {
        if (typeof role === "string") return role.toLowerCase();
        return role?.nom ? String(role.nom).toLowerCase() : null;
      })
      .filter(Boolean);
  },

  hasRole(roleName) {
    const target = String(roleName).toLowerCase();
    return this.getRoles().includes(target);
  },

  // ======================================================
  // PROFIL UTILISATEUR
  // ======================================================

  getDisplayName() {
    const user = this.getUser();
    if (!user) return "";

    const prenom = user.prenom || user.first_name || "";
    const nom = user.nom || user.last_name || "";
    const display = `${prenom} ${nom}`.trim();

    return display || user.email || "Mon compte";
  },

  // ======================================================
  // ROUTAGE ET ESPACES
  // ======================================================

  getDashboardUrl() {
    const roles = this.getRoles();

    if (roles.includes("administrateur") || roles.includes("admin")) {
      return "/pages/administration.html";
    }
    if (roles.includes("technicien_medequip") || roles.includes("gestionnaire_showroom")) {
      return "/dashboard/index.html";
    }
    return "/index.html";
  },

  // ======================================================
  // NETTOYAGE ET DÉCONNEXION
  // ======================================================

  clearSession() {
    localStorage.removeItem("pdm_token");
    localStorage.removeItem("pdm_user");
    localStorage.removeItem("pdm_role");
  },

  logout() {
    this.clearSession();
    window.location.href = "/pages/authentification.html";
  },

  // ======================================================
  // VERROUILLAGE DES PAGES ET GUARDS
  // ======================================================

  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = "/pages/authentification.html";
      return false;
    }
    return true;
  },

  requireRole(roleName) {
    if (!this.requireLogin()) return false;

    if (!this.hasRole(roleName)) {
      alert("Accès refusé : vous ne possédez pas les autorisations nécessaires.");
      window.location.href = "/index.html";
      return false;
    }
    return true;
  },

  protectAdministration() {
    const currentPath = window.location.pathname.toLowerCase();
    const isAdminPage = currentPath.includes("administration.html");

    if (!isAdminPage) return true;

    // Accepte le rôle 'administrateur' ou 'admin'
    if (!this.isLoggedIn()) {
      window.location.href = "/pages/authentification.html";
      return false;
    }

    const roles = this.getRoles();
    const hasAdminAccess = roles.includes("administrateur") || roles.includes("admin");

    if (!hasAdminAccess) {
      alert("Accès restreint à l'administration MEDEQUIP CI.");
      window.location.href = "/index.html";
      return false;
    }

    return true;
  },

  // ======================================================
  // MISE À JOUR DE L'INTERFACE DE NAVIGATION
  // ======================================================

  updateHeader() {
    const user = this.getUser();
    if (!user) return;

    const displayName = this.getDisplayName();
    const dashboardUrl = this.getDashboardUrl();

    let loginButton = document.getElementById("authButton") || document.querySelector('.main-nav a[href*="authentification.html"]');

    if (loginButton) {
      loginButton.textContent = displayName;
      loginButton.href = dashboardUrl;
      loginButton.classList.add("user-connected");
      loginButton.setAttribute("aria-label", `Espace de ${displayName}`);
      loginButton.dataset.connected = "true";
    }

    const nav = document.querySelector(".main-nav");
    if (!nav) return;

    let logoutButton = nav.querySelector(".logout-button");

    if (!logoutButton) {
      logoutButton = document.createElement("button");
      logoutButton.type = "button";
      logoutButton.className = "btn btn-orange logout-button";
      logoutButton.textContent = "Déconnexion";
      logoutButton.addEventListener("click", () => this.logout());
      nav.appendChild(logoutButton);
    }
  },

  // ======================================================
  // INITIALISATION
  // ======================================================

  init() {
    if (!this.protectAdministration()) return;
    this.updateHeader();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Auth.init();
});
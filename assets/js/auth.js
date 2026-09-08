// ==========================================================
// PDM-CI — GESTION GLOBALE DE L'AUTHENTIFICATION & DU TOKEN JWT
// ==========================================================

// Détection dynamique du chemin de base (Support GitHub Pages & Local)
const IS_GITHUB_PAGES = window.location.pathname.includes('/PDM-CI/');
const PATH_PREFIX = IS_GITHUB_PAGES ? '/PDM-CI' : '';

// Fonction globale de déconnexion
function deconnexion() {
  Auth.logout();
}

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

  // ======================================================
  // GESTION DES RÔLES ET AUTORISATIONS
  // ======================================================

  getRoles() {
    const user = this.getUser();
    if (!user) return [];

    // Récupération souple des rôles (tableau, objet ou chaîne simple)
    const rawRoles = user.roles || user.roles_noms || user.role || [];
    
    if (Array.isArray(rawRoles)) {
      return rawRoles.map(r => {
        if (typeof r === "string") return r.toLowerCase();
        return r?.nom ? String(r.nom).toLowerCase() : "";
      }).filter(Boolean);
    }

    if (typeof rawRoles === "string") {
      return [rawRoles.toLowerCase()];
    }

    return [];
  },

  hasRole(roleName) {
    const target = String(roleName).toLowerCase();
    return this.getRoles().includes(target);
  },

  getDisplayName() {
    const user = this.getUser();
    if (!user) return "";

    const prenom = user.prenom || user.first_name || "";
    const nom = user.nom || user.last_name || "";
    const display = `${prenom} ${nom}`.trim();

    return display || user.email || "Mon compte";
  },

  // ======================================================
  // ROUTAGE DYNAMIQUE
  // ======================================================

  getDashboardUrl() {
    const user = this.getUser();
    const roles = this.getRoles();
    const isAdminEmail = user?.email?.toLowerCase() === "admin@pdmci.com";
    const hasAdminRole = roles.some(role => role.includes("admin") || role.includes("administrateur"));

    if (isAdminEmail || hasAdminRole) {
      return `${PATH_PREFIX}/pages/administration.html`;
    }
    return `${PATH_PREFIX}/index.html`;
  },

  // ======================================================
  // DÉCONNEXION PROPRE
  // ======================================================

  clearSession() {
    localStorage.removeItem("pdm_token");
    localStorage.removeItem("pdm_user");
    localStorage.removeItem("pdm_role");
  },

  logout() {
    this.clearSession();
    window.location.href = `${PATH_PREFIX}/index.html`;
  },

  // ======================================================
  // PROTECTION DES PAGES (GUARDS)
  // ======================================================

  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = `${PATH_PREFIX}/pages/authentification.html`;
      return false;
    }
    return true;
  },

  protectAdministration() {
    const currentPath = window.location.pathname.toLowerCase();
    const isAdminPage = currentPath.includes("administration.html");

    if (!isAdminPage) return true;

    if (!this.isLoggedIn()) {
      window.location.href = `${PATH_PREFIX}/pages/authentification.html`;
      return false;
    }

    const user = this.getUser();
    const roles = this.getRoles();

    // Double sécurité : validation par l'email de l'admin OU par la présence du rôle
    const isAdminEmail = user?.email?.toLowerCase() === "admin@pdmci.com";
    const hasAdminRole = roles.some(role => role.includes("admin") || role.includes("administrateur"));

    if (!isAdminEmail && !hasAdminRole) {
      alert("Accès restreint à l'administration MEDEQUIP CI.");
      window.location.href = `${PATH_PREFIX}/index.html`;
      return false;
    }

    return true;
  },
  // ======================================================
  // MISE À JOUR DU HEADER SUR TOUTES LES PAGES
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
      logoutButton.style.marginLeft = "10px";
      logoutButton.textContent = "Déconnexion";
      logoutButton.addEventListener("click", () => this.logout());
      nav.appendChild(logoutButton);
    }
  },

  init() {
    if (!this.protectAdministration()) return;
    this.updateHeader();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Auth.init();
});
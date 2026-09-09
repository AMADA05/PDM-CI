/* ==========================================================
   PDM-CI — ADMINISTRATION UNIFIÉE & 100% POSTGRESQL API
========================================================== */

const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:5000"
  : "https://pdm-ci.onrender.com";

const TOKEN_KEY = "pdm_token";

// Endpoints
const API_PRODUITS = `${API_BASE_URL}/api/produits`;
const API_SHOWROOMS = `${API_BASE_URL}/api/showrooms`;
const API_ACTUALITES = `${API_BASE_URL}/api/actualites`;
const API_UTILISATEURS = `${API_BASE_URL}/api/utilisateurs`;
const API_DEVIS = `${API_BASE_URL}/api/devis`;
const API_CONTRATS = `${API_BASE_URL}/api/contrats`;

// Eléments DOM principaux
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".admin-section");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const sidebar = document.getElementById("adminSidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const logoutButton = document.getElementById("logoutButton");
const modal = document.getElementById("adminModal");

const sectionInfo = {
  dashboard: { title: "Tableau de bord", subtitle: "Vue générale de l'activité PDM CI" },
  produits: { title: "Produits", subtitle: "Gestion du catalogue des équipements" },
  showrooms: { title: "Showrooms", subtitle: "Gestion des points de vente MEDEQUIP CI" },
  services: { title: "Services", subtitle: "Gestion des services proposés par MEDEQUIP CI" },
  actualites: { title: "Actualités", subtitle: "Gestion des informations publiées sur PDM CI" },
  utilisateurs: { title: "Utilisateurs", subtitle: "Gestion des comptes et des rôles" },
  devis: { title: "Demandes de devis", subtitle: "Suivi des demandes commerciales reçues" },
  contrats: { title: "Contrats de Maintenance", subtitle: "Gestion des contrats biomédicaux" }
};

let cacheData = { produits: [], showrooms: [], actualites: [], utilisateurs: [], devis: [], contrats: [] };

function getToken() { return localStorage.getItem(TOKEN_KEY); }

function apiHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function escapeHtml(val) {
  return String(val ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = "";
  document.body.classList.remove("modal-open");
}

// Navigation entre les onglets
function showSection(sectionName) {
  navItems.forEach(item => item.classList.toggle("active", item.dataset.section === sectionName));
  sections.forEach(section => section.classList.toggle("active", section.id === `section-${sectionName}`));

  const info = sectionInfo[sectionName];
  if (info) {
    if (pageTitle) pageTitle.textContent = info.title;
    if (pageSubtitle) pageSubtitle.textContent = info.subtitle;
  }
  sidebar?.classList.remove("open");

  // Chargement à la demande
  if (sectionName === "dashboard") loadDashboard();
  if (sectionName === "produits") loadProducts();
  if (sectionName === "showrooms") loadShowrooms();
  if (sectionName === "actualites") loadActualites();
  if (sectionName === "utilisateurs") loadUtilisateurs();
  if (sectionName === "devis") loadDevis();
  if (sectionName === "contrats") loadContrats();
}

navItems.forEach(item => item.addEventListener("click", () => showSection(item.dataset.section)));
sidebarToggle?.addEventListener("click", () => sidebar?.classList.toggle("open"));

// ==========================================================
// 1. DASHBOARD & STATISTIQUES DYNAMIQUES
// ==========================================================
async function loadDashboard() {
  try {
    const [pRes, sRes, uRes, dRes] = await Promise.all([
      fetch(API_PRODUITS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({})),
      fetch(API_SHOWROOMS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({})),
      fetch(API_UTILISATEURS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({})),
      fetch(API_DEVIS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({}))
    ]);

    document.getElementById("stat-produits").textContent = pRes.products?.length || pRes.data?.length || 0;
    document.getElementById("stat-showrooms").textContent = sRes.showrooms?.length || 0;
    document.getElementById("stat-utilisateurs").textContent = uRes.utilisateurs?.length || 0;
    document.getElementById("stat-devis").textContent = dRes.devis?.length || 0;
  } catch (err) {
    console.error("Erreur stats dashboard :", err);
  }
}

// ==========================================================
// 2. PRODUITS (CRUD)
// ==========================================================
async function loadProducts() {
  const tbody = document.querySelector("#productsTable tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" class="loading-state">Chargement des équipements...</td></tr>`;

  try {
    const res = await fetch(API_PRODUITS, { headers: apiHeaders() });
    const data = await res.json();
    cacheData.produits = data.products || data.data || [];

    if (!cacheData.produits.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Aucun produit en base de données.</td></tr>`;
      return;
    }

    tbody.innerHTML = cacheData.produits.map(p => `
      <tr>
        <td><strong>${escapeHtml(p.nom)}</strong>${p.reference ? `<br><small>Réf : ${escapeHtml(p.reference)}</small>` : ''}</td>
        <td>${escapeHtml(p.categorie || "—")}</td>
        <td><span class="status ${p.actif ? "active" : "draft"}">${p.actif ? "Publié" : "Désactivé"}</span></td>
        <td>${escapeHtml(p.marque || "—")} ${p.modele ? `(${escapeHtml(p.modele)})` : ""}</td>
        <td>
          <button class="table-action" onclick="openProductModal(${p.id})">Modifier</button>
          <button class="table-action danger" onclick="deleteProduct(${p.id})">Supprimer</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="error-state">Erreur de chargement.</td></tr>`;
  }
}

function openProductModal(id = null) {
  const p = id ? cacheData.produits.find(item => item.id === id) : null;

  modal.innerHTML = `
    <div class="admin-modal-overlay" onclick="closeModal()"></div>
    <div class="admin-modal-content">
      <div class="admin-modal-header">
        <h2>${p ? "Modifier le produit" : "Ajouter un produit"}</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <form id="productForm">
        <div class="form-grid">
          <label>Référence <input name="reference" value="${escapeHtml(p?.reference || '')}"></label>
          <label>Nom * <input name="nom" required value="${escapeHtml(p?.nom || '')}"></label>
          <label>Catégorie <input name="categorie" value="${escapeHtml(p?.categorie || '')}"></label>
          <label>Marque <input name="marque" value="${escapeHtml(p?.marque || '')}"></label>
          <label>Modèle <input name="modele" value="${escapeHtml(p?.modele || '')}"></label>
          <label>Prix (FCFA) * <input name="prix" type="number" required value="${p?.prix || 0}"></label>
        </div>
        <label>Description <textarea name="description">${escapeHtml(p?.description || '')}</textarea></label>
        <label>URL Image <input name="image_url" value="${escapeHtml(p?.image_url || '')}"></label>
        <div class="modal-actions">
          <button type="button" class="secondary-button" onclick="closeModal()">Annuler</button>
          <button type="submit" class="primary-button">Enregistrer</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add("open");

  document.getElementById("productForm").onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    payload.actif = true;

    const url = p ? `${API_PRODUITS}/${p.id}` : API_PRODUITS;
    const method = p ? "PUT" : "POST";

    await fetch(url, { method, headers: apiHeaders(), body: JSON.stringify(payload) });
    closeModal();
    loadProducts();
  };
}

async function deleteProduct(id) {
  if (!confirm("Confirmer la suppression de cet équipement ?")) return;
  await fetch(`${API_PRODUITS}/${id}`, { method: "DELETE", headers: apiHeaders() });
  loadProducts();
}

// ==========================================================
// 3. SHOWROOMS (LISTE & AJOUT)
// ==========================================================
async function loadShowrooms() {
  const container = document.getElementById("showroomsContainer");
  if (!container) return;
  container.innerHTML = `<p>Chargement des showrooms...</p>`;

  try {
    const res = await fetch(API_SHOWROOMS, { headers: apiHeaders() });
    const data = await res.json();
    cacheData.showrooms = data.showrooms || [];

    if (!cacheData.showrooms.length) {
      container.innerHTML = `<p>Aucun showroom enregistré.</p>`;
      return;
    }

    container.innerHTML = cacheData.showrooms.map(s => `
      <article class="showroom-admin-card">
        <div class="showroom-placeholder">${s.ville ? s.ville.substring(0, 2).toUpperCase() : 'SH'}</div>
        <div>
          <h3>${escapeHtml(s.nom)}</h3>
          <p>${escapeHtml(s.ville)} — ${escapeHtml(s.adresse || '')}</p>
          <small>Tél: ${escapeHtml(s.telephone || 'N/A')}</small>
        </div>
      </article>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p>Erreur lors du chargement des showrooms.</p>`;
  }
}

function openShowroomModal() {
  modal.innerHTML = `
    <div class="admin-modal-overlay" onclick="closeModal()"></div>
    <div class="admin-modal-content">
      <div class="admin-modal-header">
        <h2>Ajouter un Showroom</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <form id="showroomForm">
        <label>Nom du Showroom * <input name="nom" required></label>
        <label>Ville * <input name="ville" required></label>
        <label>Adresse * <input name="adresse" required></label>
        <label>Téléphone <input name="telephone"></label>
        <label>Email <input name="email" type="email"></label>
        <div class="modal-actions">
          <button type="button" class="secondary-button" onclick="closeModal()">Annuler</button>
          <button type="submit" class="primary-button">Créer</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add("open");

  document.getElementById("showroomForm").onsubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.actif = true;

    await fetch(API_SHOWROOMS, { method: "POST", headers: apiHeaders(), body: JSON.stringify(payload) });
    closeModal();
    loadShowrooms();
  };
}

// ==========================================================
// 4. ACTUALITÉS
// ==========================================================
async function loadActualites() {
  const container = document.getElementById("newsContainer");
  if (!container) return;
  container.innerHTML = `<p>Chargement des actualités...</p>`;

  try {
    const res = await fetch(API_ACTUALITES, { headers: apiHeaders() });
    const data = await res.json();
    cacheData.actualites = data.actualites || [];

    if (!cacheData.actualites.length) {
      container.innerHTML = `<p>Aucune actualité publiée.</p>`;
      return;
    }

    container.innerHTML = cacheData.actualites.map(a => `
      <article class="content-card">
        <span class="news-date">${new Date(a.date_publication || Date.now()).toLocaleDateString()}</span>
        <h3>${escapeHtml(a.titre)}</h3>
        <p>${escapeHtml(a.extrait)}</p>
        <span class="status active">${escapeHtml(a.categorie)}</span>
      </article>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p>Erreur chargement actualités.</p>`;
  }
}

// ==========================================================
// 5. UTILISATEURS
// ==========================================================
async function loadUtilisateurs() {
  const tbody = document.querySelector("#usersTable tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" class="loading-state">Chargement des utilisateurs...</td></tr>`;

  try {
    const res = await fetch(API_UTILISATEURS, { headers: apiHeaders() });
    const data = await res.json();
    cacheData.utilisateurs = data.utilisateurs || [];

    if (!cacheData.utilisateurs.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Aucun utilisateur enregistré.</td></tr>`;
      return;
    }

    tbody.innerHTML = cacheData.utilisateurs.map(u => `
      <tr>
        <td><strong>${escapeHtml(u.nom)}</strong></td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.telephone || "—")}</td>
        <td><span class="role admin">${Array.isArray(u.roles) ? escapeHtml(u.roles.join(", ")) : "Utilisateur"}</span></td>
        <td><button class="table-action">Gérer</button></td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="error-state">Erreur chargement utilisateurs.</td></tr>`;
  }
}

// ==========================================================
// 6. DEMANDES DE DEVIS
// ==========================================================
async function loadDevis() {
  const tbody = document.querySelector("#devisTable tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" class="loading-state">Chargement des devis...</td></tr>`;

  try {
    const res = await fetch(API_DEVIS, { headers: apiHeaders() });
    const data = await res.json();
    cacheData.devis = data.devis || [];

    if (!cacheData.devis.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Aucune demande reçue.</td></tr>`;
      return;
    }

    tbody.innerHTML = cacheData.devis.map(d => `
      <tr>
        <td><strong>${escapeHtml(d.nom)} ${escapeHtml(d.prenom || "")}</strong><br><small>${escapeHtml(d.structure || "Particulier")}</small></td>
        <td>${escapeHtml(d.email)}<br><small>${escapeHtml(d.telephone)}</small></td>
        <td>${escapeHtml(d.produit_nom || "Demande globale")}</td>
        <td>${escapeHtml(d.ville || "N/A")}</td>
        <td><span class="status ${d.statut === 'Traité' ? 'active' : 'draft'}">${escapeHtml(d.statut || "Nouveau")}</span></td>
        <td><button class="table-action" onclick="updateDevisStatut(${d.id}, 'Traité')">Marquer Traité</button></td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="error-state">Erreur chargement devis.</td></tr>`;
  }
}

async function updateDevisStatut(id, statut) {
  await fetch(`${API_DEVIS}/${id}/statut`, {
    method: "PUT",
    headers: apiHeaders(),
    body: JSON.stringify({ statut })
  });
  loadDevis();
}

// ==========================================================
// 7. CONTRATS DE MAINTENANCE
// ==========================================================
async function loadContrats() {
  const tbody = document.querySelector("#contratsTable tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" class="loading-state">Chargement des contrats...</td></tr>`;

  try {
    const res = await fetch(API_CONTRATS, { headers: apiHeaders() });
    const data = await res.json();
    cacheData.contrats = data.contrats || [];

    if (!cacheData.contrats.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Aucun contrat actif.</td></tr>`;
      return;
    }

    tbody.innerHTML = cacheData.contrats.map(c => `
      <tr>
        <td><strong>${escapeHtml(c.client_nom)}</strong><br><small>${escapeHtml(c.client_telephone)}</small></td>
        <td>${escapeHtml(c.equipement)}</td>
        <td>${escapeHtml(c.type_contrat)}</td>
        <td>Du ${new Date(c.date_debut).toLocaleDateString()} au ${new Date(c.date_fin).toLocaleDateString()}</td>
        <td><span class="status ${c.statut === 'Actif' ? 'active' : 'draft'}">${escapeHtml(c.statut)}</span></td>
        <td><button class="table-action danger" onclick="updateContratStatut(${c.id}, 'Terminé')">Terminer</button></td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="error-state">Erreur chargement contrats.</td></tr>`;
  }
}

async function updateContratStatut(id, statut) {
  await fetch(`${API_CONTRATS}/${id}`, {
    method: "PUT",
    headers: apiHeaders(),
    body: JSON.stringify({ statut })
  });
  loadContrats();
}

function openContratModal() {
  modal.innerHTML = `
    <div class="admin-modal-overlay" onclick="closeModal()"></div>
    <div class="admin-modal-content">
      <div class="admin-modal-header">
        <h2>Créer un Contrat de Maintenance</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <form id="contratForm">
        <label>Client / Établissement * <input name="client_nom" required></label>
        <label>Téléphone client * <input name="client_telephone" required></label>
        <label>Équipement sous contrat * <input name="equipement" required></label>
        <label>Type de Contrat *
          <select name="type_contrat" required>
            <option value="Préventif">Préventif</option>
            <option value="Curatif">Curatif</option>
            <option value="Intégral">Intégral (Préventif + Curatif)</option>
          </select>
        </label>
        <div class="form-grid">
          <label>Date Début * <input name="date_debut" type="date" required></label>
          <label>Date Fin * <input name="date_fin" type="date" required></label>
        </div>
        <div class="modal-actions">
          <button type="button" class="secondary-button" onclick="closeModal()">Annuler</button>
          <button type="submit" class="primary-button">Créer le contrat</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add("open");

  document.getElementById("contratForm").onsubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.statut = "Actif";

    await fetch(API_CONTRATS, { method: "POST", headers: apiHeaders(), body: JSON.stringify(payload) });
    closeModal();
    loadContrats();
  };
}

// ==========================================================
// INITIALISATION DES BOUTONS
// ==========================================================
document.addEventListener("click", e => {
  if (e.target.closest("#btnAddProduct")) openProductModal();
  if (e.target.closest("#btnAddShowroom")) openShowroomModal();
  if (e.target.closest("#btnAddContrat")) openContratModal();
});

logoutButton?.addEventListener("click", () => {
  if (confirm("Se déconnecter de l'administration ?")) {
    if (window.Auth) window.Auth.logout();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
});
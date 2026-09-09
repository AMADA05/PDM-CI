// Détecte automatiquement si on est sur GitHub Pages ou en local
const BASE_PATH = window.location.pathname.includes('/PDM-CI/') ? '/PDM-CI' : '';

// Exemple de redirection pour déconnexion ou expulsion :
function deconnexion() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = `${BASE_PATH}/index.html`;
}
/* ==========================================================
   PDM-CI — ADMINISTRATION
   CONNEXION COMPLÈTE BASE DE DONNÉES POSTGRESQL & API
========================================================== */
const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:5000"
  : "https://pdm-ci.onrender.com";

const API_BASE = `${API_BASE_URL}/api/produits`;
const TOKEN_KEY = "pdm_token";

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".admin-section");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");
const sidebar = document.getElementById("adminSidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const logoutButton = document.getElementById("logoutButton");
const modal = document.getElementById("adminModal");
const productsTable = document.getElementById("productsTable");
const productsBody = productsTable?.querySelector("tbody");
const productSearch = document.querySelector('[data-table-search="productsTable"]');
const categoryFilter = document.querySelector("#section-produits .filter-select");

const sectionInfo = {
  dashboard: { title: "Tableau de bord", subtitle: "Vue générale de l'activité PDM CI" },
  produits: { title: "Produits", subtitle: "Gestion du catalogue des équipements" },
  showrooms: { title: "Showrooms", subtitle: "Gestion des points de vente MEDEQUIP CI" },
  services: { title: "Services", subtitle: "Gestion des services proposés par MEDEQUIP CI" },
  actualites: { title: "Actualités", subtitle: "Gestion des informations publiées sur PDM CI" },
  utilisateurs: { title: "Utilisateurs", subtitle: "Gestion des comptes et des rôles" },
  devis: { title: "Demandes de devis", subtitle: "Suivi des demandes commerciales reçues" }
};

let products = [];
let editingProductId = null;

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function apiHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function showSection(sectionName) {
  navItems.forEach(item => item.classList.toggle("active", item.dataset.section === sectionName));
  sections.forEach(section => section.classList.toggle("active", section.id === `section-${sectionName}`));

  const info = sectionInfo[sectionName];
  if (info) {
    if (pageTitle) pageTitle.textContent = info.title;
    if (pageSubtitle) pageSubtitle.textContent = info.subtitle;
  }
  sidebar?.classList.remove("open");

  if (sectionName === "produits") loadProducts();
}

navItems.forEach(item => item.addEventListener("click", () => showSection(item.dataset.section)));
sidebarToggle?.addEventListener("click", () => sidebar?.classList.toggle("open"));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderProducts(list = products) {
  if (!productsBody) return;

  if (!list.length) {
    productsBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">Aucun produit trouvé dans la base de données.</td>
      </tr>`;
    return;
  }

  productsBody.innerHTML = list.map(product => `
    <tr data-product-id="${product.id}">
      <td>
        <strong>${escapeHtml(product.nom)}</strong>
        ${product.reference ? `<small class="product-reference">Réf : ${escapeHtml(product.reference)}</small>` : ""}
      </td>
      <td>${escapeHtml(product.categorie || "—")}</td>
      <td>
        <span class="status ${product.actif ? "active" : "draft"}">
          ${product.actif ? "Publié" : "Désactivé"}
        </span>
      </td>
      <td>${escapeHtml(product.marque || "—")} ${product.modele ? `— ${escapeHtml(product.modele)}` : ""}</td>
      <td>
        <button class="table-action" type="button" data-edit-product="${product.id}">Modifier</button>
        <button class="table-action danger" type="button" data-delete-product="${product.id}">Supprimer</button>
      </td>
    </tr>`).join("");
}

async function loadProducts() {
  if (!productsBody) return;
  productsBody.innerHTML = `<tr><td colspan="5" class="loading-state">Chargement des équipements depuis PostgreSQL...</td></tr>`;

  try {
    const response = await fetch(API_BASE, { headers: apiHeaders() });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      throw new Error(data.message || "Accès refusé. Veuillez vous reconnecter.");
    }
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Erreur de chargement des données.");
    }

    products = Array.isArray(data.products) ? data.products : (Array.isArray(data.data) ? data.data : []);
    renderProducts(products);
    updateProductCount();
  } catch (error) {
    console.error("PDM-CI — Erreur chargement produits :", error);
    productsBody.innerHTML = `<tr><td colspan="5" class="error-state">${escapeHtml(error.message)}</td></tr>`;
  }
}

function updateProductCount() {
  const cards = document.querySelectorAll(".stat-card");
  cards.forEach(card => {
    const label = card.querySelector("span");
    const value = card.querySelector("strong");
    if (label?.textContent.trim() === "Produits" && value) value.textContent = products.length;
  });
}

function applyProductFilters() {
  const search = (productSearch?.value || "").toLowerCase().trim();
  const category = (categoryFilter?.value || "Toutes les catégories").trim();

  const filtered = products.filter(product => {
    const searchable = [product.reference, product.nom, product.description, product.categorie, product.marque, product.modele]
      .filter(Boolean).join(" ").toLowerCase();
    const categoryOk = category === "Toutes les catégories" || product.categorie === category;
    return searchable.includes(search) && categoryOk;
  });

  renderProducts(filtered);
}

productSearch?.addEventListener("input", applyProductFilters);
categoryFilter?.addEventListener("change", applyProductFilters);

function openProductModal(product = null) {
  editingProductId = product ? product.id : null;

  modal.innerHTML = `
    <div class="admin-modal-overlay" data-close-modal></div>
    <div class="admin-modal-content" role="dialog" aria-modal="true" aria-labelledby="productModalTitle">
      <div class="admin-modal-header">
        <div>
          <span class="modal-eyebrow">MEDEQUIP-CI · BASE DE DONNÉES</span>
          <h2 id="productModalTitle">${product ? "Modifier le produit" : "Ajouter un produit"}</h2>
        </div>
        <button type="button" class="modal-close" aria-label="Fermer" data-close-modal>×</button>
      </div>

      <form id="productForm" class="product-form">
        <div class="form-grid">
          <label>Référence
            <input name="reference" maxlength="100" value="${escapeHtml(product?.reference || "")}" placeholder="Ex. MED-001">
          </label>
          <label>Nom du produit <span>*</span>
            <input name="nom" maxlength="200" required value="${escapeHtml(product?.nom || "")}" placeholder="Ex. Automate de biochimie">
          </label>
          <label>Catégorie
            <input name="categorie" maxlength="150" value="${escapeHtml(product?.categorie || "")}" placeholder="Laboratoire, Diagnostic...">
          </label>
          <label>Marque
            <input name="marque" maxlength="150" value="${escapeHtml(product?.marque || "")}" placeholder="Fabricant">
          </label>
          <label>Modèle
            <input name="modele" maxlength="150" value="${escapeHtml(product?.modele || "")}" placeholder="Modèle">
          </label>
          <label>Prix (FCFA) <span>*</span>
            <input name="prix" type="number" min="0" step="0.01" required value="${escapeHtml(product?.prix ?? 0)}">
          </label>
        </div>

        <label>Description
          <textarea name="description" rows="4" placeholder="Description technique...">${escapeHtml(product?.description || "")}</textarea>
        </label>

        <label>URL de l'image
          <input name="image_url" type="url" value="${escapeHtml(product?.image_url || "")}" placeholder="https://...">
        </label>

        <label class="form-checkbox">
          <input name="actif" type="checkbox" ${product?.actif !== false ? "checked" : ""}>
          <span>Publier l'équipement sur le catalogue</span>
        </label>

        <div id="productFormMessage" class="form-message" aria-live="polite"></div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" data-close-modal>Annuler</button>
          <button type="submit" class="primary-button" id="productSubmit">${product ? "Enregistrer les modifications" : "Ajouter le produit"}</button>
        </div>
      </form>
    </div>`;

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modal.querySelector('[name="nom"]')?.focus();

  modal.querySelectorAll("[data-close-modal]").forEach(element => {
    element.addEventListener("click", closeModal);
  });
  modal.querySelector("#productForm")?.addEventListener("submit", submitProductForm);
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = "";
  document.body.classList.remove("modal-open");
  editingProductId = null;
}

async function submitProductForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = document.getElementById("productSubmit");
  const message = document.getElementById("productFormMessage");
  const formData = new FormData(form);

  const payload = {
    reference: formData.get("reference"),
    nom: formData.get("nom"),
    description: formData.get("description"),
    categorie: formData.get("categorie"),
    marque: formData.get("marque"),
    modele: formData.get("modele"),
    prix: formData.get("prix"),
    actif: formData.get("actif") === "on",
    image_url: formData.get("image_url")
  };

  button.disabled = true;
  message.className = "form-message";
  message.textContent = "Mise à jour de la base de données...";

  try {
    const url = editingProductId ? `${API_BASE}/${editingProductId}` : API_BASE;
    const method = editingProductId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: apiHeaders(),
      body: JSON.stringify(payload)
    });

// ==========================================================
// AJOUT : CHARGEMENT DES DEVIS ET CONTRATS
// ==========================================================

// URLs API
const API_DEVIS = `${API_BASE_URL}/api/devis`;
const API_CONTRATS = `${API_BASE_URL}/api/contrats`;

// Extension de la fonction showSection pour charger les nouvelles sections
const originalShowSection = showSection;
showSection = function(sectionName) {
  originalShowSection(sectionName);

  if (sectionName === "devis") loadDevis();
  if (sectionName === "contrats") loadContrats();
};

// ----------------------------------------------------------
// 1. GESTION DES DEMANDES DE DEVIS
// ----------------------------------------------------------
async function loadDevis() {
  const devisBody = document.querySelector("#section-devis tbody");
  if (!devisBody) return;

  devisBody.innerHTML = `<tr><td colspan="6" class="loading-state">Chargement des demandes de devis depuis PostgreSQL...</td></tr>`;

  try {
    const response = await fetch(API_DEVIS, { headers: apiHeaders() });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Erreur de chargement des devis.");
    }

    renderDevis(data.devis || []);
  } catch (error) {
    console.error("Erreur chargement devis :", error);
    devisBody.innerHTML = `<tr><td colspan="6" class="error-state">${escapeHtml(error.message)}</td></tr>`;
  }
}

function renderDevis(list) {
  const devisBody = document.querySelector("#section-devis tbody");
  if (!devisBody) return;

  if (!list.length) {
    devisBody.innerHTML = `<tr><td colspan="6" class="empty-state">Aucune demande de devis enregistrée.</td></tr>`;
    return;
  }

  devisBody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.nom)} ${escapeHtml(item.prenom || "")}</strong><br><small>${escapeHtml(item.structure || "Particulier")}</small></td>
      <td>${escapeHtml(item.email)}<br><small>${escapeHtml(item.telephone)}</small></td>
      <td>${escapeHtml(item.produit_nom || "Demande générale")}</td>
      <td>${escapeHtml(item.ville || "Non précisée")}</td>
      <td><span class="status ${item.statut === 'Traité' ? 'active' : 'draft'}">${escapeHtml(item.statut || "Nouveau")}</span></td>
      <td>
        <button class="table-action" onclick="updateDevisStatut(${item.id}, 'Traité')">Marquer Traité</button>
      </td>
    </tr>
  `).join("");
}

async function updateDevisStatut(id, nouveauStatut) {
  try {
    const response = await fetch(`${API_DEVIS}/${id}/statut`, {
      method: "PUT",
      headers: apiHeaders(),
      body: JSON.stringify({ statut: nouveauStatut })
    });
    const data = await response.json();
    if (data.success) {
      loadDevis();
    }
  } catch (error) {
    alert("Impossible de mettre à jour le statut du devis.");
  }
}

// ----------------------------------------------------------
// 2. GESTION DES CONTRATS DE MAINTENANCE
// ----------------------------------------------------------
async function loadContrats() {
  const contratsBody = document.querySelector("#section-contrats tbody");
  if (!contratsBody) return;

  contratsBody.innerHTML = `<tr><td colspan="6" class="loading-state">Chargement des contrats de maintenance...</td></tr>`;

  try {
    const response = await fetch(API_CONTRATS, { headers: apiHeaders() });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Erreur de chargement des contrats.");
    }

    renderContrats(data.contrats || []);
  } catch (error) {
    console.error("Erreur chargement contrats :", error);
    contratsBody.innerHTML = `<tr><td colspan="6" class="error-state">${escapeHtml(error.message)}</td></tr>`;
  }
}

function renderContrats(list) {
  const contratsBody = document.querySelector("#section-contrats tbody");
  if (!contratsBody) return;

  if (!list.length) {
    contratsBody.innerHTML = `<tr><td colspan="6" class="empty-state">Aucun contrat de maintenance actif.</td></tr>`;
    return;
  }

  contratsBody.innerHTML = list.map(c => `
    <tr>
      <td><strong>${escapeHtml(c.client_nom)}</strong><br><small>${escapeHtml(c.client_telephone)}</small></td>
      <td>${escapeHtml(c.equipement)}</td>
      <td>${escapeHtml(c.type_contrat)}</td>
      <td>Du ${new Date(c.date_debut).toLocaleDateString()} au ${new Date(c.date_fin).toLocaleDateString()}</td>
      <td><span class="status ${c.statut === 'Actif' ? 'active' : 'draft'}">${escapeHtml(c.statut)}</span></td>
      <td>
        <button class="table-action danger" onclick="resilierContrat(${c.id})">Terminer</button>
      </td>
    </tr>
  `).join("");
}

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Opération impossible.");
    }

    closeModal();
    await loadProducts();
  } catch (error) {
    console.error("PDM-CI — Erreur modification produit :", error);
    message.className = "form-message error";
    message.textContent = error.message;
    button.disabled = false;
  }
}

document.addEventListener("click", async event => {
  const addButton = event.target.closest("#section-produits .primary-button");
  if (addButton) {
    openProductModal();
    return;
  }

  const editButton = event.target.closest("[data-edit-product]");
  if (editButton) {
    const product = products.find(item => String(item.id) === String(editButton.dataset.editProduct));
    if (product) openProductModal(product);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-product]");
  if (deleteButton) {
    await deleteProduct(Number(deleteButton.dataset.deleteProduct));
  }
});

async function deleteProduct(id) {
  const product = products.find(item => Number(item.id) === id);
  if (!product) return;

  if (!confirm(`Confirmez-vous la suppression de l'équipement « ${product.nom} » de la base PostgreSQL ?`)) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: apiHeaders()
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) throw new Error(data.message || "Impossible de supprimer cet équipement.");
    await loadProducts();
  } catch (error) {
    console.error("PDM-CI — Erreur suppression produit :", error);
    alert(error.message);
  }
}

logoutButton?.addEventListener("click", () => {
  if (!confirm("Voulez-vous vraiment vous déconnecter ?")) return;
  if (window.Auth) {
    window.Auth.logout();
  } else {
    localStorage.removeItem("pdm_token");
    localStorage.removeItem("pdm_user");
    window.location.href = "authentification.html";
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => loadProducts());
} else {
  loadProducts();
}
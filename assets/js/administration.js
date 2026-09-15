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
const API_CLIENTS = `${API_BASE_URL}/api/clients`;
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
  produits: { title: "Produits & Catalogues", subtitle: "Gestion et attribution des équipements" },
  showrooms: { title: "Showrooms & Gestionnaires", subtitle: "Gestion des boutiques et comptes gestionnaires" },
  clients: { title: "Clients & Équipements", subtitle: "Gestion des clients et de leurs appareils installés" },
  services: { title: "Services", subtitle: "Gestion des services proposés par MEDEQUIP CI" },
  actualites: { title: "Actualités", subtitle: "Gestion des informations publiées sur PDM CI" },
  utilisateurs: { title: "Utilisateurs & Accès", subtitle: "Gestion globale des comptes et rôles" },
  devis: { title: "Demandes de devis & Commandes", subtitle: "Suivi centralisé des devis et commandes" },
  contrats: { title: "Contrats de Maintenance", subtitle: "Attribution des contrats sur le matériel client" }
};

let cacheData = { produits: [], showrooms: [], clients: [], actualites: [], utilisateurs: [], devis: [], contrats: [] };

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

// Navigation
function showSection(sectionName) {
  navItems.forEach(item => item.classList.toggle("active", item.dataset.section === sectionName));
  sections.forEach(section => section.classList.toggle("active", section.id === `section-${sectionName}`));

  const info = sectionInfo[sectionName];
  if (info) {
    if (pageTitle) pageTitle.textContent = info.title;
    if (pageSubtitle) pageSubtitle.textContent = info.subtitle;
  }
  sidebar?.classList.remove("open");

  if (sectionName === "dashboard") loadDashboard();
  if (sectionName === "produits") loadProducts();
  if (sectionName === "showrooms") loadShowrooms();
  if (sectionName === "clients") loadClients();
  if (sectionName === "actualites") loadActualites();
  if (sectionName === "utilisateurs") loadUtilisateurs();
  if (sectionName === "devis") loadDevis();
  if (sectionName === "contrats") loadContrats();
}

navItems.forEach(item => item.addEventListener("click", () => showSection(item.dataset.section)));
sidebarToggle?.addEventListener("click", () => sidebar?.classList.toggle("open"));

// ==========================================================
// 1. DASHBOARD
// ==========================================================
async function loadDashboard() {
  try {
    const [pRes, sRes, uRes, dRes, cRes] = await Promise.all([
      fetch(API_PRODUITS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({})),
      fetch(API_SHOWROOMS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({})),
      fetch(API_UTILISATEURS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({})),
      fetch(API_DEVIS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({})),
      fetch(API_CLIENTS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({}))
    ]);

    document.getElementById("stat-produits").textContent = pRes.products?.length || pRes.data?.length || 0;
    document.getElementById("stat-showrooms").textContent = sRes.showrooms?.length || 0;
    document.getElementById("stat-utilisateurs").textContent = uRes.utilisateurs?.length || 0;
    document.getElementById("stat-devis").textContent = dRes.devis?.length || 0;
    const clientStat = document.getElementById("stat-clients");
    if (clientStat) clientStat.textContent = cRes.clients?.length || 0;
  } catch (err) {
    console.error("Erreur stats dashboard :", err);
  }
}

// ==========================================================
// 2. PRODUITS (CRUD + ATTRIBUTION)
// ==========================================================
async function loadProducts() {
  const tbody = document.querySelector("#productsTable tbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Chargement des produits...</td></tr>`;

  try {
    const response = await fetch(API_PRODUITS, { headers: apiHeaders() });
    if (!response.ok) throw new Error("Erreur lors de la récupération des produits");

    const data = await response.json();
    const products = Array.isArray(data) ? data : (data.products || data.data || []);
    cacheData.produits = products;

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Aucun produit trouvé.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(product => `
      <tr>
        <td><strong>${escapeHtml(product.reference || 'N/A')}</strong></td>
        <td>${escapeHtml(product.nom || product.name || 'Sans nom')}</td>
        <td>${escapeHtml(product.categorie || product.category || 'Général')}</td>
        <td>${product.prix ? Number(product.prix).toLocaleString('fr-FR') + ' FCFA' : 'Sur devis'}</td>
        <td><span class="status ${product.statut === 'disponible' ? 'active' : 'draft'}">${escapeHtml(product.statut || 'En stock')}</span></td>
        <td class="table-actions">
          <button class="table-action" onclick="openAssignModal('${product.id}')">↗ Attribuer</button>
          <button class="table-action" onclick="openProductModal('${product.id}')">✏️</button>
          <button class="table-action danger" onclick="deleteProduct('${product.id}')">🗑️</button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    console.error("Erreur loadProducts:", error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Erreur de chargement des produits.</td></tr>`;
  }
}

function openProductModal(id = null) {
  const p = id ? cacheData.produits.find(item => String(item.id) === String(id)) : null;

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
          <label>Nom * <input name="nom" required value="${escapeHtml(p?.nom || p?.name || '')}"></label>
          <label>Catégorie <input name="categorie" value="${escapeHtml(p?.categorie || p?.category || '')}"></label>
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
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.actif = true;

    const url = p ? `${API_PRODUITS}/${p.id}` : API_PRODUITS;
    const method = p ? "PUT" : "POST";

    await fetch(url, { method, headers: apiHeaders(), body: JSON.stringify(payload) });
    closeModal();
    loadProducts();
  };
}

async function openAssignModal(productId) {
  const product = cacheData.produits.find(p => String(p.id) === String(productId));
  if (!product) return;

  // Charger les showrooms et clients
  const [sRes, cRes] = await Promise.all([
    fetch(API_SHOWROOMS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({ showrooms: [] })),
    fetch(API_CLIENTS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({ clients: [] }))
  ]);

  const showrooms = sRes.showrooms || [];
  const clients = cRes.clients || [];

  modal.innerHTML = `
    <div class="admin-modal-overlay" onclick="closeModal()"></div>
    <div class="admin-modal-content">
      <div class="admin-modal-header">
        <h2>Attribuer : ${escapeHtml(product.nom || product.name)}</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <form id="assignForm">
        <label>Type d'attribution *
          <select id="assignType" name="type_attribution" required onchange="toggleAssignSelects(this.value)">
            <option value="showroom">À un Showroom (Stock boutique)</option>
            <option value="client">À un Client / Laboratoire (Équipement installé)</option>
          </select>
        </label>

        <div id="showroomSelectGroup">
          <label>Sélectionner le Showroom *
            <select name="showroom_id">
              ${showrooms.map(s => `<option value="${s.id}">${escapeHtml(s.nom)} (${escapeHtml(s.ville)})</option>`).join("")}
            </select>
          </label>
        </div>

        <div id="clientSelectGroup" style="display:none;">
          <label>Sélectionner le Client / Établissement *
            <select name="client_id">
              ${clients.map(c => `<option value="${c.id}">${escapeHtml(c.nom)} - ${escapeHtml(c.ville || '')}</option>`).join("")}
            </select>
          </label>
          <label>Numéro de Série de l'appareil *
            <input name="numero_serie" placeholder="Ex: SN-99823-X">
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" onclick="closeModal()">Annuler</button>
          <button type="submit" class="primary-button">Confirmer l'attribution</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add("open");

  document.getElementById("assignForm").onsubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.produit_id = productId;

    const endpoint = payload.type_attribution === "showroom" 
      ? `${API_SHOWROOMS}/attribuer-produit` 
      : `${API_CLIENTS}/attribuer-equipement`;

    await fetch(endpoint, { method: "POST", headers: apiHeaders(), body: JSON.stringify(payload) });
    alert("Attribution enregistrée avec succès !");
    closeModal();
  };
}

function toggleAssignSelects(val) {
  document.getElementById("showroomSelectGroup").style.display = (val === "showroom") ? "block" : "none";
  document.getElementById("clientSelectGroup").style.display = (val === "client") ? "block" : "none";
}

async function deleteProduct(id) {
  if (!confirm("Confirmer la suppression de cet équipement ?")) return;
  await fetch(`${API_PRODUITS}/${id}`, { method: "DELETE", headers: apiHeaders() });
  loadProducts();
}

// ==========================================================
// 3. SHOWROOMS (BOUTIQUE + CRÉATION GESTIONNAIRE)
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
          <p><strong>Gestionnaire:</strong> ${escapeHtml(s.nom_gestionnaire || 'Non assigné')}</p>
          <p>${escapeHtml(s.ville)} — ${escapeHtml(s.adresse || '')}</p>
          <small>Tél: ${escapeHtml(s.telephone || 'N/A')} | Email: ${escapeHtml(s.email || 'N/A')}</small>
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
        <h2>Créer un Showroom & Compte Gestionnaire</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <form id="showroomForm">
        <div class="form-grid">
          <label>Nom du Showroom * <input name="nom" required placeholder="Ex: Showroom Abidjan Sud"></label>
          <label>Ville * <input name="ville" required placeholder="Ex: Abidjan"></label>
          <label>Nom complet du Gestionnaire * <input name="nom_gestionnaire" required placeholder="Ex: Jean Marc"></label>
          <label>Téléphone du Gestionnaire * <input name="telephone" required placeholder="+225 07..."></label>
          <label>Email du Showroom (Login) * <input name="email" type="email" required placeholder="showroom.sud@medequip.ci"></label>
          <label>Mot de passe de connexion * <input name="password" type="password" required></label>
        </div>
        <label>Adresse physique du Showroom * <input name="adresse" required placeholder="Ex: Zone 4, Rue des Brasseries"></label>
        <div class="modal-actions">
          <button type="button" class="secondary-button" onclick="closeModal()">Annuler</button>
          <button type="submit" class="primary-button">Créer le Showroom</button>
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
// 4. CLIENTS & ÉQUIPEMENTS CLIENTS
// ==========================================================
async function loadClients() {
  const tbody = document.querySelector("#clientsTable tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" class="loading-state">Chargement des clients...</td></tr>`;

  try {
    const res = await fetch(API_CLIENTS, { headers: apiHeaders() });
    const data = await res.json();
    cacheData.clients = data.clients || [];

    if (!cacheData.clients.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Aucun client enregistré.</td></tr>`;
      return;
    }

    tbody.innerHTML = cacheData.clients.map(c => `
      <tr>
        <td><strong>${escapeHtml(c.nom)}</strong><br><small>${escapeHtml(c.type_etablissement || 'Hôpital / Labo')}</small></td>
        <td>${escapeHtml(c.telephone || 'N/A')}<br><small>${escapeHtml(c.ville || '')}</small></td>
        <td>${escapeHtml(c.email)}</td>
        <td><span class="badge active">${c.nb_equipements || 0} appareil(s)</span></td>
        <td>
          <button class="table-action" onclick="openClientEquipmentsModal(${c.id})">⚙️ Appareils</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="error-state">Erreur lors du chargement des clients.</td></tr>`;
  }
}

function openClientModal() {
  modal.innerHTML = `
    <div class="admin-modal-overlay" onclick="closeModal()"></div>
    <div class="admin-modal-content">
      <div class="admin-modal-header">
        <h2>Ajouter un Client (Hôpital / Laboratoire)</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <form id="clientForm">
        <div class="form-grid">
          <label>Nom de l'établissement * <input name="nom" required placeholder="Ex: Laboratoire CHU Bouaké"></label>
          <label>Type d'établissement <input name="type_etablissement" placeholder="Ex: Hôpital Général"></label>
          <label>Téléphone de contact * <input name="telephone" required></label>
          <label>Ville * <input name="ville" required></label>
          <label>Email (Login du client) * <input name="email" type="email" required></label>
          <label>Mot de passe initial * <input name="password" type="password" required></label>
        </div>
        <div class="modal-actions">
          <button type="button" class="secondary-button" onclick="closeModal()">Annuler</button>
          <button type="submit" class="primary-button">Créer le client</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.add("open");

  document.getElementById("clientForm").onsubmit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.target).entries());

    await fetch(API_CLIENTS, { method: "POST", headers: apiHeaders(), body: JSON.stringify(payload) });
    closeModal();
    loadClients();
  };
}

async function openClientEquipmentsModal(clientId) {
  const res = await fetch(`${API_CLIENTS}/${clientId}/equipements`, { headers: apiHeaders() });
  const data = await res.json();
  const equipements = data.equipements || [];

  modal.innerHTML = `
    <div class="admin-modal-overlay" onclick="closeModal()"></div>
    <div class="admin-modal-content">
      <div class="admin-modal-header">
        <h2>Appareils installés chez le client</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <div style="padding: 20px;">
        ${equipements.length === 0 ? '<p>Aucun appareil attribué à ce client.</p>' : `
          <ul style="list-style:none; display:flex; flex-direction:column; gap:10px;">
            ${equipements.map(eq => `
              <li style="padding:10px; border:1px solid #e5e7eb; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong>${escapeHtml(eq.nom_produit)}</strong><br>
                  <small>N° Série: ${escapeHtml(eq.numero_serie || 'N/A')} | Ajouté le: ${new Date(eq.date_attribution).toLocaleDateString()}</small>
                </div>
              </li>
            `).join('')}
          </ul>
        `}
      </div>
      <div class="modal-actions" style="padding:15px;">
        <button type="button" class="secondary-button" onclick="closeModal()">Fermer</button>
      </div>
    </div>
  `;
  modal.classList.add("open");
}

// ==========================================================
// 5. ACTUALITÉS
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
// 6. UTILISATEURS
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
        <td><span class="role admin">${Array.isArray(u.roles) ? escapeHtml(u.roles.join(", ")) : escapeHtml(u.role || "Utilisateur")}</span></td>
        <td><button class="table-action">Gérer</button></td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="error-state">Erreur chargement utilisateurs.</td></tr>`;
  }
}

// ==========================================================
// 7. DEMANDES DE DEVIS
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
// 8. CONTRATS DE MAINTENANCE
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
        <td><strong>${escapeHtml(c.client_nom)}</strong><br><small>${escapeHtml(c.client_telephone || '')}</small></td>
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

async function openContratModal() {
  const cRes = await fetch(API_CLIENTS, { headers: apiHeaders() }).then(r => r.json()).catch(() => ({ clients: [] }));
  const clients = cRes.clients || [];

  modal.innerHTML = `
    <div class="admin-modal-overlay" onclick="closeModal()"></div>
    <div class="admin-modal-content">
      <div class="admin-modal-header">
        <h2>Créer un Contrat de Maintenance</h2>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
      <form id="contratForm">
        <label>Client / Établissement *
          <select name="client_id" required id="contratClientSelect">
            <option value="">Sélectionner un client...</option>
            ${clients.map(c => `<option value="${c.id}">${escapeHtml(c.nom)}</option>`).join('')}
          </select>
        </label>
        <label>Équipement sous contrat * <input name="equipement" required placeholder="Ex: Automate d'hématologie Sysmex"></label>
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

    const selectedClient = clients.find(c => String(c.id) === String(payload.client_id));
    if (selectedClient) payload.client_nom = selectedClient.nom;

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
  if (e.target.closest("#btnAddClient")) openClientModal();
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
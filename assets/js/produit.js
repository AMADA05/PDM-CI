// Détecte automatiquement si on est sur GitHub Pages ou en local
const BASE_PATH = window.location.pathname.includes('/PDM-CI/') ? '/PDM-CI' : '';

// Exemple de redirection pour déconnexion ou expulsion :
function deconnexion() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = `${BASE_PATH}/index.html`;
}
/* ============================================================
   PDM CI — PRODUIT
   Logique spécifique à cette page — données fictives Phase 1.
   ============================================================ */
import {catalogueProduits} from "./catalogue-data.js";
const box=document.getElementById("product-detail-content"),id=new URLSearchParams(location.search).get("id"),p=catalogueProduits.find(x=>x.id===id);
box.innerHTML=p?`<div class="product-detail-grid"><div class="product-detail-image"><img src="${p.image}" alt="${p.nom}"></div><div><small>${p.reference}</small><span class="product-detail-category">${p.categorieNom}</span><h1>${p.nom}</h1><p class="product-detail-description">${p.description}</p><div class="product-specs"><div><strong>Marque</strong><span>${p.marque||"MEDEQUIP"}</span></div><div><strong>Référence</strong><span>${p.reference}</span></div><div><strong>Catégorie</strong><span>${p.categorieNom}</span></div></div><a class="btn-primary" href="demande-devis.html?produit=${p.id}">Demander un devis</a></div></div>`:`<div class="empty-state"><h1>Produit introuvable</h1><a class="btn-primary" href="catalogue.html">Retour au catalogue</a></div>`;

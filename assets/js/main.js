// Détecte automatiquement si on est sur GitHub Pages ou en local
const BASE_PATH = window.location.pathname.includes('/PDM-CI/') ? '/PDM-CI' : '';

// Exemple de redirection pour déconnexion ou expulsion :
function deconnexion() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = `${BASE_PATH}/index.html`;
}
// Charger la liste des produits depuis l'API PostgreSQL
async function chargerProduits() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/produits`, {
      headers: CONFIG.HEADERS
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const produits = await response.json();
    console.log("Produits récupérés de la base de données :", produits);

    // Injection dans le DOM (remplace le conteneur par l'ID de ta grille)
    afficherCatalogue(produits);

  } catch (erreur) {
    console.error("Erreur lors de la récupération des produits :", erreur);
  }
}

// Fonction d'affichage des cartes produits dans le HTML
function afficherCatalogue(produits) {
  const container = document.getElementById("liste-produits"); // Adapte avec l'ID de ton conteneur HTML
  if (!container) return;

  if (produits.length === 0) {
    container.innerHTML = "<p>Aucun équipement disponible dans le catalogue pour le moment.</p>";
    return;
  }

  container.innerHTML = produits.map(p => `
    <div class="produit-card">
      <img src="${p.image || 'assets/images/placeholder.jpeg'}" alt="${p.nom}" />
      <h3>${p.nom}</h3>
      <p class="categorie">${p.categorie || 'Non classé'}</p>
      <p class="description">${p.description || ''}</p>
      <a href="produit.html?id=${p.id}" class="btn-detail">Voir détails</a>
    </div>
  `).join('');
}

// Lancement au chargement de la page
document.addEventListener("DOMContentLoaded", chargerProduits);
// ==========================================================
// PDM CI
// PAGE DÉTAIL SHOWROOM
// ==========================================================
// Ce fichier gère uniquement la page showroom-detail.html.
// Les données sont récupérées depuis data/data.js.
// ==========================================================


// ==========================================================
// 1. RÉCUPÉRATION DE L'ID DU SHOWROOM
// Exemple :
// showroom-detail.html?id=show_abidjan
// ==========================================================

const params = new URLSearchParams(window.location.search);
const showroomId = params.get("id");

console.log("ID du showroom :", showroomId);


// ==========================================================
// 2. RÉCUPÉRATION DES ÉLÉMENTS HTML
// ==========================================================

const showroomInformation =
    document.getElementById("showroom-information");

const productsGrid =
    document.getElementById("showroom-products-grid");

const searchInput =
    document.getElementById("equipment-search");


// ==========================================================
// 3. VÉRIFICATION DE L'ID
// ==========================================================

if (!showroomId) {

    showroomInformation.innerHTML = `
        <div class="container">
            <div class="showroom-error">

                <h1>
                    Aucun showroom sélectionné
                </h1>

                <p>
                    Aucun identifiant de showroom n'a été fourni.
                </p>

                <a href="showrooms.html">
                    ← Retour aux showrooms
                </a>

            </div>
        </div>
    `;

} else {

    // ======================================================
    // 4. RÉCUPÉRATION DU SHOWROOM
    // ======================================================

    const showroom = getShowroomById(showroomId);

    console.log("Showroom trouvé :", showroom);


    // ======================================================
    // 5. VÉRIFICATION DU SHOWROOM
    // ======================================================

    if (!showroom) {

        showroomInformation.innerHTML = `
            <div class="container">
                <div class="showroom-error">

                    <h1>
                        Showroom introuvable
                    </h1>

                    <p>
                        Le showroom demandé n'existe pas
                        dans les données de démonstration.
                    </p>

                    <a href="showrooms.html">
                        ← Retour aux showrooms
                    </a>

                </div>
            </div>
        `;

        productsGrid.innerHTML = "";

    } else {

        // ==================================================
        // 6. AFFICHAGE DU SHOWROOM
        // ==================================================

        afficherShowroom(showroom);


        // ==================================================
        // 7. AFFICHAGE DES ÉQUIPEMENTS
        // ==================================================

        afficherProduits(showroom);

    }


    // ======================================================
    // 8. RECHERCHE DES ÉQUIPEMENTS
    // ======================================================

    if (searchInput) {

        searchInput.addEventListener("input", function () {

            afficherProduits(
                showroom,
                this.value
            );

        });

    }

}


// ==========================================================
// 9. AFFICHER LES INFORMATIONS DU SHOWROOM
// ==========================================================

function afficherShowroom(showroom) {

    showroomInformation.innerHTML = `

        <div class="container">

            <div class="showroom-hero-grid">

                <!-- ========================================
                     IMAGE DU SHOWROOM
                ========================================= -->

                <div class="showroom-image">

                    <img
                        src="${showroom.image}"
                        alt="${showroom.nom}"
                    >

                </div>


                <!-- ========================================
                     INFORMATIONS DU SHOWROOM
                ========================================= -->

                <div class="showroom-content">

                    <span class="eyebrow">
                        SHOWROOM MEDEQUIP
                    </span>

                    <h1>
                        ${showroom.nom}
                    </h1>

                    <p class="showroom-description">
                        ${showroom.description}
                    </p>


                    <!-- ====================================
                         DÉTAILS
                    ===================================== -->

                    <div class="showroom-details">

                        <div>
                            <strong>
                                Localisation
                            </strong>

                            <p>
                                ${showroom.ville},
                                ${showroom.region}
                            </p>
                        </div>


                        <div>
                            <strong>
                                Adresse
                            </strong>

                            <p>
                                ${showroom.adresse}
                            </p>
                        </div>


                        <div>
                            <strong>
                                Téléphone
                            </strong>

                            <p>
                                ${showroom.telephone}
                            </p>
                        </div>


                        <div>
                            <strong>
                                Horaires
                            </strong>

                            <p>
                                ${showroom.horaires}
                            </p>
                        </div>

                    </div>


                    <!-- ====================================
                         BOUTONS D'ACTION
                    ===================================== -->

                    <div class="showroom-actions">

                        <a
                            href="tel:${showroom.telephone}"
                            class="btn btn-primary"
                        >
                            Appeler
                        </a>


                        <a
                            href="https://wa.me/${showroom.whatsapp.replace(/\D/g, '')}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-secondary"
                        >
                            WhatsApp
                        </a>

                    </div>

                </div>

            </div>

        </div>

    `;
}


// ==========================================================
// 10. AFFICHER LES PRODUITS DU SHOWROOM
// ==========================================================

function afficherProduits(showroom, recherche = "") {

    let produits =
        getProduitsByShowroom(showroom);


    // ======================================================
    // FILTRE DE RECHERCHE
    // ======================================================

    if (recherche.trim() !== "") {

        const rechercheNormalisee =
            recherche.toLowerCase().trim();

        produits = produits.filter(produit =>

            produit.nom
                .toLowerCase()
                .includes(rechercheNormalisee)

        );

    }


    // ======================================================
    // AUCUN PRODUIT
    // ======================================================

    if (produits.length === 0) {

        productsGrid.innerHTML = `

            <div class="no-products">

                <h3>
                    Aucun équipement trouvé
                </h3>

                <p>
                    Aucun équipement ne correspond
                    à votre recherche.
                </p>

            </div>

        `;

        return;
    }


    // ======================================================
    // AFFICHAGE DES PRODUITS
    // ======================================================

    productsGrid.innerHTML = produits.map(produit => `

        <article class="product-card">

            <!-- IMAGE -->
            <div class="product-image">

                <img
                    src="${produit.image}"
                    alt="${produit.nom}"
                >

            </div>


            <!-- CONTENU -->
            <div class="product-content">

                <span class="product-category">
                    ${produit.categorie}
                </span>

                <h3>
                    ${produit.nom}
                </h3>

                <p>
                    ${produit.description}
                </p>


                <!-- LIEN VERS LE PRODUIT -->
                <a
                    href="produit.html?id=${produit.id}"
                    class="product-link"
                >
                    Voir le produit →
                </a>

            </div>

        </article>

    `).join("");
}
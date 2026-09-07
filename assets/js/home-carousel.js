/* ==========================================
   CARROUSEL - CARTE HERO ACCUEIL
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Récupération des éléments
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");

    // Vérification
    if (!slides.length || !dots.length) {
        return;
    }

    let currentSlide = 0;

    // ==========================================
    // AFFICHER UNE IMAGE
    // ==========================================

    function showSlide(index) {

        // Retirer l'état actif de toutes les images
        slides.forEach((slide) => {
            slide.classList.remove("active");
        });

        // Retirer l'état actif des indicateurs
        dots.forEach((dot) => {
            dot.classList.remove("active");
        });

        // Ajouter l'état actif
        slides[index].classList.add("active");
        dots[index].classList.add("active");

        // Mémoriser la position actuelle
        currentSlide = index;
    }


    // ==========================================
    // IMAGE SUIVANTE
    // ==========================================

    function nextSlide() {

        let nextIndex = currentSlide + 1;

        // Revenir à la première image
        if (nextIndex >= slides.length) {
            nextIndex = 0;
        }

        showSlide(nextIndex);
    }


    // ==========================================
    // CLIQUE SUR LES INDICATEURS
    // ==========================================

    dots.forEach((dot, index) => {

        dot.addEventListener("click", () => {
            showSlide(index);
        });

    });


    // ==========================================
    // DÉFILEMENT AUTOMATIQUE
    // Toutes les 5 secondes
    // ==========================================

    setInterval(() => {
        nextSlide();
    }, 5000);


    // ==========================================
    // INITIALISATION
    // ==========================================

    showSlide(0);

});
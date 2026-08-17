// ============================================================
// PDM CI — PAGE ACTUALITÉS
// Données fictives Phase 1.
// ============================================================

const news = [
  {id:"news_001", date:"2026-08-10", category:"Démonstration", title:"Démonstration d'équipements de laboratoire", excerpt:"Présentation fictive d'une sélection d'équipements et de leurs usages auprès des professionnels de santé.", image:"../assets/images/logo-medequip-ci.png"},
  {id:"news_002", date:"2026-08-05", category:"Réseau", title:"Le réseau de showrooms au cœur de la proximité", excerpt:"Focus sur le rôle des showrooms et des points relais dans le développement territorial de MEDEQUIP CI.", image:"../assets/images/logo-medequip-ci.png"},
  {id:"news_003", date:"2026-07-28", category:"Formation", title:"Formation utilisateurs : bonnes pratiques", excerpt:"Exemple de contenu consacré à l'accompagnement des utilisateurs et à la prise en main des équipements.", image:"../assets/images/logo-medequip-ci.png"},
  {id:"news_004", date:"2026-07-20", category:"Santé", title:"Conseils et sensibilisation santé", excerpt:"Exemple d'article destiné à valoriser les actions de sensibilisation et les enjeux de santé publique.", image:"../assets/images/logo-medequip-ci.png"},
  {id:"news_005", date:"2026-07-12", category:"Partenariat", title:"Développer les partenariats dans l'écosystème santé", excerpt:"Exemple de publication autour des relations institutionnelles et des collaborations stratégiques.", image:"../assets/images/logo-medequip-ci.png"},
  {id:"news_006", date:"2026-07-04", category:"Produit", title:"Nouvelles solutions : focus équipement", excerpt:"Exemple de fiche éditoriale consacrée à une solution médicale présentée sur la plateforme.", image:"../assets/images/logo-medequip-ci.png"}
];

const grid = document.getElementById("news-grid");
const search = document.getElementById("news-search");
const category = document.getElementById("news-category");
const empty = document.getElementById("news-empty");

[...new Set(news.map(item => item.category))].sort().forEach(cat => {
  const option = document.createElement("option");
  option.value = cat;
  option.textContent = cat;
  category.appendChild(option);
});

function formatDate(value) {
  return new Intl.DateTimeFormat("fr-FR", {day:"2-digit", month:"long", year:"numeric"}).format(new Date(value + "T12:00:00"));
}

function renderNews() {
  const q = (search.value || "").trim().toLowerCase();
  const selected = category.value;

  const filtered = news.filter(item => {
    const matchesText = [item.title, item.excerpt, item.category].join(" ").toLowerCase().includes(q);
    const matchesCategory = selected === "all" || item.category === selected;
    return matchesText && matchesCategory;
  });

  grid.innerHTML = filtered.map(item => `
    <article class="news-card">
      <div class="news-image">
        <img src="${item.image}" alt="" loading="lazy">
        <span>${item.category}</span>
      </div>
      <div class="news-card-body">
        <time datetime="${item.date}">${formatDate(item.date)}</time>
        <h3>${item.title}</h3>
        <p>${item.excerpt}</p>
        <button class="news-read" type="button" data-news-id="${item.id}">Lire l'actualité <span>→</span></button>
      </div>
    </article>
  `).join("");

  empty.hidden = filtered.length !== 0;

  grid.querySelectorAll(".news-read").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = news.find(n => n.id === btn.dataset.newsId);
      alert(`Phase 1 — Démonstration\n\n${item.title}\n\nLe module de lecture détaillée sera relié au contenu éditorial en Phase 2.`);
    });
  });
}

search.addEventListener("input", renderNews);
category.addEventListener("change", renderNews);
renderNews();

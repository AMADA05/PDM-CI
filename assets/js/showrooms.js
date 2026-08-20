// ============================================================
// PDM CI — PAGE SHOWROOMS
// Données fictives Phase 1 : à remplacer par les données officielles.
// ============================================================

const showrooms = [
  {id:"show_abidjan_Siège", ville:"Abidjan", zone:"Siège", nom:"Showroom Abidjan Siège", region:"District d'Abidjan", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Démonstration"},
  {id:"show_abidjan_cocody", ville:"Abidjan", zone:"Cocody", nom:"Showroom Abidjan Cocody", region:"District d'Abidjan", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Démonstration"},
  {id:"show_abidjan_yopougon", ville:"Abidjan", zone:"Yopougon", nom:"Showroom Abidjan Yopougon", region:"District d'Abidjan", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Démonstration"},
  {id:"show_abidjan_port_bouet", ville:"Abidjan", zone:"Port-Bouët", nom:"Showroom Abidjan Port-Bouët", region:"District d'Abidjan", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Démonstration"},
  {id:"show_bouake", ville:"Bouaké", zone:"Centre", nom:"Showroom Bouaké", region:"Gbêkê", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Démonstration"},
  {id:"show_yamoussoukro", ville:"Yamoussoukro", zone:"Centre", nom:"Showroom Yamoussoukro", region:"Bélier", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Démonstration"},
  {id:"show_daloa", ville:"Daloa", zone:"Centre-Ouest", nom:"Showroom Daloa", region:"Haut-Sassandra", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Démonstration"},
  {id:"show_san_pedro", ville:"San-Pédro", zone:"Sud-Ouest", nom:"Showroom San-Pédro", region:"San-Pédro", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Démonstration"},
  {id:"show_korhogo", ville:"Korhogo", zone:"Nord", nom:"Showroom Korhogo", region:"Poro", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Démonstration"},
  {id:"show_abengourou", ville:"Abengourou", zone:"Est", nom:"Showroom Abengourou", region:"Indénié-Djuablin", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Démonstration"},
  {id:"show_man", ville:"Man", zone:"Ouest", nom:"Représentation commerciale de Man", region:"Tonkpi", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Point relais — démonstration"},
  {id:"show_autre", ville:"À confirmer", zone:"À confirmer", nom:"Point de proximité à confirmer", region:"À confirmer", telephone:"À confirmer", whatsapp:"À confirmer", statut:"Démonstration"}
];

const search = document.getElementById("showroom-search");
const grid = document.getElementById("showrooms-grid");
const empty = document.getElementById("showroom-empty");
const total = document.getElementById("showroom-total");

function renderShowrooms() {
  const query = (search.value || "").trim().toLowerCase();

  const filtered = showrooms.filter(item =>
    [item.nom, item.ville, item.zone, item.region]
      .join(" ")
      .toLowerCase()
      .includes(query)
  );

  total.textContent = filtered.length;

  grid.innerHTML = filtered.map(item => `
    <article class="showroom-card">
      <div class="showroom-card-top">
        <span class="showroom-badge">${item.statut}</span>
        <span class="showroom-id">${item.id}</span>
      </div>
      <div class="showroom-marker">+</div>
      <p class="showroom-region">${item.region}</p>
      <h3>${item.nom}</h3>
      <p class="showroom-location">${item.ville} · ${item.zone}</p>
      <div class="showroom-meta">
        <div><span>Téléphone</span><strong>${item.telephone}</strong></div>
        <div><span>WhatsApp</span><strong>${item.whatsapp}</strong></div>
      </div>
       <a class="showroom-action" href="contact.html?showroom=${encodeURIComponent(item.id)}">Contacter ce point <span>→</span></a>
      
    <a
    class="showroom-action showroom-link"
    href="showroom-detail.html?id=${item.id}"
>
    Voir le showroom →
</a>
      </article>
  `).join("");

  empty.hidden = filtered.length !== 0;
}

search.addEventListener("input", renderShowrooms);
renderShowrooms();

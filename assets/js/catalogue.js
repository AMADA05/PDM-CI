/* ============================================================
   PDM CI — CATALOGUE
   Logique spécifique à cette page — données fictives Phase 1.
   ============================================================ */
import {catalogueCategories,catalogueProduits} from "./catalogue-data.js";
const grid=document.getElementById("products-grid"), cats=document.getElementById("category-list"), search=document.getElementById("product-search"), count=document.getElementById("product-count"), empty=document.getElementById("empty-state");
// -------------------- FILTRE INITIAL DEPUIS L'URL --------------------
const urlCategory = new URLSearchParams(location.search).get("cat");
const categoryAliases = {
  labo: "cat_labo",
  laboratoire: "cat_labo",
  medical: "cat_diag",
  diagnostic: "cat_diag",
  surveillance: "cat_surv",
  sterilisation: "cat_ster",
  mobilier: "cat_mob"
};
let selected = categoryAliases[urlCategory] || "cat_tous";
function renderCats(){cats.innerHTML=catalogueCategories.map(c=>`<button class="category-btn ${c.id===selected?"active":""}" data-cat="${c.id}">${c.nom}</button>`).join("");cats.querySelectorAll("button").forEach(b=>b.onclick=()=>{selected=b.dataset.cat;renderCats();render();});}
function render(){let q=search.value.toLowerCase().trim();let items=catalogueProduits.filter(p=>(selected==="cat_tous"||p.categorie===selected)&&[p.nom,p.reference,p.categorieNom].join(" ").toLowerCase().includes(q));count.textContent=items.length;empty.hidden=items.length>0;grid.innerHTML=items.map(p=>`<article class="catalogue-card"><a class="catalogue-card-image" href="produit.html?id=${p.id}"><img src="${p.image}" alt="${p.nom}"><span>${p.categorieNom}</span></a><div class="catalogue-card-body"><small>${p.reference}</small><h2>${p.nom}</h2><p>${p.description}</p><div class="product-actions"><a class="btn-secondary" href="produit.html?id=${p.id}">Voir le produit</a><a class="btn-primary small" href="demande-devis.html?produit=${p.id}">Demander un devis</a></div></div></article>`).join("");}
search.oninput=render;renderCats();render();

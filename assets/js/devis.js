/* ============================================================
   PDM CI — DEVIS
   Logique spécifique à cette page — données fictives Phase 1.
   ============================================================ */
import {catalogueProduits} from "./catalogue-data.js";
const s=document.getElementById("produit"),form=document.getElementById("devis-form"),msg=document.getElementById("form-message");
catalogueProduits.forEach(p=>{let o=document.createElement("option");o.value=p.id;o.textContent=`${p.nom} — ${p.reference}`;s.appendChild(o)});
let q=new URLSearchParams(location.search).get("produit");if(q)s.value=q;
form.onsubmit=e=>{e.preventDefault();let lead={id:`lead_demo_${Date.now()}`,produit_id:s.value||null,nom:nom.value.trim(),prenom:prenom.value.trim(),telephone:telephone.value.trim(),email:email.value.trim(),ville:ville.value.trim(),structure:structure.value.trim(),message:message.value.trim(),origine:"site_web",statut:"Nouveau",showroom_id:null,commercial_id:null,apm_ref:null,date_creation:new Date().toISOString()};let all=JSON.parse(localStorage.getItem("pdm_demo_leads")||"[]");all.push(lead);localStorage.setItem("pdm_demo_leads",JSON.stringify(all));msg.textContent="Demande enregistrée localement pour la démonstration.";msg.className="success";form.reset()};
const t=document.querySelector(".menu-toggle"),n=document.querySelector(".main-nav");if(t&&n)t.onclick=()=>{let o=n.classList.toggle("open");t.setAttribute("aria-expanded",o)};

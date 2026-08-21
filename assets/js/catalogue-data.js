/* DONNÉES FICTIVES — PHASE 1 */
const catalogueCategories = [
  {id:"cat_tous",nom:"Tous les produits"},
  {id:"cat_labo",nom:"Laboratoire"},
  {id:"cat_diag",nom:"Diagnostic"},
  {id:"cat_surv",nom:"Surveillance médicale"},
  {id:"cat_ster",nom:"Stérilisation"},
  {id:"cat_mob",nom:"Mobilier médical"}
];

const catalogueProduits = [
  {id:"prod_biochimie_01",nom:"Analyseur de biochimie",reference:"BIO-AX400",categorie:"cat_labo",categorieNom:"Laboratoire",image:"../assets/images/Analyseurs.webp",description:"Analyseur fictif destiné aux laboratoires et structures de diagnostic.",apm_ref:null},
  {id:"prod_hematologie_01",nom:"Automate d'hématologie",reference:"HEM-5D20",categorie:"cat_labo",categorieNom:"Laboratoire",image:"../assets/images/produit-biochimie.jpeg",description:"Solution fictive d'analyse hématologique.",apm_ref:null},
  {id:"prod_monitor_01",nom:"Moniteur de surveillance",reference:"MON-700",categorie:"cat_surv",categorieNom:"Surveillance médicale",image:"../assets/images/moniteur.jpeg",description:"Moniteur multiparamétrique fictif.",apm_ref:null},
  {id:"prod_centrifugeuse_01",nom:"Centrifugeuse de laboratoire",reference:"CEN-420",categorie:"cat_labo",categorieNom:"Laboratoire",image:"../assets/images/produit-centrifugeuse.jpeg",description:"Centrifugeuse fictive pour la préparation d'échantillons.",apm_ref:null},
  {id:"prod_autoclave_01",nom:"Autoclave médical",reference:"STE-300",categorie:"cat_ster",categorieNom:"Stérilisation",image:"../assets/images/autoclave.webp",description:"Équipement fictif de stérilisation.",apm_ref:null},
  {id:"prod_oxygene_01",nom:"Concentrateur d'oxygène",reference:"OXY-10",categorie:"cat_diag",categorieNom:"Diagnostic",image:"../assets/images/Concentrateur.jpeg",description:"Concentrateur d'oxygène fictif.",apm_ref:null},
  {id:"prod_lit_01",nom:"Lit médicalisé",reference:"MOB-210",categorie:"cat_mob",categorieNom:"Mobilier médical",image:"../assets/images/solution-medicale.jpeg",description:"Lit médicalisé fictif.",apm_ref:null},
  {id:"prod_aspiration_01",nom:"Aspirateur médical",reference:"ASP-150",categorie:"cat_diag",categorieNom:"Diagnostic",image:"../assets/images/aspirateur.jpeg",description:"Aspirateur médical fictif.",apm_ref:null},
  {id:"prod_on_call_01",nom:"On Call",reference:"ONC-01",categorie:"cat_diag",categorieNom:"Laboratoire",image:"../assets/images/produit/on_calls.JPG",description:"Test rapide.",apm_ref:null}
];
export {catalogueCategories,catalogueProduits};

const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/produits - Récupérer les produits actifs
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM produits WHERE COALESCE(actif, true) = true ORDER BY nom ASC'
    );
    res.json({ success: true, products: rows });
  } catch (err) {
    console.error('Erreur récupération produits :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST : Ajouter un produit avec logs d'erreur détaillés
router.post('/', async (req, res) => {
  console.log('Payload reçu sur POST /api/produits :', req.body);

  try {
    const { reference, nom, categorie, marque, modele, prix, description, image_url } = req.body;

    // Validation des champs indispensables
    const nomProduit = nom || req.body.name;
    if (!nomProduit) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le champ "Nom" du produit est obligatoire.' 
      });
    }

    // Requête SQL sécurisée avec valeurs par défaut
    const query = `
      INSERT INTO produits (
        reference, 
        nom, 
        categorie, 
        marque, 
        modele, 
        prix, 
        description, 
        image_url, 
        actif
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *
    `;

    const values = [
      reference || `REF-${Date.now().toString().slice(-6)}`, // Génère une réf si vide
      nomProduit,
      categorie || 'Général',
      marque || '',
      modele || '',
      isNaN(parseFloat(prix)) ? 0 : parseFloat(prix),
      description || '',
      image_url || ''
    ];

    const result = await db.query(query, values);

    return res.status(201).json({
      success: true,
      message: 'Produit ajouté avec succès dans la base de données !',
      product: result.rows[0]
    });

  } catch (err) {
    // Affiche l'erreur exacte PostgreSQL dans le terminal
    console.error('❌ ERREUR POSTGRESQL POST /api/produits :', err.message);

    return res.status(500).json({ 
      success: false, 
      message: `Erreur BD (${err.code || 'SQL'}) : ${err.message}` 
    });
  }
});

// PUT : Modifier un produit
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Payload reçu sur PUT /api/produits/${id} :`, req.body);

  try {
    const { reference, nom, categorie, marque, modele, prix, description, image_url } = req.body;

    const query = `
      UPDATE produits 
      SET 
        reference = COALESCE($1, reference), 
        nom = $2, 
        categorie = $3, 
        marque = $4, 
        modele = $5, 
        prix = $6, 
        description = $7, 
        image_url = $8
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      reference || null,
      nom || req.body.name,
      categorie || 'Général',
      marque || '',
      modele || '',
      isNaN(parseFloat(prix)) ? 0 : parseFloat(prix),
      description || '',
      image_url || '',
      id
    ];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }

    return res.json({
      success: true,
      message: 'Produit mis à jour avec succès !',
      product: result.rows[0]
    });

  } catch (err) {
    console.error(`❌ ERREUR POSTGRESQL PUT /api/produits/${id} :`, err.message);
    return res.status(500).json({ 
      success: false, 
      message: `Erreur BD (${err.code || 'SQL'}) : ${err.message}` 
    });
  }
});

// DELETE /api/produits/:id - Désactivation plutôt que suppression physique
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE produits SET actif = false WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    }
    res.json({ success: true, message: 'Produit supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur suppression produit :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
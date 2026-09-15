const express = require('express');
const router = express.Router();
const db = require('../db');

// POST : Ajouter un produit
router.post('/', async (req, res) => {
  const { nom, description, prix, stock, categorie, image_url } = req.body;

  // Validation minimale
  if (!nom || prix === undefined) {
    return res.status(400).json({ success: false, error: 'Le nom et le prix sont obligatoires.' });
  }

  try {
    const query = `
      INSERT INTO produits (nom, description, prix, stock, categorie, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      nom,
      description || '',
      parseFloat(prix),
      parseInt(stock) || 0,
      categorie || 'Général',
      image_url || ''
    ];

    const result = await db.query(query, values);

    // Retourne un statut 201 avec le produit créé
    res.status(201).json({
      success: true,
      message: 'Produit ajouté avec succès !',
      produit: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du produit :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur lors de la création du produit.' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/devis - Envoyer une demande de devis (Public)
router.post('/', async (req, res) => {
  try {
    const { produit_id, nom, prenom, telephone, email, ville, structure, message, showroom_id } = req.body;

    if (!nom || !telephone || !email) {
      return res.status(400).json({ success: false, message: 'Nom, téléphone et email sont obligatoires.' });
    }

    const query = `
      INSERT INTO devis (produit_id, nom, prenom, telephone, email, ville, structure, message, showroom_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [produit_id || null, nom, prenom, telephone, email, ville, structure, message, showroom_id || null];
    const { rows } = await db.query(query, values);

    res.status(201).json({ success: true, message: 'Demande de devis enregistrée avec succès.', devis: rows[0] });
  } catch (error) {
    console.error('Erreur création devis :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/devis - Liste des devis (Admin)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT d.*, p.nom AS produit_nom 
      FROM devis d 
      LEFT JOIN produits p ON d.produit_id = p.id 
      ORDER BY d.date_creation DESC
    `;
    const { rows } = await db.query(query);
    res.json({ success: true, devis: rows });
  } catch (error) {
    console.error('Erreur récupération devis :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// PUT /api/devis/:id/statut - Changer le statut d'un devis (Admin)
router.put('/:id/statut', async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const { rows } = await db.query('UPDATE devis SET statut = $1 WHERE id = $2 RETURNING *', [statut, id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Devis introuvable.' });

    res.json({ success: true, message: 'Statut mis à jour.', devis: rows[0] });
  } catch (error) {
    console.error('Erreur mise à jour devis :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
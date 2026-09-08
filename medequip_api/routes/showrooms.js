const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/showrooms - Récupérer tous les showrooms
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM showrooms WHERE actif = true ORDER BY ville ASC');
    res.json({ success: true, showrooms: rows });
  } catch (error) {
    console.error('Erreur showrooms :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/showrooms - Ajouter un showroom (Admin)
router.post('/', async (req, res) => {
  try {
    const { nom, ville, adresse, telephone, email, horaires, actif } = req.body;
    const query = `
      INSERT INTO showrooms (nom, ville, adresse, telephone, email, horaires, actif)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const { rows } = await db.query(query, [nom, ville, adresse, telephone, email, horaires, actif ?? true]);
    res.status(201).json({ success: true, showroom: rows[0] });
  } catch (error) {
    console.error('Erreur ajout showroom :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
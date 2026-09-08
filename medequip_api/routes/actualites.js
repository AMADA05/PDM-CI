const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/actualites - Récupérer les articles publics
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM actualites WHERE actif = true ORDER BY date_publication DESC');
    res.json({ success: true, actualites: rows });
  } catch (error) {
    console.error('Erreur actualités :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/actualites - Publier un article (Admin)
router.post('/', async (req, res) => {
  try {
    const { titre, categorie, extrait, contenu, image_url, auteur_id } = req.body;
    const query = `
      INSERT INTO actualites (titre, categorie, extrait, contenu, image_url, auteur_id)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const { rows } = await db.query(query, [titre, categorie, extrait, contenu, image_url, auteur_id || null]);
    res.status(201).json({ success: true, actualite: rows[0] });
  } catch (error) {
    console.error('Erreur ajout actualité :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
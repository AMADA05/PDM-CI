const express = require('express');
const router = express.Router();
const db = require('../db');

// POST : Ajouter un projet
router.post('/', async (req, res) => {
  const { titre, description, client, date_realisation, image_url } = req.body;

  if (!titre) {
    return res.status(400).json({ success: false, error: 'Le titre du projet est obligatoire.' });
  }

  try {
    const query = `
      INSERT INTO projets (titre, description, client, date_realisation, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [titre, description || '', client || '', date_realisation || null, image_url || ''];

    const result = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Projet ajouté avec succès !',
      projet: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du projet :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur lors de la création du projet.' });
  }
});

module.exports = router;
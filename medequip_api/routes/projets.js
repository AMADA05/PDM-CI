const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/projets - Lister les projets publiables
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM projets ORDER BY date_realisation DESC NULLS LAST, id DESC'
    );
    res.json({ success: true, projets: rows });
  } catch (err) {
    console.error('Erreur lors de la récupération des projets :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur lors du chargement des projets.' });
  }
});

// POST /api/projets - Ajouter un projet
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

// PUT /api/projets/:id - Modifier un projet
router.put('/:id', async (req, res) => {
  const { titre, description, client, date_realisation, image_url } = req.body;
  if (!titre) {
    return res.status(400).json({ success: false, error: 'Le titre du projet est obligatoire.' });
  }

  try {
    const { rows } = await db.query(`
      UPDATE projets
      SET titre = $1, description = $2, client = $3, date_realisation = $4, image_url = $5
      WHERE id = $6
      RETURNING *
    `, [titre, description || '', client || '', date_realisation || null, image_url || '', req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Projet introuvable.' });
    }
    res.json({ success: true, message: 'Projet mis à jour avec succès.', projet: rows[0] });
  } catch (err) {
    console.error('Erreur lors de la modification du projet :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur lors de la modification du projet.' });
  }
});

// DELETE /api/projets/:id - Supprimer un projet
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM projets WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Projet introuvable.' });
    }
    res.json({ success: true, message: 'Projet supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression du projet :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur lors de la suppression du projet.' });
  }
});

module.exports = router;
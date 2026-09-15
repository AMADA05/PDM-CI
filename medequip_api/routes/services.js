const express = require('express');
const router = express.Router();
const db = require('../db'); // Ajuste le chemin vers ton fichier de connexion BD

// GET : Récupérer tous les services
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM services ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des services' });
  }
});

// POST : Ajouter un nouveau service
router.post('/', async (req, res) => {
  const { nom, description, icone } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO services (nom, description, icone) VALUES ($1, $2, $3) RETURNING *',
      [nom, description, icone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du service' });
  }
});

// PUT : Modifier un service
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, description, icone } = req.body;
  try {
    const result = await db.query(
      'UPDATE services SET nom = $1, description = $2, icone = $3 WHERE id = $4 RETURNING *',
      [nom, description, icone, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la modification du service' });
  }
});

// DELETE : Supprimer un service
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM services WHERE id = $1', [id]);
    res.json({ message: 'Service supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du service' });
  }
});

module.exports = router;
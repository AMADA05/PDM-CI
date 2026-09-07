const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/showrooms
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM showrooms ORDER BY nom ASC;');
    res.json(rows);
  } catch (err) {
    console.error('Erreur SQL (GET /api/showrooms) :', err);
    res.status(500).json({ erreur: err.message });
  }
});

// GET /api/showrooms/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const showroomRes = await db.query('SELECT * FROM showrooms WHERE id = $1;', [id]);

    if (showroomRes.rows.length === 0) {
      return res.status(404).json({ erreur: 'Showroom non trouvé' });
    }

    const showroom = showroomRes.rows[0];

    const equipementsRes = await db.query(`
      SELECT p.* 
      FROM produits p
      JOIN showroom_produits sp ON p.id = sp.produit_id
      WHERE sp.showroom_id = $1;
    `, [id]);

    showroom.equipements = equipementsRes.rows;
    res.json(showroom);
  } catch (err) {
    console.error('Erreur SQL (GET /api/showrooms/:id) :', err);
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');

const { verifierToken, exigerAdmin } = require('../middleware/auth');

// Seuls les administrateurs connectés peuvent ajouter ou supprimer un produit
router.post('/', verifierToken, exigerAdmin, async (req, res) => {  });
router.delete('/:id', verifierToken, exigerAdmin, async (req, res) => {  });

// GET /api/produits - Récupérer tous les produits
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM produits ORDER BY cree_le DESC;');
    res.json(rows);
  } catch (err) {
    console.error('Erreur SQL (GET /api/produits) :', err);
    res.status(500).json({ erreur: err.message });
  }
});

// GET /api/produits/:id - Récupérer un produit par son ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM produits WHERE id = $1;', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ erreur: 'Produit non trouvé' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur SQL (GET /api/produits/:id) :', err);
    res.status(500).json({ erreur: err.message });
  }
});

// POST /api/produits - Ajouter un nouveau produit depuis l'Admin
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM produits ORDER BY cree_le DESC;');
    res.json(rows);
  } catch (err) {
    console.error('Erreur SQL (GET /api/produits) :', err);
    res.status(500).json({ erreur: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, nom, categorie_id, image, description, caracteristiques, prix_indicatif } = req.body;

    const query = `
      INSERT INTO produits (id, nom, categorie_id, image, description, caracteristiques, prix_indicatif)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      id,
      nom,
      categorie_id || null,
      image || null,
      description || null,
      JSON.stringify(caracteristiques || []),
      prix_indicatif || null
    ];

    const { rows } = await db.query(query, values);
    res.status(201).json({ message: 'Produit ajouté avec succès', produit: rows[0] });
  } catch (err) {
    console.error('Erreur SQL (POST /api/produits) :', err);
    res.status(500).json({ erreur: err.message });
  }
});

// DELETE /api/produits/:id - Supprimer un produit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query('DELETE FROM produits WHERE id = $1;', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ erreur: 'Produit introuvable' });
    }

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (err) {
    console.error('Erreur SQL (DELETE /api/produits/:id) :', err);
    res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
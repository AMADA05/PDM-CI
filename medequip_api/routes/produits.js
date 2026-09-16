const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/produits — catalogue PostgreSQL
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, reference, nom, categorie, marque, modele, prix, description, image_url, actif
      FROM produits
      ORDER BY id DESC
    `);
    res.json({ success: true, products: rows });
  } catch (err) {
    console.error('GET /api/produits:', err.message);
    res.status(500).json({ success: false, message: 'Impossible de récupérer les produits.', error: err.message });
  }
});

// GET /api/produits/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM produits WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    res.json({ success: true, product: rows[0] });
  } catch (err) {
    console.error('GET produit:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur.', error: err.message });
  }
});

// POST /api/produits
router.post('/', async (req, res) => {
  try {
    const { reference, nom, categorie, marque, modele, prix, description, image_url } = req.body;
    const nomProduit = String(nom || req.body.name || '').trim();
    if (!nomProduit) return res.status(400).json({ success: false, message: 'Le nom du produit est obligatoire.' });

    const parsedPrice = Number.parseFloat(prix);
    const { rows } = await db.query(`
      INSERT INTO produits (reference, nom, categorie, marque, modele, prix, description, image_url, actif)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true) RETURNING *
    `, [
      String(reference || `REF-${Date.now().toString().slice(-6)}`).trim(),
      nomProduit,
      categorie || 'Général', marque || '', modele || '',
      Number.isFinite(parsedPrice) ? parsedPrice : 0,
      description || '', image_url || ''
    ]);
    res.status(201).json({ success: true, message: 'Produit ajouté avec succès.', product: rows[0] });
  } catch (err) {
    console.error('POST /api/produits:', err.message);
    res.status(500).json({ success: false, message: `Erreur BD : ${err.message}` });
  }
});

// PUT /api/produits/:id
router.put('/:id', async (req, res) => {
  try {
    const { reference, nom, categorie, marque, modele, prix, description, image_url, actif } = req.body;
    const nomProduit = String(nom || req.body.name || '').trim();
    if (!nomProduit) return res.status(400).json({ success: false, message: 'Le nom du produit est obligatoire.' });
    const parsedPrice = Number.parseFloat(prix);
    const { rows } = await db.query(`
      UPDATE produits SET reference=$1, nom=$2, categorie=$3, marque=$4, modele=$5,
      prix=$6, description=$7, image_url=$8, actif=COALESCE($9, actif)
      WHERE id=$10 RETURNING *
    `, [reference || null, nomProduit, categorie || 'Général', marque || '', modele || '',
        Number.isFinite(parsedPrice) ? parsedPrice : 0, description || '', image_url || '', actif, req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    res.json({ success: true, message: 'Produit mis à jour avec succès.', product: rows[0] });
  } catch (err) {
    console.error('PUT /api/produits:', err.message);
    res.status(500).json({ success: false, message: `Erreur BD : ${err.message}` });
  }
});

// DELETE /api/produits/:id — suppression logique si possible
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('UPDATE produits SET actif = false WHERE id = $1 RETURNING *', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
    res.json({ success: true, message: 'Produit désactivé avec succès.', product: rows[0] });
  } catch (err) {
    console.error('DELETE /api/produits:', err.message);
    res.status(500).json({ success: false, message: `Erreur BD : ${err.message}` });
  }
});

module.exports = router;

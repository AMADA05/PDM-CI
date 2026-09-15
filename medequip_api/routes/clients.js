const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// GET /api/clients - Clients et nombre d'équipements installés
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT c.*, COUNT(e.id)::int AS nb_equipements
      FROM clients c
      LEFT JOIN equipements e ON e.client_id = c.id
      GROUP BY c.id
      ORDER BY c.nom ASC
    `);
    res.json({ success: true, clients: rows });
  } catch (error) {
    console.error('Erreur clients :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/clients - Ajouter un client et son compte utilisateur
router.post('/', async (req, res) => {
  const { nom, type_etablissement, telephone, ville, email, password, mot_de_passe } = req.body;
  if (!nom || !telephone || !ville || !email || !(password || mot_de_passe)) {
    return res.status(400).json({
      success: false,
      message: 'Le nom, le téléphone, la ville, l’email et le mot de passe sont obligatoires.',
    });
  }

  const clientDb = await db.connect();
  try {
    await clientDb.query('BEGIN');
    const existing = await clientDb.query('SELECT id FROM utilisateurs WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      await clientDb.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé.' });
    }

    const hash = await bcrypt.hash(password || mot_de_passe, 10);
    const user = await clientDb.query(`
      INSERT INTO utilisateurs (nom, email, mot_de_passe, role, telephone, ville)
      VALUES ($1, $2, $3, 'client', $4, $5)
      RETURNING id, nom, email
    `, [nom, email, hash, telephone, ville]);

    const client = await clientDb.query(`
      INSERT INTO clients (nom, type_etablissement, telephone, ville, email, utilisateur_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [nom, type_etablissement || '', telephone, ville, email, user.rows[0].id]);

    await clientDb.query('COMMIT');
    res.status(201).json({ success: true, client: client.rows[0], utilisateur: user.rows[0] });
  } catch (error) {
    await clientDb.query('ROLLBACK');
    console.error('Erreur création client :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  } finally {
    clientDb.release();
  }
});

// GET /api/clients/:id/equipements - Équipements installés chez un client
router.get('/:id/equipements', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT e.*, p.nom AS nom_produit
      FROM equipements e
      LEFT JOIN produits p ON p.id = e.produit_id
      WHERE e.client_id = $1
      ORDER BY e.date_attribution DESC NULLS LAST
    `, [req.params.id]);
    res.json({ success: true, equipements: rows });
  } catch (error) {
    console.error('Erreur équipements client :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/clients/attribuer-equipement - Installer un produit chez un client
router.post('/attribuer-equipement', async (req, res) => {
  const { client_id, produit_id, numero_serie } = req.body;
  if (!client_id || !produit_id || !numero_serie) {
    return res.status(400).json({ success: false, message: 'Le client, le produit et le numéro de série sont obligatoires.' });
  }
  try {
    const { rows } = await db.query(`
      INSERT INTO equipements (client_id, produit_id, numero_serie)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [client_id, produit_id, numero_serie]);
    res.status(201).json({ success: true, equipement: rows[0] });
  } catch (error) {
    console.error('Erreur attribution équipement :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
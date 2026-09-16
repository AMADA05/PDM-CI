const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/utilisateurs - Récupérer la liste des utilisateurs (Admin)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.nom, u.email, u.telephone, u.ville, u.date_creation, 
             COALESCE(ARRAY_AGG(r.nom) FILTER (WHERE r.nom IS NOT NULL), '{}') AS roles
      FROM utilisateurs u
      LEFT JOIN utilisateur_roles ur ON u.id = ur.utilisateur_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.date_creation DESC
    `;
    const { rows } = await db.query(query);
    res.json({ success: true, utilisateurs: rows });
  } catch (error) {
    console.error('Erreur utilisateurs :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
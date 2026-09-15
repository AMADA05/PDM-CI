const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/utilisateurs - Récupérer la liste des utilisateurs (Admin)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.nom, u.email, u.telephone, u.ville, u.date_creation,
             COALESCE(u.role, 'utilisateur') AS role,
             ARRAY[COALESCE(u.role, 'utilisateur')] AS roles
      FROM utilisateurs u
      ORDER BY u.date_creation DESC NULLS LAST, u.id DESC
    `;
    const { rows } = await db.query(query);
    res.json({ success: true, utilisateurs: rows });
  } catch (error) {
    console.error('Erreur utilisateurs :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
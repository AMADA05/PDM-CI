const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/contrats - Récupérer tous les contrats de maintenance
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM contrats_maintenance ORDER BY date_creation DESC');
    res.json({ success: true, contrats: rows });
  } catch (error) {
    console.error('Erreur récupération contrats :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/contrats - Enregistrer un nouveau contrat (Admin / Commercial)
router.post('/', async (req, res) => {
  try {
    const { client_nom, client_email, client_telephone, equipement, type_contrat, date_debut, date_fin, statut, devis_associe_id } = req.body;

    if (!client_nom || !client_telephone || !equipement || !type_contrat || !date_debut || !date_fin) {
      return res.status(400).json({ success: false, message: 'Tous les champs obligatoires doivent être renseignés.' });
    }

    const query = `
      INSERT INTO contrats_maintenance 
      (client_nom, client_email, client_telephone, equipement, type_contrat, date_debut, date_fin, statut, devis_associe_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [client_nom, client_email, client_telephone, equipement, type_contrat, date_debut, date_fin, statut || 'Actif', devis_associe_id || null];
    
    const { rows } = await db.query(query, values);
    res.status(201).json({ success: true, message: 'Contrat de maintenance créé avec succès.', contrat: rows[0] });
  } catch (error) {
    console.error('Erreur création contrat :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// PUT /api/contrats/:id - Mettre à jour un contrat
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, date_fin } = req.body;

    const { rows } = await db.query(
      'UPDATE contrats_maintenance SET statut = COALESCE($1, statut), date_fin = COALESCE($2, date_fin) WHERE id = $3 RETURNING *',
      [statut, date_fin, id]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Contrat introuvable.' });

    res.json({ success: true, message: 'Contrat mis à jour.', contrat: rows[0] });
  } catch (error) {
    console.error('Erreur modification contrat :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
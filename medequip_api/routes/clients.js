const express = require('express');
const router = express.Router();
const db = require('../db');

// Clients — version de base compatible avec la table clients utilisée par PDM-CI.
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT c.*, COUNT(e.id)::int AS nb_equipements
      FROM clients c
      LEFT JOIN equipements e ON e.client_id = c.id
      GROUP BY c.id ORDER BY c.id DESC
    `);
    res.json({ success:true, clients:rows });
  } catch (err) {
    console.error('GET /api/clients:', err.message);
    res.status(500).json({ success:false, message:`Erreur BD : ${err.message}` });
  }
});

router.get('/:id/equipements', async (req,res) => {
  try {
    const { rows } = await db.query('SELECT * FROM equipements WHERE client_id=$1 ORDER BY id DESC',[req.params.id]);
    res.json({success:true,equipements:rows});
  } catch(err) { res.status(500).json({success:false,message:`Erreur BD : ${err.message}`}); }
});

router.post('/', async (req,res) => {
  try {
    const { nom, email, telephone, ville, adresse, type_etablissement } = req.body;
    if (!nom) return res.status(400).json({success:false,message:'Le nom du client est obligatoire.'});
    const { rows } = await db.query(`
      INSERT INTO clients (nom,email,telephone,ville,adresse,type_etablissement)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `,[nom,email || null,telephone || null,ville || null,adresse || null,type_etablissement || 'Établissement']);
    res.status(201).json({success:true,message:'Client ajouté.',client:rows[0]});
  } catch(err) { res.status(500).json({success:false,message:`Erreur BD : ${err.message}`}); }
});

router.post('/attribuer-equipement', async (req,res) => {
  try {
    const { client_id, produit_id, numero_serie } = req.body;
    if (!client_id || !produit_id || !numero_serie) return res.status(400).json({success:false,message:'Client, produit et numéro de série sont requis.'});
    const { rows } = await db.query(`INSERT INTO equipements (client_id,produit_id,numero_serie) VALUES ($1,$2,$3) RETURNING *`,[client_id,produit_id,numero_serie]);
    res.status(201).json({success:true,message:'Équipement attribué.',equipement:rows[0]});
  } catch(err) { res.status(500).json({success:false,message:`Erreur BD : ${err.message}`}); }
});

module.exports = router;

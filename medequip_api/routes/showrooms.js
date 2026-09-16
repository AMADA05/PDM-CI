const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// GET /api/showrooms — liste publique/admin
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT s.*, u.nom AS nom_gestionnaire, u.email AS email_gestionnaire, u.telephone AS telephone_gestionnaire
      FROM showrooms s
      LEFT JOIN utilisateurs u ON u.id = s.gestionnaire_id
      ORDER BY s.id DESC
    `);
    res.json({ success: true, showrooms: rows });
  } catch (err) {
    console.error('GET /api/showrooms:', err.message);
    res.status(500).json({ success: false, message: 'Impossible de récupérer les showrooms.', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT s.*, u.nom AS nom_gestionnaire, u.email AS email_gestionnaire
      FROM showrooms s LEFT JOIN utilisateurs u ON u.id=s.gestionnaire_id WHERE s.id=$1
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Showroom introuvable.' });
    res.json({ success:true, showroom:rows[0] });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
});

// POST — créer showroom + gestionnaire
router.post('/', async (req, res) => {
  const { nom, ville, adresse, gestionnaire_nom, gestionnaire_email, gestionnaire_password, telephone } = req.body;
  if (!nom || !gestionnaire_email || !gestionnaire_password) return res.status(400).json({ success:false, message:'Nom du showroom, email et mot de passe sont requis.' });
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const exists = await client.query('SELECT id FROM utilisateurs WHERE email=$1', [gestionnaire_email.toLowerCase()]);
    if (exists.rows.length) { await client.query('ROLLBACK'); return res.status(409).json({success:false,message:'Cet email est déjà utilisé.'}); }
    const hash = await bcrypt.hash(gestionnaire_password, 10);
    const user = await client.query(`INSERT INTO utilisateurs (nom,email,telephone,mot_de_passe) VALUES ($1,$2,$3,$4) RETURNING id,nom,email,telephone`, [gestionnaire_nom || nom, gestionnaire_email.toLowerCase(), telephone || null, hash]);
    const showroom = await client.query(`INSERT INTO showrooms (nom,ville,adresse,gestionnaire_id) VALUES ($1,$2,$3,$4) RETURNING *`, [nom,ville || '',adresse || '',user.rows[0].id]);
    await client.query('COMMIT');
    res.status(201).json({success:true,message:'Showroom et gestionnaire créés.',showroom:showroom.rows[0],gestionnaire:user.rows[0]});
  } catch (err) { await client.query('ROLLBACK'); console.error(err); res.status(500).json({success:false,message:`Erreur BD : ${err.message}`}); }
  finally { client.release(); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// GET /api/showrooms - Récupérer les showrooms visibles dans l'administration et sur le site
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT s.*, u.nom AS nom_gestionnaire, u.email AS email_gestionnaire
      FROM showrooms s
      LEFT JOIN utilisateurs u ON u.id = s.gestionnaire_id
      WHERE COALESCE(s.actif, true) = true
      ORDER BY s.ville ASC, s.nom ASC
    `);
    res.json({ success: true, showrooms: rows });
  } catch (error) {
    console.error('Erreur showrooms :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// POST /api/showrooms - Créer un showroom et son gestionnaire
router.post('/', async (req, res) => {
  const {
    nom,
    ville,
    adresse,
    gestionnaire_nom,
    gestionnaire_email,
    gestionnaire_password,
    nom_gestionnaire,
    email,
    password,
  } = req.body;
  const managerName = gestionnaire_nom || nom_gestionnaire || nom;
  const managerEmail = gestionnaire_email || email;
  const managerPassword = gestionnaire_password || password;

  if (!nom || !managerEmail || !managerPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le nom du showroom, l\'email et le mot de passe du gestionnaire sont requis.' 
    });
  }

  const clientDb = await db.connect(); // Début de transaction

  try {
    await clientDb.query('BEGIN');

    // Step 1 : Vérifier si l'email existe déjà dans utilisateurs
    const checkUser = await clientDb.query('SELECT id FROM utilisateurs WHERE email = $1', [managerEmail]);
    if (checkUser.rows.length > 0) {
      await clientDb.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé par un autre compte.' });
    }

    // Step 2 : Hacher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(managerPassword, saltRounds);

    // Step 3 : Insérer le gestionnaire dans la table `utilisateurs`
    const insertUserQuery = `
      INSERT INTO utilisateurs (nom, email, mot_de_passe, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nom, email, role
    `;
    const userResult = await clientDb.query(insertUserQuery, [
      managerName,
      managerEmail,
      hashedPassword,
      'gestionnaire_showroom' // ou 'technicien' / 'admin' selon ta convention de rôles
    ]);

    const gestionnaireId = userResult.rows[0].id;

    // Step 4 : Insérer le showroom et lier l'ID du gestionnaire
    const insertShowroomQuery = `
      INSERT INTO showrooms (nom, ville, adresse, gestionnaire_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const showroomResult = await clientDb.query(insertShowroomQuery, [
      nom,
      ville || '',
      adresse || '',
      gestionnaireId
    ]);

    await clientDb.query('COMMIT'); // Valider la transaction

    res.status(201).json({
      success: true,
      message: 'Showroom et compte Gestionnaire créés avec succès !',
      showroom: showroomResult.rows[0],
      gestionnaire: userResult.rows[0]
    });

  } catch (err) {
    await clientDb.query('ROLLBACK');
    console.error('Erreur lors de la création du showroom et du gestionnaire :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la création.' });
  } finally {
    clientDb.release();
  }
});

// POST /api/showrooms/attribuer-produit - Ajouter un produit au stock d'un showroom
router.post('/attribuer-produit', async (req, res) => {
  const { showroom_id, produit_id } = req.body;
  if (!showroom_id || !produit_id) {
    return res.status(400).json({ success: false, message: 'Le showroom et le produit sont obligatoires.' });
  }

  try {
    await db.query(
      `INSERT INTO showroom_produits (showroom_id, produit_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [showroom_id, produit_id]
    );
    res.status(201).json({ success: true, message: 'Produit attribué au showroom.' });
  } catch (error) {
    console.error('Erreur attribution produit showroom :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
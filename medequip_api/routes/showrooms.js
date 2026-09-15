const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt'); // Pense à vérifier que bcrypt est installé

// POST : Créer un Showroom ET son Gestionnaire (Création d'utilisateur)
router.post('/', async (req, res) => {
  const { nom, ville, adresse, gestionnaire_nom, gestionnaire_email, gestionnaire_password } = req.body;

  if (!nom || !gestionnaire_email || !gestionnaire_password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le nom du showroom, l\'email et le mot de passe du gestionnaire sont requis.' 
    });
  }

  const clientDb = await db.connect(); // Début de transaction

  try {
    await clientDb.query('BEGIN');

    // Step 1 : Vérifier si l'email existe déjà dans utilisateurs
    const checkUser = await clientDb.query('SELECT id FROM utilisateurs WHERE email = $1', [gestionnaire_email]);
    if (checkUser.rows.length > 0) {
      await clientDb.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé par un autre compte.' });
    }

    // Step 2 : Hacher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(gestionnaire_password, saltRounds);

    // Step 3 : Insérer le gestionnaire dans la table `utilisateurs`
    const insertUserQuery = `
      INSERT INTO utilisateurs (nom, email, mot_de_passe, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nom, email, role
    `;
    const userResult = await clientDb.query(insertUserQuery, [
      gestionnaire_nom || nom,
      gestionnaire_email,
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

module.exports = router;
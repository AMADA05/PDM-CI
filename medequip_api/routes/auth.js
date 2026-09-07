const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Ajusté à '../db' (remplacer par '../../db' si db.js est 2 dossiers au-dessus)

// POST /api/auth/login (ou /connexion)
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ erreur: 'Veuillez fournir un email et un mot de passe.' });
    }

    // 1. Chercher l'utilisateur dans la base
    const { rows } = await db.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ erreur: 'Email ou mot de passe incorrect.' });
    }

    const utilisateur = rows[0];

    // 2. Vérifier le mot de passe
    const mdpValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!mdpValide) {
      return res.status(400).json({ erreur: 'Email ou mot de passe incorrect.' });
    }

    // 3. Générer le jeton JWT
    const token = jwt.sign(
      { id: utilisateur.id, email: utilisateur.email },
      process.env.JWT_SECRET || 'secret_key_de_secours',
      { expiresIn: '24h' }
    );

    // 4. Envoyer la réponse au frontend
    return res.status(200).json({
      message: 'Connexion réussie',
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        email: utilisateur.email
      }
    });
  } catch (err) {
    console.error('Erreur connexion :', err);
    return res.status(500).json({ erreur: err.message });
  }
});

// Alias pour garder la compatibilité si /connexion est aussi appelé
router.post('/connexion', (req, res, next) => {
  req.url = '/login';
  router.handle(req, res, next);
});

// POST /api/auth/inscription - Inscription d'un utilisateur
router.post('/inscription', async (req, res) => {
  try {
    const { nom, email, mot_de_passe, role } = req.body;

    if (!nom || !email || !mot_de_passe) {
      return res.status(400).json({ erreur: 'Tous les champs obligatoires doivent être remplis.' });
    }

    // Vérifier si l'utilisateur existe déjà
    const userExist = await db.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ erreur: 'Un compte existe déjà avec cet email.' });
    }

    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const mdpHache = await bcrypt.hash(mot_de_passe, salt);

    const query = `
      INSERT INTO utilisateurs (nom, email, mot_de_passe)
      VALUES ($1, $2, $3)
      RETURNING id, nom, email;
    `;
    const values = [nom, email, mdpHache];
    const { rows } = await db.query(query, values);

    return res.status(201).json({ message: 'Utilisateur créé avec succès', utilisateur: rows[0] });
  } catch (err) {
    console.error('Erreur inscription :', err);
    return res.status(500).json({ erreur: err.message });
  }
});

module.exports = router;
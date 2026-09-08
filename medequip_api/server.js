const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration CORS
app.use(cors({
  origin: [
    'https://amada05.github.io',
    'http://localhost:5000',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
  ],
  credentials: true
}));

app.use(express.json());

// Import des routes
const authRoutes = require('./routes/auth');
const produitsRoutes = require('./routes/produits');
const showroomsRoutes = require('./routes/showrooms');
const devisRoutes = require('./routes/devis');
const actualitesRoutes = require('./routes/actualites');
const utilisateursRoutes = require('./routes/utilisateurs');

// Déclaration des endpoints API
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API PDM CI / MEDEQUIP CI' });
});

app.use('/api/auth', authRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/showrooms', showroomsRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/actualites', actualitesRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
const contratsRoutes = require('./routes/contrats_maintenance');
app.use('/api/contrats', contratsRoutes);
app.listen(PORT, () => {
  console.log(`Serveur API lancé sur le port ${PORT}`);
});
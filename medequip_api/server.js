const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://amada05.github.io';

// Configuration CORS
app.use(cors({
  origin: [
    FRONTEND_ORIGIN,
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
const contratsRoutes = require('./routes/contrats_maintenance');
const clientsRoutes = require('./routes/clients'); // Nouveau router pour la gestion des clients et appareils
const servicesRoutes = require('./routes/services');


app.use('/api/auth', authRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/showrooms', showroomsRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/actualites', actualitesRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/contrats', contratsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/services', servicesRoutes);
// Déclaration des endpoints API
app.get('/api/health', async (req, res) => {
  try { await require('./db').query('SELECT 1'); res.json({ success: true, service: 'PDM-CI API', database: 'connected' }); }
  catch (err) { res.status(503).json({ success: false, service: 'PDM-CI API', database: 'error', message: err.message }); }
});

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API PDM CI / MEDEQUIP CI' });
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur API lancé sur le port ${PORT}`);
});
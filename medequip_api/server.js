const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Déclarer l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// 2. Configuration CORS pour autoriser GitHub Pages et le dev local
app.use(cors({
  origin: [
    'https://amada05.github.io',
    'http://localhost:5000',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
  ],
  credentials: true
}));

// 3. Middlewares
app.use(express.json());

// 4. Importer les routes
const authRoutes = require('./routes/auth');
const produitsRoutes = require('./routes/produits');
const showroomsRoutes = require('./routes/showrooms');

// 5. Routes de l'API
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API PDM CI / PDM.MEDEQUIP' });
});

app.use('/api/auth', authRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/showrooms', showroomsRoutes);

// 6. Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur API lancé sur le port ${PORT}`);
});
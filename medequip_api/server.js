const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Déclarer l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// 2. Importer les routes
const authRoutes = require('./routes/auth');
const produitsRoutes = require('./routes/produits');
const showroomsRoutes = require('./routes/showrooms');

// 3. Middlewares
app.use(cors()); // Autoriser les requêtes venant du frontend
app.use(express.json());

// 4. Route racine de l'API
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API PDM CI / PDM.MEDEQUIP' });
});

app.use('/api/auth', authRoutes);
app.use('/api/produits', produitsRoutes);
app.use('/api/showrooms', showroomsRoutes);

console.log("Routes Express actives :");
app._router.stack.forEach(r => {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});
// 6. Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur API lancé sur http://localhost:${PORT}`);
});
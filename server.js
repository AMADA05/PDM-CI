const express = require('express');
const cors = require('cors');
require('dotenv').config();

const produitsRoutes = require('./routes/produits');
const showroomsRoutes = require('./routes/showrooms');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Racine
app.get('/', (req, res) => {
  res.json({ message: "API PDM-CI / MEDEQUIP opérationnelle" });
});

// Routes API
app.use('/api/produits', produitsRoutes);
app.use('/api/showrooms', showroomsRoutes);

app.listen(PORT, () => {
  console.log(`Serveur API lancé pra miezan sur http://localhost:${PORT}`);
});
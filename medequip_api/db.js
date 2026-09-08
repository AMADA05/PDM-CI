const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false // Active la connexion SSL requise par Neon.tech
  }
});

pool.on('connect', () => {
  console.log('Connexion réussie à la base de données PostgreSQL (medequip_db)');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
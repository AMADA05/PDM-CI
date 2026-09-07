const jwt = require('jsonwebtoken');

// Middleware pour vérifier la présence d'un Token JWT valide
function verifierToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ erreur: 'Accès refusé. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ erreur: 'Token invalide ou expiré.' });
  }
}

// Middleware restreint uniquement aux administrateurs
function exigerAdmin(req, res, next) {
  if (req.utilisateur && req.utilisateur.role === 'admin') {
    next();
  } else {
    res.status(403).json({ erreur: 'Accès interdit. Privilèges administrateur requis.' });
  }
}

module.exports = { verifierToken, exigerAdmin };
# PDM-CI — version de présentation

Cette version prépare le projet pour une démonstration au DG sans remplacer l'architecture existante.

## Corrections principales
- API Produits : GET liste, GET détail, POST, PUT et DELETE logique.
- Connexion PostgreSQL/Neon compatible avec `DATABASE_URL` Render ou les variables DB séparées.
- Pool PostgreSQL exportant `query()` et `connect()`.
- API Showrooms : lecture, détail et création showroom + gestionnaire.
- API Clients : lecture, création, équipements et attribution d'un équipement.
- Endpoint de santé : `/api/health`.
- Configuration API centralisée côté frontend.
- Authentification : redirection selon rôle Admin / Gestionnaire / Client.
- Nouvel espace Gestionnaire Showroom.
- Nouvel espace Client.
- Catalogue et pages existantes conservés.

## Render
Variables recommandées :
- `DATABASE_URL` = chaîne de connexion Neon avec `sslmode=require`
- `JWT_SECRET` = secret aléatoire long
- `FRONTEND_ORIGIN` = origine exacte du site GitHub Pages

Ne jamais publier le vrai fichier `.env` contenant les identifiants Neon.

## Démonstration
1. Ouvrir l'administration.
2. Vérifier le tableau de bord.
3. Ouvrir Produits.
4. Ajouter ou modifier un produit.
5. Montrer la persistance dans PostgreSQL/Neon.
6. Présenter Showrooms & Gestionnaires.
7. Montrer les espaces Gestionnaire et Client.
8. Présenter la trajectoire : commandes, prospects, équipements et maintenance.

Les nouveaux espaces disposent d'un mode de présentation visuel lorsque l'API n'est pas encore disponible, afin que l'interface reste démontrable pendant la finalisation de Neon/Render.

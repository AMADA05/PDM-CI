-- Migration minimale pour activer la gestion des projets et des attributions.
-- À exécuter une fois dans PostgreSQL/Neon avant d'utiliser l'administration.

CREATE TABLE IF NOT EXISTS projets (
  id BIGSERIAL PRIMARY KEY,
  titre VARCHAR(180) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  client VARCHAR(180) NOT NULL DEFAULT '',
  date_realisation DATE,
  image_url TEXT NOT NULL DEFAULT '',
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showroom_produits (
  showroom_id BIGINT NOT NULL REFERENCES showrooms(id) ON DELETE CASCADE,
  produit_id BIGINT NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
  date_attribution TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (showroom_id, produit_id)
);

CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  nom VARCHAR(180) NOT NULL,
  type_etablissement VARCHAR(120) NOT NULL DEFAULT '',
  telephone VARCHAR(40) NOT NULL DEFAULT '',
  ville VARCHAR(120) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL UNIQUE,
  utilisateur_id BIGINT REFERENCES utilisateurs(id) ON DELETE SET NULL,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipements (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  produit_id BIGINT REFERENCES produits(id) ON DELETE SET NULL,
  numero_serie VARCHAR(180) NOT NULL,
  date_attribution TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
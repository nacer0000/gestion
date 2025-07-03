-- Création de la base de données
CREATE DATABASE IF NOT EXISTS stockpro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stockpro_db;

-- Table des utilisateurs
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employe') NOT NULL DEFAULT 'employe',
    magasin_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des magasins
CREATE TABLE magasins (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nom VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des fournisseurs
CREATE TABLE fournisseurs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nom VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    contact VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE produits (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nom VARCHAR(255) NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    categorie VARCHAR(255) NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    seuil_alerte INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500) NULL,
    fournisseur_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL
);

-- Table des stocks
CREATE TABLE stocks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    produit_id VARCHAR(36) NOT NULL,
    magasin_id VARCHAR(36) NOT NULL,
    quantite INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
    FOREIGN KEY (magasin_id) REFERENCES magasins(id) ON DELETE CASCADE,
    UNIQUE KEY unique_produit_magasin (produit_id, magasin_id)
);

-- Table des mouvements de stock
CREATE TABLE mouvements (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    produit_id VARCHAR(36) NOT NULL,
    magasin_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('entrée', 'sortie') NOT NULL,
    quantite INT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motif VARCHAR(255) NOT NULL,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
    FOREIGN KEY (magasin_id) REFERENCES magasins(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des présences
CREATE TABLE presences (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    magasin_id VARCHAR(36) NOT NULL,
    date_pointage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    type ENUM('arrivee', 'depart') NOT NULL DEFAULT 'arrivee',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (magasin_id) REFERENCES magasins(id) ON DELETE CASCADE
);

-- Table des sessions
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ajout des contraintes de clés étrangères pour users
ALTER TABLE users ADD FOREIGN KEY (magasin_id) REFERENCES magasins(id) ON DELETE SET NULL;

-- Insertion d'un utilisateur admin par défaut
INSERT INTO users (email, password_hash, role) VALUES 
('admin@stockpro.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
-- Mot de passe: password
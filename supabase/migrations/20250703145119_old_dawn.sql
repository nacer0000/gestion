-- Create database
CREATE DATABASE IF NOT EXISTS stockpro_db;
USE stockpro_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employe') NOT NULL DEFAULT 'employe',
    magasin_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Magasins table
CREATE TABLE IF NOT EXISTS magasins (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nom VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fournisseurs table
CREATE TABLE IF NOT EXISTS fournisseurs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nom VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    contact VARCHAR(255) NOT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Produits table
CREATE TABLE IF NOT EXISTS produits (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nom VARCHAR(255) NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    categorie VARCHAR(255) NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    seuil_alerte INT NOT NULL DEFAULT 0,
    image_url TEXT NULL,
    fournisseur_id VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id) ON DELETE SET NULL
);

-- Stocks table
CREATE TABLE IF NOT EXISTS stocks (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    produit_id VARCHAR(36) NOT NULL,
    magasin_id VARCHAR(36) NOT NULL,
    quantite INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
    FOREIGN KEY (magasin_id) REFERENCES magasins(id) ON DELETE CASCADE,
    UNIQUE KEY unique_stock (produit_id, magasin_id)
);

-- Mouvements table
CREATE TABLE IF NOT EXISTS mouvements (
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

-- Presences table
CREATE TABLE IF NOT EXISTS presences (
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

-- Add foreign key constraint for users.magasin_id
ALTER TABLE users ADD FOREIGN KEY (magasin_id) REFERENCES magasins(id) ON DELETE SET NULL;

-- Insert default admin user (password: 'password')
INSERT INTO users (email, password_hash, role) VALUES 
('admin@stockpro.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Create indexes for better performance
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_stocks_produit ON stocks(produit_id);
CREATE INDEX idx_stocks_magasin ON stocks(magasin_id);
CREATE INDEX idx_mouvements_date ON mouvements(date);
CREATE INDEX idx_presences_date ON presences(date_pointage);
CREATE INDEX idx_presences_user ON presences(user_id);
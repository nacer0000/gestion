# StockPro - Application de Gestion de Stock Multi-Magasin

## 📋 Description

StockPro est une application web moderne de gestion de stock multi-magasin conçue pour un usage professionnel. Elle offre une interface sécurisée avec des rôles différenciés et fonctionne avec React (frontend) et PHP/MySQL (backend).

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité
- Authentification par email + mot de passe
- Application 100% privée (accès authentifié uniquement)
- Gestion de rôles : **admin** et **employé**
- Protection des routes selon les rôles
- Sessions sécurisées avec tokens

### 👨‍💼 Gestion des Présences
- Pointage avec vérification de géolocalisation (rayon de 100m)
- Prévention du pointage frauduleux
- Historique des présences pour les administrateurs

### 📦 Gestion des Données
- **Produits** : CRUD complet avec images
- **Magasins** : Gestion avec coordonnées GPS
- **Fournisseurs** : CRUD complet
- **Stock** : Gestion par magasin avec alertes de seuil
- **Mouvements** : Suivi des mouvements de stock

### 📊 Dashboard & Statistiques
- Tableau de bord administrateur avec graphiques (Recharts)
- Statistiques de stock et valeur
- Alertes visuelles pour les ruptures de stock
- Dashboard employé simplifié

## 🛠️ Technologies Utilisées

- **Frontend** : React 18 + TypeScript
- **Styling** : Tailwind CSS
- **Backend** : PHP 8+ avec PDO
- **Base de données** : MySQL
- **Serveur** : XAMPP
- **Graphiques** : Recharts
- **Icons** : Lucide React
- **Routing** : React Router DOM
- **HTTP Client** : Axios

## 🔧 Installation et Configuration

### 1. Prérequis
- XAMPP (Apache + MySQL + PHP 8+)
- Node.js 18+
- npm ou yarn

### 2. Configuration XAMPP

1. **Démarrer XAMPP**
   - Lancez XAMPP Control Panel
   - Démarrez Apache et MySQL

2. **Créer la base de données**
   - Ouvrez phpMyAdmin (http://localhost/phpmyadmin)
   - Importez le fichier `backend/database/schema.sql`
   - Ou exécutez les commandes SQL du fichier

3. **Configuration de la base de données**
   - Modifiez `backend/config/database.php` si nécessaire :
   ```php
   private $host = 'localhost';
   private $db_name = 'stockpro_db';
   private $username = 'root';
   private $password = '';
   ```

### 3. Installation du Backend

1. **Copier les fichiers backend**
   ```bash
   # Copiez le dossier backend dans votre répertoire XAMPP
   cp -r backend/ /path/to/xampp/htdocs/stockpro/
   ```

2. **Vérifier les permissions**
   - Assurez-vous que Apache peut lire les fichiers PHP
   - Testez l'API : http://localhost/stockpro/backend/api/auth/verify.php

### 4. Installation du Frontend

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configuration de l'API**
   - Modifiez `src/config/api.ts` si nécessaire :
   ```typescript
   const API_BASE_URL = 'http://localhost/stockpro/backend/api';
   ```

3. **Lancer l'application**
   ```bash
   npm run dev
   ```

L'application sera accessible sur `http://localhost:5173`

## 👥 Comptes par défaut

### Administrateur
- **Email** : admin@stockpro.com
- **Mot de passe** : password

## 🗂️ Structure du Projet

```
stockpro/
├── backend/                    # API PHP
│   ├── api/                   # Endpoints API
│   │   ├── auth/             # Authentification
│   │   ├── users/            # Gestion utilisateurs
│   │   ├── produits/         # Gestion produits
│   │   ├── magasins/         # Gestion magasins
│   │   ├── fournisseurs/     # Gestion fournisseurs
│   │   ├── stocks/           # Gestion stocks
│   │   ├── mouvements/       # Mouvements de stock
│   │   └── presences/        # Gestion présences
│   ├── config/               # Configuration
│   │   ├── database.php      # Connexion BDD
│   │   └── cors.php          # Configuration CORS
│   ├── models/               # Modèles de données
│   │   ├── User.php
│   │   └── Session.php
│   └── database/
│       └── schema.sql        # Structure BDD
├── src/                      # Application React
│   ├── components/           # Composants React
│   ├── config/              # Configuration
│   ├── hooks/               # Hooks personnalisés
│   └── types/               # Types TypeScript
└── public/                  # Fichiers statiques
```

## 🔒 Sécurité

- **Authentification obligatoire** : Aucun accès sans connexion
- **Géolocalisation sécurisée** : Pointage uniquement sur site (100m)
- **Rôles stricts** : Permissions selon le profil utilisateur
- **Protection CSRF** : Tokens de session sécurisés
- **Validation des données** : Sanitisation côté serveur

## 📱 Utilisation

### Pour les Administrateurs
1. Connectez-vous avec un compte admin
2. Créez des magasins avec leurs coordonnées GPS
3. Ajoutez des produits avec images
4. Gérez les fournisseurs
5. Consultez les statistiques sur le dashboard

### Pour les Employés
1. Connectez-vous avec un compte employé
2. Effectuez votre pointage quotidien
3. Consultez le stock de votre magasin
4. Enregistrez les mouvements de stock

## 🚀 Déploiement

### Serveur de production

1. **Configurer le serveur web**
   - Apache/Nginx avec PHP 8+
   - MySQL 8+
   - SSL/HTTPS recommandé

2. **Déployer le backend**
   ```bash
   # Copier les fichiers PHP
   rsync -av backend/ user@server:/var/www/html/stockpro/
   
   # Configurer la base de données
   mysql -u root -p < backend/database/schema.sql
   ```

3. **Déployer le frontend**
   ```bash
   # Build de production
   npm run build
   
   # Copier les fichiers statiques
   rsync -av dist/ user@server:/var/www/html/stockpro-app/
   ```

4. **Configuration Apache**
   ```apache
   <VirtualHost *:80>
       ServerName stockpro.example.com
       DocumentRoot /var/www/html/stockpro-app
       
       # Redirection API vers PHP
       Alias /api /var/www/html/stockpro/api
       
       # Configuration React Router
       <Directory "/var/www/html/stockpro-app">
           RewriteEngine On
           RewriteBase /
           RewriteRule ^index\.html$ - [L]
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteRule . /index.html [L]
       </Directory>
   </VirtualHost>
   ```

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de connexion à la base de données**
   - Vérifiez que MySQL est démarré
   - Contrôlez les paramètres dans `backend/config/database.php`

2. **Erreurs CORS**
   - Vérifiez la configuration dans `backend/config/cors.php`
   - Assurez-vous que l'URL de l'API est correcte

3. **Problèmes d'authentification**
   - Vérifiez que les sessions PHP fonctionnent
   - Contrôlez les tokens dans le localStorage

4. **Géolocalisation ne fonctionne pas**
   - Utilisez HTTPS en production
   - Vérifiez les permissions du navigateur

## 📝 API Documentation

### Authentification
- `POST /auth/login.php` - Connexion
- `POST /auth/logout.php` - Déconnexion
- `GET /auth/verify.php` - Vérification du token

### Ressources
- `GET|POST|PUT|DELETE /users/index.php` - Gestion utilisateurs
- `GET|POST|PUT|DELETE /produits/index.php` - Gestion produits
- `GET|POST|PUT|DELETE /magasins/index.php` - Gestion magasins
- `GET|POST|PUT|DELETE /fournisseurs/index.php` - Gestion fournisseurs
- `GET|POST|PUT|DELETE /stocks/index.php` - Gestion stocks
- `GET|POST /mouvements/index.php` - Mouvements de stock
- `GET|POST /presences/index.php` - Gestion présences

## 🤝 Support

Pour toute question ou assistance :
1. Vérifiez la configuration XAMPP
2. Consultez les logs Apache/PHP
3. Vérifiez les logs de la console navigateur

---

**StockPro** - Solution professionnelle de gestion de stock multi-magasin avec XAMPP/MySQL
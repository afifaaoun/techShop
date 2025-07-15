# 🛒 E-commerce MERN Stack

Application e-commerce complète avec panneau d'administration et interface utilisateur moderne.

## 🚀 Technologies utilisées

### Backend
- **Node.js** avec Express
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **Multer** pour l'upload de fichiers
- **Cloudinary** pour le stockage d'images
- **Stripe** pour les paiements
- **Nodemailer** pour les emails

### Frontend
- **React** avec hooks
- **Material-UI** pour l'interface
- **React Router** pour la navigation
- **Chart.js** pour les graphiques
- **Context API** pour la gestion d'état

## 📁 Structure du projet

```
e-commerce/
├── back/                 # Backend Node.js/Express
│   ├── config/          # Configuration (DB, Cloudinary, etc.)
│   ├── controllers/     # Contrôleurs API
│   ├── middlewares/     # Middlewares (auth, validation)
│   ├── models/          # Modèles MongoDB
│   ├── routes/          # Routes API
│   ├── services/        # Services (email, paiement)
│   ├── templates/       # Templates email
│   ├── uploads/         # Images uploadées
│   └── utils/           # Utilitaires
├── front/               # Frontend React
│   ├── src/
│   │   ├── components/  # Composants réutilisables
│   │   ├── context/     # Contextes React
│   │   ├── hooks/       # Hooks personnalisés
│   │   ├── pages/       # Pages de l'application
│   │   └── utils/       # Utilitaires frontend
│   └── public/          # Fichiers statiques
```

## 🛠️ Installation et démarrage

### 1. Cloner le projet
```bash
git clone <repository-url>
cd e-commerce
```

### 2. Configuration backend
```bash
cd back
npm install
```

Créer un fichier `.env` dans le dossier `back/` :
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=votre_secret_jwt
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
STRIPE_SECRET_KEY=votre_stripe_secret
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
```

### 3. Configuration frontend
```bash
cd front
npm install
```

### 4. Démarrer l'application

**Backend :**
```bash
cd back
npm start
```

**Frontend :**
```bash
cd front
npm start
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- Backend : http://localhost:5000

## 🎯 Fonctionnalités

### 👤 Interface utilisateur
- **Catalogue de produits** avec filtres et recherche
- **Système de panier** persistant
- **Gestion des favoris**
- **Passation de commande** avec paiement Stripe
- **Historique des commandes**
- **Profil utilisateur** avec gestion des informations
- **Système de reviews** et notation des produits

### 👨‍💼 Panneau d'administration
- **Dashboard** avec statistiques et graphiques
- **Gestion des produits** (CRUD complet)
- **Gestion des utilisateurs** avec statuts
- **Gestion des commandes** avec suivi des statuts
- **Statistiques** de vente et d'activité

### 🔧 Fonctionnalités techniques
- **Authentification JWT** sécurisée
- **Upload d'images** avec Cloudinary
- **Paiements** intégrés avec Stripe
- **Emails automatiques** (confirmation, reset password)
- **Interface responsive** Material-UI
- **Gestion d'état** avec Context API

## 🔐 Rôles utilisateurs

### Utilisateur standard
- Navigation dans le catalogue
- Gestion du panier et des favoris
- Passation de commande
- Gestion du profil

### Administrateur
- Accès au panneau d'administration
- Gestion complète des produits
- Gestion des utilisateurs
- Suivi des commandes
- Accès aux statistiques

## 📊 API Endpoints

### Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /auth/me` - Vérification token
- `POST /auth/forgot-password` - Mot de passe oublié
- `POST /auth/reset-password` - Reset mot de passe

### Produits
- `GET /products` - Liste des produits
- `GET /products/:id` - Détail produit
- `POST /products` - Créer produit (admin)
- `PUT /products/:id` - Modifier produit (admin)
- `DELETE /products/:id` - Supprimer produit (admin)

### Utilisateurs
- `GET /users` - Liste utilisateurs (admin)
- `GET /users/:id` - Profil utilisateur
- `PUT /users/:id` - Modifier profil
- `DELETE /users/:id` - Supprimer utilisateur (admin)

### Commandes
- `GET /orders` - Historique commandes
- `POST /orders` - Créer commande
- `PUT /orders/:id` - Modifier statut (admin)

## 🎨 Interface utilisateur

### Design moderne
- **Material-UI** pour un design cohérent
- **Responsive** sur tous les appareils
- **Animations fluides** et transitions
- **Thème personnalisé** avec couleurs cohérentes

### Composants principaux
- **Navbar** avec recherche et menu utilisateur
- **ProductCard** avec hover effects
- **Cart** avec gestion des quantités
- **Dashboard** avec graphiques Chart.js
- **Forms** avec validation et feedback

## 🚀 Déploiement

### Backend (Heroku/Railway)
```bash
cd back
npm run build
```

### Frontend (Netlify/Vercel)
```bash
cd front
npm run build
```

## 📝 Notes de développement

### Bonnes pratiques
- **Code modulaire** avec séparation des responsabilités
- **Gestion d'erreurs** robuste
- **Validation** côté client et serveur
- **Sécurité** avec JWT et validation
- **Performance** avec lazy loading et optimisations

### Structure des données
- **Produits** : images, prix, stock, catégories
- **Utilisateurs** : profil, commandes, favoris
- **Commandes** : statuts, paiement, livraison
- **Reviews** : notation, commentaires, dates

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. 
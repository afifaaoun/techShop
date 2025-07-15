# Configuration Email pour E-Shop

## Problème identifié
La fonctionnalité "Mot de passe oublié" ne fonctionne pas car les variables d'environnement SMTP ne sont pas configurées.

## Solution

### 1. Créer un fichier .env dans le dossier `back/`

```bash
# Dans le dossier back/
touch .env
```

### 2. Ajouter les variables d'environnement suivantes dans le fichier .env

```env
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Base de données MongoDB
DB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRE=30d
COOKIE_EXPIRE=30

# URL du client frontend
CLIENT_URL=http://localhost:3000

# Configuration SMTP pour l'envoi d'emails

# Option 1: Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_d_application

# Option 2: Outlook/Hotmail
# SMTP_HOST=smtp-mail.outlook.com
# SMTP_PORT=587
# SMTP_USER=votre_email@outlook.com
# SMTP_PASS=votre_mot_de_passe

# Email d'expédition
FROM_EMAIL=votre_email@gmail.com
FROM_NAME=E-Shop
```

### 3. Configuration Gmail (Recommandé)

1. Allez sur https://myaccount.google.com/
2. Activez l'authentification à 2 facteurs
3. Générez un "mot de passe d'application"
4. Utilisez ce mot de passe dans `SMTP_PASS`

### 4. Test de la configuration

Après avoir configuré le fichier .env, redémarrez le serveur backend :

```bash
cd back
npm start
```

### 5. Test de la fonctionnalité

1. Allez sur http://localhost:3000/forgot-password
2. Entrez une adresse email valide
3. Cliquez sur "Envoyer le lien de réinitialisation"
4. Vérifiez votre boîte email

## Variables optionnelles (pour les fonctionnalités avancées)

```env
# Cloudinary (pour les images)
CLOUDINARY_NAME=votre_cloudinary_name
CLOUDINARY_KEY=votre_cloudinary_key
CLOUDINARY_SECRET=votre_cloudinary_secret

# Stripe (paiements)
STRIPE_SECRET_KEY=votre_stripe_secret_key
STRIPE_WEBHOOK_SECRET=votre_stripe_webhook_secret
```

## Dépannage

### Erreur "Invalid login"
- Vérifiez que `SMTP_USER` et `SMTP_PASS` sont corrects
- Pour Gmail, utilisez un mot de passe d'application

### Erreur "Connection timeout"
- Vérifiez que `SMTP_HOST` et `SMTP_PORT` sont corrects
- Vérifiez votre connexion internet

### Email non reçu
- Vérifiez les spams
- Vérifiez que `FROM_EMAIL` est correct 